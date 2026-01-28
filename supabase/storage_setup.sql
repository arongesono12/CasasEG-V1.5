-- Solo ejecutar si tienes permisos de Postgres en Supabase
-- Esto aplica las políticas de seguridad al bucket existente.

-- 1. Asegurar que el bucket sea público (esto se hace mejor desde la UI)

-- 2. Políticas de Seguridad para el Bucket 'propiedades-images'
-- Permitir que usuarios autenticados suban imágenes
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'propiedades-images');

-- Permitir acceso público de lectura
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'propiedades-images');

-- Permitir a los dueños borrar sus propias imágenes
CREATE POLICY "Allow individual delete" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'propiedades-images' AND auth.uid() = owner);
