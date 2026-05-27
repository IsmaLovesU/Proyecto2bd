# ecommerce.com — Proyecto 3

Extensión del Proyecto 2 con seguridad a nivel de base de datos: roles y permisos, stored procedures y ORM (Sequelize).

## Tecnologías
- Backend: Node.js + Express + EJS
- ORM: Sequelize 6
- Base de datos: PostgreSQL 16
- Infraestructura: Docker + Docker Compose

## Requisitos previos
- Docker Desktop instalado y corriendo
- Git

## Levantar el proyecto

```bash
git clone <repo>
cd <repo>
git checkout proyecto-3
cp .env.example .env
docker compose up --build
```

Abrir en el navegador: `http://localhost:3000`

> **Nota:** Si el puerto 5432 está ocupado por otro proyecto, el `docker-compose.yml` expone PostgreSQL en el puerto `5433` del host. El backend se comunica internamente en el puerto `5432` dentro de Docker, por lo que no requiere cambios adicionales.

## Usuarios de prueba
Todos tienen la contraseña: `secret`

| Usuario    | Rol       | Acceso                                      |
|------------|-----------|---------------------------------------------|
| admin      | admin     | Todo: inventario, empleados, historial      |
| gerente1   | gerente   | Gestión de empleados + historial de ventas  |
| maria      | empleado  | Inventario + historial                      |
| cliente1   | cliente   | Tienda + carrito + mis compras              |
| cliente2   | cliente   | Tienda + carrito + mis compras              |
| cliente3   | cliente   | Tienda + carrito + mis compras              |
| proveedor1 | proveedor | Sus propios productos (stock + info)        |

## Roles en la base de datos

Los roles existen en el DBMS (PostgreSQL), definidos con `CREATE ROLE`, `GRANT` y `REVOKE` en `db/roles.sql`.

| Rol           | Tablas accesibles                                  | Operaciones permitidas                         |
|---------------|----------------------------------------------------|------------------------------------------------|
| rol_admin     | Todas                                              | SELECT, INSERT, UPDATE, DELETE                 |
| rol_empleado  | producto, venta, detalle_venta, cliente, empleado  | SELECT en todo; INSERT en ventas; UPDATE stock |
| rol_cliente   | producto, categoria, cliente, venta, detalle_venta | SELECT únicamente                              |
| rol_gerente   | Todas (lectura) + empleado                         | SELECT todo; INSERT/UPDATE/DELETE en empleado  |
| rol_proveedor | producto, proveedor, categoria                     | SELECT; UPDATE nombre/desc/precio/stock        |

## Stored Procedures

Definidos en `db/procedures.sql`, invocados desde el backend (nunca desde scripts independientes).

| Procedimiento        | Descripción                                   | Parámetros E/S | ROLLBACK |
|----------------------|-----------------------------------------------|----------------|----------|
| sp_realizar_compra   | Registra venta completa y descuenta stock     | Entrada + salida (id_venta) | ✅ |
| sp_agregar_producto  | Inserta producto con validaciones de precio   | Entrada        | ✅       |
| sp_registrar_cliente | Registra cliente vinculado a un usuario       | Entrada + salida (id_cliente) | ✅ |
| sp_actualizar_stock  | Actualiza stock validando que no sea negativo | Entrada        | ✅       |
| sp_reporte_ventas    | Retorna ventas en un rango de fechas          | Entrada        | ✅       |

## ORM (Sequelize) — operaciones CRUD cubiertas

Configurado en `backend/models/index.js`. Modelos: `Producto`, `Empleado`, `Cliente`.

| Modelo   | Operaciones ORM              | Ruta           |
|----------|------------------------------|----------------|
| Producto | READ                         | `/inventario`  |
| Empleado | CREATE, READ, UPDATE, DELETE | `/empleados`   |
| Producto | READ, UPDATE                 | `/proveedores` |

## Estructura del proyecto

```
ecommerce/
├── .env.example
├── .gitignore
├── docker-compose.yml
├── README.md
├── db/
│   ├── schema.sql        ← tablas base
│   ├── seed.sql          ← datos de prueba + usuarios por rol
│   ├── procedures.sql    ← 5 stored procedures
│   └── roles.sql         ← CREATE ROLE + GRANT/REVOKE
└── backend/
    ├── Dockerfile
    ├── package.json
    ├── index.js
    ├── db.js             ← exporta { pool, sequelize }
    ├── models/
    │   └── index.js      ← modelos Sequelize
    ├── routes/
    │   ├── auth.js
    │   ├── home.js
    │   ├── carrito.js    ← invoca sp_realizar_compra
    │   ├── historial.js
    │   ├── inventario.js ← invoca sp_agregar_producto y sp_actualizar_stock
    │   ├── empleados.js  ← CRUD Sequelize para rol gerente
    │   └── proveedores.js← gestión productos para rol proveedor
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
    │   ├── empleados.ejs
    │   ├── proveedores.ejs
    │   └── error.ejs
    └── public/
        ├── css/style.css
        ├── js/main.js
        └── img/default.png
```

## Credenciales de base de datos
- Usuario: `proy3`
- Contraseña: `secret`
- Base de datos: `ecommerce`
- Puerto externo: `5433` (interno Docker: `5432`)

## Detener el proyecto
```bash
docker compose down
```

Para borrar también los datos:
```bash
docker compose down -v
```
