-- ===========================================
-- CONFIGURACIÓN DE SUPABASE PARA SPENDSMART
-- ===========================================
-- Ejecuta este SQL en el SQL Editor de Supabase
-- (Dashboard > SQL Editor > New Query)

-- 1. Crear la tabla user_data
CREATE TABLE IF NOT EXISTS user_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  expenses JSONB DEFAULT '[]'::jsonb,
  categories JSONB DEFAULT '[]'::jsonb,
  income_categories JSONB DEFAULT '[]'::jsonb,
  budgets JSONB DEFAULT '[]'::jsonb,
  goals JSONB DEFAULT '[]'::jsonb,
  recurring JSONB DEFAULT '[]'::jsonb,
  saved_reports JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear índice para búsquedas rápidas por user_id
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- 4. Crear política para que cada usuario solo vea sus datos
CREATE POLICY "Users can view own data" ON user_data
  FOR SELECT
  USING (auth.uid() = user_id);

-- 5. Crear política para que cada usuario pueda insertar sus datos
CREATE POLICY "Users can insert own data" ON user_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6. Crear política para que cada usuario pueda actualizar sus datos
CREATE POLICY "Users can update own data" ON user_data
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. Crear política para que cada usuario pueda eliminar sus datos
CREATE POLICY "Users can delete own data" ON user_data
  FOR DELETE
  USING (auth.uid() = user_id);

-- 8. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Trigger para actualizar updated_at en cada UPDATE
DROP TRIGGER IF EXISTS update_user_data_updated_at ON user_data;
CREATE TRIGGER update_user_data_updated_at
  BEFORE UPDATE ON user_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ✅ ¡Listo! Tu base de datos está configurada.
