-- Migration: Crear tabla de notificaciones
-- Esto permitirá al administrador recibir alertas reales.

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  message text NOT NULL,
  read boolean DEFAULT false,
  type text, -- 'new_property', 'new_message', 'system'
  link text, -- Opcional: link para ir a la acción
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Política: Solo el usuario dueño puede ver sus notificaciones
CREATE POLICY "Users can manage their own notifications." ON notifications
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
