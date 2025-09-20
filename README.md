# 📅 API de Fechas Hábiles - Colombia

API REST para calcular fechas hábiles en Colombia con arquitectura hexagonal y despliegue serverless en AWS.

## 🚀 Características

- ✅ **Arquitectura hexagonal** limpia y testeable
- ✅ **TypeScript 5.9** con tipado estricto
- ✅ **Cálculo preciso** de días y horas hábiles
- ✅ **Exclusión automática** de festivos colombianos
- ✅ **Zona horaria Colombia** (America/Bogota)
- ✅ **Cache inteligente** para festivos
- ✅ **AWS Lambda** deployment ready
- ✅ **45 tests** unitarios e integración
- ✅ **Validación Zod** robusta

## 📋 Requisitos

- Node.js >= 20.0.0
- AWS CLI configurado (para deployment)
- CDK CLI instalado globalmente

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

## 🛠️ Instalación y Desarrollo Local

```bash
# Clonar repositorio
git clone https://github.com/Wilmaryucuma7/fechas-habiles-back.git
cd fechas-habiles-back

# Instalar dependencias
pnpm install

# Ejecutar en desarrollo
pnpm run dev

# Ejecutar tests
pnpm test
```

## ☁️ Despliegue en AWS

### Configuración inicial

```bash
# Instalar CDK globalmente
npm install -g aws-cdk

# Configurar AWS CLI (si no está configurado)
aws configure

# Navegar al directorio de infraestructura
cd infrastructure

# Instalar dependencias CDK
npm install

# Bootstrap CDK (solo primera vez)
npm run bootstrap
```

### Deployment

```bash
# Desde la raíz del proyecto
pnpm run build:lambda    # Construye el bundle optimizado
pnpm run cdk:deploy      # Despliega a AWS

# O desde infrastructure/
npm run deploy
```

### URLs de producción

La API está disponible en:
```
https://jjzxiyb89h.execute-api.us-east-1.amazonaws.com/prod/working-date
```

### Destruir infraestructura

```bash
pnpm run cdk:destroy
# o desde infrastructure/
npm run destroy
```

## 🌐 API Endpoints

### GET /working-date

Calcula fechas hábiles sumando días y/o horas al momento actual o fecha específica.

**Parámetros:**
- `days` (opcional): Días hábiles a sumar
- `hours` (opcional): Horas hábiles a sumar  
- `date` (opcional): Fecha inicial UTC (ISO 8601)

**Respuesta exitosa:**
```json
{
  "date": "2025-08-01T14:00:00.000Z"
}
```

## 📚 Reglas de Negocio

- **Días hábiles:** Lunes a viernes, 8:00 AM - 5:00 PM
- **Almuerzo:** 12:00 PM - 1:00 PM (excluido)
- **Zona horaria:** America/Bogota
- **Festivos:** Consultados automáticamente desde API externa
- **Aproximación:** Fechas fuera de horario se ajustan al siguiente momento hábil

## 📝 Ejemplos

```bash
# Desarrollo local
curl "http://localhost:3000/working-date?days=1&hours=2"

# Producción AWS
curl "https://jjzxiyb89h.execute-api.us-east-1.amazonaws.com/prod/working-date?days=1&hours=2"

# Con fecha específica
curl "https://jjzxiyb89h.execute-api.us-east-1.amazonaws.com/prod/working-date?days=1&date=2025-04-10T15:00:00.000Z"
```

## 🏗️ Arquitectura

```
src/
├── application/          # Casos de uso
├── domain/              # Lógica de negocio
│   ├── entities/        # Holiday, WorkingDateQuery, WorkingDateResult
│   ├── services/        # WorkingDateService, calculadores
│   └── repositories/    # Interfaces
├── infrastructure/      # Adaptadores externos
│   ├── adapters/        # Controllers, ExpressApp
│   ├── composition/     # DI container
│   └── repositories/    # Implementaciones
├── lambda/              # AWS Lambda handler
└── shared/              # Código compartido
```

## 🔧 Tecnologías

- **TypeScript 5.9** - Lenguaje principal
- **Express 5.1** - Framework web (desarrollo)
- **AWS Lambda** - Serverless runtime (producción)
- **AWS CDK** - Infrastructure as Code
- **date-fns** - Manipulación de fechas
- **Zod 4.1** - Validación de schemas
- **Jest 30** - Testing framework

## 🧪 Tests

```bash
pnpm test              # Ejecutar todos los tests
pnpm test:watch        # Tests en modo watch
pnpm test:coverage     # Reporte de cobertura
```

**Cobertura completa:** 45 tests cubriendo todos los componentes críticos.

## 📦 Scripts Disponibles

```bash
# Desarrollo
pnpm run dev           # Servidor local
pnpm run build         # Compilar TypeScript
pnpm test              # Ejecutar tests

# AWS Deployment
pnpm run build:lambda  # Bundle optimizado para Lambda
pnpm run cdk:bootstrap # Configurar CDK (primera vez)
pnpm run cdk:deploy    # Desplegar a AWS
pnpm run cdk:destroy   # Eliminar infraestructura
```

## ⚙️ Configuración

Variables de entorno disponibles:
- `HOLIDAYS_API_URL`: URL de la API de feriados colombianos
- `HOLIDAYS_CACHE_TIMEOUT`: Tiempo de cache en milisegundos
- `WORK_START_HOUR`, `WORK_END_HOUR`: Horario laboral (8-17)
- `LUNCH_START_HOUR`, `LUNCH_END_HOUR`: Horario de almuerzo (12-13)
- `TIMEZONE`: Zona horaria (America/Bogota)

## 🎯 Patrones Implementados

- **Hexagonal Architecture** - Separación clara de capas
- **Dependency Injection** - CompositionRoot centralizado  
- **Repository Pattern** - Abstracción de datos
- **Use Case Pattern** - Casos de uso específicos
- **Strategy Pattern** - Calculadores especializados

**Autor:** Wilmar Yucuma  
**Prueba Técnica:** API Fechas Hábiles Colombia