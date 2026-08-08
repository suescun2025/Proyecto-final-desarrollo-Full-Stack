from django.urls import path
from .api import (
    DeviceBrandListView, DeviceModelListView, 
    ProductListByDeviceView, ProductCategoryListView, CheckoutView
)
from .views import index_view, product_detail_view, order_history_view

urlpatterns = [
    # Vistas de plantillas Django (Frontend híbrido)
    path('', index_view, name='index'),
    path('product/<int:pk>/', product_detail_view, name='product_detail'),
    path('orders/', order_history_view, name='orders'),
    
    # Endpoints API REST para el Asistente e integración de React
    path('api/brands/', DeviceBrandListView.as_view(), name='api_brands'),
    path('api/models/', DeviceModelListView.as_view(), name='api_models'),
    path('api/products/', ProductListByDeviceView.as_view(), name='api_products'),
    path('api/categories/', ProductCategoryListView.as_view(), name='api_categories'),
    path('api/checkout/', CheckoutView.as_view(), name='api_checkout'),
]
