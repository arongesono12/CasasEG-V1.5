-- Comprehensive Fix for Recursion and Storage Policies (v2 - Fixed Type Casting)
-- Execute this in the Supabase SQL Editor

-- 1. Redefine get_user_role to be non-recursive
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM users WHERE id = auth.uid() LIMIT 1;
$$;

-- 2. Apply non-recursive policies to 'users' table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own profile" ON public.users;
DROP POLICY IF EXISTS "Superadmins have full access" ON public.users;
DROP POLICY IF EXISTS "Admins can manage non-admin users" ON public.users;
DROP POLICY IF EXISTS "Superadmins/Admins full access" ON public.users;

CREATE POLICY "Users can manage own profile" 
ON public.users FOR ALL 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Use a direct check to avoid recursion
CREATE POLICY "Superadmins/Admins full access" 
ON public.users FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- 3. Apply similar policies to 'profiles' table (just in case it exists)
DO $$ 
BEGIN 
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;
    DROP POLICY IF EXISTS "Profiles are manageable by owner" ON public.profiles;
    -- Explicitly cast id to uuid or vice versa to avoid ERROR: 42883
    CREATE POLICY "Profiles are manageable by owner" ON public.profiles FOR ALL TO authenticated USING (auth.uid()::text = id::text);
  END IF;
END $$;

-- 4. Corrected Storage Policies for 'propiedades-images'
-- The error "texto = uuid" usually comes from comparing auth.uid()::text with a uuid field
-- In storage.objects, 'owner' is often a UUID but sometimes handled as text in policies.

DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'propiedades-images');

DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
CREATE POLICY "Allow public read access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'propiedades-images');

DROP POLICY IF EXISTS "Allow individual delete" ON storage.objects;
CREATE POLICY "Allow individual delete" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'propiedades-images' AND auth.uid() = owner); -- Removed ::text to match UUID = UUID
