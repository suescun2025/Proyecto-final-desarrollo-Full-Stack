from django.urls import path
from .api import (
    DeviceBrandListView, DeviceModelListView, 
    ProductListByDeviceView, ProductCategoryListView, CheckoutView,
    UserOrderListView, UserOrderDetailView, LoginView, LogoutView, RegisterView,
    PasswordResetRequestView, PasswordResetConfirmView,
    AdminStatsView, AdminProductListCreateView, AdminProductDetailView,
    AdminOrderListView, AdminOrderUpdateView, OrderShipEmailActionView,
    OrderCancelEmailActionView
)
from .views import index_view

urlpatterns = [
    # Vistas de la SPA (React gestiona el ruteo interno o el estado de vistas)
    path('', index_view, name='index'),
    path('accesorios/', index_view, name='accesorios'),
    path('admin-dashboard/', index_view, name='admin_dashboard'),
    path('orders/', index_view, name='orders'),
    path('universe/', index_view, name='universe'),
    path('product/<int:pk>/', index_view, name='product_detail'),

    
    # Endpoints API REST de compra y asistente
    path('api/brands/', DeviceBrandListView.as_view(), name='api_brands'),
    path('api/models/', DeviceModelListView.as_view(), name='api_models'),
    path('api/products/', ProductListByDeviceView.as_view(), name='api_products'),
    path('api/categories/', ProductCategoryListView.as_view(), name='api_categories'),
    path('api/checkout/', CheckoutView.as_view(), name='api_checkout'),
    path('api/orders/', UserOrderListView.as_view(), name='api_user_orders'),
    path('api/orders/<int:pk>/', UserOrderDetailView.as_view(), name='api_user_order_detail'),
    path('api/orders/<int:pk>/ship-email-action/', OrderShipEmailActionView.as_view(), name='api_order_ship_email_action'),
    path('api/orders/<int:pk>/cancel-email-action/', OrderCancelEmailActionView.as_view(), name='api_order_cancel_email_action'),

    
    # Endpoints API REST de Autenticación
    path('api/auth/login/', LoginView.as_view(), name='api_login'),
    path('api/auth/logout/', LogoutView.as_view(), name='api_logout'),
    path('api/auth/register/', RegisterView.as_view(), name='api_register'),
    path('api/auth/password-reset-request/', PasswordResetRequestView.as_view(), name='api_password_reset_request'),
    path('api/auth/password-reset-confirm/', PasswordResetConfirmView.as_view(), name='api_password_reset_confirm'),
    
    # Endpoints API REST de Administración
    path('api/admin/stats/', AdminStatsView.as_view(), name='api_admin_stats'),
    path('api/admin/products/', AdminProductListCreateView.as_view(), name='api_admin_products'),
    path('api/admin/products/<int:pk>/', AdminProductDetailView.as_view(), name='api_admin_product_detail'),
    path('api/admin/orders/', AdminOrderListView.as_view(), name='api_admin_orders'),
    path('api/admin/orders/<int:pk>/', AdminOrderUpdateView.as_view(), name='api_admin_order_detail'),
]

