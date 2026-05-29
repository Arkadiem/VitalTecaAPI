# Library Management API (crud-nest)

Una API RESTful construida con **NestJS** y **Prisma ORM** (con SQLite) para gestionar el inventario y préstamos de una biblioteca.

## 🚀 Tecnologías

- [NestJS](https://nestjs.com/) (Framework Node.js)
- [Prisma ORM](https://www.prisma.io/) con adaptador libSQL
- [Turso](https://turso.tech/) (libSQL cloud database)
- TypeScript
- Class Validator & Class Transformer (Validación de DTOs)
- JWT + Passport (Autenticación y Autorización)

## 📋 Prerrequisitos

Asegúrate de tener instalado en tu sistema:
- [Node.js](https://nodejs.org/) (v18 o superior recomendado)
- El gestor de paquetes `pnpm`

## 🛠️ Instalación y Configuración

Sigue estos pasos para inicializar la API en tu entorno local.

1. **Instalar dependencias**
   ```bash
   pnpm install
   ```

2. **Configurar variables de entorno**
   Copia el archivo `.env` de ejemplo y edita las variables necesarias:
   ```bash
   # Requerido - credenciales de Turso (libSQL cloud)
   TURSO_DATABASE_URL="libsql://tu-db.turso.io"
   TURSO_AUTH_TOKEN="tu-auth-token"
   
   # Requerido - clave secreta para firmar JWTs (obligatorio, sin fallback)
   JWT_SECRET="tu_clave_secreta_jwt"
   ```
   > **Nota:** La aplicación no iniciará si `JWT_SECRET` no está definido en el entorno.

3. **Configurar la Base de Datos (Prisma + Turso)**
   Genera el cliente de Prisma:
   ```bash
   pnpm exec prisma generate
   ```
   Ejecuta el script de migración y seed que crea las tablas y datos iniciales en Turso:
   ```bash
   pnpm exec tsx prisma/seed.ts
   ```
   Esto crea las tablas necesarias e inserta los siguientes datos de prueba:
   | Tipo | Email | Password | Rol |
   |------|-------|----------|-----|
   | Admin | admin@biblioteca.com | admin123 | ADMIN |
   | Empleado | laura@biblioteca.com | librarian123 | EMPLOYEE |
   | Empleado | carlos@biblioteca.com | librarian456 | EMPLOYEE |
   | Cliente | alice@example.com | alice123 | CLIENT |
   | Cliente | bob@example.com | bob123 | CLIENT |
   | Cliente | charlie@example.com | charlie123 | CLIENT |

4. **Ejecutar la aplicación**
   ```bash
   # Modo desarrollo estándar
   pnpm start

   # Modo watch (recarga automática al guardar, recomendado para desarrollo)
   pnpm start:dev

   # Modo producción (requiere compilar antes con pnpm build)
   pnpm start:prod
   ```

   Una vez iniciada, la API estará escuchando peticiones en `http://localhost:3000`. Todos los endpoints tienen el prefijo `/api`.

## 🔐 Autenticación y Autorización

La API está protegida mediante **JSON Web Tokens (JWT)**. Para acceder a los recursos protegidos, el frontend debe incluir el token en la cabecera de las peticiones HTTP:
`Authorization: Bearer <tu_token_jwt>`

### Roles Disponibles
El sistema maneja permisos basados en roles (RBAC) con 3 niveles:
- **CLIENT**: Cliente/lector registrado. Acceso limitado: ver libros públicos, ver/editar solo su propio perfil, ver solo sus propios préstamos.
- **EMPLOYEE**: Empleado/bibliotecario. Acceso casi completo: gestionar libros, inventarios, préstamos y ver usuarios. No puede gestionar empleados ni eliminar recursos críticos.
- **ADMIN**: Administrador del sistema. Acceso total a todos los endpoints sin restricciones.

### Matriz de Permisos

| Endpoint | CLIENT | EMPLOYEE | ADMIN |
|----------|--------|----------|-------|
| Ver libros (GET) | ✅ | ✅ | ✅ |
| Crear/editar libros | ❌ | ✅ | ✅ |
| Eliminar libros | ❌ | ❌ | ✅ |
| Ver perfil propio (GET users/:id) | ✅ | ✅ | ✅ |
| Editar perfil propio (PATCH users/:id) | ✅ | ✅ | ✅ |
| Ver todos los usuarios | ❌ | ✅ | ✅ |
| Crear/eliminar usuarios | ❌ | ❌ | ✅ |
| Gestionar empleados | ❌ | ✅ (ver) | ✅ |
| Crear préstamos | ❌ | ✅ | ✅ |
| Ver préstamos | ✅ (solo suyos) | ✅ | ✅ |
| Devolver libros | ❌ | ✅ | ✅ |
| Gestionar inventario | ❌ | ✅ | ✅ |

### Endpoints de Auth
- `POST /api/auth/register` - Registra un nuevo usuario (`USER`). 
  - **Body requerido:** `{ "name": "...", "email": "...", "password": "..." }`
  - **Body opcional:** `{ "isActive": true }` (por defecto: `true`)
- `POST /api/auth/login` - Inicia sesión para Usuarios o Empleados.
  - **Body requerido:** `{ "email": "...", "password": "..." }`
  - **Respuesta:** Retorna el `access_token` (JWT) y los datos básicos del usuario logueado (incluyendo su `role`).

## 📄 Paginación

Todos los endpoints que listan colecciones (`GET /api/books`, `GET /api/users`, `GET /api/employees`, `GET /api/loans`, `GET /api/inventory`) ahora soportan paginación mediante query parameters:

- `?page=1` (por defecto: 1)
- `?limit=10` (por defecto: 10)

**Ejemplo de petición:** `GET /api/books?page=2&limit=5`

**Formato de respuesta paginada:**
```json
{
  "data": [
    // ... array de objetos
  ],
  "meta": {
    "total": 50,
    "page": 2,
    "lastPage": 5
  }
}
```

## 📖 Documentación Interactiva (Swagger)

Puedes explorar y probar todos los endpoints de forma visual a través de Swagger UI.
Una vez que el servidor esté en ejecución (`pnpm start:dev`), ingresa desde tu navegador a:

👉 **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

*(Nota: En Swagger encontrarás un botón "Authorize" en la parte superior para inyectar tu JWT y probar las rutas protegidas).*

## 📡 Endpoints Disponibles (con prefijo `/api`)

La API expone varios recursos. Todas las rutas reciben y devuelven datos en formato `JSON`.

### 📚 Libros (Books)
- `GET /api/books` - Obtener todos los libros (público).
- `GET /api/books/:id` - Obtener un libro por ID (público).
- `POST /api/books` - Crear un nuevo libro (solo EMPLOYEE/ADMIN).
- `PATCH /api/books/:id` - Actualizar un libro existente (solo EMPLOYEE/ADMIN).
- `DELETE /api/books/:id` - Eliminar un libro (solo ADMIN).

### 👥 Usuarios (Users)
- `GET /api/users` - Obtener todos los usuarios (solo EMPLOYEE/ADMIN).
- `GET /api/users/:id` - Obtener un usuario por ID (CLIENT solo el suyo, EMPLOYEE/ADMIN cualquiera).
- `POST /api/users` - Crear un nuevo usuario (solo ADMIN).
- `PATCH /api/users/:id` - Actualizar información (CLIENT solo el suyo, EMPLOYEE/ADMIN cualquiera).
- `DELETE /api/users/:id` - Eliminar un usuario (solo ADMIN).

### 👔 Empleados / Bibliotecarios (Employees)
- `GET /api/employees` - Obtener todos los empleados (solo EMPLOYEE/ADMIN).
- `GET /api/employees/:id` - Obtener un empleado por ID (solo EMPLOYEE/ADMIN).
- `POST /api/employees` - Registrar un empleado (solo ADMIN).
- `PATCH /api/employees/:id` - Actualizar un empleado (solo ADMIN).
- `DELETE /api/employees/:id` - Eliminar un empleado (solo ADMIN).

### 📖 Préstamos (Loans)
- `GET /api/loans` - Listar préstamos (CLIENT solo ve los suyos, EMPLOYEE/ADMIN ven todos).
- `GET /api/loans/:id` - Obtener detalles de un préstamo (CLIENT solo el suyo).
- `POST /api/loans` - Registrar un nuevo préstamo (solo EMPLOYEE/ADMIN). Disminuye el stock del libro.
- `PATCH /api/loans/:id` - Actualizar información de un préstamo (solo EMPLOYEE/ADMIN).
- `DELETE /api/loans/:id` - Eliminar un registro de préstamo (solo ADMIN).
- `PATCH /api/loans/:id/return` - **Devolver un libro** (solo EMPLOYEE/ADMIN). Valida que no esté devuelto, actualiza la fecha de retorno y restaura el stock.

### 📦 Inventario (Inventory)
- `GET /api/inventory` - Obtener registros de inventario (solo EMPLOYEE/ADMIN).
- `GET /api/inventory/:id` - Obtener un registro por ID (solo EMPLOYEE/ADMIN).
- `POST /api/inventory` - Crear un registro de inventario (solo EMPLOYEE/ADMIN). Valores válidos de `status`: `GOOD`, `DAMAGED`, `LOST` (por defecto: `GOOD`).
- `PATCH /api/inventory/:id` - Actualizar el estado en el inventario (solo EMPLOYEE/ADMIN).
- `DELETE /api/inventory/:id` - Eliminar un registro (solo ADMIN).

## 🚦 Manejo de Errores y Validaciones

- **Validación Automática:** Los datos de entrada (Data Transfer Objects o DTOs) están protegidos mediante el `ValidationPipe` global. Propiedades no definidas en los DTOs serán rechazadas automáticamente (`400 Bad Request`).
- **Filtro Global de Base de Datos:** Los errores originados por Prisma son interceptados:
  - `404 Not Found`: Al intentar buscar (`findOne`), actualizar o borrar un registro que no existe.
  - `409 Conflict`: Al violar reglas de unicidad (ej. crear un usuario con un email ya registrado, o un libro con un ISBN repetido).
- **Seguridad:** Los passwords nunca se exponen en las respuestas de la API (tanto en listados como en búsquedas individuales).
