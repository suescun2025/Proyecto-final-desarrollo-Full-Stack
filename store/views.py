from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Product, Order

def index_view(request):
    """
    Vista de la página de inicio.
    Renderiza el contenedor principal de la aplicación React.
    """
    return render(request, 'store/index.html')

def product_detail_view(request, pk):
    """
    Vista del detalle de un producto específico.
    Muestra la ficha técnica y compatibilidad directa.
    """
    product = get_object_or_404(Product, pk=pk)
    return render(request, 'store/product_detail.html', {'product': product})

@login_required
def order_history_view(request):
    """
    Historial de pedidos del cliente autenticado.
    """
    orders = Order.objects.filter(user=request.user).prefetch_related('items__product')
    return render(request, 'store/orders.html', {'orders': orders})

