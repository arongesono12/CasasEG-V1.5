# Guía de Despliegue: GitHub y Netlify

Esta guía te ayudará a subir tu proyecto a GitHub y desplegarlo en Netlify para que sea accesible públicamente.

## 1. Preparar el Repositorio en GitHub

1. **Crea un nuevo repositorio** en [GitHub](https://github.com/new). Ponle un nombre (ej. `CasasEG-V1.5`).
2. **Abre una terminal** en la carpeta de tu proyecto.
3. **Inicializa git** (si aún no lo has hecho):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - CasasEG V1.5"
   ```
4. **Vincula con GitHub**:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git branch -M main
   git push -u origin main
   ```

## 2. Desplegar en Netlify

1. **Inicia sesión** en [Netlify](https://app.netlify.com/).
2. Haz clic en **"Add new site"** -> **"Import an existing project"**.
3. Selecciona **GitHub** y autoriza el acceso.
4. Elige el repositorio que acabas de subir.
5. **Configuración de Build**:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist` (o la carpeta que genere tu comando de build).
6. **Variables de Entorno (MUY IMPORTANTE)**:
   - Ve a **Site configuration** -> **Environment variables**.
   - Añade las siguientes variables con sus valores de tu archivo `.env`:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_USE_SUPABASE=true`
7. Haz clic en **"Deploy site"**.

## 3. Actualizar Cambios

Cada vez que hagas cambios en tu código local y quieras que se vean en Netlify:

1. Guarda tus cambios: `git add .`
2. Haz un commit: `git commit -m "Descripción del cambio"`
3. Sube a GitHub: `git push origin main`
   Netlify detectará el cambio automáticamente y volverá a desplegar la aplicación.

---

> [!TIP]
> Recuerda añadir la URL que te asigne Netlify (ej. `casaseg.netlify.app`) en la sección de **"Redirect URLs"** de Supabase para que el login de Google funcione en producción.
