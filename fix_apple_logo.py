import os
import urllib.request
from PIL import Image, ImageOps

MEDIA_APPLE = os.path.join("media", "brands", "apple.png")
PUBLIC_APPLE = os.path.join("frontend", "public", "assets", "brands", "apple.png")

# URL de la manzana en blanco puro (SimpleIcons CDN o Github CDN)
WHITE_APPLE_URLS = [
    "https://cdn.simpleicons.org/apple/ffffff",
    "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/apple.svg",
    "https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/png/apple.png"
]

headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'}

def create_white_apple_png():
    # Opción 1: Descargar icono PNG blanco de alta resolución de GitHub
    url = "https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/png/apple.png"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = resp.read()
        
        with open(MEDIA_APPLE, "wb") as f:
            f.write(data)
        with open(PUBLIC_APPLE, "wb") as f:
            f.write(data)
        print("✓ Manzana blanca brillante integrada correctamente desde GitHub CDN.")
        return True
    except Exception as e:
        print(f"Error descargando GitHub CDN: {e}")

    # Opción 2: Si teníamos la manzana negra previa, invertiremos sus colores para que sea blanca pura
    if os.path.exists(MEDIA_APPLE):
        try:
            img = Image.open(MEDIA_APPLE).convert("RGBA")
            r, g, b, alpha = img.split()
            # Crear una imagen completamente blanca conservando el canal alfa (transparencia) de la manzana
            white_img = Image.new("RGBA", img.size, (255, 255, 255, 255))
            white_img.putalpha(alpha)
            
            white_img.save(MEDIA_APPLE)
            white_img.save(PUBLIC_APPLE)
            print("✓ Manzana invertida con éxito a blanco puro brillante (#FFFFFF).")
            return True
        except Exception as e:
            print(f"Error procesando imagen local: {e}")
            
    return False

if __name__ == '__main__':
    create_white_apple_png()
