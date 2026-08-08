# ⚡ TechMatch — E-Commerce de Consumibles y Accesorios Tecnológicos

> **Proyecto Final de Máster (PFM)**  
> *"El match perfecto para tus dispositivos."*

---

## 📝 Descripción General

**TechMatch** es una aplicación web de comercio electrónico híbrida, desarrollada para resolver las carencias del mercado local en la adquisición de accesorios y repuestos tecnológicos (cargadores, cables, fundas y componentes). 

La plataforma incorpora un **Asistente Inteligente de Compatibilidad** y un **Carrito de Compras Dinámico** desarrollados en **React**, integrados sobre un backend robusto en **Django**. Esto garantiza que los usuarios compren repuestos con la certeza del 100% de compatibilidad técnica con su marca y modelo de dispositivo, reduciendo a cero los errores de compra, las devoluciones innecesarias y el estrés del cliente.

---

## 🚀 Tecnologías Utilizadas

### Backend y Base de Datos
* **Django (Python 3.11+ / Django 5.x)**: Núcleo del servidor, panel de administración y sistema de autenticación de usuarios.
* **Django REST Framework (DRF)**: Construcción de la API de marcas, modelos de dispositivos y productos compatibles.
* **SQLite**: Base de datos ligera utilizada para el desarrollo local (migrable a PostgreSQL para producción).
* **django-environ**: Gestión segura de secretos e información sensible mediante archivos `.env`.

### Frontend
* **React (Vite / React 18+)**: Implementación del asistente visual paso a paso y el carrito dinámico.
* **Vanilla CSS**: Estilos premium responsivos basados en variables, efectos de vidrio (glassmorphism), transiciones fluidas y micro-animaciones.
* **Django Templates**: Estructura de páginas principales, perfiles e historial de compras.

### DevOps
* **Git y GitHub**: Control de versiones y alojamiento de código.

---

## ⚙️ Instrucciones de Instalación y Ejecución

Sigue estos pasos para levantar la aplicación en tu entorno local:

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd "Proyecto Final Full Stack"
```

### 2. Configurar el Backend (Django)
Crea un entorno virtual e instala las dependencias de Python:
```bash
# Crear entorno virtual
python3 -m venv venv

# Activar entorno virtual
source venv/bin/activate  # En macOS/Linux
# o venv\Scripts\activate en Windows

# Instalar dependencias
pip install -r requirements.txt
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto y define las siguientes variables básicas:
```env
DEBUG=True
SECRET_KEY=clave-secreta-para-desarrollo-local
ALLOWED_HOSTS=127.0.0.1,localhost
```

### 4. Migraciones e Inicialización de Datos (Seed)
Aplica las migraciones de base de datos e inyecta los datos de prueba (incluye categorías, marcas, modelos y un superusuario administrador):
```bash
# Crear y aplicar migraciones
python manage.py makemigrations
python manage.py migrate

# Cargar datos iniciales de prueba (Seed Data)
python seed_data.py
```
* **Credenciales del Administrador creadas por defecto**:
  * **Usuario**: `admin`
  * **Contraseña**: `admin123`

### 5. Configurar el Frontend (React)
Accede a la carpeta del frontend, instala las dependencias de Node.js y compila los archivos estáticos:
```bash
cd frontend
npm install
npm run build
cd ..
```
*Nota: El comando `npm run build` colocará los archivos estáticos listos para producción dentro de la carpeta `store/static/dist/` de Django.*

### 6. Ejecutar el Servidor
Inicia el servidor de desarrollo de Django:
```bash
python manage.py runserver
```
Accede desde tu navegador a: [http://127.0.0.1:8000](http://127.0.0.1:8000)

---

## 👥 Roles de Usuario y Permisos

1. **Visitante (Anónimo)**:
   * Puede buscar en el catálogo y utilizar el Asistente Inteligente de Compatibilidad.
   * Puede agregar productos al carrito temporal.
2. **Cliente (Registrado)**:
   * Puede ver sus pedidos anteriores y consultar el estado en la sección "Mis Pedidos".
   * Puede realizar compras desde el carrito e ingresar su dirección de envío.
3. **Administrador (Staff)**:
   * Acceso total al panel de administración en `/admin`.
   * Gestión de productos, marcas, modelos y pedidos de clientes.

---

## 🔒 Medidas de Seguridad Aplicadas

* **Protección contra Inyecciones SQL**: Parametrización automática mediante el ORM de Django.
* **Seguridad de Contraseñas**: Hashing mediante algoritmo de derivación de claves **PBKDF2 con SHA-256**.
* **Protección CSRF**: Protección activa en todos los formularios tradicionales y peticiones POST realizadas por el carrito de React mediante la cabecera `X-CSRFToken`.
* **Protección XSS**: Escapado automático de caracteres especiales en las plantillas Django y el renderizado seguro de React.
* **Seguridad de Secretos**: Exclusión estricta de las variables de entorno en el control de versiones a través de `.gitignore`.
