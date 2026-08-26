import os
import urllib.request

urls = [
    "https://img.icons8.com/color/512/samsung.png",
    "https://cdn.simpleicons.org/samsung/ffffff.svg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/512px-Samsung_Logo.svg.png"
]

headers = {'User-Agent': 'Mozilla/5.0'}

for url in urls:
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = resp.read()
            if len(data) > 100:
                ext = "png" if "png" in url else "svg"
                with open(f"media/brands/samsung.{ext}", "wb") as f:
                    f.write(data)
                with open(f"media/brands/samsung.png", "wb") as f:
                    f.write(data)
                with open(f"frontend/public/assets/brands/samsung.png", "wb") as f:
                    f.write(data)
                with open(f"frontend/public/assets/brands/samsung.svg", "wb") as f:
                    f.write(data)
                print(f"Éxito descargando Samsung desde: {url}")
                break
    except Exception as e:
        print(f"Error {url}: {e}")
