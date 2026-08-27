#!/usr/bin/env bash
# Detener la ejecución si ocurre algún error
set -o errexit

echo "📦 1. Instalando dependencias de Python..."
pip install -r requirements.txt

echo "🎨 2. Compilando aplicación Frontend (React + Vite)..."
cd frontend
npm install
npm run build
cd ..

echo "🖼️ 3. Copiando logos de marcas a la carpeta de medios de producción..."
mkdir -p media/brands
cp -r frontend/public/assets/brands/* media/brands/ || true

echo "⚡ 4. Ejecutando Recolección de Archivos Estáticos y Migraciones de Django..."
python manage.py collectstatic --no-input
python manage.py migrate

echo "🌱 5. Poblando la Base de Datos con Productos, Marcas y Usuario Admin..."
python seed_data.py
python update_database_brands.py

echo "✅ ¡Build completado con éxito para Render!"
