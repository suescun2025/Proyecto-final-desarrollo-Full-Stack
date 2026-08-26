import os
from PIL import Image

SRC_IMAGE = "/Users/yefersonsuescun/.gemini/antigravity-ide/brain/6f18976c-5411-421c-afde-222a33a29a1d/media__1786898262253.png"

MEDIA_APPLE = "media/brands/apple.png"
PUBLIC_APPLE = "frontend/public/assets/brands/apple.png"

def center_apple_optically():
    if not os.path.exists(SRC_IMAGE):
        print(f"Error: no se encontró la imagen en {SRC_IMAGE}")
        return
        
    img = Image.open(SRC_IMAGE).convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    for item in datas:
        r, g, b, a = item
        if r > 230 and g > 230 and b > 230:
            new_data.append((255, 255, 255, 0))
        elif r > 200 and g > 200 and b > 200:
            alpha_val = int(255 - ((r - 200) / 30.0) * 255)
            alpha_val = max(0, min(255, alpha_val))
            new_data.append((r, g, b, alpha_val))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    
    bbox = img.getbbox()
    if bbox:
        cropped = img.crop(bbox)
        
        max_dim = max(cropped.width, cropped.height)
        padding = int(max_dim * 0.30) # 30% padding para tamaño refinado
        new_size = max_dim + (padding * 2)
        
        final_img = Image.new("RGBA", (new_size, new_size), (0, 0, 0, 0))
        
        # Ajuste óptico: Desplazar ligeramente hacia la izquierda (X - 14px) 
        # para compensar la hoja inclinada a la derecha y centrar el cuerpo de la manzana
        paste_x = ((new_size - cropped.width) // 2) - 14
        paste_y = (new_size - cropped.height) // 2
        
        final_img.paste(cropped, (paste_x, paste_y), cropped)
        
        # Redimensionar a 256x256 con antialiasing
        final_img = final_img.resize((256, 256), Image.Resampling.LANCZOS)
        
        final_img.save(MEDIA_APPLE, "PNG")
        final_img.save(PUBLIC_APPLE, "PNG")
        print("✓ Manzana centrada ópticamente con corrección de eje X.")
    else:
        print("Error en delimitación de píxeles.")

if __name__ == '__main__':
    center_apple_optically()
