# 📅 API de Fechas Hábiles en Colombia

API REST para calcular fechas hábiles en Colombia con arquitectura hexagonal, implementada en TypeScript con configuración nativa de Node.js.

## 🚀 Características

- ✅ Arquitectura hexagonal (Domain-Application-Infrastructure)
- ✅ TypeScript con tipado estricto
- ✅ Configuración con variables de entorno nativas (Node.js 20+)
- ✅ Cálculo de días y horas hábiles
- ✅ Exclusión de festivos colombianos
- ✅ Manejo de zona horaria de Colombia
- ✅ Tests unitarios e integración con Jest
- ✅ Validación de parámetros de entrada
- ✅ Respuestas en formato UTC ISO 8601

## 📋 Requisitos

- Node.js >= 20.6.0 (para `process.loadEnvFile()`)
- pnpm (recomendado) o npm

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```env
# Colombian Holidays API Configuration
HOLIDAYS_API_URL=https://content.capta.co/Recruitment/WorkingDays.json

# Cache configuration (in milliseconds) - 24 hours default
HOLIDAYS_CACHE_TIMEOUT=86400000

# Server configuration
PORT=3000
```

### Configuraciones Disponibles

- `HOLIDAYS_API_URL`: URL de la API de feriados colombianos
- `HOLIDAYS_CACHE_TIMEOUT`: Tiempo de cache en milisegundos (por defecto 24 horas)
- `PORT`: Puerto del servidor (por defecto 3000)

> **Nota**: Esta API usa `process.loadEnvFile()` nativo de Node.js 20.6.0+, por lo que no necesita la librería `dotenv`.

## 🛠️ Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Wilmaryucuma7/fechas-habiles-back.git
cd fechas-habiles

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env si necesitas cambiar alguna configuración

# Compilar TypeScript
pnpm run build

# Ejecutar en modo desarrollo
pnpm run dev

# O ejecutar en producción
pnpm start
```

## 🌐 API Endpoints

### GET /working-date

Calcula fechas hábiles sumando días y/o horas al momento actual o a una fecha específica.

**Parámetros de consulta:**
- `days` (opcional): Número de días hábiles a sumar (entero positivo)
- `hours` (opcional): Número de horas hábiles a sumar (entero positivo)  
- `date` (opcional): Fecha/hora inicial en UTC (ISO 8601 con sufijo Z)

**Respuesta exitosa (200):**
```json
{
  "date": "2025-08-01T14:00:00.000Z"
}
```

**Respuesta de error (400/503):**
```json
{
  "error": "InvalidParameters",
  "message": "Detalle del error"
}
```

## 📚 Reglas de Negocio

- **Días hábiles:** Lunes a viernes
- **Horario laboral:** 8:00 AM - 5:00 PM (Colombia)
- **Almuerzo:** 12:00 PM - 1:00 PM (excluido)
- **Zona horaria:** America/Bogota
- **Festivos:** Se consultan desde API externa y se excluyen
- **Ajuste automático:** Fechas fuera de horario se aproximan al día/hora laboral más cercano

## 📝 Ejemplos de Uso

### 1. Sumar 1 hora desde viernes 5:00 PM
```bash
curl "http://localhost:3000/working-date?hours=1"
# Resultado: Lunes 9:00 AM (UTC)
```

### 2. Sumar 1 día y 3 horas desde martes 3:00 PM  
```bash
curl "http://localhost:3000/working-date?days=1&hours=3"
# Resultado: Jueves 10:00 AM (UTC)
```

### 3. Con fecha específica
```bash
curl "http://localhost:3000/working-date?days=1&date=2025-04-10T15:00:00.000Z"
# Resultado: Próximo día hábil considerando festivos
```

## 🏗️ Arquitectura

```
src/
├── config/                # Configuración de la aplicación
├── domain/                # Lógica de negocio
│   ├── entities/         # Entidades y value objects
│   ├── repositories/     # Interfaces de repositorios
│   └── services/         # Servicios de dominio
├── application/          # Casos de uso
│   └── use-cases/       # Lógica de aplicación
└── infrastructure/       # Adaptadores externos
    ├── adapters/        # Controllers y Express
    └── repositories/    # Implementaciones
```

## 🧪 Tests

```bash
# Ejecutar todos los tests
pnpm test

# Tests en modo watch
pnpm test:watch

# Coverage report
pnpm test:coverage

# Verificar tipos TypeScript
pnpm run lint
```

## 📦 Scripts Disponibles

- `pnpm run dev` - Ejecutar en modo desarrollo
- `pnpm run build` - Compilar TypeScript
- `pnpm start` - Ejecutar en producción
- `pnpm test` - Ejecutar tests
- `pnpm run clean` - Limpiar directorio dist

## 🔧 Tecnologías

- **TypeScript** - Lenguaje principal
- **Express** - Framework web
- **date-fns** - Manipulación de fechas
- **Jest** - Testing framework
- **Supertest** - Testing HTTP
- **date-fns-tz** - Manejo de zonas horarias

## 📊 Cobertura de Tests

Los tests cubren:
- ✅ Entidades de dominio
- ✅ Casos de uso
- ✅ Servicios de dominio  
- ✅ Controllers
- ✅ Tests de integración
- ✅ Validaciones de entrada
- ✅ Manejo de errores

## 🌟 Patrones de Diseño

- **Hexagonal Architecture** - Separación clara de capas
- **Dependency Injection** - Inversión de dependencias
- **Repository Pattern** - Abstracción de datos
- **Use Case Pattern** - Casos de uso como clases
- **Value Objects** - Objetos inmutables
- **Domain Services** - Lógica compleja de dominio
