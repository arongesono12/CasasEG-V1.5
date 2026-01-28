-- Semilla: 8 propiedades con COORDENADAS para el mapa
-- Ejecuta primero add_coordinates.sql antes de este script.

DO $$ 
DECLARE 
    owner_uuid uuid;
BEGIN
    -- Obtener el ID del propietario (owner@test.com)
    SELECT id INTO owner_uuid FROM users WHERE email = 'owner@test.com' LIMIT 1;

    -- Limpiar propiedades de prueba previas si es necesario (opcional)
    -- DELETE FROM properties WHERE owner_id = owner_uuid;

    -- Insertar 8 propiedades con coordenadas reales
    INSERT INTO properties (owner_id, title, description, price, location, image_urls, bedrooms, bathrooms, area, is_occupied, features, status, category, coordinates)
    VALUES 
    (owner_uuid, 'Villa Lujosa en Paraíso', 'Villa de lujo con vistas al pico Basile.', 250000, 'Malabo, Bioko Norte', ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750'], 4, 3, 350, false, ARRAY['Piscina', 'Vista al Mar'], 'active', 'Lujo', '{"lat": 3.7504, "lng": 8.7371}'),
    (owner_uuid, 'Apartamento Moderno Centro', 'Apartamento ideal para ejecutivos.', 85000, 'Bata, Litoral', ARRAY['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'], 2, 1, 90, false, ARRAY['Wifi', 'A/C'], 'active', 'Apartamentos', '{"lat": 1.8631, "lng": 9.7658}'),
    (owner_uuid, 'Casa Familiar Amplia', 'Gran jardín y seguridad.', 120000, 'Ebebiyín, Kié-Ntem', ARRAY['https://images.unsplash.com/photo-1518780664697-55e3ad937233'], 3, 2, 180, false, ARRAY['Jardín', 'Garaje'], 'active', 'Casas', '{"lat": 2.1511, "lng": 11.3353}'),
    (owner_uuid, 'Estudio Loft Industrial', 'Cerca de comercios y transporte.', 60000, 'Malabo, Bioko Norte', ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'], 1, 1, 55, false, ARRAY['Amueblado'], 'active', 'Apartamentos', '{"lat": 3.7550, "lng": 8.7700}'),
    (owner_uuid, 'Cabaña Ecológica', 'Retiro natural en la costa.', 45000, 'Luba, Bioko Sur', ARRAY['https://images.unsplash.com/photo-1449156001437-37c645d9bc54'], 1, 1, 40, false, ARRAY['Eco-friendly'], 'active', 'Especiales', '{"lat": 3.4567, "lng": 8.5555}'),
    (owner_uuid, 'Ático con Terraza', 'Vistas panorámicas de la ciudad.', 150000, 'Mongomo, Wele-Nzas', ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'], 3, 2, 120, false, ARRAY['Terraza'], 'active', 'Lujo', '{"lat": 1.6274, "lng": 11.3135}'),
    (owner_uuid, 'Bungalow Frente al Mar', 'A pasos de la playa de Mbini.', 95000, 'Mbini, Litoral', ARRAY['https://images.unsplash.com/photo-1499793983690-e29da59ef1c2'], 2, 1, 85, false, ARRAY['Playa'], 'active', 'Vacacional', '{"lat": 1.5833, "lng": 9.6167}'),
    (owner_uuid, 'Residencia Estudiantil', 'Habitación cómoda y económica.', 25000, 'Malabo, Bioko Norte', ARRAY['https://images.unsplash.com/photo-1555854817-40e098ee7f27'], 1, 1, 25, false, ARRAY['Escritorio'], 'active', 'Habitaciones', '{"lat": 3.7400, "lng": 8.7600}');

END $$;
