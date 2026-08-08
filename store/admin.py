from django.contrib import admin
from .models import DeviceBrand, DeviceModel, ProductCategory, Product, Order, OrderItem

@admin.register(DeviceBrand)
class DeviceBrandAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'has_logo')
    search_fields = ('name',)

    def has_logo(self, obj):
        return bool(obj.logo)
    has_logo.boolean = True
    has_logo.short_description = "Tiene Logo"

@admin.register(DeviceModel)
class DeviceModelAdmin(admin.ModelAdmin):
    list_display = ('id', 'brand', 'name')
    list_filter = ('brand',)
    search_fields = ('name', 'brand__name')

@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category', 'price', 'stock', 'get_compatibilities')
    list_filter = ('category', 'compatible_devices')
    search_fields = ('name', 'description')
    filter_horizontal = ('compatible_devices',) # Interfaz de selección horizontal amigable

    def get_compatibilities(self, obj):
        return ", ".join([str(device) for device in obj.compatible_devices.all()[:3]]) + ("..." if obj.compatible_devices.count() > 3 else "")
    get_compatibilities.short_description = "Modelos Compatibles"

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    raw_id_fields = ('product',)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'created_at', 'status', 'total')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'shipping_address')
    inlines = [OrderItemInline]
    readonly_fields = ('created_at',)

