import os
import django
import urllib.request

# Configurar el entorno de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'techmatch.settings')
django.setup()

from django.contrib.auth.models import User
from store.models import DeviceBrand, DeviceModel, ProductCategory, Product, Order, OrderItem

# Carpeta para descargar las imágenes
MEDIA_DIR = os.path.join('media', 'products')
os.makedirs(MEDIA_DIR, exist_ok=True)

def download_image(url, filename):
    """
    Descarga una imagen desde una URL de Unsplash y la guarda en la carpeta media/products/.
    Retorna la ruta relativa para el campo ImageField de Django o None si falla.
    """
    filepath = os.path.join(MEDIA_DIR, filename)
    
    # Si la imagen ya existe localmente, no la descargamos de nuevo para ahorrar tiempo
    if os.path.exists(filepath):
        print(f"  - Imagen {filename} ya existe localmente.")
        return f"products/{filename}"

    try:
        print(f"  - Descargando imagen para {filename}...")
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
        )
        with urllib.request.urlopen(req, timeout=15) as response, open(filepath, 'wb') as out_file:
            out_file.write(response.read())
        return f"products/{filename}"
    except Exception as e:
        print(f"  - Error al descargar {filename}: {e} (Se creará el producto sin imagen)")
        return None

def seed():
    print("Iniciando la carga de datos iniciales completos (Dispositivos + Accesorios + Imágenes hasta 2026)...")

    # 1. Limpieza de base de datos para evitar duplicados y conflictos
    print("- Limpiando datos antiguos...")
    OrderItem.objects.all().delete()
    Order.objects.all().delete()
    Product.objects.all().delete()
    ProductCategory.objects.all().delete()
    DeviceModel.objects.all().delete()
    DeviceBrand.objects.all().delete()

    # 2. Configuración de cuentas y permisos por defecto
    admin_u, _ = User.objects.get_or_create(username='admin')
    admin_u.set_password('admin123')
    admin_u.email = 'admin@techmatch.com'
    admin_u.is_staff = True
    admin_u.is_superuser = True
    admin_u.save()
    print("- Cuenta de Administrador configurada: admin / admin123")

    # Configurar cuenta Cliente Yeferson (Comprador Estándar)
    for u_name in ['Yeferson', 'yeferson']:
        u_obj, _ = User.objects.get_or_create(username=u_name)
        u_obj.set_password('1234')
        u_obj.is_staff = False
        u_obj.is_superuser = False
        u_obj.email = 'suescunyeferson32@gmail.com'
        u_obj.save()
    print("- Cuenta de Cliente 'Yeferson' y 'yeferson' configuradas con contraseña '1234'")

    # 3. Marcas de Dispositivos (Reconocidas a nivel mundial con logos oficiales)
    apple = DeviceBrand.objects.create(name="Apple", logo="brands/apple.png")
    samsung = DeviceBrand.objects.create(name="Samsung", logo="brands/samsung.png")
    xiaomi = DeviceBrand.objects.create(name="Xiaomi", logo="brands/xiaomi.png")
    huawei = DeviceBrand.objects.create(name="Huawei", logo="brands/huawei.png")
    hp = DeviceBrand.objects.create(name="HP", logo="brands/hp.png")
    lenovo = DeviceBrand.objects.create(name="Lenovo", logo="brands/lenovo.png")
    print("- Marcas creadas con logos oficiales: Apple, Samsung, Xiaomi, Huawei, HP, Lenovo")

    # 4. Modelos de Dispositivos (Catálogo de referencia de 2024 a 2026)
    # Apple
    iphone17_pro = DeviceModel.objects.create(brand=apple, name="iPhone 17 Pro Max", image=download_image("https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80", "dev_iphone17.jpg"))
    iphone16 = DeviceModel.objects.create(brand=apple, name="iPhone 16 Pro", image=download_image("https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80", "dev_iphone16.jpg"))
    ipad_pro = DeviceModel.objects.create(brand=apple, name="iPad Pro M4", image=download_image("https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop&q=80", "dev_ipadpro.jpg"))
    ipad_mini = DeviceModel.objects.create(brand=apple, name="iPad Mini (2025)", image=download_image("https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop&q=80", "dev_ipadmini.jpg"))
    macbook_m4 = DeviceModel.objects.create(brand=apple, name="MacBook Pro M4", image=download_image("https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80", "dev_macbook.jpg"))
    
    # Samsung
    galaxy_s26 = DeviceModel.objects.create(brand=samsung, name="Galaxy S26 Ultra (2026)", image=download_image("https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80", "dev_s26ultra.jpg"))
    galaxy_s25 = DeviceModel.objects.create(brand=samsung, name="Galaxy S25 Ultra", image=download_image("https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80", "dev_s25ultra.jpg"))
    galaxy_tab = DeviceModel.objects.create(brand=samsung, name="Galaxy Tab S10 Pro", image=download_image("https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=600&auto=format&fit=crop&q=80", "dev_galaxytab.jpg"))
    
    # Xiaomi
    xiaomi15_pro = DeviceModel.objects.create(brand=xiaomi, name="Xiaomi 15 Pro", image=download_image("https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80", "dev_xiaomi15.jpg"))
    xiaomi14_ultra = DeviceModel.objects.create(brand=xiaomi, name="Xiaomi 14 Ultra", image=download_image("https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80", "dev_xiaomi14.jpg"))
    xiaomi_pad = DeviceModel.objects.create(brand=xiaomi, name="Xiaomi Pad 7 Pro", image=download_image("https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop&q=80", "dev_xiaomipad.jpg"))
    
    # Huawei
    mate70 = DeviceModel.objects.create(brand=huawei, name="Mate 70 Pro", image=download_image("https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80", "dev_mate70.jpg"))
    matepad = DeviceModel.objects.create(brand=huawei, name="MatePad Pro 13.2", image=download_image("https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop&q=80", "dev_matepad.jpg"))
    
    # Laptops Windows
    hp_spectre = DeviceModel.objects.create(brand=hp, name="HP Spectre x360 (2025)", image=download_image("https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80", "dev_hpspectre.jpg"))
    thinkpad = DeviceModel.objects.create(brand=lenovo, name="ThinkPad X1 Carbon Gen 13", image=download_image("https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80", "dev_thinkpad.jpg"))
    
    print("- Modelos de dispositivos con fotografías reales creados")

    # 5. Categorías de Productos (Dispositivos + Accesorios)
    telefonos_cat = ProductCategory.objects.create(name="Teléfonos", slug="telefonos")
    ordenadores_cat = ProductCategory.objects.create(name="Ordenadores", slug="ordenadores")
    tablets_cat = ProductCategory.objects.create(name="Tablets", slug="tablets")
    cargadores = ProductCategory.objects.create(name="Cargadores", slug="cargadores")
    cables = ProductCategory.objects.create(name="Cables", slug="cables")
    fundas = ProductCategory.objects.create(name="Fundas y Estuches", slug="fundas")
    protectores = ProductCategory.objects.create(name="Protectores de Pantalla", slug="protectores")
    hubs = ProductCategory.objects.create(name="Hubs y Adaptadores", slug="hubs")
    audio_varios = ProductCategory.objects.create(name="Audio y Soportes", slug="audio-varios")
    print("- Categorías creadas (9 en total: Dispositivos y Accesorios)")

    # 6. Productos y descargas de imágenes reales (Unsplash de alta calidad)
    # ----------------------------------------------------
    # SECCIÓN DISPOSITIVOS (Los equipos principales de la tienda)
    # ----------------------------------------------------
    print("- Creando dispositivos con imágenes...")

    # Teléfonos
    img_iphone17 = download_image("https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80", "iphone17.jpg")
    dev1 = Product.objects.create(
        category=telefonos_cat,
        name="iPhone 17 Pro Max (256GB, Titanio Natural)",
        description="El smartphone estandarte de Apple de última generación. Con el chip A19 Pro, pantalla Super Retina XDR de 6.9 pulgadas y un sistema de cámaras fotográficas profesional revolucionario.",
        price=1469.00,
        stock=10,
        image=img_iphone17,
        specifications={"marca": "Apple", "almacenamiento": "256 GB", "pantalla": "6.9 pulgadas", "color": "Titanio Natural"}
    )
    dev1.compatible_devices.set([iphone17_pro])

    img_iphone16 = download_image("https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80", "iphone16.jpg")
    dev2 = Product.objects.create(
        category=telefonos_cat,
        name="iPhone 16 Pro (128GB, Negro Espacial)",
        description="Rendimiento sobresaliente con el chip A18 Pro y control de cámara táctil. Pantalla de 6.3 pulgadas en un chasis de titanio duradero y ligero.",
        price=1219.00,
        stock=12,
        image=img_iphone16,
        specifications={"marca": "Apple", "almacenamiento": "128 GB", "pantalla": "6.3 pulgadas", "color": "Negro Espacial"}
    )
    dev2.compatible_devices.set([iphone16])

    img_s26 = download_image("https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80", "s26ultra.jpg")
    dev3 = Product.objects.create(
        category=telefonos_cat,
        name="Samsung Galaxy S26 Ultra (512GB, Gris)",
        description="Modelo insignia de 2026. Integra el procesador Snapdragon Gen 5 de última generación, pantalla antirreflejos Dynamic AMOLED 2X y el S-Pen integrado con inteligencia artificial de avanzada.",
        price=1579.00,
        stock=8,
        image=img_s26,
        specifications={"marca": "Samsung", "almacenamiento": "512 GB", "pantalla": "6.8 pulgadas", "color": "Gris Titanio", "lápiz óptico": "Incluido"}
    )
    dev3.compatible_devices.set([galaxy_s26])

    img_s25 = download_image("https://images.unsplash.com/photo-1583573636246-18cb2246697f?w=600&auto=format&fit=crop&q=80", "s25ultra.jpg")
    dev4 = Product.objects.create(
        category=telefonos_cat,
        name="Samsung Galaxy S25 Ultra (256GB, Negro)",
        description="Potente y elegante. Cuenta con cámara principal de 200 MP, zoom óptico avanzado y la suite completa de Galaxy AI para traducción e edición de fotos en tiempo real.",
        price=1329.00,
        stock=10,
        image=img_s25,
        specifications={"marca": "Samsung", "almacenamiento": "256 GB", "pantalla": "6.8 pulgadas", "color": "Negro Titanio"}
    )
    dev4.compatible_devices.set([galaxy_s25])

    img_xiaomi15 = download_image("https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80", "xiaomi15.jpg")
    dev5 = Product.objects.create(
        category=telefonos_cat,
        name="Xiaomi 15 Pro (256GB, Verde Bosque)",
        description="Equipado con lentes Leica profesionales, batería de alta densidad con carga ultra rápida y diseño ergonómico de bordes ultra finos.",
        price=999.00,
        stock=15,
        image=img_xiaomi15,
        specifications={"marca": "Xiaomi", "almacenamiento": "256 GB", "pantalla": "6.73 pulgadas", "color": "Verde Bosque"}
    )
    dev5.compatible_devices.set([xiaomi15_pro])

    img_xiaomi14 = download_image("https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80", "xiaomi14.jpg")
    dev5_2 = Product.objects.create(
        category=telefonos_cat,
        name="Xiaomi 14 Ultra (512GB, Titanio)",
        description="El teléfono fotográfico supremo con sensor de 1 pulgada, apertura variable física y un kit de fotografía opcional. Potenciado con Snapdragon 8 Gen 3.",
        price=1199.00,
        stock=6,
        image=img_xiaomi14,
        specifications={"marca": "Xiaomi", "almacenamiento": "512 GB", "pantalla": "6.73 pulgadas", "color": "Titanio"}
    )
    dev5_2.compatible_devices.set([xiaomi14_ultra])

    img_mate70 = download_image("https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80", "mate70.jpg")
    dev6 = Product.objects.create(
        category=telefonos_cat,
        name="Huawei Mate 70 Pro (512GB, Plata Satélite)",
        description="Diseño icónico con módulo de cámara circular. Conectividad satelital avanzada, pantalla con vidrio Kunlun ultra resistente y el nuevo sistema operativo fluido.",
        price=1199.00,
        stock=7,
        image=img_mate70,
        specifications={"marca": "Huawei", "almacenamiento": "512 GB", "pantalla": "6.8 pulgadas", "color": "Plata Satélite"}
    )
    dev6.compatible_devices.set([mate70])

    # Ordenadores
    img_macbook = download_image("https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80", "macbook.jpg")
    dev7 = Product.objects.create(
        category=ordenadores_cat,
        name="MacBook Pro M4 (14 pulgadas, 16GB RAM, 512GB SSD)",
        description="Portátil profesional de Apple con la increíble eficiencia y potencia del chip M4 de última generación. Pantalla Liquid Retina XDR de alto contraste y batería de hasta 22 horas.",
        price=1999.00,
        stock=5,
        image=img_macbook,
        specifications={"marca": "Apple", "procesador": "Apple M4", "memoria RAM": "16 GB", "almacenamiento": "512 GB SSD", "color": "Plata"}
    )
    dev7.compatible_devices.set([macbook_m4])

    img_hp = download_image("https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80", "hpspectre.jpg")
    dev8 = Product.objects.create(
        category=ordenadores_cat,
        name="HP Spectre x360 Convertible (14\", Intel Core Ultra 7, 1TB SSD)",
        description="Ordenador portátil 2-en-1 premium convertible en tablet. Pantalla táctil OLED de alta definición, lápiz digital incluido y chasis metálico elegante.",
        price=1599.00,
        stock=6,
        image=img_hp,
        specifications={"marca": "HP", "procesador": "Intel Core Ultra 7", "memoria RAM": "16 GB", "almacenamiento": "1 TB SSD", "pantalla": "Táctil OLED"}
    )
    dev8.compatible_devices.set([hp_spectre])

    img_thinkpad = download_image("https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&auto=format&fit=crop&q=80", "thinkpad.jpg")
    dev9 = Product.objects.create(
        category=ordenadores_cat,
        name="Lenovo ThinkPad X1 Carbon Gen 13 (32GB RAM, 1TB SSD)",
        description="El estándar de oro para los ordenadores de negocios. Chasis de fibra de carbono ultra ligero y ultra resistente, pantalla antirreflejos e increíble teclado ThinkPad.",
        price=2199.00,
        stock=4,
        image=img_thinkpad,
        specifications={"marca": "Lenovo", "procesador": "Intel Core Ultra 7", "memoria RAM": "32 GB", "almacenamiento": "1 TB SSD", "peso": "1.09 kg"}
    )
    dev9.compatible_devices.set([thinkpad])

    # Tablets
    img_ipad = download_image("https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80", "ipadpro.jpg")
    dev10 = Product.objects.create(
        category=tablets_cat,
        name="iPad Pro M4 (11 pulgadas, Wi-Fi, 256GB, Negro)",
        description="El iPad más delgado jamás creado, potenciado por el procesador M4. Pantalla Tandem OLED revolucionaria con colores perfectos para creadores de contenido.",
        price=1049.00,
        stock=8,
        image=img_ipad,
        specifications={"marca": "Apple", "procesador": "Apple M4", "pantalla": "Tandem OLED 11 pulgadas", "almacenamiento": "256 GB"}
    )
    dev10.compatible_devices.set([ipad_pro])

    img_ipadmini = download_image("https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=600&auto=format&fit=crop&q=80", "ipadmini.jpg")
    dev10_2 = Product.objects.create(
        category=tablets_cat,
        name="iPad Mini (8.3 pulgadas, Wi-Fi, 64GB, Gris)",
        description="Ultra portátil y potente. Con el chip A17 Pro, diseño todo pantalla, compatibilidad con Apple Pencil Pro y conector USB-C.",
        price=599.00,
        stock=10,
        image=img_ipadmini,
        specifications={"marca": "Apple", "pantalla": "8.3 pulgadas Liquid Retina", "almacenamiento": "64 GB", "procesador": "A17 Pro"}
    )
    dev10_2.compatible_devices.set([ipad_mini])

    img_tab = download_image("https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop&q=80", "galaxytab.jpg")
    dev11 = Product.objects.create(
        category=tablets_cat,
        name="Samsung Galaxy Tab S10 Pro (12.4\", 256GB, Wi-Fi)",
        description="Tablet premium resistente al agua (IP68). Pantalla AMOLED vibrante, ideal para dibujar y multitarea intensiva con soporte S-Pen de serie.",
        price=899.00,
        stock=9,
        image=img_tab,
        specifications={"marca": "Samsung", "pantalla": "Dynamic AMOLED 12.4\"", "almacenamiento": "256 GB", "S-Pen": "Incluido"}
    )
    dev11.compatible_devices.set([galaxy_tab])

    img_xipad = download_image("https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80", "xiaomipad.jpg")
    dev12 = Product.objects.create(
        category=tablets_cat,
        name="Xiaomi Pad 7 Pro (11\", 128GB, Wi-Fi, Gris)",
        description="Excelente relación calidad-precio. Pantalla con tasa de refresco ultra rápida de 144Hz, procesador de alta gama y gran batería para entretenimiento continuo.",
        price=449.00,
        stock=15,
        image=img_xipad,
        specifications={"marca": "Xiaomi", "pantalla": "11 pulgadas 144Hz", "almacenamiento": "128 GB", "procesador": "Snapdragon"}
    )
    dev12.compatible_devices.set([xiaomi_pad])

    img_matepad = download_image("https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80", "matepad.jpg")
    dev13 = Product.objects.create(
        category=tablets_cat,
        name="Huawei MatePad Pro 13.2 (256GB, Wi-Fi)",
        description="Tablet ultradelgada con pantalla OLED flexible de 13.2 pulgadas y bordes ínfimos. Ideal para oficina móvil y diseño artístico digital.",
        price=799.00,
        stock=6,
        image=img_matepad,
        specifications={"marca": "Huawei", "pantalla": "OLED 13.2 pulgadas", "almacenamiento": "256 GB", "color": "Verde"}
    )
    dev13.compatible_devices.set([matepad])

    # ----------------------------------------------------
    # SECCIÓN ACCESORIOS (Compatibles con los equipos anteriores)
    # ----------------------------------------------------
    print("- Creando accesorios con imágenes...")

    # Cargadores
    img_cargador30 = download_image("https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80", "charger30.jpg")
    p1 = Product.objects.create(
        category=cargadores,
        name="Cargador Rápido USB-C 30W (Tecnología GaN / PD)",
        description="Cargador de pared compacto de 30W con nitruro de galio (GaN). Permite una carga rápida y segura para iPhones, Galaxy, Xiaomi, Huawei y iPads.",
        price=22.99,
        stock=40,
        image=img_cargador30,
        specifications={"potencia": "30W", "puertos": "1x USB-C", "tecnología": "GaN Tech / Power Delivery", "color": "Blanco Glaciar"}
    )
    p1.compatible_devices.set([iphone17_pro, iphone16, ipad_pro, ipad_mini, galaxy_s26, galaxy_s25, xiaomi15_pro, xiaomi14_ultra, xiaomi_pad, mate70, matepad])

    img_cargador100 = download_image("https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80", "charger100.jpg")
    p2 = Product.objects.create(
        category=cargadores,
        name="Cargador Multipuerto Pro GaN 100W",
        description="Cargador ultrarrápido GaN de 100W con 3 puertos USB-C y 1 puerto USB-A. Carga portátiles de alto rendimiento como MacBooks y ThinkPads al mismo tiempo.",
        price=59.99,
        stock=15,
        image=img_cargador100,
        specifications={"potencia": "100W total", "puertos": "3x USB-C + 1x USB-A", "tecnología": "GaN III / PPS 45W", "color": "Gris Grafito"}
    )
    p2.compatible_devices.set([macbook_m4, ipad_pro, galaxy_tab, xiaomi_pad, matepad, hp_spectre, thinkpad, galaxy_s26, galaxy_s25, iphone17_pro, xiaomi14_ultra])

    # Cables
    img_cableled = download_image("https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&auto=format&fit=crop&q=80", "cableled.jpg")
    p3 = Product.objects.create(
        category=cables,
        name="Cable Inteligente USB-C a USB-C con Pantalla LED (2m)",
        description="Cable trenzado reforzado de 2 metros con pantalla LED integrada que muestra la potencia de carga en tiempo real (hasta 100W).",
        price=18.50,
        stock=45,
        image=img_cableled,
        specifications={"longitud": "2.0 metros", "material": "Nylon Trenzado / Aleación Zinc", "potencia máxima": "100W (5A)", "pantalla LED": "Sí"}
    )
    p3.compatible_devices.set([iphone17_pro, iphone16, ipad_pro, ipad_mini, macbook_m4, galaxy_s26, galaxy_s25, galaxy_tab, xiaomi15_pro, xiaomi14_ultra, xiaomi_pad, mate70, matepad, hp_spectre, thinkpad])

    img_cablesoft = download_image("https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=600&auto=format&fit=crop&q=80", "cablesoft.jpg")
    p4 = Product.objects.create(
        category=cables,
        name="Cable USB-C de Carga Rápida Silicona Flexible (1.2m)",
        description="Cable fabricado en silicona líquida flexible de tacto ultra suave. Muy duradero, no se enreda y soporta carga rápida de hasta 60W.",
        price=12.99,
        stock=30,
        image=img_cablesoft,
        specifications={"longitud": "1.2 metros", "material": "Silicona Líquida Soft-Touch", "potencia máxima": "60W", "color": "Azul Pastel"}
    )
    p4.compatible_devices.set([iphone17_pro, iphone16, ipad_pro, ipad_mini, galaxy_s26, galaxy_s25, xiaomi15_pro, xiaomi14_ultra, mate70])

    # Fundas y Estuches
    img_funda17 = download_image("https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&auto=format&fit=crop&q=80", "funda17.jpg")
    p5 = Product.objects.create(
        category=fundas,
        name="Funda Silicona Magnética MagSafe (Titanio Gris)",
        description="Funda de silicona premium texturizada. Incorpora imanes N52 para una perfecta alineación con accesorios MagSafe. Exclusiva para iPhone 17 Pro Max.",
        price=29.99,
        stock=20,
        image=img_funda17,
        specifications={"material": "Silicona Premium", "soporte MagSafe": "Sí", "interior": "Microfibra", "color": "Titanio Gris"}
    )
    p5.compatible_devices.set([iphone17_pro])

    img_fundatrans = download_image("https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80", "fundatrans.jpg")
    p6 = Product.objects.create(
        category=fundas,
        name="Funda Híbrida Ultra Transparente Magnética",
        description="Funda transparente fabricada con policarbonato rígido anti-amarilleo y bordes absorbentes de TPU. Exclusiva para iPhone 16 Pro.",
        price=19.99,
        stock=25,
        image=img_fundatrans,
        specifications={"material": "Policarbonato + TPU", "anti-amarilleo": "Sí", "soporte MagSafe": "Sí", "color": "Transparente"}
    )
    p6.compatible_devices.set([iphone16])

    img_fundarugged = download_image("https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&auto=format&fit=crop&q=80", "fundarugged.jpg")
    p7 = Product.objects.create(
        category=fundas,
        name="Funda Antigolpes Rugged Armor con Soporte",
        description="Carcasa resistente con parachoques de doble capa y tecnología de dispersión de impactos. Cuenta con pie de apoyo retráctil.",
        price=21.99,
        stock=18,
        image=img_fundarugged,
        specifications={"protección": "Grado militar certificado", "material": "TPU + PC rígido", "soporte de mesa": "Sí", "color": "Negro Blindado"}
    )
    p7.compatible_devices.set([galaxy_s26, galaxy_s25])

    img_fundaipad = download_image("https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop&q=80", "fundaipad.jpg")
    p8 = Product.objects.create(
        category=fundas,
        name="Funda Inteligente tipo Folio Origami (iPad)",
        description="Funda de cuero sintético premium para tablet con tapa magnética plegable tipo origami. Permite colocar el iPad Pro M4 o el iPad Mini en múltiples ángulos.",
        price=29.99,
        stock=12,
        image=img_fundaipad,
        specifications={"diseño": "Origami multi-ángulo", "material": "Cuero PU + TPU suave", "encendido automático": "Sí", "color": "Azul Marino"}
    )
    p8.compatible_devices.set([ipad_pro, ipad_mini])

    img_fundatab = download_image("https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=600&auto=format&fit=crop&q=80", "fundatab.jpg")
    p9 = Product.objects.create(
        category=fundas,
        name="Funda Smart Case con Portalápiz Integrado",
        description="Funda rígida trasera de acrílico transparente y tapa magnética frontal. Dispone de un hueco diseñado para cargar y proteger el lápiz táctil.",
        price=24.99,
        stock=15,
        image=img_fundatab,
        specifications={"ranura para lápiz": "Sí", "tapa inteligente": "Sí", "color": "Verde Oliva"}
    )
    p9.compatible_devices.set([xiaomi_pad, matepad, galaxy_tab])

    # Protectores de pantalla
    img_protector9h = download_image("https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=600&auto=format&fit=crop&q=80", "protector9h.jpg")
    p10 = Product.objects.create(
        category=protectores,
        name="Protector de Vidrio Templado 9H Plus Premium",
        description="Lámina de cristal templado de alta resistencia. Bordes pulidos 2.5D para una transición suave al tacto y tratamiento antihuellas.",
        price=10.99,
        stock=30,
        image=img_protector9h,
        specifications={"dureza": "9H Plus", "grosor": "0.30 mm", "tecnología": "Filtro antihuellas / 2.5D", "transparencia": "99.9%"}
    )
    p10.compatible_devices.set([iphone17_pro, iphone16])

    img_hidrogel = download_image("https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80", "hidrogel.jpg")
    p11 = Product.objects.create(
        category=protectores,
        name="Protector Flexible de Hidrogel Autoreparable",
        description="Protección de hidrogel elástica. Absorbe los impactos ligeros y regenera las pequeñas marcas de la superficie de la pantalla de forma automática.",
        price=12.99,
        stock=25,
        image=img_hidrogel,
        specifications={"material": "Hidrogel Flex", "auto-reparable": "Sí (24h)", "apto bordes curvos": "Sí", "sensibilidad táctil": "100%"}
    )
    p11.compatible_devices.set([galaxy_s26, galaxy_s25, xiaomi15_pro, xiaomi14_ultra, mate70])

    # Hubs y adaptadores
    img_hub = download_image("https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600&auto=format&fit=crop&q=80", "hub.jpg")
    p12 = Product.objects.create(
        category=hubs,
        name="Hub Multipuerto USB-C Aluminio 7-en-1",
        description="Concentrador de puertos portátil fabricado en aluminio. Añade puertos HDMI 4K, ranuras SD/MicroSD, dos puertos USB-A 3.1 y puerto de carga pasante USB-C PD.",
        price=34.99,
        stock=10,
        image=img_hub,
        specifications={"conexión": "USB-C", "salidas": "1x HDMI 4K @60Hz", "puertos USB": "2x USB-A 3.1 + 1x USB-C", "lector tarjetas": "SD + MicroSD", "carga pasante": "USB-C PD 100W"}
    )
    p12.compatible_devices.set([macbook_m4, ipad_pro, galaxy_tab, matepad, hp_spectre, thinkpad])

    # Audio y Soportes (Nuevas incorporaciones para expandir)
    img_auriculares = download_image("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80", "auriculares.jpg")
    p13 = Product.objects.create(
        category=audio_varios,
        name="Auriculares Inalámbricos Premium ANC",
        description="Auriculares de diadema inalámbricos con Cancelación Activa de Ruido (ANC) híbrida, audio espacial tridimensional y batería de hasta 40 horas con carga rápida.",
        price=149.99,
        stock=15,
        image=img_auriculares,
        specifications={"tipo": "Circumaural (Over-Ear)", "cancelación ruido": "Activa Híbrida", "autonomía": "Hasta 40 horas", "bluetooth": "5.3"}
    )
    p13.compatible_devices.set([iphone17_pro, iphone16, ipad_pro, ipad_mini, macbook_m4, galaxy_s26, galaxy_s25, galaxy_tab, xiaomi15_pro, xiaomi14_ultra, xiaomi_pad, mate70, matepad, hp_spectre, thinkpad])

    img_soporte = download_image("https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80", "soporte_laptop.jpg")
    p14 = Product.objects.create(
        category=audio_varios,
        name="Soporte de Aluminio Ajustable para Portátil",
        description="Soporte ergonómico plegable y regulable en 6 niveles de altura, fabricado completamente en aleación de aluminio con almohadillas de silicona antideslizantes.",
        price=24.50,
        stock=20,
        image=img_soporte,
        specifications={"material": "Aleación de Aluminio", "niveles altura": "6 niveles", "plegable": "Sí", "peso máximo soportado": "10 kg"}
    )
    p14.compatible_devices.set([macbook_m4, hp_spectre, thinkpad])

    # Carcasa Personalizada
    img_custom = download_image("https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&auto=format&fit=crop&q=80", "customcase.jpg")
    p_custom = Product.objects.create(
        category=fundas,
        name="Carcasa Personalizada con Diseño Web/Google",
        description="Carcasa transparente premium personalizada con la imagen y el dispositivo que tú elijas.",
        price=19.99,
        stock=9999,
        image=img_custom,
        specifications={"material": "Policarbonato Híbrido", "anti-amarilleo": "Sí", "personalizada": "Sí"}
    )
    p_custom.compatible_devices.set(DeviceModel.objects.all())

    print("- Productos y matriz de compatibilidades creados con éxito")
    print("¡Carga de datos finalizada!")

if __name__ == '__main__':
    seed()
