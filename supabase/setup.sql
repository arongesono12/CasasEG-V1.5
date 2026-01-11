# Supabase: execution order and quick notess de ejemplo

-- 1) Asegúrate de que la extensión para generar UUIDs aleatorias esté disponible
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2) Tabla: users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL,
  avatar text,
  password text,
  created_at timestamptz DEFAULT now()
);

-- 3) Tabla: properties
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  price numeric,
  location text,
  image_urls text[],
  bedrooms int,
  bathrooms int,
  area int,
  is_occupied boolean DEFAULT false,
  features text[],
  waiting_list uuid[] DEFAULT ARRAY[]::uuid[],
  status text DEFAULT 'active',
  rating numeric DEFAULT 5.0,
  review_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 4) Tabla: messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_id uuid REFERENCES users(id) ON DELETE CASCADE,
  to_id uuid REFERENCES users(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  content text,
  created_at timestamptz DEFAULT now()
);

-- 5) Semillas: usuarios de ejemplo
INSERT INTO users (id, name, email, role, avatar, password)
VALUES
  ('00000000-0000-0000-0000-000000000001','Administrador','admin@vesta.com','admin',NULL,'123'),
  ('00000000-0000-0000-0000-000000000002','Owner','owner@test.com','owner',NULL,'123'),
  ('00000000-0000-0000-0000-000000000003','Client','client@test.com','client',NULL,'123')
ON CONFLICT (email) DO NOTHING;

-- 6) Semilla: propiedad de ejemplo (usa el propietario por email)
INSERT INTO properties (id, owner_id, title, description, price, location, image_urls, bedrooms, bathrooms, area, is_occupied, features)
VALUES (
  '10000000-0000-0000-0000-000000000001',
  (SELECT id FROM users WHERE email='owner@test.com'),
  'Muestra: Apartamento Test',
  'Propiedad de ejemplo para desarrollo conectada a Supabase.',
  100000,
  'Ciudad Test',
  ARRAY['/storage/v1/object/public/images/img1.jpg'],
  2, 1, 75, false, ARRAY['Wifi','Cocina']
)
ON CONFLICT (id) DO NOTHING;

-- 7) Semilla: mensaje de ejemplo
INSERT INTO messages (id, from_id, to_id, property_id, content)
VALUES (
  '20000000-0000-0000-0000-000000000001',
  (SELECT id FROM users WHERE email='client@test.com'),
  (SELECT id FROM users WHERE email='owner@test.com'),
  (SELECT id FROM properties WHERE id='10000000-0000-0000-0000-000000000001'),
  'Hola, estoy interesado en esta propiedad.'
)
ON CONFLICT (id) DO NOTHING;

-- Notas:
-- - Usa este archivo en el SQL editor de Supabase tal cual. Primero ejecuta todo para crear extensiones y tablas,
--   luego las sentencias INSERT insertarán los datos de ejemplo. Si algún SELECT devuelve NULL (por ejemplo
--   si el usuario owner@test.com no existe), modifica el INSERT de la propiedad para usar un owner_id explícito.
-- - Si prefieres UUIDs generados automáticamente, puedes omitir los valores `id` en los INSERTs.
