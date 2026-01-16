-- Script de REPARACIÓN para el usuario Administrador
-- Correo: arongesono@outlook.es
-- Contraseña: Admin1234@

DO $$
DECLARE
  uid UUID;
BEGIN
  -- 1. Intentar obtener el ID si ya existe
  SELECT id INTO uid FROM auth.users WHERE email = 'arongesono@outlook.es';

  IF uid IS NULL THEN
    -- 2. Si no existe, crearlo desde cero
    uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, 
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
      created_at, updated_at, confirmation_token, recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      uid,
      'authenticated',
      'authenticated',
      'arongesono@outlook.es',
      crypt('Admin1234@', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name": "Aron G Esono", "role": "admin"}',
      now(), now(), '', ''
    );
  ELSE
    -- 3. Si existe, forzar la actualización de contraseña y confirmar email
    UPDATE auth.users 
    SET 
      encrypted_password = crypt('Admin1234@', gen_salt('bf')),
      email_confirmed_at = now(),
      raw_user_meta_data = '{"full_name": "Aron G Esono", "role": "admin"}',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}',
      updated_at = now()
    WHERE id = uid;
  END IF;

  -- 4. Asegurar que el perfil público esté correcto y sincronizado
  INSERT INTO public.users (id, name, email, role)
  VALUES (uid, 'Aron G Esono', 'arongesono@outlook.es', 'admin')
  ON CONFLICT (id) DO UPDATE 
  SET role = 'admin', name = 'Aron G Esono', email = 'arongesono@outlook.es';

END $$;
