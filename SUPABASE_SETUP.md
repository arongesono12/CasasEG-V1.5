-- Supabase: seed-only SQL (sample data) data
Configuración de Supabase e integración con el proyecto

1) Crear un proyecto en Supabase
- Ve a https://app.supabase.com y crea un nuevo proyecto.
- Después de la creación, ve a Project Settings -> API y copia la `URL` y la clave `anon`.

2) Crear tablas y datos de ejemplo
- En el editor SQL de Supabase, pega el contenido de `supabase/setup.sql` y ejecútalo. Esto creará las tablas `users`, `properties`, `messages` y sembrará tres usuarios de prueba (Administrador, Propietario, Cliente).

3) Añadir variables de entorno
- Crea un archivo `.env` en la raíz del proyecto con lo siguiente (Vite espera el prefijo `VITE_`):

VITE_USE_SUPABASE=true
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>

- Reinicia `npm run dev` después de añadir el archivo `.env`.

4) Cómo utiliza el proyecto Supabase
- El proyecto incluye `src/services/supabaseClient.ts` y `src/services/supabaseService.ts` que usan los endpoints PostgREST provistos por Supabase (no es necesario el SDK).
- Cuando `VITE_USE_SUPABASE=true`, los contextos (`AuthContext`, `PropertyContext`, `MessagingContext`) intentan obtener datos remotos al montarse y recurren a los mocks locales si la petición falla.

5) Consultas de ejemplo (PostgREST)
- Para listar usuarios: GET https://<project>.supabase.co/rest/v1/users?select=*
- Para insertar: POST a /rest/v1/users con un body JSON y los encabezados `apikey`/`Authorization`.

6) Opcional: Usar el SDK oficial de Supabase
- Si prefieres usar el SDK oficial, ejecuta:

npm install @supabase/supabase-js

- Luego actualiza `supabaseClient.ts` para usar `createClient(url, key)` en lugar de llamadas directas con `fetch`.

7) Solución para la pantalla en blanco
- La aplicación ahora incluye un `ErrorBoundary` (`src/components/ErrorBoundary.tsx`) que evita la página en blanco y muestra una interfaz de error si ocurre una excepción durante el renderizado.

8) Próximos pasos
- Si prefieres un backend (Express) en lugar de usar Supabase directamente desde el frontend, puedo crear un directorio `server/` con endpoints que hagan proxy a Supabase o implementen la lógica de negocio.

