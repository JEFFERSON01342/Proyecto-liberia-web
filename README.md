# Librería Lisjuashde — Web Cliente 🛒

Tienda en línea (storefront) de **Librería Lisjuashde**, desarrollada como parte del proyecto académico de **Ingeniería de Software I** — Universidad Nacional de Ingeniería (UNI), Nicaragua.

Esta es la **parte pública / cliente** del sistema. Permite a los visitantes explorar el catálogo de productos, ver promociones, armar su carrito, pagar (simulado) y descargar su factura en PDF. La administración del negocio vive en un proyecto separado (panel ERP).

🔗 **Producción:** https://librerialisjuashde.netlify.app

---

## ✨ Características principales

- **Catálogo público** de productos con búsqueda e imágenes.
- **Promociones y descuentos dinámicos**: badges de "% OFF" / "C$ OFF", precios tachados y banner animado de ofertas activas.
- **Carrito de compras** con cálculo automático de totales en córdobas (**C$**).
- **Acceso público al inicio**; solo se solicita iniciar sesión al **añadir al carrito** o **subir un documento** para impresión.
- **Checkout** con dos métodos de pago:
  - Pago en local.
  - Pago con tarjeta **simulado** (validación Luhn, detección de marca VISA/MasterCard/AMEX).
- **Factura en PDF** descargable al confirmar el pedido.
- **Número de orden** (formato `P-XXXX` / `I-XXXX`) y modal de confirmación.
- **Servicio de impresión de documentos** para clientes.
- Interfaz 100% en **español**, moneda **córdoba nicaragüense (C$)**.

---

## 🧰 Tecnologías

- **React 18** + **Vite**
- **Tailwind CSS**
- **Supabase** (PostgreSQL) como backend/base de datos
- **jsPDF** + **jspdf-autotable** para la generación de facturas
- **Netlify** para el hosting

---

## 🚀 Puesta en marcha (desarrollo local)

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno (crear archivo .env en la raíz)
#    VITE_SUPABASE_URL=...
#    VITE_SUPABASE_ANON_KEY=...
#    VITE_LIBRERIA_EMPRESA_ID=1

# 3. Levantar el servidor de desarrollo
npm run dev

# 4. Compilar para producción
npm run build
```

---

## 📦 Estructura del proyecto

```
src/
├── components/
│   ├── store/        # Vista de tienda, grid de productos, banner de promos
│   └── modals/       # Carrito, pago con tarjeta, confirmación de orden
├── context/
│   └── AppContext.jsx  # Estado global: carrito, auth, descuentos, checkout
├── utils/
│   └── generarFacturaClientePDF.js  # Generación de facturas PDF
└── ...
```

---

## 🏢 Sobre el sistema

Librería Lisjuashde está dividida en dos aplicaciones independientes que comparten una misma base de datos Supabase:

| Aplicación | Descripción | Repositorio |
|------------|-------------|-------------|
| **Web Cliente** (este repo) | Tienda pública para clientes | [Libreria-Lisjuashde-Web-Client](https://github.com/Stevenalv123/Libreria-Lisjuashde-Web-Client) |
| **Sistema Admin (ERP)** | Panel administrativo: inventario, ventas, RRHH, reportes | [Libreria-Lisjuashde-Admin-Project](https://github.com/Stevenalv123/Libreria-Lisjuashde-Admin-Project) |

- Empresa fija: **Librería Lisjuashde** (`EMPRESA_ID = 1`).
- Moneda: **córdoba nicaragüense (C$)**.
- Idioma: **español**.

---

## 👥 Proyecto académico

Desarrollado para la asignatura **Ingeniería de Software I** — Universidad Nacional de Ingeniería (UNI), Nicaragua.
