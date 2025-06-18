# 🚀 Bukialo CRM - Sistema Especializado para Agencias de Viajes

<div align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/Node.js-18+-green.svg" alt="Node">
  <img src="https://img.shields.io/badge/React-18.2-61dafb.svg" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.3-blue.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
</div>
## 📋 Descripción

Bukialo CRM es un sistema de gestión de relaciones con clientes (CRM) especializado para agencias de viajes, que integra inteligencia artificial para automatizar procesos, analizar datos y personalizar la experiencia del cliente.

### 🌟 Características Principales

* **Gestión Inteligente de Contactos** : Pipeline visual para gestionar leads (Interesados → Pasajeros → Clientes)
* **IA Integrada con Google Gemini** : Chat IA para consultas, análisis automático y generación de contenido
* **Automatizaciones Inteligentes** : Triggers y acciones automáticas basadas en comportamiento
* **Sistema de Campañas** : Email marketing personalizado con IA
* **Calendario de Viajes** : Gestión completa de eventos y seguimientos
* **Dashboard Analytics** : Métricas en tiempo real con visualizaciones dinámicas
* **Diseño Glassmorphism** : UI moderna con efectos de cristal y gradientes

## 🛠️ Stack Tecnológico

### Frontend

* **React 18** con TypeScript
* **Tailwind CSS** con tema glassmorphism personalizado
* **Zustand** para gestión de estado
* **React Query** para caché y sincronización
* **Firebase Authentication**
* **Recharts** para visualizaciones

### Backend

* **Node.js** con Express y TypeScript
* **Prisma ORM** con PostgreSQL
* **Bull.js** + Redis para colas de tareas
* **Google Gemini API** para IA
* **Nodemailer** para emails
* **Firebase Admin SDK**

## 🚀 Instalación y Configuración

### Prerrequisitos

* Node.js 18+ y npm 9+
* PostgreSQL 14+
* Redis (para colas de tareas)
* Cuenta de Firebase
* API Key de Google Gemini

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/bukialo-crm.git
cd bukialo-crm
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus credenciales
```

### 4. Configurar la base de datos

```bash
# Crear base de datos PostgreSQL
createdb bukialo_crm

# Ejecutar migraciones (cuando estén disponibles)
npm run db:migrate

# Cargar datos de prueba (cuando estén disponibles)
npm run db:seed
```

### 5. Iniciar el desarrollo

```bash
# Iniciar frontend y backend
npm run dev

# O por separado:
npm run dev:frontend  # Frontend en http://localhost:3000
npm run dev:backend   # Backend en http://localhost:5000
```

## 📁 Estructura del Proyecto

```
bukialo-crm/
├── packages/
│   ├── frontend/          # Aplicación React
│   │   ├── src/
│   │   │   ├── components/    # Componentes reutilizables
│   │   │   ├── pages/        # Páginas de la aplicación
│   │   │   ├── hooks/        # Custom hooks
│   │   │   ├── store/        # Estado global (Zustand)
│   │   │   ├── services/     # Servicios API
│   │   │   ├── utils/        # Utilidades
│   │   │   └── styles/       # Estilos globales
│   │   └── public/           # Assets públicos
│   │
│   ├── backend/           # API REST
│   │   ├── src/
│   │   │   ├── controllers/  # Controladores
│   │   │   ├── services/     # Lógica de negocio
│   │   │   ├── routes/       # Rutas API
│   │   │   ├── middlewares/  # Middlewares
│   │   │   ├── utils/        # Utilidades
│   │   │   └── types/        # Tipos TypeScript
│   │   └── prisma/           # Schema y migraciones
│   │
│   └── shared/            # Código compartido
│       └── src/
│           ├── types/        # Tipos compartidos
│           └── utils/        # Utilidades compartidas
│
├── docker/                # Configuraciones Docker
├── docs/                  # Documentación
└── scripts/               # Scripts de automatización
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia frontend y backend
npm run dev:frontend     # Solo frontend
npm run dev:backend      # Solo backend

# Build
npm run build           # Build de producción
npm run build:frontend  # Build solo frontend
npm run build:backend   # Build solo backend

# Base de datos
npm run db:migrate      # Ejecutar migraciones
npm run db:seed         # Cargar datos de prueba
npm run db:studio       # Abrir Prisma Studio

# Testing
npm run test            # Ejecutar tests
npm run test:watch      # Tests en modo watch

# Linting y formato
npm run lint            # Ejecutar ESLint
npm run format          # Formatear código con Prettier
```

## 🎨 Personalización del Tema

El tema glassmorphism se puede personalizar en:

* `/packages/frontend/tailwind.config.js` - Configuración de Tailwind
* `/packages/frontend/src/styles/globals.css` - Estilos globales y variables CSS

### Variables CSS principales:

```css
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
--accent-color: #00d4ff;
--success-color: #00ff88;
--dark-bg: #1a1d2e;
```

## 🤖 Integración con IA

La integración con Google Gemini permite:

* Chat interactivo para consultas de datos
* Generación automática de contenido para emails
* Análisis predictivo de clientes
* Sugerencias de acciones comerciales
* Insights automáticos sobre tendencias

## 📊 Estados de Cliente

El CRM maneja tres estados principales de cliente:

1. **🔵 Interesado** : Leads iniciales que muestran interés
2. **🟡 Pasajero** : Clientes con viajes cotizados o reservados
3. **🟢 Cliente** : Clientes recurrentes con historial de compras

## 🔒 Seguridad

* Autenticación mediante Firebase Auth
* JWT para autorización de API
* Rate limiting en endpoints
* Validación de datos con Zod
* Sanitización de inputs
* HTTPS en producción

## 🚢 Deployment

El proyecto está preparado para deployment con Docker:

```bash
# Build de imágenes
docker-compose build

# Iniciar servicios
docker-compose up -d
```

## 📝 Licencia

Este proyecto está bajo licencia MIT. Ver archivo `LICENSE` para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Para soporte y consultas:

* Email: support@bukialo.com
* Documentación: [docs.bukialo.com](https://docs.bukialo.com/)
* Issues: [GitHub Issues](https://github.com/tu-usuario/bukialo-crm/issues)

---

<div align="center">
  Desarrollado con ❤️ para agencias de viajes modernas
</div>
