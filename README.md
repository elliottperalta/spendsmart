# 💰 SpendSmart - Expense Tracker

Una aplicación web moderna para gestionar tus finanzas personales. Controla gastos, ingresos, presupuestos y metas de ahorro desde cualquier dispositivo.

![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-7.2-purple)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Características

### 📊 Dashboard
- Resumen visual de ingresos y gastos del mes
- Gráficos de distribución por categoría (pie chart)
- Comparación mensual de gastos vs ingresos (barras/líneas)
- Transacciones recientes con acceso rápido

### 💸 Transacciones
- Registro de gastos e ingresos
- Categorías personalizables con emojis
- Filtros por tipo, categoría y búsqueda
- Exportación a CSV

### 🔄 Gastos/Ingresos Recurrentes
- Configura pagos fijos mensuales (Netflix, alquiler, salario, etc.)
- Auto-registro automático cada mes en la fecha indicada
- Pausar/reactivar sin eliminar
- Resumen de gastos e ingresos fijos mensuales

### 📈 Presupuestos
- Límites de gasto por categoría
- Barra de progreso visual
- Alertas cuando te acercas al límite
- Tracking de cuánto te queda disponible

### 🎯 Metas de Ahorro
- Crea metas con monto objetivo y fecha límite
- Deposita y retira dinero de cada meta
- Historial de movimientos por meta
- Barra de progreso hacia tu objetivo

### 📋 Reportes PDF
- **Reporte Semanal**: Resumen de la semana pasada
- **Reporte Mensual**: Análisis del mes anterior
- **Mes Actual**: Progreso hasta hoy
- Incluye: gastos por categoría, ingresos por fuente, top 5 gastos
- Historial de reportes generados
- Recordatorio cada lunes para revisar finanzas

### 🎨 Interfaz
- Tema oscuro/claro
- 100% responsive (móvil, tablet, desktop)
- Menú lateral colapsable en móvil
- Botón flotante para agregar transacciones rápidas

## 🚀 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Pasos

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/expense_tracker.git
cd expense_tracker

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📦 Dependencias Principales

| Paquete | Uso |
|---------|-----|
| `react` | Framework UI |
| `vite` | Build tool y dev server |
| `recharts` | Gráficos (pie, bar, area) |
| `date-fns` | Manejo de fechas |
| `lucide-react` | Iconos |
| `jspdf` | Generación de PDFs |
| `jspdf-autotable` | Tablas en PDFs |

## 🗂️ Estructura del Proyecto

```
expense_tracker/
├── src/
│   ├── App.jsx          # Componente principal con toda la lógica
│   ├── index.css        # Estilos globales y responsive
│   └── main.jsx         # Entry point
├── public/
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## ☁️ Sincronización en la Nube (Supabase)

La app soporta sincronización en la nube usando **Supabase** (gratis). Esto permite:
- ✅ Acceder a tus datos desde cualquier dispositivo
- ✅ Login con email y contraseña
- ✅ Sincronización automática de cambios
- ✅ Backup seguro en la nube

### Configurar Supabase

1. **Crear cuenta en Supabase** (gratis)
   - Ve a [supabase.com](https://supabase.com)
   - Crea una cuenta y un nuevo proyecto

2. **Crear la tabla en la base de datos**
   - Ve a **SQL Editor** en el dashboard de Supabase
   - Copia y ejecuta el contenido de `supabase_setup.sql`

3. **Obtener credenciales**
   - Ve a **Settings > API** en tu proyecto de Supabase
   - Copia la `URL` y el `anon public key`

4. **Configurar la app**
   - Crea el archivo `.env` en la raíz del proyecto:
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_anon_key
   ```

5. **Reiniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

> 💡 Sin configurar Supabase, la app funciona en **modo offline** usando localStorage.

## 💾 Almacenamiento

### Con Supabase configurado
Los datos se guardan en la nube y se sincronizan automáticamente entre dispositivos.

### Sin Supabase (modo offline)
Todos los datos se guardan en **localStorage** del navegador:

- `expenses` - Transacciones
- `categories` - Categorías de gastos
- `incomeCategories` - Categorías de ingresos
- `budgets` - Presupuestos
- `goals` - Metas de ahorro
- `recurring` - Gastos/ingresos recurrentes
- `savedReports` - Historial de reportes
- `theme` - Preferencia de tema

> ⚠️ En modo offline, los datos persisten solo en ese navegador. Usa exportar para hacer backups.

## 📱 Categorías Predefinidas

### Gastos
🍔 Alimentación | 🏠 Vivienda | 🚌 Transporte | 🏥 Salud | 👫 Pareja | 🎓 Educación | 💻 Tecnología | 💵 Finanzas | 📺 Suscripciones | 🎉 Ocio | 👨‍👩‍👧 Familia | 📦 Otros

### Ingresos
💰 Salario Mensual | 🏢 Comisiones HKA | 💵 Comisiones Extra | 🦐 Camarones | 🚀 Proyectos Personales

> Puedes agregar, editar o eliminar categorías desde el menú de configuración.

## 🛠️ Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run preview  # Preview del build
```

## 🚀 Despliegue

### Opción 1: Vercel (Recomendado)
1. Sube tu proyecto a GitHub
2. Ve a [vercel.com](https://vercel.com) y conecta tu repo
3. Agrega las variables de entorno (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
4. ¡Deploy automático!

### Opción 2: Netlify
1. Sube tu proyecto a GitHub
2. Ve a [netlify.com](https://netlify.com) y conecta tu repo
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Agrega las variables de entorno en Site settings

## 🔮 Posibles Mejoras Futuras

- [x] ~~Sincronización en la nube~~ ✅
- [ ] Múltiples cuentas (efectivo, banco, tarjeta)
- [ ] Importación de extractos bancarios
- [ ] Gráficos de tendencias a largo plazo
- [ ] PWA con notificaciones push
- [ ] Modo offline completo con sync

## 📄 Licencia

MIT License - Siéntete libre de usar, modificar y distribuir.

---

Desarrollado con ❤️ usando React + Vite + Supabase
