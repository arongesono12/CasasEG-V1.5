-- Migración: Soporte para Superadmin y Estado de Usuario

-- 1. Añadir columna status a la tabla users
ALTER TABLE users ADD COLUMN IF NOT EXISTS status text DEFAULT 'active'; -- 'active', 'inactive', 'banned'

-- 2. Asegurar que el superadmin tenga el rol correcto
UPDATE users SET role = 'superadmin' WHERE email = 'arongesono@outlook.es';

-- 3. Actualizar políticas de RLS para propiedades
-- Permitir que superadmins y admins gestionen todo
DROP POLICY IF EXISTS "Admins have full access to all properties" ON properties;
CREATE POLICY "Admins and Superadmins have full access" ON properties 
FOR ALL USING (get_user_role() IN ('admin', 'superadmin'));

-- 4. Actualizar políticas de RLS para usuarios
-- Superadmin puede ver y editar a todos
CREATE POLICY "Superadmin can manage all users" ON users 
FOR ALL USING (get_user_role() = 'superadmin');

-- Admins pueden ver y editar a clientes y propietarios (pero no a otros admins)
CREATE POLICY "Admins can manage non-admin users" ON users 
FOR ALL USING (get_user_role() = 'admin' AND role NOT IN ('admin', 'superadmin'));
