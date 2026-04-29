# ecommerce.com — Proyecto 2
Aplicación web de gestión de inventario y ventas.
Curso cc3088 - Bases de Datos 1 | Universidad del Valle de Guatemala

## Tecnologías
- Backend: Node.js + Express + EJS
- Base de datos: PostgreSQL 16
- Infraestructura: Docker + Docker Compose

## Requisitos previos
- Docker Desktop instalado y corriendo
- Git

## Levantar el proyecto

1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo
```

2. Crear el archivo .env
```bash
cp .env.example .env
```

3. Levantar todo con Docker
```bash
docker compose up --build
```

4. Abrir en el navegador
```
http://localhost:3000
```

## Usuarios de prueba
Todos tienen la contraseña: `secret`

| Usuario  | Rol      | Acceso                     |
|----------|----------|----------------------------|
| admin    | admin    | Inventario + Historial     |
| maria    | empleado | Inventario + Historial     |
| cliente1 | cliente  | Home + Carrito + Historial |
| cliente2 | cliente  | Home + Carrito + Historial |
| cliente3 | cliente  | Home + Carrito + Historial |

## Estructura del proyecto
```
ecommerce/
├── .env.example
├── .gitignore
├── docker-compose.yml
├── README.md
├── db/
│   ├── schema.sql
│   └── seed.sql
└── backend/
    ├── Dockerfile
    ├── package.json
    ├── index.js
    ├── db.js
    ├── routes/
    │   ├── auth.js
    │   ├── home.js
    │   ├── carrito.js
    │   ├── historial.js
    │   └── inventario.js
    ├── views/
    │   ├── partials/
    │   │   ├── header.ejs
    │   │   └── footer.ejs
    │   ├── login.ejs
    │   ├── home.ejs
    │   ├── carrito.ejs
    │   ├── confirmacion.ejs
    │   ├── historial.ejs
    │   ├── inventario.ejs
    │   └── error.ejs
    └── public/
        ├── css/style.css
        ├── js/main.js
        └── img/default.png
```

## Funcionalidades
- Login / Logout con sesión
- Catálogo de productos con filtro por categoría
- Carrito de compras
- Compra con transacción explícita (BEGIN / COMMIT / ROLLBACK)
- Descuento automático de stock al comprar
- Historial de ventas
- Exportar historial a CSV
- Panel de inventario con agregar producto
- Manejo de errores visible para el usuario

## Credenciales de base de datos
- Usuario: `proy2`
- Contraseña: `secret`
- Base de datos: `ecommerce`
- Puerto: `5432`

## Detener el proyecto
```bash
docker compose down
```

Para borrar también los datos de la base de datos:
```bash
docker compose down -v
```