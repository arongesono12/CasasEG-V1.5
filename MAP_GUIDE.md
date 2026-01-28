# Guía de Manejo del Mapa de Viviendas

Esta guía explica cómo asegurar que las viviendas que agregas aparezcan correctamente en el mapa interactivo.

## 1. Requisito de Coordenadas

Para que una vivienda se muestre en el mapa, **debe tener coordenadas válidas** (latitud y longitud). Sin estas coordenadas, el sistema de filtrado la omitirá del mapa para evitar errores de renderizado.

### Formato de Coordenadas

El sistema utiliza un objeto JSON llamado `coordinates` con dos campos numéricos:

- `lat`: Latitud (ej. `3.7504`)
- `lng`: Longitud (ej. `8.7371`)

## 2. Cómo agregar viviendas que se vean en el mapa

Si estás agregando viviendas manualmente mediante SQL o un formulario:

### Usando SQL

Asegúrate de incluir el campo `coordinates` como un objeto JSON:

```sql
INSERT INTO properties (..., coordinates)
VALUES (..., '{"lat": 3.7504, "lng": 8.7371}');
```

### Usando la Aplicación (Próximamente/En desarrollo)

Al capturar una vivienda desde un formulario futuro, el sistema debería:

1. Usar geolocalización automática basada en la dirección física.
2. O permitir al usuario marcar un punto en el mapa para obtener el `lat/lng`.

## 3. Resolución de Problemas (FAQ)

### ¿Por qué mi vivienda no aparece en el mapa pero sí en la lista?

Lo más probable es que el campo `coordinates` en la base de datos sea `NULL` o tenga un formato incorrecto. Verifica en tu panel de Supabase que la columna existe y contiene datos válidos.

### ¿Cómo sé cuáles son las coordenadas?

Puedes usar Google Maps:

1. Haz clic derecho en cualquier lugar del mapa.
2. Copia los números (latitud y longitud) que aparecen arriba.

## 4. Estado de Publicación

Recuerda que solo las viviendas con `status = 'active'` son visibles para los clientes en el mapa público. Los administradores pueden ver todas en el panel de control.
