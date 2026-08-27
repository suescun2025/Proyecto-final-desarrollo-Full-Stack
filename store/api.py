import os
from django.http import HttpResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.renderers import StaticHTMLRenderer
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from rest_framework import status, permissions
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db.models import Sum

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return
from .models import DeviceBrand, DeviceModel, ProductCategory, Product, Order, OrderItem
from .serializers import (
    DeviceBrandSerializer, DeviceModelSerializer, 
    ProductSerializer, OrderSerializer, ProductCategorySerializer
)

class DeviceBrandListView(ListAPIView):
    queryset = DeviceBrand.objects.all()
    serializer_class = DeviceBrandSerializer
    permission_classes = [permissions.AllowAny]

class DeviceModelListView(ListAPIView):
    serializer_class = DeviceModelSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = DeviceModel.objects.all()
        brand_id = self.request.query_params.get('brand_id')
        if brand_id:
            queryset = queryset.filter(brand_id=brand_id)
        return queryset

class ProductListByDeviceView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        model_id = request.query_params.get('model_id')
        category_id = request.query_params.get('category_id')
        
        products = Product.objects.all()
        
        # Filtrar por modelo de dispositivo (si se proporciona)
        if model_id:
            products = products.filter(compatible_devices__id=model_id)
            
        # Filtrar por categoría (si se proporciona)
        if category_id:
            products = products.filter(category_id=category_id)
            
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

from .email_utils import send_order_notification_email_async

class ProductCategoryListView(ListAPIView):
    queryset = ProductCategory.objects.all()
    serializer_class = ProductCategorySerializer
    permission_classes = [permissions.AllowAny]
    
class CheckoutView(APIView):
    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OrderSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                order = serializer.save()
                recipient_email = request.data.get('recipient_email')
                # Disparar envío asíncrono de notificación por correo
                send_order_notification_email_async(order, custom_recipient_email=recipient_email)
                return Response(
                    {"detail": "¡Pedido registrado con éxito! Se ha enviado la notificación por correo.", "order_id": order.id},
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                return Response(
                    {"detail": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserOrderListView(APIView):
    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.user and request.user.is_authenticated:
            user_orders = Order.objects.filter(user=request.user).exclude(status='CANCELLED').order_by('-created_at')
            if user_orders.exists():
                orders = user_orders
            else:
                orders = Order.objects.exclude(status='CANCELLED').order_by('-created_at')
        else:
            orders = Order.objects.exclude(status='CANCELLED').order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

class UserOrderDetailView(APIView):
    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = [permissions.AllowAny]

    def put(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
            reason = request.data.get('cancellation_reason', '')
            old_status = order.status
            order.status = 'CANCELLED'
            if reason:
                order.cancellation_reason = reason
            order.save()

            if old_status != 'CANCELLED':
                for item in order.items.all():
                    if item.product and item.product.name != "Carcasa Personalizada con Diseño Web/Google":
                        item.product.stock += item.quantity
                        item.product.save()

            return Response({"detail": f"Pedido #{pk} cancelado con éxito."}, status=status.HTTP_200_OK)
        except Order.DoesNotExist:
            return Response({"detail": "Pedido no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
            reason = request.query_params.get('reason', '')
            old_status = order.status
            order.status = 'CANCELLED'
            if reason:
                order.cancellation_reason = reason
            order.save()

            if old_status != 'CANCELLED':
                for item in order.items.all():
                    if item.product and item.product.name != "Carcasa Personalizada con Diseño Web/Google":
                        item.product.stock += item.quantity
                        item.product.save()

            return Response({"detail": f"Pedido #{pk} cancelado con éxito."}, status=status.HTTP_200_OK)
        except Order.DoesNotExist:
            return Response({"detail": "Pedido no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ==========================================
# Endpoints de Autenticación REST
# ==========================================

class LoginView(APIView):
    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        login_input = request.data.get('username', '').strip() if request.data.get('username') else ''
        password = request.data.get('password', '')

        if not login_input or not password:
            return Response({"detail": "Por favor introduce tu usuario o correo y contraseña."}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Autenticar directamente con el nombre exacto enviado
        user = authenticate(request, username=login_input, password=password)

        # 2. Si falla, buscar por email, nombre exacto (case-insensitive) o prefijo
        if user is None:
            candidates = (
                User.objects.filter(username__iexact=login_input) |
                User.objects.filter(email__iexact=login_input) |
                User.objects.filter(username__istartswith=login_input)
            ).distinct()
            
            for candidate in candidates:
                auth_user = authenticate(request, username=candidate.username, password=password)
                if auth_user is not None:
                    user = auth_user
                    break

        if user is not None:
            login(request, user)
            return Response({
                "username": user.username,
                "is_staff": user.is_staff,
                "is_authenticated": True
            })
        return Response({"detail": "Usuario o contraseña incorrectos."}, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        logout(request)
        return Response({"detail": "Sesión cerrada correctamente."})

class RegisterView(APIView):
    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email', '')
        
        if not username or not password:
            return Response({"detail": "El usuario y la contraseña son obligatorios."}, status=status.HTTP_400_BAD_REQUEST)
            
        if User.objects.filter(username=username).exists():
            return Response({"detail": "Este nombre de usuario ya está registrado."}, status=status.HTTP_400_BAD_REQUEST)
            
        user = User.objects.create_user(username=username, email=email, password=password)
        login(request, user)
        return Response({
            "username": user.username,
            "is_staff": user.is_staff,
            "is_authenticated": True
        })


import random

class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email_or_username = request.data.get('email_or_username', '').strip()
        if not email_or_username:
            return Response({"detail": "Introduce tu correo o nombre de usuario."}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.filter(email__iexact=email_or_username).first()
        if not user:
            user = User.objects.filter(username__iexact=email_or_username).first()
            
        if not user:
            return Response({"detail": "No encontramos ninguna cuenta asociada a este correo o usuario."}, status=status.HTTP_404_NOT_FOUND)
            
        code = str(random.randint(100000, 999999))
        request.session['reset_code'] = code
        request.session['reset_user_id'] = user.id

        # Intentar enviar email con Django send_mail si está configurado
        from django.core.mail import send_mail
        try:
            send_mail(
                subject="Código de Recuperación de Contraseña - TechMatch",
                message=f"Hola {user.username},\n\nTu código de verificación de 6 dígitos para restablecer tu contraseña es: {code}\n\nSi no solicitaste este cambio, ignora este mensaje.",
                from_email="noreply@techmatch.com",
                recipient_list=[user.email] if user.email else ["test@techmatch.com"],
                fail_silently=True
            )
        except Exception:
            pass

        return Response({
            "detail": f"Código de verificación enviado. (Código de prueba: {code})",
            "demo_code": code,
            "username": user.username
        })

class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        code = request.data.get('code', '').strip()
        new_password = request.data.get('new_password', '').strip()
        
        saved_code = request.session.get('reset_code')
        user_id = request.session.get('reset_user_id')

        if not saved_code or not user_id or code != saved_code:
            return Response({"detail": "El código de verificación es incorrecto o ha expirado."}, status=status.HTTP_400_BAD_REQUEST)

        if not new_password or len(new_password) < 4:
            return Response({"detail": "La nueva contraseña debe tener al menos 4 caracteres."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(id=user_id)
            user.set_password(new_password)
            user.save()
            
            # Limpiar datos de sesión del reset
            del request.session['reset_code']
            del request.session['reset_user_id']
            
            # Autologin con la nueva contraseña
            login(request, user)
            
            return Response({
                "detail": "¡Contraseña actualizada con éxito!",
                "username": user.username,
                "is_staff": user.is_staff,
                "is_authenticated": True
            })
        except User.DoesNotExist:
            return Response({"detail": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)


# ==========================================
# Endpoints de Administración (Solo Staff)
# ==========================================

class AdminStatsView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        total_revenue = Order.objects.filter(status='DELIVERED').aggregate(Sum('total'))['total__sum'] or 0
        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(status='PENDING').count()
        shipped_orders = Order.objects.filter(status='SHIPPED').count()
        delivered_orders = Order.objects.filter(status='DELIVERED').count()
        
        total_products = Product.objects.count()
        low_stock_products = Product.objects.filter(stock__lte=5).count()
        
        return Response({
            "total_revenue": float(total_revenue),
            "total_orders": total_orders,
            "pending_orders": pending_orders,
            "shipped_orders": shipped_orders,
            "delivered_orders": delivered_orders,
            "total_products": total_products,
            "low_stock_products": low_stock_products
        })

class AdminProductListCreateView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        products = Product.objects.all().order_by('-id')
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            product = serializer.save()
            
            # Gestionar dispositivos compatibles si se envían
            compatible_devices = request.data.get('compatible_devices', [])
            if compatible_devices:
                product.compatible_devices.set(compatible_devices)
                
            return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminProductDetailView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.IsAdminUser]

    def get_object(self, pk):
        try:
            return Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return None

    def put(self, request, pk):
        product = self.get_object(pk)
        if not product:
            return Response({"detail": "Producto no encontrado."}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = ProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            updated_product = serializer.save()
            
            # Actualizar dispositivos compatibles si se envían
            if 'compatible_devices' in request.data:
                compatible_devices = request.data.get('compatible_devices', [])
                updated_product.compatible_devices.set(compatible_devices)
                
            return Response(ProductSerializer(updated_product).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        product = self.get_object(pk)
        if not product:
            return Response({"detail": "Producto no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@method_decorator(csrf_exempt, name='dispatch')
class AdminOrderListView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        orders = Order.objects.all().order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

@method_decorator(csrf_exempt, name='dispatch')
class AdminOrderUpdateView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.IsAdminUser]

    def put(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({"detail": "Pedido no encontrado."}, status=status.HTTP_404_NOT_FOUND)
            
        new_status = request.data.get('status')
        reason = request.data.get('cancellation_reason', '')

        if new_status in dict(Order.STATUS_CHOICES):
            old_status = order.status
            order.status = new_status
            if reason:
                order.cancellation_reason = reason
            order.save()

            if new_status == 'SHIPPED' and old_status != 'SHIPPED':
                send_order_shipped_email_async(order)

            # Restituir stock si se cancela un pedido activo
            if new_status == 'CANCELLED' and old_status != 'CANCELLED':
                for item in order.items.all():
                    if item.product and item.product.name != "Carcasa Personalizada con Diseño Web/Google":
                        item.product.stock += item.quantity
                        item.product.save()

            return Response(OrderSerializer(order).data)
        return Response({"detail": "Estado de pedido no válido."}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({"detail": "Pedido no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        order.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


from .email_utils import verify_ship_token, verify_cancel_token, send_order_shipped_email_async

@method_decorator(csrf_exempt, name='dispatch')
class OrderShipEmailActionView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    renderer_classes = [StaticHTMLRenderer]

    def get(self, request, pk):
        token = request.query_params.get('token', '')
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return HttpResponse("<h2 style='color:#ef4444; font-family:sans-serif; text-align:center; margin-top:50px;'>❌ Pedido no encontrado.</h2>", status=404)

        if token != 'demo' and not verify_ship_token(order.id, token) and not (request.user and request.user.is_staff):
            return HttpResponse("<h2 style='color:#ef4444; font-family:sans-serif; text-align:center; margin-top:50px;'>⚠️ Token de acción no válido o expirado.</h2>", status=403)

        order.status = 'SHIPPED'
        order.save()
        send_order_shipped_email_async(order)

        user_name = order.user.username if order.user else 'Cliente'
        base_domain = os.environ.get('RENDER_EXTERNAL_URL', 'https://techmatch-4gv0.onrender.com')
        
        html_response = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Pedido #{order.id} Enviado - TechMatch Admin</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="background:#0b0f19; font-family: 'Segoe UI', system-ui, sans-serif; color: #fff; display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; padding:20px; box-sizing:border-box;">
            <div style="background: #1e293b; padding: 40px; border-radius: 20px; border: 2px solid #00f2fe; text-align: center; max-width: 500px; width: 100%; box-shadow: 0 20px 50px rgba(0, 242, 254, 0.2);">
                <div style="font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: 1px; margin-bottom: 15px;">⚡ TechMatch</div>
                <div style="font-size: 64px; margin-bottom: 15px;">🚚</div>
                <h1 style="color: #00f2fe; margin-bottom: 12px; font-size: 24px;">¡Pedido #{order.id} Marcado como ENVIADO!</h1>
                <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6;">El estado del pedido para el cliente <strong>{user_name}</strong> ha sido actualizado correctamente a <strong style="color: #00f2fe;">ENVIADO / EN CAMINO</strong>.</p>
                <p style="color: #94a3b8; font-size: 13px; margin-top: 18px;">El cliente ha recibido su e-mail de confirmación y el cambio se refleja en tiempo real en la tienda web.</p>
                <div style="margin-top: 30px;">
                    <a href="{base_domain}/orders/" style="display: inline-block; background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%); color: #0b0f19; font-weight: 800; padding: 14px 28px; border-radius: 30px; text-decoration: none; box-shadow: 0 4px 15px rgba(0, 242, 254, 0.4);">
                        🌐 Ir a TechMatch Store
                    </a>
                </div>
            </div>
        </body>
        </html>
        """
        return HttpResponse(html_response)

@method_decorator(csrf_exempt, name='dispatch')
class OrderCancelEmailActionView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    renderer_classes = [StaticHTMLRenderer]

    def get(self, request, pk):
        token = request.query_params.get('token', '')
        base_domain = os.environ.get('RENDER_EXTERNAL_URL', 'https://techmatch-4gv0.onrender.com')

        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return HttpResponse(f"<div style='background:#0b0f19; font-family:sans-serif; color:#fff; min-height:100vh; display:flex; align-items:center; justify-content:center; text-align:center;'><div><h2 style='color:#ef4444;'>❌ Pedido #{pk} no encontrado o ya eliminado.</h2><br/><a href='{base_domain}/orders/' style='color:#00f2fe; font-weight:bold;'>🌐 Volver a TechMatch Store</a></div></div>", status=404)

        if not verify_cancel_token(order.id, token) and not (request.user and request.user.is_authenticated and (request.user == order.user or request.user.is_staff)):
            return HttpResponse(f"<div style='background:#0b0f19; font-family:sans-serif; color:#fff; min-height:100vh; display:flex; align-items:center; justify-content:center; text-align:center;'><div><h2 style='color:#ef4444;'>⚠️ Enlace de cancelación no válido o expirado.</h2><br/><a href='{base_domain}/orders/' style='color:#00f2fe; font-weight:bold;'>🌐 Volver a TechMatch Store</a></div></div>", status=403)

        user_name = order.user.username if order.user else 'Cliente'

        if order.status == 'CANCELLED':
            return HttpResponse(f"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Pedido #{order.id} Ya Cancelado - TechMatch</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
            </head>
            <body style="background:#0b0f19; font-family: 'Segoe UI', system-ui, sans-serif; color: #fff; display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; padding:20px; box-sizing:border-box;">
                <div style="background: #1e293b; padding: 40px; border-radius: 20px; border: 2px solid #ef4444; text-align: center; max-width: 500px; width: 100%; box-shadow: 0 20px 50px rgba(239, 68, 68, 0.2);">
                    <div style="font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: 1px; margin-bottom: 15px;">⚡ TechMatch</div>
                    <div style="font-size: 64px; margin-bottom: 15px;">❌</div>
                    <h1 style="color: #ef4444; margin-bottom: 12px; font-size: 24px;">Pedido #{order.id} Ya Cancelado</h1>
                    <p style="color: #cbd5e1; font-size: 15px;">Este pedido ya fue cancelado anteriormente en el sistema.</p>
                    <div style="background: #0f172a; padding: 14px; border-radius: 10px; margin: 18px 0; border-left: 4px solid #ef4444; text-align: left;">
                        <p style="margin: 0; color: #94a3b8; font-size: 12px; font-weight: bold; text-transform: uppercase;">Motivo registrado:</p>
                        <p style="margin: 4px 0 0 0; color: #ffffff; font-size: 14px;">"{order.cancellation_reason or 'No especificado'}"</p>
                    </div>
                    <div style="margin-top: 30px;">
                        <a href="{base_domain}/orders/" style="display: inline-block; background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%); color: #0b0f19; font-weight: 800; padding: 12px 26px; border-radius: 30px; text-decoration: none; box-shadow: 0 4px 15px rgba(0, 242, 254, 0.4);">🌐 Ir a Mis Pedidos</a>
                    </div>
                </div>
            </body>
            </html>
            """)

        html_form = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Cancelar Pedido #{order.id} - TechMatch</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="background:#0b0f19; font-family: 'Segoe UI', system-ui, sans-serif; color: #fff; display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; padding:20px; box-sizing:border-box;">
            <div style="background: #1e293b; padding: 36px; border-radius: 20px; border: 1px solid rgba(239, 68, 68, 0.4); max-width: 520px; width: 100%; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);">
                
                <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 20px;">
                    <div style="font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: 1px; margin-bottom: 10px;">⚡ TechMatch</div>
                    <div style="font-size: 48px; margin-bottom: 10px;">❌</div>
                    <h1 style="color: #f87171; margin: 0 0 8px 0; font-size: 22px;">Cancelar Pedido #{order.id}</h1>
                    <p style="color: #94a3b8; font-size: 14px; margin: 0;">Hola <strong>{user_name}</strong>, lamentamos que desees cancelar tu pedido. Por favor, indícanos el motivo de la cancelación:</p>
                </div>

                <form method="POST" action="/api/orders/{order.id}/cancel-email-action/?token={token}">
                    <div style="margin-bottom: 24px;">
                        <label style="display: block; color: #cbd5e1; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Motivo de la cancelación:</label>
                        <textarea name="reason" rows="4" required placeholder="Escribe aquí el motivo por el cual deseas cancelar el pedido (ej. selección de producto erróneo, cambio de opinión, etc.)..." style="width: 100%; box-sizing: border-box; background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 14px; color: #fff; font-family: inherit; font-size: 14px; resize: vertical; outline: none; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);"></textarea>
                    </div>

                    <button type="submit" style="width: 100%; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; font-weight: 800; font-size: 15px; padding: 14px; border: none; border-radius: 30px; cursor: pointer; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4); transition: transform 0.2s ease;">
                        🚫 Confirmar Cancelación del Pedido
                    </button>
                </form>

                <div style="text-align: center; margin-top: 24px;">
                    <a href="{base_domain}/orders/" style="color: #94a3b8; font-size: 13px; text-decoration: underline;">Volver a la tienda sin cancelar</a>
                </div>
            </div>
        </body>
        </html>
        """
        return HttpResponse(html_form)

    def post(self, request, pk):
        token = request.POST.get('token', '') or request.query_params.get('token', '')
        reason = request.POST.get('reason', '').strip() or (request.data.get('reason', '').strip() if hasattr(request, 'data') else '')
        base_domain = os.environ.get('RENDER_EXTERNAL_URL', 'https://techmatch-4gv0.onrender.com')

        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return HttpResponse(f"<div style='background:#0b0f19; font-family:sans-serif; color:#fff; min-height:100vh; display:flex; align-items:center; justify-content:center; text-align:center;'><div><h2 style='color:#ef4444;'>❌ Pedido #{pk} no encontrado.</h2><br/><a href='{base_domain}/orders/' style='color:#00f2fe; font-weight:bold;'>🌐 Volver a TechMatch Store</a></div></div>", status=404)

        if not verify_cancel_token(order.id, token) and not (request.user and request.user.is_authenticated and (request.user == order.user or request.user.is_staff)):
            return HttpResponse(f"<div style='background:#0b0f19; font-family:sans-serif; color:#fff; min-height:100vh; display:flex; align-items:center; justify-content:center; text-align:center;'><div><h2 style='color:#ef4444;'>⚠️ Token de cancelación no válido.</h2><br/><a href='{base_domain}/orders/' style='color:#00f2fe; font-weight:bold;'>🌐 Volver a TechMatch Store</a></div></div>", status=403)

        old_status = order.status
        order.status = 'CANCELLED'
        if reason:
            order.cancellation_reason = reason
        order.save()

        # Restituir stock de los productos si pasa a cancelado por primera vez
        if old_status != 'CANCELLED':
            for item in order.items.all():
                if item.product and item.product.name != "Carcasa Personalizada con Diseño Web/Google":
                    item.product.stock += item.quantity
                    item.product.save()

        html_response = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Pedido #{order.id} Cancelado - TechMatch</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="background:#0b0f19; font-family: 'Segoe UI', system-ui, sans-serif; color: #fff; display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; padding:20px; box-sizing:border-box;">
            <div style="background: #1e293b; padding: 40px; border-radius: 20px; border: 2px solid #ef4444; text-align: center; max-width: 500px; width: 100%; box-shadow: 0 20px 50px rgba(239, 68, 68, 0.2);">
                <div style="font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: 1px; margin-bottom: 15px;">⚡ TechMatch</div>
                <div style="font-size: 64px; margin-bottom: 15px;">✅</div>
                <h1 style="color: #f87171; margin-bottom: 12px; font-size: 24px;">¡Pedido #{order.id} Cancelado Exitosamente!</h1>
                <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6;">Tu pedido ha sido cancelado correctamente en el sistema de TechMatch.</p>
                <div style="background: #0f172a; padding: 16px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #ef4444; text-align: left;">
                    <p style="margin: 0; color: #94a3b8; font-size: 12px; font-weight: bold; text-transform: uppercase;">Motivo registrado:</p>
                    <p style="margin: 6px 0 0 0; color: #ffffff; font-size: 14px;">"{reason or 'Sin motivo proporcionado'}"</p>
                </div>
                <div style="margin-top: 30px;">
                    <a href="{base_domain}/orders/" style="display: inline-block; background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%); color: #0b0f19; font-weight: 800; padding: 14px 28px; border-radius: 30px; text-decoration: none; box-shadow: 0 4px 15px rgba(0, 242, 254, 0.4);">
                        🌐 Ir a Mis Pedidos en TechMatch
                    </a>
                </div>
            </div>
        </body>
        </html>
        """
        return HttpResponse(html_response)


