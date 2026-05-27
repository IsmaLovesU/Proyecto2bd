
CREATE ROLE rol_admin;

GRANT SELECT, INSERT, UPDATE, DELETE ON
    categoria, proveedor, producto, empleado,
    usuario, cliente, venta, detalle_venta
TO rol_admin;

GRANT SELECT ON vista_historial_ventas TO rol_admin;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_admin;

CREATE ROLE rol_empleado;

GRANT SELECT ON categoria, proveedor, producto, empleado, cliente TO rol_empleado;
GRANT SELECT, INSERT ON venta, detalle_venta TO rol_empleado;
GRANT UPDATE (stock) ON producto TO rol_empleado;
GRANT SELECT ON vista_historial_ventas TO rol_empleado;

GRANT USAGE, SELECT ON SEQUENCE venta_id_venta_seq, detalle_venta_id_detalle_seq TO rol_empleado;

CREATE ROLE rol_cliente;

GRANT SELECT ON categoria, producto TO rol_cliente;
GRANT SELECT ON cliente TO rol_cliente;
GRANT SELECT ON venta, detalle_venta TO rol_cliente;

CREATE ROLE rol_gerente;

GRANT SELECT ON
    categoria, proveedor, producto, empleado,
    usuario, cliente, venta, detalle_venta
TO rol_gerente;

GRANT INSERT, UPDATE, DELETE ON empleado TO rol_gerente;
GRANT SELECT ON vista_historial_ventas TO rol_gerente;

GRANT USAGE, SELECT ON SEQUENCE empleado_id_empleado_seq TO rol_gerente;

CREATE ROLE rol_proveedor;

GRANT SELECT ON categoria TO rol_proveedor;
GRANT SELECT, UPDATE (nombre, descripcion, precio, stock, imagen_url) ON producto TO rol_proveedor;
GRANT SELECT ON proveedor TO rol_proveedor;

-- Asignar roles al usuario proy3 (superusuario dueño)
GRANT rol_admin     TO proy3;
GRANT rol_empleado  TO proy3;
GRANT rol_cliente   TO proy3;
GRANT rol_gerente   TO proy3;
GRANT rol_proveedor TO proy3;

-- Permisos para ejecutar los stored procedures
GRANT EXECUTE ON FUNCTION sp_realizar_compra(INTEGER, INTEGER, JSON)    TO rol_empleado, rol_cliente, rol_admin;
GRANT EXECUTE ON FUNCTION sp_agregar_producto(VARCHAR, TEXT, NUMERIC, INTEGER, TEXT, INTEGER, INTEGER) TO rol_admin, rol_gerente;
GRANT EXECUTE ON FUNCTION sp_registrar_cliente(VARCHAR, VARCHAR, VARCHAR, VARCHAR, INTEGER) TO rol_admin;
GRANT EXECUTE ON FUNCTION sp_actualizar_stock(INTEGER, INTEGER)          TO rol_admin, rol_empleado, rol_gerente;
GRANT EXECUTE ON FUNCTION sp_reporte_ventas(DATE, DATE)                  TO rol_admin, rol_gerente;