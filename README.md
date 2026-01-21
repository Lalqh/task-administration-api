# Task Administration API

API en NestJS + TypeORM (MySQL) para administrar tareas, con soporte de visibilidad pública y control de edición por propietario.

## 1. Requisitos

- Node.js 18+
- MySQL 8+
- Windows (probado con PowerShell)

## 2. Configuración rápida

1) Clonar e instalar:
```powershell
git clone <repo>
cd task-administration-api
npm install
```

2) Variables de entorno (.env):
```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=task_admin
```
- Crear la base: `CREATE DATABASE task_admin;`
- El proyecto usa TypeORM; si está habilitado `synchronize`, se crean tablas al iniciar.

3) Arranque:
```powershell
npm run start:dev
```
- Swagger: http://localhost:3000/docs

## 3. Autenticación y autorización

- Header usado: `x-user-id` (entero > 0).
- Rutas públicas permiten no enviar `x-user-id`. Si lo envías, se usa para filtrar y registrar logs.
- Reglas:
  - Tareas públicas: se pueden listar/ver/editar/eliminar por cualquiera.
  - Tareas no públicas: solo el “propietario” puede editar/eliminar. Propietario = quien generó el log `TaskLog` con `action="create"` para esa tarea.

## 4. Endpoints principales

Base: `http://localhost:3000`

- Listar tareas (públicas o propias):
```powershell
# Sin usuario (solo públicas)
curl.exe http://localhost:3000/tasks

# Con usuario (públicas + propias)
curl.exe -H "x-user-id: 1" http://localhost:3000/tasks
```

- Crear tarea (URL y ejemplo de JSON):
URL: http://localhost:3000/tasks
```json
{
  "title": "Fix login bug",
  "description": "Investigate",
  "status": "pending",
  "dueDate": "2026-01-31T00:00:00.000Z",
  "tagNames": ["backend", "priority"],
  "priority": "high",
  "isPublic": 1,
  "responsibleId": 2
}
```

- Ver por id:
URL: http://localhost:3000/tasks/1

- Actualizar:
```powershell
curl.exe -X PATCH http://localhost:3000/tasks/1 -H "Content-Type: application/json" -H "x-user-id: 1" -d ^
"{\"title\":\"Fix login bug v2\",\"status\":\"in_progress\"}"
```

- Eliminar:
```powershell
curl.exe -X DELETE http://localhost:3000/tasks/1 -H "x-user-id: 1"
```

## 5. Swagger

- Abre http://localhost:3000/docs
- Usa el botón “Authorize” o agrega el header `x-user-id` en cada operación (algunas son públicas).
- Ejemplos ya incluidos en DTOs.

