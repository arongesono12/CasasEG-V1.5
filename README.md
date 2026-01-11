# 🏠 CasasEG - Plataforma de Alquiler de Viviendas

![Version](https://img.shields.io/badge/version-1.5.0-blue.svg)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.18-06B6D4?logo=tailwindcss)

Plataforma moderna de alquiler de propiedades inmobiliarias con funcionalidades avanzadas de gestión, mensajería en tiempo real y sistema de roles.

## ✨ Características

- 🔐 **Sistema de Autenticación** - Login/Registro con roles (Cliente, Propietario, Administrador)
- 🏘️ **Gestión de Propiedades** - CRUD completo con carga de imágenes
- 💬 **Sistema de Mensajería** - Chat en tiempo real entre usuarios
- 🔍 **Búsqueda Avanzada** - Filtrado por ubicación, precio y características
- ⭐ **Sistema de Valoraciones** - Rating interactivo de propiedades
- 📱 **Diseño Responsive** - Optimizado para móviles y escritorio
- 🎨 **UI/UX Moderna** - Interfaz limpia inspirada en Airbnb
- 🔔 **Notificaciones** - Sistema de alertas para disponibilidad

## 🏗️ Arquitectura del Proyecto

```
CasasEG-V1.5/
├── src/
│   ├── components/          # Componentes React organizados por feature
│   │   ├── ui/             # Componentes UI reutilizables
│   │   │   ├── Button.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── ImageViewer.tsx
│   │   │   └── PropertyCardSkeleton.tsx
│   │   ├── property/       # Componentes de propiedades
│   │   │   ├── PropertyCard.tsx
│   │   │   ├── PropertyDetailsView.tsx
│   │   │   ├── CreatePropertyModal.tsx
│   │   │   └── SearchBar.tsx
│   │   ├── messaging/      # Sistema de mensajería
│   │   │   ├── MessagesModal.tsx
│   │   │   └── LoginModal.tsx
│   │   ├── layout/         # Componentes de layout
│   │   │   ├── Header.tsx
│   │   │   └── MobileNavigation.tsx
│   │   └── Icons.tsx       # Iconos centralizados
│   ├── contexts/           # Context API para estado global
│   │   ├── AuthContext.tsx
│   │   ├── PropertyContext.tsx
│   │   └── MessagingContext.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useToast.ts
│   │   ├── usePagination.ts
│   │   └── usePropertyFilters.ts
│   ├── types/              # TypeScript types e interfaces
│   │   └── index.ts
│   ├── constants/          # Constantes y datos mock
│   │   ├── config.ts
│   │   └── mockData.ts
│   ├── services/           # Servicios externos (API, etc.)
│   │   └── geminiService.ts
│   ├── utils/              # Funciones utilitarias
│   │   └── helpers.ts
│   ├── styles/             # Estilos globales
│   │   └── global.css
│   ├── App.tsx             # Componente principal
│   └── index.tsx           # Entry point
├── public/                 # Archivos estáticos
├── index.html             # HTML principal
├── tailwind.config.js     # Configuración de Tailwind
├── tsconfig.json          # Configuración de TypeScript
├── vite.config.ts         # Configuración de Vite
└── package.json           # Dependencias del proyecto
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js >= 18.0.0
- npm o yarn

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd CasasEG-V1.5
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

### Comandos Disponibles

```bash
npm run dev      # Inicia el servidor de desarrollo
npm run build    # Construye para producción
npm run preview  # Vista previa de la build de producción
npm run lint     # Ejecuta el linter de TypeScript
```

## 🎯 Stack Tecnológico

### Frontend
- **React 19.2.3** - Biblioteca UI
- **TypeScript 5.8.2** - Tipado estático
- **Tailwind CSS 4.1.18** - Framework CSS utility-first
- **Vite 6.2.0** - Build tool y dev server
- **Lucide React** - Iconos modernos

### Herramientas de Desarrollo
- **ESLint** - Linter de código
- **PostCSS** - Procesamiento de CSS
- **Autoprefixer** - Prefijos CSS automáticos

## 📦 Características de la Arquitectura

### 🎯 Separación de Responsabilidades
- **Componentes** organizados por funcionalidad
- **Custom Hooks** para lógica reutilizable
- **Context API** para estado global
- **Servicios** separados para APIs externas

### 🔄 Estado Global
- **AuthContext** - Gestión de autenticación
- **PropertyContext** - Gestión de propiedades
- **MessagingContext** - Gestión de mensajes y notificaciones

### 🎨 Componentes Reutilizables
- Botones, Toasts, Skeletons
- Sistema de diseño consistente
- Props tipadas con TypeScript

### 🧩 Hooks Personalizados
- `useToast` - Notificaciones temporales
- `usePagination` - Paginación automática
- `usePropertyFilters` - Filtrado inteligente

## 👥 Roles de Usuario

### Cliente
- Ver propiedades disponibles
- Contactar propietarios
- Sistema de mensajería
- Valorar propiedades

### Propietario
- Publicar propiedades
- Gestionar sus publicaciones
- Responder mensajes
- Ver estadísticas

### Administrador
- Supervisión global
- Suspender/Activar propiedades
- Gestión de usuarios
- Acceso completo

## 🔐 Usuarios de Prueba

```javascript
// Admin
Email: admin@vesta.com
Password: 123

// Propietario
Email: owner@test.com
Password: 123

// Cliente
Email: client@test.com
Password: 123
```

## 🎨 Características de UI/UX

- ✨ Animaciones suaves y transiciones
- 📱 100% responsive (mobile-first)
- 🎭 Skeleton loaders para mejor UX
- 🖼️ Visor de imágenes en pantalla completa
- 🔄 Carrusel de imágenes con navegación
- 💫 Efectos hover y estados activos
- 🎯 Navegación intuitiva
- 🌐 Búsqueda en tiempo real

## 📱 Compatibilidad

- ✅ Chrome/Edge (últimas versiones)
- ✅ Firefox (últimas versiones)
- ✅ Safari (últimas versiones)
- ✅ Dispositivos móviles iOS/Android

## 🛠️ Mejoras Futuras

- [ ] Backend con Node.js/Express
- [ ] Base de datos (PostgreSQL/MongoDB)
- [ ] Autenticación JWT
- [ ] Upload de imágenes real (Cloudinary/S3)
- [ ] Notificaciones push
- [ ] Sistema de pagos (Stripe)
- [ ] Geolocalización con mapas
- [ ] PWA (Progressive Web App)
- [ ] Tests unitarios e integración
- [ ] CI/CD pipeline

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👨‍💻 Autor

Desarrollado con ❤️ para CasasEG

---

**Versión:** 1.5.0  
**Última actualización:** Enero 2026
