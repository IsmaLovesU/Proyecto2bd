
-- SP 1: sp_realizar_compra
--   Registra una venta completa con transacción explícita.
--   Parámetros de entrada: id_cliente, id_empleado, items (JSON)
--   Parámetro de salida:   id_venta generado
--   Manejo de excepciones: ROLLBACK si stock insuficiente
CREATE OR REPLACE FUNCTION sp_realizar_compra(
    p_id_cliente  INTEGER,
    p_id_empleado INTEGER,
    p_items       JSON       -- [{"id_producto": 1, "cantidad": 2, "precio": 150.00}, ...]
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_venta   INTEGER;
    v_total      NUMERIC(10,2) := 0;
    v_stock_actual INTEGER;
    v_item       JSON;
    v_id_prod    INTEGER;
    v_cantidad   INTEGER;
    v_precio     NUMERIC(10,2);
BEGIN
    -- Calcular total
    FOR v_item IN SELECT * FROM json_array_elements(p_items)
    LOOP
        v_total := v_total + (v_item->>'precio')::NUMERIC * (v_item->>'cantidad')::INTEGER;
    END LOOP;

    -- Insertar cabecera de venta
    INSERT INTO venta (total, id_cliente, id_empleado)
    VALUES (v_total, p_id_cliente, p_id_empleado)
    RETURNING id_venta INTO v_id_venta;

    -- Procesar cada ítem
    FOR v_item IN SELECT * FROM json_array_elements(p_items)
    LOOP
        v_id_prod  := (v_item->>'id_producto')::INTEGER;
        v_cantidad := (v_item->>'cantidad')::INTEGER;
        v_precio   := (v_item->>'precio')::NUMERIC;

        -- Verificar stock con bloqueo
        SELECT stock INTO v_stock_actual
        FROM producto
        WHERE id_producto = v_id_prod
        FOR UPDATE;

        IF v_stock_actual IS NULL THEN
            RAISE EXCEPTION 'Producto % no encontrado', v_id_prod;
        END IF;

        IF v_stock_actual < v_cantidad THEN
            RAISE EXCEPTION 'Stock insuficiente para producto %', v_id_prod;
        END IF;

        -- Insertar detalle
        INSERT INTO detalle_venta (cantidad, precio_unitario, subtotal, id_venta, id_producto)
        VALUES (v_cantidad, v_precio, v_precio * v_cantidad, v_id_venta, v_id_prod);

        -- Descontar stock
        UPDATE producto
        SET stock = stock - v_cantidad
        WHERE id_producto = v_id_prod;
    END LOOP;

    RETURN v_id_venta;

EXCEPTION
    WHEN OTHERS THEN
        RAISE; -- El caller hace ROLLBACK
END;
$$;

-- SP 2: sp_agregar_producto
--   Inserta un nuevo producto en el inventario.
--   Valida que precio y stock sean positivos.
CREATE OR REPLACE FUNCTION sp_agregar_producto(
    p_nombre       VARCHAR(150),
    p_descripcion  TEXT,
    p_precio       NUMERIC(10,2),
    p_stock        INTEGER,
    p_imagen_url   TEXT,
    p_id_categoria INTEGER,
    p_id_proveedor INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_producto INTEGER;
BEGIN
    IF p_precio <= 0 THEN
        RAISE EXCEPTION 'El precio debe ser mayor a 0';
    END IF;

    IF p_stock < 0 THEN
        RAISE EXCEPTION 'El stock no puede ser negativo';
    END IF;

    INSERT INTO producto (nombre, descripcion, precio, stock, imagen_url, id_categoria, id_proveedor)
    VALUES (p_nombre, p_descripcion, p_precio, p_stock, COALESCE(p_imagen_url, '/img/default.png'), p_id_categoria, p_id_proveedor)
    RETURNING id_producto INTO v_id_producto;

    RETURN v_id_producto;

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Categoría o proveedor no existe';
    WHEN OTHERS THEN
        RAISE;
END;
$$;

-- SP 3: sp_registrar_cliente
--   Registra un nuevo cliente vinculado a un usuario existente.
--   Parámetros de entrada/salida: retorna id_cliente
CREATE OR REPLACE FUNCTION sp_registrar_cliente(
    p_nombre    VARCHAR(100),
    p_apellido  VARCHAR(100),
    p_telefono  VARCHAR(20),
    p_email     VARCHAR(150),
    p_id_usuario INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_cliente INTEGER;
    v_existe     INTEGER;
BEGIN
    -- Verificar que el usuario no tenga ya un cliente asociado
    SELECT COUNT(*) INTO v_existe
    FROM cliente
    WHERE id_usuario = p_id_usuario;

    IF v_existe > 0 THEN
        RAISE EXCEPTION 'El usuario % ya tiene un cliente registrado', p_id_usuario;
    END IF;

    INSERT INTO cliente (nombre, apellido, telefono, email, id_usuario)
    VALUES (p_nombre, p_apellido, p_telefono, p_email, p_id_usuario)
    RETURNING id_cliente INTO v_id_cliente;

    RETURN v_id_cliente;

EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;

-- SP 4: sp_actualizar_stock
--   Actualiza el stock de un producto, valida que no quede negativo.
--   Parámetros de entrada: id_producto, cantidad_nueva
CREATE OR REPLACE FUNCTION sp_actualizar_stock(
    p_id_producto   INTEGER,
    p_nuevo_stock   INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_existe INTEGER;
BEGIN
    IF p_nuevo_stock < 0 THEN
        RAISE EXCEPTION 'El stock no puede ser negativo';
    END IF;

    SELECT COUNT(*) INTO v_existe
    FROM producto
    WHERE id_producto = p_id_producto;

    IF v_existe = 0 THEN
        RAISE EXCEPTION 'Producto % no encontrado', p_id_producto;
    END IF;

    UPDATE producto
    SET stock = p_nuevo_stock
    WHERE id_producto = p_id_producto;

EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;

-- SP 5: sp_reporte_ventas
--   Retorna resumen de ventas en un rango de fechas.
--   Parámetros de entrada: fecha_inicio, fecha_fin
CREATE OR REPLACE FUNCTION sp_reporte_ventas(
    p_fecha_inicio DATE,
    p_fecha_fin    DATE
)
RETURNS TABLE (
    id_venta        INTEGER,
    fecha           TIMESTAMP,
    cliente_nombre  VARCHAR,
    total           NUMERIC,
    cant_productos  BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_fecha_inicio > p_fecha_fin THEN
        RAISE EXCEPTION 'La fecha de inicio debe ser anterior a la fecha de fin';
    END IF;

    RETURN QUERY
    SELECT
        v.id_venta,
        v.fecha,
        (c.nombre || ' ' || c.apellido)::VARCHAR AS cliente_nombre,
        v.total,
        SUM(dv.cantidad) AS cant_productos
    FROM venta v
    JOIN cliente c        ON v.id_cliente = c.id_cliente
    JOIN detalle_venta dv ON dv.id_venta  = v.id_venta
    WHERE v.fecha::DATE BETWEEN p_fecha_inicio AND p_fecha_fin
    GROUP BY v.id_venta, v.fecha, c.nombre, c.apellido, v.total
    ORDER BY v.fecha DESC;

EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;