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
        fields = ['id', 'brand', 'brand_name', 'name']

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
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price']
        read_only_fields = ['price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user_username', 'created_at', 'status', 'total', 'shipping_address', 'items']
        read_only_fields = ['id', 'created_at', 'total', 'status']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user = self.context['request'].user
        
        # Calcular total
        total = 0
        order_items = []
        for item_data in items_data:
            product = item_data['product']
            quantity = item_data['quantity']
            
            # Verificar stock
            if product.stock < quantity:
                raise serializers.ValidationError(f"Stock insuficiente para {product.name}")
            
            price = product.price * quantity
            total += price
            
            # Reducir stock del producto
            product.stock -= quantity
            product.save()
            
            order_items.append(
                OrderItem(
                    product=product,
                    quantity=quantity,
                    price=product.price
                )
            )
            
        # Crear orden
        order = Order.objects.create(user=user, total=total, **validated_data)
        
        # Asociar items y guardar
        for item in order_items:
            item.order = order
            item.save()
            
        return order
