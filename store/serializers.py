from rest_framework import serializers
from django.contrib.auth.models import User
from .models import DeviceBrand, DeviceModel, ProductCategory, Product, Order, OrderItem

class DeviceBrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceBrand
        fields = ['id', 'name', 'logo']

class DeviceModelSerializer(serializers.ModelSerializer):
    brand_name = serializers.CharField(source='brand.name', read_only=True)

    class Meta:
        model = DeviceModel
        fields = ['id', 'brand', 'brand_name', 'name', 'image']

class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = ['id', 'name', 'slug']

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    compatible_devices = DeviceModelSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'category', 'category_name', 'name', 'description', 
            'price', 'stock', 'image', 'compatible_devices', 'specifications'
        ]

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.SerializerMethodField()
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_image', 'quantity', 'price', 'custom_image', 'custom_model']
        read_only_fields = ['price']

    def get_product_name(self, obj):
        if obj.custom_model:
            c_model = obj.custom_model.strip()
            device_keywords = ['macbook', 'iphone', 'samsung', 'ipad', 'galaxy', 'xiaomi', 'pixel']
            is_device_model = any(kw in c_model.lower() for kw in device_keywords)
            
            if not is_device_model and c_model != obj.product.name:
                return c_model
            elif is_device_model and ("Personalizada" in obj.product.name or "Carcasa" in obj.product.name):
                return "Carcasa Personalizada"
        return obj.product.name

    def get_product_image(self, obj):
        if obj.custom_image:
            return obj.custom_image
        elif obj.product and obj.product.image:
            try:
                return obj.product.image.url
            except Exception:
                return ""
        return ""

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user_username', 'created_at', 'status', 'total', 'shipping_address', 'cancellation_reason', 'items']
        read_only_fields = ['id', 'created_at', 'total']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user = self.context['request'].user
        if not user or user.is_anonymous:
            from django.contrib.auth.models import User
            user = User.objects.filter(username='Yeferson').first() or User.objects.filter(username='yeferson').first()
            if not user:
                user, _ = User.objects.get_or_create(
                    username='Yeferson',
                    defaults={'email': 'suescunyeferson32@gmail.com', 'first_name': 'Yeferson', 'last_name': 'Suescun'}
                )
        
        # Calcular total
        total = 0
        order_items = []
        for item_data in items_data:
            product = item_data['product']
            quantity = item_data['quantity']
            custom_image = item_data.get('custom_image', '')
            custom_model = item_data.get('custom_model', '')
            
            # Usar precio individual proporcionado o fallback al precio del producto
            item_price = item_data.get('price', None)
            if item_price is not None:
                try:
                    item_price = float(item_price)
                except (ValueError, TypeError):
                    item_price = float(product.price)
            else:
                item_price = float(product.price)

            if not custom_image and product.image:
                custom_image = product.image.url
            
            # Verificar stock (excepto para carcasas personalizadas)
            if product.name != "Carcasa Personalizada con Diseño Web/Google" and product.stock < quantity:
                raise serializers.ValidationError(f"Stock insuficiente para {product.name}")
            
            line_total = item_price * quantity
            total += line_total
            
            # Reducir stock del producto (excepto para carcasas personalizadas)
            if product.name != "Carcasa Personalizada con Diseño Web/Google":
                product.stock -= quantity
                product.save()
            
            order_items.append(
                OrderItem(
                    product=product,
                    quantity=quantity,
                    price=item_price,
                    custom_image=custom_image,
                    custom_model=custom_model
                )
            )
            
        # Crear orden
        order = Order.objects.create(user=user, total=total, **validated_data)
        
        # Asociar items y guardar
        for item in order_items:
            item.order = order
            item.save()
            
        return order
