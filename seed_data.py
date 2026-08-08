import os
import django

# Configurar el entorno de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'techmatch.settings')
django.setup()

from django.contrib.auth.models import User
from store.models import DeviceBrand, DeviceModel, ProductCategory, Product

def seed():
    print("Iniciando la carga de datos iniciales (Seed Data)...")

    # 1. Crear Superusuario (Administrador) si no existe
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@techmatch.com', 'admin123')
        print("- Superusuario creado: admin / admin123")
    else:
        print("- El superusuario 'admin' ya existe")

    # 2. Marcas de Dispositivos
    apple, _ = DeviceBrand.objects.get_or_create(name="Apple")
    samsung, _ = DeviceBrand.objects.get_or_create(name="Samsung")
    xiaomi, _ = DeviceBrand.objects.get_or_create(name="Xiaomi")
    print("- Marcas de dispositivos creadas")

    # 3. Modelos de Dispositivos
    iphone14, _ = DeviceModel.objects.get_or_create(brand=apple, name="iPhone 14")
    iphone15, _ = DeviceModel.objects.get_or_create(brand=apple, name="iPhone 15")
    macbook_m2, _ = DeviceModel.objects.get_or_create(brand=apple, name="MacBook Air M2")
    
    galaxy_s23, _ = DeviceModel.objects.get_or_create(brand=samsung, name="Galaxy S23")
    galaxy_s24, _ = DeviceModel.objects.get_or_create(brand=samsung, name="Galaxy S24")
    
    redmi12, _ = DeviceModel.objects.get_or_create(brand=xiaomi, name="Redmi Note 12")
    print("- Modelos de dispositivos creados")

    # 4. Categorías
    cargadores, _ = ProductCategory.objects.get_or_create(name="Cargadores", slug="cargadores")
    cables, _ = ProductCategory.objects.get_or_create(name="Cables", slug="cables")
    fundas, _ = ProductCategory.objects.get_or_create(name="Fundas", slug="fundas")
    print("- Categorías de producto creadas")

    # 5. Productos y Compatibilidades
    # Producto 1: Cargador 20W
    p1, created = Product.objects.get_or_create(
        category=cargadores,
        name="Cargador Rápido USB-C 20W (Tecnología PD)",
        defaults={
            'description': "Cargador de pared con puerto USB-C y entrega de potencia (Power Delivery) de 20W. Ideal para la carga ultra rápida de smartphones de última generación.",
            'price': 19.99,
            'stock': 40,
            'specifications': {
                "potencia": "20W",
                "puerto": "USB-C",
                "garantía": "2 años",
                "color": "Blanco"
            }
        }
    )
    p1.compatible_devices.set([iphone14, iphone15])
    
    # Producto 2: Cargador 45W
    p2, created = Product.objects.get_or_create(
        category=cargadores,
        name="Cargador Super Rápido 45W PPS",
        defaults={
            'description': "Cargador ultra rápido de 45W con tecnología PPS (Programmable Power Supply), óptimo para portátiles livianos y smartphones de alta gama.",
            'price': 34.99,
            'stock': 25,
            'specifications': {
                "potencia": "45W",
                "puerto": "USB-C",
                "tecnología": "GaN Tech / PPS",
                "color": "Negro"
            }
        }
    )
    p2.compatible_devices.set([galaxy_s23, galaxy_s24, macbook_m2])

    # Producto 3: Cable USB-C a USB-C
    p3, created = Product.objects.get_or_create(
        category=cables,
        name="Cable USB-C a USB-C Trenzado 1.5m",
        defaults={
            'description': "Cable reforzado de nylon trenzado de 1.5 metros, soporta potencias de carga de hasta 100W y velocidades de transferencia USB 2.0.",
            'price': 12.50,
            'stock': 60,
            'specifications': {
                "longitud": "1.5 metros",
                "material": "Nylon Trenzado",
                "potencia máxima": "100W",
                "color": "Gris Espacial"
            }
        }
    )
    p3.compatible_devices.set([iphone15, macbook_m2, galaxy_s23, galaxy_s24, redmi12])

    # Producto 4: Funda MagSafe iPhone 15
    p4, created = Product.objects.get_or_create(
        category=fundas,
        name="Funda Transparente Magnética (MagSafe)",
        defaults={
            'description': "Funda de poliuretano termoplástico transparente con anillo magnético integrado para un acople perfecto de cargadores y accesorios MagSafe.",
            'price': 24.99,
            'stock': 30,
            'specifications': {
                "tipo": "Funda Magnética",
                "material": "TPU / Policarbonato",
                "soporte MagSafe": "Sí",
                "color": "Transparente"
            }
        }
    )
    p4.compatible_devices.set([iphone15])

    # Producto 5: Funda Silicona iPhone 14
    p5, created = Product.objects.get_or_create(
        category=fundas,
        name="Funda Silicona Líquida Suave con Felpa",
        defaults={
            'description': "Funda protectora fabricada en silicona líquida ultra suave al tacto, con forro interior de microfibra aterciopelada para evitar arañazos.",
            'price': 14.99,
            'stock': 20,
            'specifications': {
                "material": "Silicona Líquida",
                "interior": "Microfibra",
                "color": "Azul Marino"
            }
        }
    )
    p5.compatible_devices.set([iphone14])

    # Producto 6: Funda Antigolpes Galaxy S23
    p6, created = Product.objects.get_or_create(
        category=fundas,
        name="Funda de Alta Resistencia Militar Anti-Impacto",
        defaults={
            'description': "Carcasa híbrida reforzada con esquinas amortiguadas para caídas de grado militar. Incluye soporte de anillo metálico trasero integrado.",
            'price': 18.99,
            'stock': 15,
            'specifications': {
                "grado de protección": "Militar (MIL-STD-810G)",
                "material": "PC + TPU",
                "soporte integrado": "Sí (Anillo)",
                "color": "Negro Carbono"
            }
        }
    )
    p6.compatible_devices.set([galaxy_s23, galaxy_s24])

    print("- Productos y matriz de compatibilidades creados con éxito")
    print("¡Carga de datos finalizada!")

if __name__ == '__main__':
    seed()
