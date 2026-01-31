-- Script SQL para crear un usuario administrador en Supabase
-- Correo: arongesono@outlook.es
-- Contraseña: Admin1234@

-- 1. Asegurarse de que pgcrypto esté disponible
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Insertar en auth.users y public.users
DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
  user_email TEXT := 'arongesono@outlook.es';
  user_password TEXT := 'Admin1234@';
  user_role TEXT := 'admin';
  user_name TEXT := 'Aron G Esono';
  existing_user_id UUID;
BEGIN
  -- Verificar si el usuario ya existe en auth.users para evitar error 42P10
  SELECT id INTO existing_user_id FROM auth.users WHERE email = user_email;

  IF existing_user_id IS NULL THEN
    -- Insertamos en la tabla de autenticación si no existe
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
      user_email,
      crypt(user_password, gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      json_build_object('full_name', user_name, 'role', user_role),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
    existing_user_id := new_user_id;
  END IF;

  -- 3. Insertar o Actualizar en la tabla pública public.users
  INSERT INTO public.users (id, name, email, role, avatar, password)
  VALUES (existing_user_id, user_name, user_email, user_role, NULL, user_password)
  ON CONFLICT (email) DO UPDATE 
  SET role = EXCLUDED.role, name = EXCLUDED.name;

END $$;
