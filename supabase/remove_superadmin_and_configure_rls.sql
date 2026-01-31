-- Script para eliminar reglas de Superadmin y configurar RLS
-- Solo Admins pueden gestionar Usuarios y Propiedades
-- Propietarios solo pueden gestionar sus propias viviendas
-- Ejecutar en el SQL Editor de Supabase

-- =================================================================
-- 1. Asegurar que la función get_user_role() no cause recursión
-- =================================================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM users WHERE id = auth.uid() LIMIT 1;
$$;

-- =================================================================
-- 2. ELIMINAR TODAS LAS POLÍTICAS RELACIONADAS CON SUPERADMIN
-- =================================================================

-- Eliminar políticas de la tabla 'users' relacionadas con superadmin
DROP POLICY IF EXISTS "Superadmins have full access" ON public.users;
DROP POLICY IF EXISTS "Superadmin can manage all users" ON public.users;
DROP POLICY IF EXISTS "Superadmins/Admins full access" ON public.users;
DROP POLICY IF EXISTS "Admins can manage non-admin users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;

-- Eliminar políticas de la tabla 'properties' relacionadas con superadmin
DROP POLICY IF EXISTS "Admins and Superadmins have full access" ON public.properties;
DROP POLICY IF EXISTS "Admins/Superadmins manage properties" ON public.properties;
DROP POLICY IF EXISTS "Superadmins have full access to all properties" ON public.properties;

-- Eliminar otras políticas antiguas que puedan existir
DROP POLICY IF EXISTS "Users can view and update their own profile." ON public.users;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.users;
DROP POLICY IF EXISTS "Admins have full access to all properties" ON public.properties;
DROP POLICY IF EXISTS "Public can view active properties." ON public.properties;
DROP POLICY IF EXISTS "Owners can view their own properties." ON public.properties;
DROP POLICY IF EXISTS "Authenticated users can create properties." ON public.properties;
DROP POLICY IF EXISTS "Owners can delete their own properties." ON public.properties;
DROP POLICY IF EXISTS "Owners can insert properties" ON public.properties;
DROP POLICY IF EXISTS "Owners can update own properties" ON public.properties;
DROP POLICY IF EXISTS "Owners can delete own properties" ON public.properties;
DROP POLICY IF EXISTS "Owners can view own properties" ON public.properties;
DROP POLICY IF EXISTS "Public view active properties" ON public.properties;
DROP POLICY IF EXISTS "Public can view active properties" ON public.properties;
DROP POLICY IF EXISTS "Authenticated users can view active properties" ON public.properties;
DROP POLICY IF EXISTS "Owners can create own properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can manage all properties" ON public.properties;

-- =================================================================
-- 3. HABILITAR RLS EN LAS TABLAS
-- =================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- 4. POLÍTICAS PARA LA TABLA 'users'
-- =================================================================

-- Política 1: Los usuarios pueden ver y editar su propio perfil
CREATE POLICY "Users can manage own profile" 
ON public.users FOR ALL 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Política 2: Los Admins pueden gestionar TODOS los usuarios (ver, crear, editar, eliminar, asignar roles)
-- Esto incluye: clientes, propietarios y otros admins
CREATE POLICY "Admins can manage all users" 
ON public.users FOR ALL 
TO authenticated 
USING (get_user_role() = 'admin')
WITH CHECK (get_user_role() = 'admin');

-- =================================================================
-- 5. POLÍTICAS PARA LA TABLA 'properties'
-- =================================================================

-- Política 1: Lectura pública de propiedades activas (para usuarios no autenticados)
CREATE POLICY "Public can view active properties" 
ON public.properties FOR SELECT 
TO public 
USING (status = 'active');

-- Política 2: Los usuarios autenticados pueden ver todas las propiedades activas
CREATE POLICY "Authenticated users can view active properties" 
ON public.properties FOR SELECT 
TO authenticated 
USING (status = 'active');

-- Política 3: Los propietarios pueden ver SUS PROPIAS propiedades (activas e inactivas)
CREATE POLICY "Owners can view own properties" 
ON public.properties FOR SELECT 
TO authenticated 
USING (auth.uid() = owner_id);

-- Política 4: Los propietarios pueden CREAR propiedades (solo pueden asignarse a sí mismos)
CREATE POLICY "Owners can create own properties" 
ON public.properties FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() = owner_id
  AND get_user_role() = 'owner'
);

-- Política 5: Los propietarios pueden EDITAR SUS PROPIAS propiedades
CREATE POLICY "Owners can update own properties" 
ON public.properties FOR UPDATE 
TO authenticated 
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Política 6: Los propietarios pueden ELIMINAR SUS PROPIAS propiedades
CREATE POLICY "Owners can delete own properties" 
ON public.properties FOR DELETE 
TO authenticated 
USING (auth.uid() = owner_id);

-- Política 7: Los Admins pueden gestionar TODAS las propiedades (ver, crear, editar, eliminar, asignar)
-- Esto incluye: cambiar owner_id, modificar cualquier propiedad, etc.
CREATE POLICY "Admins can manage all properties" 
ON public.properties FOR ALL 
TO authenticated 
USING (get_user_role() = 'admin')
WITH CHECK (get_user_role() = 'admin');

-- =================================================================
-- 6. ACTUALIZAR USUARIOS CON ROL SUPERADMIN A ADMIN (OPCIONAL)
-- =================================================================
-- Si quieres convertir todos los superadmins existentes a admin, descomenta esto:
UPDATE public.users SET role = 'admin' WHERE role = 'superadmin';

-- =================================================================
-- 7. VERIFICACIÓN: Listar todas las políticas creadas
-- =================================================================
-- Para verificar que las políticas se crearon correctamente, ejecuta:
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
    FROM pg_policies 
        WHERE schemaname = 'public' 
            AND tablename IN ('users', 'properties')
                ORDER BY tablename, policyname;

-- =================================================================
-- NOTAS IMPORTANTES:
-- =================================================================
-- 1. Los Superadmins ya no tienen permisos especiales
-- 2. Solo los Admins pueden gestionar usuarios y propiedades
-- 3. Los Propietarios solo pueden gestionar sus propias viviendas
-- 4. Los Clientes pueden ver propiedades pero no gestionarlas
-- 5. Las propiedades activas son visibles públicamente
-- =================================================================
