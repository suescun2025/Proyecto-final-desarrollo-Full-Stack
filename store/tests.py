from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from .models import DeviceBrand, DeviceModel, ProductCategory, Product, Order, OrderItem

class TechMatchModelsTest(TestCase):
    def setUp(self):
        # Configurar datos básicos de prueba
        self.brand = DeviceBrand.objects.create(name="Apple")
        self.model = DeviceModel.objects.create(brand=self.brand, name="iPhone 13")
        self.category = ProductCategory.objects.create(name="Cargadores", slug="cargadores")
        self.product = Product.objects.create(
            category=self.category,
            name="Cargador Rápido 20W",
            description="Cargador USB-C de alta potencia",
            price=19.99,
            stock=10
        )
        self.product.compatible_devices.add(self.model)

    def test_model_creation(self):
        # Verificar que los objetos se guardaron correctamente en BD
        self.assertEqual(DeviceBrand.objects.count(), 1)
        self.assertEqual(DeviceModel.objects.count(), 1)
        self.assertEqual(ProductCategory.objects.count(), 1)
        self.assertEqual(Product.objects.count(), 1)
        
        # Verificar relaciones y strings
        self.assertEqual(str(self.brand), "Apple")
        self.assertEqual(str(self.model), "Apple iPhone 13")
        self.assertEqual(self.product.compatible_devices.first(), self.model)
        self.assertEqual(self.model.compatible_products.first(), self.product)

class TechMatchAPITest(APITestCase):
    def setUp(self):
        # Configurar base de datos para pruebas de API
        self.brand = DeviceBrand.objects.create(name="Samsung")
        self.model = DeviceModel.objects.create(brand=self.brand, name="Galaxy S23")
        self.category = ProductCategory.objects.create(name="Cables", slug="cables")
        self.product = Product.objects.create(
            category=self.category,
            name="Cable USB-C 2m",
            description="Cable trenzado reforzado",
            price=9.99,
            stock=5
        )
        self.product.compatible_devices.add(self.model)
        
        # Crear usuario para pruebas de checkout
        self.user = User.objects.create_user(username="cliente_test", password="password123")

    def test_list_brands_api(self):
        response = self.client.get('/api/brands/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], "Samsung")

    def test_list_models_filtered_api(self):
        response = self.client.get(f'/api/models/?brand_id={self.brand.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], "Galaxy S23")

    def test_compatibility_filter_api(self):
        # Consultar productos compatibles con Galaxy S23
        response = self.client.get(f'/api/products/?model_id={self.model.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], "Cable USB-C 2m")

    def test_checkout_requires_auth(self):
        # Intentar checkout sin estar logueado
        checkout_data = {
            "shipping_address": "Calle Falsa 123",
            "items": [{"product": self.product.id, "quantity": 1}]
        }
        response = self.client.post('/api/checkout/', checkout_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_checkout_success(self):
        # Iniciar sesión
        self.client.login(username="cliente_test", password="password123")
        
        checkout_data = {
            "shipping_address": "Avenida Siempre Viva 742",
            "items": [{"product": self.product.id, "quantity": 2}]
        }
        response = self.client.post('/api/checkout/', checkout_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Order.objects.count(), 1)
        
        # Verificar deducción de stock (inicialmente era 5, compramos 2, debe quedar 3)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 3)
        
        # Verificar que el pedido tenga el total correcto
        order = Order.objects.first()
        self.assertEqual(float(order.total), 19.98) # 9.99 * 2
        self.assertEqual(order.items.count(), 1)

