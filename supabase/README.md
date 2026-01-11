# Supabase: orden de ejecución y notas rápidas

Este archivo describe el orden recomendado para preparar la base de datos en Supabase y ejecutar los scripts incluidos en este repositorio.

Orden recomendado:

1. Abrir el **SQL editor** del proyecto en https://app.supabase.com.
2. Pegar y ejecutar todo el contenido de `supabase/setup.sql` — esto crea la extensión necesaria y las tablas (`users`, `properties`, `messages`).
3. Pegar y ejecutar `supabase/seed_only.sql` para insertar los datos de ejemplo (usuarios, propiedad y un mensaje).

Variables de entorno (frontend Vite):

- Añade en la raíz del proyecto un archivo `.env` con:

```
VITE_USE_SUPABASE=true
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

- Si usas el proxy backend, habilita `VITE_USE_API=true` en lugar de llamar directamente a Supabase desde el frontend.

Notas importantes:

- `supabase/setup.sql` crea la extensión `pgcrypto` para usar `gen_random_uuid()`; en el SQL editor de Supabase esto suele permitirse. Si la creación de la extensión falla por permisos, contacta con el administrador del proyecto o crea UUIDs manualmente en los INSERTs.
- Los `INSERT` en `supabase/seed_only.sql` usan IDs fijos para facilitar pruebas; puedes omitir la columna `id` en los INSERTs para que la base de datos genere UUIDs automáticamente.
- Asegúrate de ejecutar primero `setup.sql` (creación de tablas) antes de `seed_only.sql` para evitar errores de referencia a tablas/usuarios inexistentes.

Verificación rápida (opcional):

- En el SQL editor, tras ejecutar los scripts puedes verificar filas con consultas simples:

```
SELECT count(*) FROM users;
SELECT count(*) FROM properties;
SELECT count(*) FROM messages;
```

Si necesitas que genere instrucciones para importar estas tablas usando `psql` o scripts automatizados, dímelo y lo añado.
