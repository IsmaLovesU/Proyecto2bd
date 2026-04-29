const express = require('express');
const pool    = require('../db');
const router  = express.Router();

function requireLogin(req, res, next) {
  if (!req.session.usuario) return res.redirect('/login');
  next();
}

router.get('/', requireLogin, async (req, res) => {
  try {
    const usuario = req.session.usuario;
    let query, params = [];

    if (usuario.rol === 'admin' || usuario.rol === 'empleado') {
      query = `
        SELECT id_venta, fecha, total, cliente_nombre, cliente_apellido
        FROM   vista_historial_ventas
        GROUP  BY id_venta, fecha, total, cliente_nombre, cliente_apellido
        ORDER  BY fecha DESC
      `;
    } else {
      query = `
        WITH ventas_cliente AS (
          SELECT v.id_venta, v.fecha, v.total
          FROM   venta v
          JOIN   cliente c ON v.id_cliente = c.id_cliente
          JOIN   usuario u ON c.id_usuario = u.id_usuario
          WHERE  u.id_usuario = $1
        )
        SELECT * FROM ventas_cliente ORDER BY fecha DESC
      `;
      params = [usuario.id];
    }

    const { rows: ventas } = await pool.query(query, params);
    res.render('historial', { ventas });

  } catch (err) {
    console.error(err);
    res.render('error', { mensaje: 'Error al cargar el historial' });
  }
});

router.get('/exportar', requireLogin, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT v.id_venta,
             to_char(v.fecha,'DD/MM/YYYY HH24:MI') AS fecha,
             v.cliente_nombre || ' ' || v.cliente_apellido AS cliente,
             v.producto_nombre AS producto,
             v.cantidad, v.precio_unitario, v.subtotal, v.total
      FROM   vista_historial_ventas v
      ORDER  BY v.fecha DESC
    `);

    const header = 'ID Venta,Fecha,Cliente,Producto,Cantidad,Precio Unitario,Subtotal,Total\n';
    const csv = rows.map(r =>
      `${r.id_venta},"${r.fecha}","${r.cliente}","${r.producto}",${r.cantidad},${r.precio_unitario},${r.subtotal},${r.total}`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="historial_ventas.csv"');
    res.send(header + csv);
  } catch (err) {
    res.render('error', { mensaje: 'Error al exportar' });
  }
});

module.exports = router;