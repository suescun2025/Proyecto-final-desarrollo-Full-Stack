import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'techmatch.settings')
django.setup()

from store.models import DeviceBrand

BRAND_LOGOS = {
    "Apple": "brands/apple.png",
    "Samsung": "brands/samsung.png",
    "Xiaomi": "brands/xiaomi.png",
    "Huawei": "brands/huawei.png",
    "HP": "brands/hp.png",
    "Lenovo": "brands/lenovo.png"
}

def update_brands():
    for name, logo_path in BRAND_LOGOS.items():
        brand, created = DeviceBrand.objects.get_or_create(name=name)
        brand.logo = logo_path
        brand.save()
        print(f"✓ Marca '{name}' actualizada con logo: {logo_path}")

if __name__ == '__main__':
    update_brands()
