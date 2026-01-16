-- Script para eliminar la vivienda de prueba y limpiar datos residuales
-- Ejecutar en el Editor SQL de Supabase

DELETE FROM public.properties 
WHERE id = '10000000-0000-0000-0000-000000000001';

-- Opcional: Eliminar mensajes asociados si los hay
DELETE FROM public.messages 
WHERE property_id = '10000000-0000-0000-0000-000000000001';

-- Nota: Si has creado otras propiedades de prueba manualmente, 
-- puedes borrarlas todas usando:
-- DELETE FROM public.properties WHERE title LIKE '%Muestra%';
