
CREATE TABLE categoria (
    id_categoria  SERIAL        PRIMARY KEY,
    nombre        VARCHAR(100)  NOT NULL,
    descripcion   TEXT
);

CREATE TABLE proveedor (
    id_proveedor  SERIAL        PRIMARY KEY,
    nombre        VARCHAR(150)  NOT NULL,
    telefono      VARCHAR(20),
    email         VARCHAR(150),
    direccion     TEXT
);

CREATE TABLE producto (
    id_producto   SERIAL          PRIMARY KEY,
    nombre        VARCHAR(150)    NOT NULL,
    descripcion   TEXT,
    precio        NUMERIC(10,2)   NOT NULL,
    stock         INTEGER         NOT NULL DEFAULT 0,
    imagen_url    TEXT,
    id_categoria  INTEGER         NOT NULL REFERENCES categoria(id_categoria),
    id_proveedor  INTEGER         NOT NULL REFERENCES proveedor(id_proveedor)
);

CREATE TABLE empleado (
    id_empleado   SERIAL        PRIMARY KEY,
    nombre        VARCHAR(100)  NOT NULL,
    apellido      VARCHAR(100)  NOT NULL,
    cargo         VARCHAR(100),
    telefono      VARCHAR(20),
    email         VARCHAR(150)
);

CREATE TABLE usuario (
    id_usuario    SERIAL        PRIMARY KEY,
    username      VARCHAR(100)  NOT NULL UNIQUE,
    password_hash TEXT          NOT NULL,
    rol           VARCHAR(20)   NOT NULL DEFAULT 'cliente',
    id_empleado   INTEGER       REFERENCES empleado(id_empleado)
    id_proveedor  INTEGER       REFERENCES proveedor(id_proveedor)
);

CREATE TABLE cliente (
    id_cliente    SERIAL        PRIMARY KEY,
    nombre        VARCHAR(100)  NOT NULL,
    apellido      VARCHAR(100)  NOT NULL,
    telefono      VARCHAR(20),
    email         VARCHAR(150),
    id_usuario    INTEGER       REFERENCES usuario(id_usuario)
);

CREATE TABLE venta (
    id_venta      SERIAL          PRIMARY KEY,
    fecha         TIMESTAMP       NOT NULL DEFAULT NOW(),
    total         NUMERIC(10,2)   NOT NULL,
    id_cliente    INTEGER         NOT NULL REFERENCES cliente(id_cliente),
    id_empleado   INTEGER         NOT NULL REFERENCES empleado(id_empleado)
);

CREATE TABLE detalle_venta (
    id_detalle        SERIAL          PRIMARY KEY,
    cantidad          INTEGER         NOT NULL,
    precio_unitario   NUMERIC(10,2)   NOT NULL,
    subtotal          NUMERIC(10,2)   NOT NULL,
    id_venta          INTEGER         NOT NULL REFERENCES venta(id_venta),
    id_producto       INTEGER         NOT NULL REFERENCES producto(id_producto)
);

-- Índices
CREATE INDEX idx_producto_categoria  ON producto(id_categoria);
CREATE INDEX idx_venta_cliente       ON venta(id_cliente);
CREATE INDEX idx_producto_proveedor  ON producto(id_proveedor);

-- Vista historial
CREATE VIEW vista_historial_ventas AS
    SELECT
        v.id_venta,
        v.fecha,
        v.total,
        c.nombre     AS cliente_nombre,
        c.apellido   AS cliente_apellido,
        p.nombre     AS producto_nombre,
        p.imagen_url,
        dv.cantidad,
        dv.precio_unitario,
        dv.subtotal
    FROM venta v
    JOIN cliente c        ON v.id_cliente   = c.id_cliente
    JOIN detalle_venta dv ON dv.id_venta    = v.id_venta
    JOIN producto p       ON dv.id_producto = p.id_producto;