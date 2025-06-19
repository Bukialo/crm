# Bukialo CRM 🌍✈️

Sistema CRM especializado para agencias de viajes con IA integrada, diseñado para gestionar leads, contactos y automatizar procesos de ventas.

## 🚀 Características Principales

- **Gestión Inteligente de Contactos**: Pipeline visual (Interesados → Pasajeros → Clientes)
- **IA Integrada**: Chat assistant con Google Gemini para análisis y automatizaciones
- **Email Marketing**: Plantillas personalizables y campañas automatizadas
- **Dashboard Analytics**: Métricas en tiempo real y visualizaciones interactivas
- **Automatizaciones**: Triggers inteligentes y acciones personalizadas
- **Calendario Integrado**: Gestión de eventos y seguimientos
- **Diseño Glassmorphism**: UI moderna con efectos visuales atractivos

## 🏗️ Arquitectura

### Stack Tecnológico

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS + Glassmorphism
- Zustand (Estado global)
- React Query (Gestión de datos)
- Firebase Auth (Autenticación)

**Backend:**
- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- Google Gemini API (IA)
- Bull.js + Redis (Colas)
- Nodemailer (Emails)

**Infraestructura:**
- Docker + Docker Compose
- Monorepo con Workspaces
- CI/CD ready

## 📦 Estructura del Proyecto

```
bukialo-crm/
├── packages/
│   ├── frontend/          # React + TypeScript
│   ├── backend/           # Node.js + Express  
│   └── shared/            # Tipos compartidos
├── docker/                # Configuraciones Docker
├── docs/                  # Documentación
└── scripts/               # Scripts de automatización
```

## 🛠️ Instalación y Desarrollo

### Prerrequisitos

- Node.js 18+
- npm 9+
- PostgreSQL 14+
- Redis (para colas)
- Docker (opcional)

### Configuración Rápida

1. **Clonar el repositorio:**
```bash
git clone https://github.com/your-org/bukialo-crm.git
cd bukialo-crm
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
```bash
# Frontend (.env en packages/frontend/)
cp packages/frontend/.env.example packages/frontend/.env

# Backend (.env en packages/backend/)
cp packages/backend/.env.example packages/backend/.env
```

4. **Configurar base de datos:**
```bash
npm run db:migrate
npm run db:seed
```

5. **Iniciar desarrollo:**
```bash
npm run dev
```

La aplicación estará disponible en:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

### Variables de Entorno Clave

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=bukialo-crm
```

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/bukialo_crm
FIREBASE_PROJECT_ID=bukialo-crm
GEMINI_API_KEY=your_gemini_api_key
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
REDIS_URL=redis://localhost:6379
```

## 🐳 Docker

### Desarrollo con Docker

```bash
# Construir contenedores
npm run docker:build

# Iniciar servicios
npm run docker:up

# Ver logs
npm run docker:logs

# Detener servicios
npm run docker:down
```

### Servicios Docker

- **Frontend**: Puerto 3000
- **Backend**: Puerto 5000
- **PostgreSQL**: Puerto 5432
- **Redis**: Puerto 6379
- **Nginx**: Puerto 80 (producción)

## 📊 Funcionalidades Principales

### 1. Gestión de Contactos

- **Estados**: Interesado → Pasajero → Cliente
- **Filtros avanzados** por estado, fuente, agente, etc.
- **Import/Export** masivo de contactos (CSV/Excel)
- **Pipeline visual** drag & drop
- **Notas y seguimientos** automáticos

### 2. IA Assistant

```typescript
// Ejemplos de consultas
"¿Cuántos contactos nuevos tuvimos este mes?"
"Muéstrame los destinos más populares"
"Genera un reporte de ventas del último trimestre"
"¿Qué clientes tienen viajes próximos?"
```

### 3. Email Marketing

- **Plantillas personalizables** con variables dinámicas
- **Segmentación inteligente** de audiencias
- **Campañas automatizadas** basadas en triggers
- **Analytics detallados** (tasas de apertura, clics, conversiones)

### 4. Automatizaciones

```typescript
// Ejemplo de trigger
{
  type: 'CONTACT_CREATED',
  conditions: { status: 'INTERESADO' },
  actions: [
    { type: 'SEND_EMAIL', template: 'welcome' },
    { type: 'SCHEDULE_CALL', delay: 24 }
  ]
}
```

## 🎨 Diseño y UX

### Paleta de Colores

```css
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --accent-color: #00d4ff;
  --success-color: #00ff88;
}
```

### Componentes Principales

- **Glassmorphism Cards**: Efectos de vidrio translúcido
- **Dashboard Interactivo**: Métricas en tiempo real
- **Chat IA Flotante**: Asistente siempre disponible
- **Pipeline Visual**: Gestión drag & drop de contactos

## 📈 Analytics y Reportes

### Métricas Principales

- **Conversión por etapa**: Interesados → Pasajeros → Clientes
- **Rendimiento por agente**: Ventas, conversiones, contactos gestionados
- **Destinos populares**: Análisis de tendencias de viajes
- **ROI de campañas**: Efectividad de email marketing

### Dashboards

- **Resumen ejecutivo**: KPIs principales
- **Ventas**: Gráficos de tendencias y proyecciones
- **Marketing**: Performance de campañas
- **Agentes**: Comparativas de rendimiento

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia frontend + backend + shared
npm run dev:frontend     # Solo frontend
npm run dev:backend      # Solo backend

# Build
npm run build           # Build completo
npm run build:frontend  # Build frontend
npm run build:backend   # Build backend

# Base de datos
npm run db:migrate      # Ejecutar migraciones
npm run db:seed         # Datos de ejemplo
npm run db:reset        # Resetear BD

# Testing
npm run test           # Tests completos
npm run typecheck      # Verificar tipos TypeScript
npm run lint           # Linting

# Docker
npm run docker:build   # Construir imágenes
npm run docker:up      # Iniciar servicios
npm run docker:down    # Detener servicios

# Utilidades
npm run clean          # Limpiar builds
npm run ai:test        # Test integración Gemini
```

## 🧪 Testing

### Frontend Testing
```bash
cd packages/frontend
npm run test
```

### Backend Testing
```bash
cd packages/backend
npm run test
```

### E2E Testing
```bash
npm run test:e2e
```

## 📚 Documentación API

Una vez iniciado el backend, la documentación Swagger estará disponible en:
```
http://localhost:5000/api/docs
```

### Endpoints Principales

```
GET    /api/contacts           # Listar contactos
POST   /api/contacts           # Crear contacto
PUT    /api/contacts/:id       # Actualizar contacto
DELETE /api/contacts/:id       # Eliminar contacto

GET    /api/dashboard          # Datos dashboard
GET    /api/ai/query           # Consulta IA
POST   /api/emails/send        # Enviar email
```

## 🚀 Deployment

### Producción con Docker

```bash
# Build para producción
npm run build

# Deploy con Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### Variables de Producción

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db:5432/bukialo_crm
REDIS_URL=redis://prod-redis:6379
GEMINI_API_KEY=your_production_key
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

### Convenciones

- **Commits**: Usar [Conventional Commits](https://conventionalcommits.org/)
- **Branches**: `feature/`, `bugfix/`, `hotfix/`
- **TypeScript**: Strict mode habilitado
- **ESLint**: Seguir las reglas configuradas

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

- **Issues**: [GitHub Issues](https://github.com/your-org/bukialo-crm/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/bukialo-crm/discussions)
- **Email**: support@bukialo.com

## 🎯 Roadmap

### v1.1 (Próximo Release)
- [ ] Integración WhatsApp Business
- [ ] Dashboard móvil responsive
- [ ] Exportación de reportes PDF
- [ ] Integración Google Calendar

### v1.2 (Futuro)
- [ ] App móvil React Native
- [ ] Integración con sistemas de reservas
- [ ] IA predictiva de ventas
- [ ] Multi-idioma (i18n)

### v2.0 (Visión)
- [ ] Marketplace de integraciones
- [ ] IA generativa para itinerarios
- [ ] Realidad aumentada para destinos
- [ ] Blockchain para verificación de viajes

---

**Bukialo CRM** - Transformando la gestión de agencias de viajes con tecnología de vanguardia 🚀