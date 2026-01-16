-- Script SQL para crear un usuario administrador en Supabase
-- Correo: arongesono@outlook.es
-- Contraseña: Admin1234@

-- 1. Asegurarse de que pgcrypto esté disponible
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Insertar en auth.users (Tabla interna de Supabase Auth)
-- Generamos un UUID nuevo para el usuario
DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
BEGIN
  -- Insertamos en la tabla de autenticación
  INSERT INTO auth.users (
    instance_id, 
    id, 
    aud, 
    role, 
    email, 
    encrypted_password, 
    email_confirmed_at, 
    recovery_sent_at, 
    last_sign_in_at, 
    raw_app_meta_data, 
    raw_user_meta_data, 
    created_at, 
    updated_at, 
    confirmation_token, 
    email_change, 
    email_change_token_new, 
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    'arongesono@outlook.es',
    crypt('Admin1234@', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name": "Aron G Esono", "role": "admin"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (email) DO NOTHING;

  -- 3. Insertar en la tabla pública public.users (Perfil de la aplicación)
  -- Buscamos el ID recién creado (o el existente si falló el insert anterior por duplicado)
  INSERT INTO public.users (id, name, email, role, avatar, password)
  SELECT id, 'Aron G Esono', 'arongesono@outlook.es', 'admin', NULL, 'Admin1234@'
  FROM auth.users 
  WHERE email = 'arongesono@outlook.es'
  ON CONFLICT (email) DO UPDATE 
  SET role = 'admin', name = 'Aron G Esono';

END $$;
