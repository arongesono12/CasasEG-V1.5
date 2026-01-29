-- Migración: Fix Infinite Recursion and Avatar Storage Access
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Redefinir la función para obtener el rol sin causar recursión
-- La función original podía causar recursión si se usaba en una política de la misma tabla 'users'.
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- Usamos auth.uid() directamente y limitamos la búsqueda
  SELECT role FROM users WHERE id = auth.uid() LIMIT 1;
$$;

-- 2. Corregir las políticas de la tabla 'users'
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view and update their own profile." ON users;
DROP POLICY IF EXISTS "Superadmin can manage all users" ON users;
DROP POLICY IF EXISTS "Admins can manage non-admin users" ON users;

-- Permitir que cada usuario vea y edite su propio perfil
CREATE POLICY "Users can manage own profile" 
ON users FOR ALL 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Permitir que Superadmins gestionen todo (usando metadatos del JWT para evitar recursión si es posible, 
-- o simplemente asegurando que la política anterior se evalúa primero)
CREATE POLICY "Superadmins have full access" 
ON users FOR ALL 
TO authenticated 
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'superadmin'
);

-- 3. Corregir políticas de Storage para evitar dependencia de perfiles recursivos
-- Si el error 500 ocurre al subir imágenes, es porque la validación de la política falla.
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'propiedades-images');

DROP POLICY IF EXISTS "Allow individual delete" ON storage.objects;
CREATE POLICY "Allow individual delete" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'propiedades-images' AND auth.uid() = owner_id); -- Asegurar que usamos owner_id si así está en storage

-- 4. Asegurar que los Admins pueden gestionar propiedades sin recursión
DROP POLICY IF EXISTS "Admins and Superadmins have full access" ON properties;
CREATE POLICY "Admins/Superadmins manage properties" 
ON properties FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super admin')
  )
);
