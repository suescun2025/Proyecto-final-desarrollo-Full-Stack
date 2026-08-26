import os
import urllib.request

MEDIA_BRANDS_DIR = os.path.join("media", "brands")
PUBLIC_BRANDS_DIR = os.path.join("frontend", "public", "assets", "brands")

os.makedirs(MEDIA_BRANDS_DIR, exist_ok=True)
os.makedirs(PUBLIC_BRANDS_DIR, exist_ok=True)

SIMPLE_ICONS_BRANDS = [
    {"name": "Apple", "slug": "apple", "filename": "apple.svg", "color": "ffffff"},
    {"name": "Samsung", "slug": "samsung", "filename": "samsung.svg", "color": "ffffff"},
    {"name": "Xiaomi", "slug": "xiaomi", "filename": "xiaomi", "color": "ffffff"}, # Note: xiaomi on simpleicons
    {"name": "Huawei", "slug": "huawei", "filename": "huawei.svg", "color": "ffffff"},
    {"name": "HP", "slug": "hp", "filename": "hp.svg", "color": "ffffff"},
    {"name": "Lenovo", "slug": "lenovo", "filename": "lenovo.svg", "color": "ffffff"}
]

# URLs directas de PNG/SVG garantizadas
BRAND_PNG_URLS = {
    "Apple": "https://cdn.simpleicons.org/apple/ffffff",
    "Samsung": "https://cdn.simpleicons.org/samsung/ffffff",
    "Xiaomi": "https://cdn.simpleicons.org/xiaomi/ffffff",
    "Huawei": "https://cdn.simpleicons.org/huawei/ffffff",
    "HP": "https://cdn.simpleicons.org/hp/ffffff",
    "Lenovo": "https://cdn.simpleicons.org/lenovo/ffffff"
}

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)'
}

def main():
    for name, url in BRAND_PNG_URLS.items():
        filename = f"{name.lower()}.svg"
        png_filename = f"{name.lower()}.png"
        
        dest_media_svg = os.path.join(MEDIA_BRANDS_DIR, filename)
        dest_public_svg = os.path.join(PUBLIC_BRANDS_DIR, filename)
        
        dest_media_png = os.path.join(MEDIA_BRANDS_DIR, png_filename)
        dest_public_png = os.path.join(PUBLIC_BRANDS_DIR, png_filename)
        
        print(f"Descargando icono simpleicons para {name}...")
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req) as resp:
                content = resp.read()
                
            for dest in [dest_media_svg, dest_public_svg, dest_media_png, dest_public_png]:
                with open(dest, "wb") as f:
                    f.write(content)
            print(f"  ✓ {name} guardado correctamente (SVG/PNG).")
        except Exception as e:
            print(f"  ❌ Error descargando {name}: {e}")

if __name__ == "__main__":
    main()
