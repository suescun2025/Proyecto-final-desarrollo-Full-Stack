from django.db import models
from django.contrib.auth.models import User

class DeviceBrand(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Nombre de la Marca")
    logo = models.ImageField(upload_to='brands/', null=True, blank=True, verbose_name="Logo")

    class Meta:
        verbose_name = "Marca de Dispositivo"
        verbose_name_plural = "Marcas de Dispositivos"
        ordering = ['name']

    def __str__(self):
        return self.name

class DeviceModel(models.Model):
    brand = models.ForeignKey(DeviceBrand, on_delete=models.CASCADE, related_name='models', verbose_name="Marca")
    name = models.CharField(max_length=100, verbose_name="Nombre del Modelo")

    class Meta:
        verbose_name = "Modelo de Dispositivo"
        verbose_name_plural = "Modelos de Dispositivos"
        ordering = ['brand', 'name']
        unique_together = ('brand', 'name')

    def __str__(self):
        return f"{self.brand.name} {self.name}"

class ProductCategory(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Nombre de Categoría")
    slug = models.SlugField(max_length=100, unique=True)

    class Meta:
        verbose_name = "Categoría de Producto"
        verbose_name_plural = "Categorías de Productos"

    def __str__(self):
        return self.name

class Product(models.Model):
    category = models.ForeignKey(ProductCategory, on_delete=models.CASCADE, related_name='products', verbose_name="Categoría")
    name = models.CharField(max_length=200, verbose_name="Nombre del Producto")
    description = models.TextField(verbose_name="Descripción")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio")
    stock = models.IntegerField(default=0, verbose_name="Stock Disponible")
    image = models.ImageField(upload_to='products/', null=True, blank=True, verbose_name="Imagen del Producto")
    compatible_devices = models.ManyToManyField(DeviceModel, related_name='compatible_products', blank=True, verbose_name="Dispositivos Compatibles")
    specifications = models.JSONField(default=dict, blank=True, verbose_name="Especificaciones Técnicas")

    class Meta:
        verbose_name = "Producto"
        verbose_name_plural = "Productos"
        ordering = ['name']

    def __str__(self):
        return self.name

class Order(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pendiente'),
        ('SHIPPED', 'Enviado'),
        ('DELIVERED', 'Entregado'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders', verbose_name="Usuario / Cliente")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creación")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', verbose_name="Estado de Pedido")
    total = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Total Pagado")
    shipping_address = models.TextField(verbose_name="Dirección de Envío")

    class Meta:
        verbose_name = "Pedido"
        verbose_name_plural = "Pedidos"
        ordering = ['-created_at']

    def __str__(self):
        return f"Pedido #{self.id} - {self.user.username} ({self.get_status_display()})"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items', verbose_name="Pedido")
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='order_items', verbose_name="Producto")
    quantity = models.PositiveIntegerField(default=1, verbose_name="Cantidad")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio Unitario")

    class Meta:
        verbose_name = "Item del Pedido"
        verbose_name_plural = "Items del Pedido"

    def __str__(self):
        return f"{self.quantity}x {self.product.name} en Pedido #{self.order.id}"

