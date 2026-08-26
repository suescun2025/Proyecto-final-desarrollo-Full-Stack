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

echo "⚡ 3. Ejecutando Recolección de Archivos Estáticos y Migraciones de Django..."
python manage.py collectstatic --no-input
python manage.py migrate

echo "✅ ¡Build completado con éxito para Render!"
