-- 1. Añadir la columna de categoría a la tabla de propiedades
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'Apartamentos';

-- 2. Actualizar las propiedades existentes con categorías variadas (opcional)
-- Esto es para que las categorías de Airbnb funcionen de inmediato
UPDATE public.properties SET category = 'Apartamentos' WHERE category IS NULL;

-- 3. Ejemplo para asignar categorías específicas si ya tienes datos:
-- UPDATE public.properties SET category = 'Villas' WHERE title ILIKE '%villa%';
-- UPDATE public.properties SET category = 'Lujo' WHERE price > 500000;
