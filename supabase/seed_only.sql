-- Supabase: seed-only SQL (datos de ejemplo)
-- Ejecuta este archivo después de crear las tablas.

-- 1) Usuarios de ejemplo
INSERT INTO users (id, name, email, role, avatar, password)
VALUES
  ('00000000-0000-0000-0000-000000000001','Administrador','admin@vesta.com','admin',NULL,'123'),
  ('00000000-0000-0000-0000-000000000002','Owner','owner@test.com','owner',NULL,'123'),
  ('00000000-0000-0000-0000-000000000003','Client','client@test.com','client',NULL,'123')
ON CONFLICT (email) DO NOTHING;

-- 2) Propiedad de ejemplo (usa el propietario por email)
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

-- 3) Mensaje de ejemplo
INSERT INTO messages (id, from_id, to_id, property_id, content)
VALUES (
  '20000000-0000-0000-0000-000000000001',
  (SELECT id FROM users WHERE email='client@test.com'),
  (SELECT id FROM users WHERE email='owner@test.com'),
  (SELECT id FROM properties WHERE id='10000000-0000-0000-0000-000000000001'),
  'Hola, estoy interesado en esta propiedad.'
)
ON CONFLICT (id) DO NOTHING;
