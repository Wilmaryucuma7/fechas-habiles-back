# 📅 API de Fechas Hábiles en Colombia

API REST para calcular fechas hábiles en Colombia con arquitectura hexagonal, implementada en TypeScript con configuración nativa de Node.js.

## 🚀 Características

- ✅ **Arquitectura hexagonal** (Domain-Application-Infrastructure)
- ✅ **TypeScript con tipado estricto** (5.9 con configuración estricta)
- ✅ **Configuración nativa Node.js 20+** (`process.loadEnvFile()`)
- ✅ **Validación robusta con Zod** - Schemas de entrada y configuración
- ✅ **Cálculo preciso de días y horas hábiles** - Algoritmos optimizados
- ✅ **Exclusión automática de festivos colombianos** - API externa con cache
- ✅ **Manejo correcto de zona horaria Colombia ↔ UTC** - date-fns-tz
- ✅ **Sistema de cache inteligente** - TTL configurable para festivos  
- ✅ **Tests exhaustivos** - 45 tests unitarios e integración
- ✅ **Manejo de errores completo** - Jerarquía de errores de dominio
- ✅ **Respuestas UTC ISO 8601** - Formato estándar internacional
- ✅ **Composición de dependencias** - DI container centralizado

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
- `WORK_START_HOUR`: Hora de inicio laboral (por defecto 8)
- `WORK_END_HOUR`: Hora de fin laboral (por defecto 17)
- `LUNCH_START_HOUR`: Hora de inicio de almuerzo (por defecto 12)
- `LUNCH_END_HOUR`: Hora de fin de almuerzo (por defecto 13)
- `TIMEZONE`: Zona horaria (por defecto America/Bogota)
- `NODE_ENV`: Entorno de ejecución (development, production, test)

> **Nota**: Esta API usa `process.loadEnvFile()` nativo de Node.js 20.6.0+, por lo que no necesita la librería `dotenv`.

## 🛠️ Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Wilmaryucuma7/fechas-habiles-back.git
cd fechas-habiles-back

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
├── main.ts               # Punto de entrada de la aplicación
├── application/          # Casos de uso
│   ├── ports/           # Puertos de entrada (interfaces)
│   └── use-cases/       # Lógica de aplicación
├── domain/              # Lógica de negocio
│   ├── entities/        # Entidades y value objects  
│   ├── ports/           # Puertos abstractos (TimeProvider, ConfigurationPort)
│   ├── repositories/    # Interfaces de repositorios
│   ├── services/        # Servicios de dominio
│   └── utils/           # Utilidades de dominio
├── infrastructure/      # Adaptadores externos
│   ├── adapters/        # Controllers, ExpressApp, TimeProvider
│   ├── composition/     # CompositionRoot (DI container)
│   ├── config/          # ConfigurationManager
│   └── repositories/    # Implementaciones de repositorios
├── shared/              # Código compartido
│   ├── adapters/        # HttpClient, etc.
│   ├── middleware/      # ErrorHandling
│   ├── ports/           # Puertos compartidos (ICacheService, IHttpClient)
│   ├── schemas/         # Schemas de validación con Zod
│   ├── services/        # CacheService
│   └── utils/           # Utilidades de validación
└── types/               # Definiciones de tipos globales
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

- **TypeScript 5.9** - Lenguaje principal con tipado estricto
- **Express 5.1** - Framework web
- **date-fns 4.1** - Manipulación de fechas
- **date-fns-tz 3.2** - Manejo de zonas horarias
- **Zod 4.1** - Validación y schemas
- **Jest 30.1** - Testing framework
- **Supertest 7.1** - Testing HTTP
- **Node.js 20+** - Runtime con soporte nativo para .env

## 📊 Cobertura de Tests

Los tests cubren todos los aspectos críticos:
- ✅ **Entidades de dominio** (Holiday, WorkingDateQuery, etc.)
- ✅ **Servicios de dominio** (WorkingDateService, calculadores)
- ✅ **Casos de uso** (CalculateWorkingDateUseCase)  
- ✅ **Repositorios** (CaptaHolidayRepository con mocks)
- ✅ **Adaptadores HTTP** (FetchHttpClient)
- ✅ **Tests de integración completa** (ExpressApp)
- ✅ **Casos de prueba reales** (RequirementsExamples con fechas específicas)
- ✅ **Validaciones Zod** (parámetros de entrada)
- ✅ **Manejo completo de errores** (DomainError, ZodError)

**Total: 45 tests pasando ✅**

## 🌟 Patrones de Diseño Implementados

- **Hexagonal Architecture (Ports & Adapters)** - Separación clara de capas con puertos y adaptadores
- **Dependency Injection** - Inversión de dependencias mediante CompositionRoot
- **Repository Pattern** - Abstracción del acceso a datos (HolidayRepository)
- **Use Case Pattern** - Casos de uso como clases con responsabilidad única
- **Value Objects** - Entidades inmutables (Holiday, WorkingDateQuery, WorkingDateResult)
- **Domain Services** - Servicios que encapsulan lógica compleja de dominio
- **Strategy Pattern** - Calculadores especializados (WorkingDayCalculator, WorkingHourCalculator)
- **Adapter Pattern** - Adaptadores para sistemas externos (CaptaHolidayRepository, DateFnsTzTimeProvider)
- **Singleton Pattern** - CompositionRoot para inyección centralizada
- **Factory Pattern** - Creación de objetos mediante el composition root

## 🧭 Ports & Adapters (Mapa rápido)

Este proyecto sigue la idea de puertos (interfaces) y adaptadores (implementaciones). A continuación hay un mapa rápido de los puertos principales y sus adaptadores:

- Puertos de entrada (Driving / Primary):
  - `src/application/ports/ICalculateWorkingDateUseCase.ts` — Interface que expone el caso de uso principal. Implementado por `src/application/use-cases/CalculateWorkingDateUseCase.ts`.
  - HTTP Controller: `src/infrastructure/adapters/WorkingDateController.ts` — adapta las peticiones HTTP al use-case.

- Puertos de salida (Driven / Secondary):
  - `src/domain/repositories/HolidayRepository.ts` — puerto para obtener feriados. Implementación: `src/infrastructure/repositories/CaptaHolidayRepository.ts`.
  - `src/shared/ports/ICacheService.ts` — puerto de cache usado por repositorios. Implementación: `src/shared/services/CacheService.ts`.
  - `src/domain/ports/ITimeProvider.ts` — puerto para operaciones de zona horaria y reloj. Implementación: `src/infrastructure/adapters/DateFnsTzTimeProvider.ts`.
  - `src/domain/ports/IConfigurationPort.ts` — puerto para configuración del dominio. Implementación: `src/infrastructure/adapters/ConfigurationAdapter.ts`.

- Otros adaptadores / utilidades:
  - `src/infrastructure/adapters/ExpressApp.ts` — servidor HTTP y montaje de routers.
  - `src/infrastructure/config/ConfigurationManager.ts` — manager para configuración con validación Zod.
  - `src/shared/ports/IHttpClient.ts` — puerto HTTP genérico para llamadas externas.
  - `src/shared/adapters/FetchHttpClient.ts` — implementación basada en `fetch` (Node 18+).
  - `src/infrastructure/composition/CompositionRoot.ts` — inyección de dependencias centralizada.

### Contratos (contract) breves

- ICalculateWorkingDateUseCase
  - Entrada: `WorkingDateQuery` (days?: number, hours?: number, date?: string)
  - Salida: `WorkingDateResult` ({ date: string }) o DomainError

- HolidayRepository
  - Método: `getHolidays(): Promise<Holiday[]>`

- ICacheService
  - Métodos: `getHolidays(fetchFn: () => Promise<Holiday[]>): Promise<Holiday[]>`, `invalidateHolidays(): void`

- ITimeProvider
  - Métodos: `toZonedTime(date: Date, timeZone: string): Date`, `fromZonedTime(date: Date, timeZone: string): Date`, `now(): Date`, `formatDateKey(date: Date, timeZone?: string): string`

- IConfigurationPort
  - Métodos: `getWorkingHoursConfig(): WorkingHoursConfig`, `getHolidayConfig(): HolidayConfig`

 

Se añadió el puerto `IHttpClient` para desacoplar llamadas HTTP de los repositorios.

- Contrato mínimo: `get<T>(url, opts): Promise<IHttpResponse<T>>` (expone `status`, `ok`, `json()`, `text()`).
- Implementación por defecto: `src/shared/adapters/FetchHttpClient.ts` (usa `fetch`).
- En tests se puede inyectar un `IHttpClient` mock o sobrescribir `global.fetch`.

Composición: `src/infrastructure/composition/CompositionRoot.ts` actúa como composition root implementando el patrón de inyección de dependencias. Crea e inyecta todas las dependencias: configuración, cache, repositorio, time provider, calculadores de días/horas, servicio de dominio, caso de uso y controller.