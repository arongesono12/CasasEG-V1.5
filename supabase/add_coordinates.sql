-- Migration: Añadir columna de coordenadas a la tabla de propiedades
-- Esto es necesario para que las viviendas aparezcan en el mapa.

ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS coordinates jsonb;

-- Nota: El formato esperado es {"lat": -1.23, "lng": 1.23}
