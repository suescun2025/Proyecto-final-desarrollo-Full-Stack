from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import DeviceBrand, DeviceModel, ProductCategory, Product, Order
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

class ProductCategoryListView(ListAPIView):
    queryset = ProductCategory.objects.all()
    serializer_class = ProductCategorySerializer
    permission_classes = [permissions.AllowAny]
    
class CheckoutView(APIView):
    # El checkout requiere estar autenticado (Cliente)
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = OrderSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                order = serializer.save()
                return Response(
                    {"detail": "Pedido creado con éxito", "order_id": order.id},
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                return Response(
                    {"detail": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
