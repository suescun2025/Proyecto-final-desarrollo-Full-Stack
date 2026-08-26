import os
import urllib.request
from PIL import Image

# Desactivar límite de píxeles para evitar error de DecompressionBomb con imágenes de museos gigantes (Google Art/Earth)
Image.MAX_IMAGE_PIXELS = None

# Obras clásicas originales y URLs directas en Wikimedia Commons
# Las obras horizontales (rotate: True) se rotarán 90° a la derecha para cubrir la funda vertical a lo largo.
ARTWORKS = [
    {
        "filename": "mona_lisa.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg",
        "rotate": False
    },
    {
        "filename": "starry_night.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
        "rotate": True
    },
    {
        "filename": "the_scream.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/f/f4/The_Scream.jpg",
        "rotate": False
    },
    {
        "filename": "the_kiss.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/4/40/The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg",
        "rotate": False
    },
    {
        "filename": "girl_pearl_earring.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/0/0f/1665_Girl_with_a_Pearl_Earring.jpg",
        "rotate": False
    },
    {
        "filename": "persistence_memory.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/en/d/dd/The_Persistence_of_Memory.jpg",
        "rotate": True
    },
    {
        "filename": "great_wave.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/0/0d/Great_Wave_off_Kanagawa2.jpg",
        "rotate": True
    },
    {
        "filename": "las_meninas.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/3/31/Las_Meninas%2C_by_Diego_Vel%C3%A1zquez%2C_from_Prado_in_Google_Earth.jpg",
        "rotate": False
    },
    {
        "filename": "las_senas.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/4/4b/%C3%9Altima_Cena_-_Da_Vinci_5.jpg",
        "rotate": True
    },
    {
        "filename": "birth_venus.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg",
        "rotate": True
    }
]

def main():
    target_dir = os.path.join("frontend", "public", "assets", "art")
    
    if not os.path.exists(target_dir):
        os.makedirs(target_dir)
        print(f"Directorio creado: {target_dir}")
        
    headers = {
        'User-Agent': 'TechMatchBot/1.0 (contact: admin@techmatch.com; owner: suescun)',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
    }

    for art in ARTWORKS:
        dest_path = os.path.join(target_dir, art["filename"])
        temp_path = dest_path + ".tmp"
        
        print(f"\nDescargando e integrando la obra: {art['filename']}...")
        try:
            # 1. Descargar la imagen a un archivo temporal
            req = urllib.request.Request(art["url"], headers=headers)
            with urllib.request.urlopen(req) as response:
                with open(temp_path, 'wb') as out_file:
                    out_file.write(response.read())
            
            # 2. Cargar con PIL para procesamiento
            with Image.open(temp_path) as img:
                # Rotación si es horizontal para adaptarlo verticalmente a lo largo de la funda
                if art["rotate"]:
                    print(f"  - Rotando físicamente 90° a la derecha (orientación vertical)...")
                    img = img.rotate(270, expand=True)
                
                # Redimensión optimizada (alto 800px para que fluya en la web con calidad y rapidez)
                width, height = img.size
                aspect_ratio = width / height
                new_height = 800
                new_width = int(new_height * aspect_ratio)
                print(f"  - Redimensionando de {width}x{height} a {new_width}x{new_height}...")
                img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                
                # Convertir a RGB si es necesario para guardar como JPEG
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")
                
                # Guardar en destino definitivo
                img.save(dest_path, "JPEG", quality=85)
                
            # Limpiar archivo temporal
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
            print(f"✓ {art['filename']} procesada con éxito.")
        except Exception as e:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            print(f"❌ Error al procesar {art['filename']}: {e}")

if __name__ == "__main__":
    main()
