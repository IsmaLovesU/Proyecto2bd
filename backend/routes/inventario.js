const express = require('express');
const pool    = require('../db');
const router  = express.Router();

function requireAdmin(req, res, next) {
  if (!req.session.usuario) return res.redirect('/login');
  if (req.session.usuario.rol === 'cliente') return res.redirect('/');
  next();
}

router.get('/', requireAdmin, async (req, res) => {
  try {
    const { rows: productos } = await pool.query(`
      SELECT p.id_producto, p.nombre, p.descripcion,
             p.precio, p.stock, p.imagen_url,
             c.nombre AS categoria_nombre,
             (SELECT SUM(dv.cantidad)
              FROM detalle_venta dv
              WHERE dv.id_producto = p.id_producto) AS total_vendido
      FROM   producto p
      JOIN   categoria c ON p.id_categoria = c.id_categoria
      ORDER  BY c.nombre, p.nombre
    `);

    const { rows: categorias } = await pool.query(
      'SELECT * FROM categoria ORDER BY id_categoria'
    );

    res.render('inventario', { productos, categorias });
  } catch (err) {
    console.error(err);
    res.render('error', { mensaje: 'Error al cargar el inventario' });
  }
});

router.post('/agregar', requireAdmin, async (req, res) => {
  const { nombre, descripcion, precio, stock, imagen_url, id_categoria } = req.body;

  if (!nombre || !precio || !stock || !id_categoria) {
    return res.redirect('/inventario?error=campos');
  }

  try {
    await pool.query(
      `INSERT INTO producto (nombre, descripcion, precio, stock, imagen_url, id_categoria, id_proveedor)
       VALUES ($1, $2, $3, $4, $5, $6, 1)`,
      [nombre, descripcion, parseFloat(precio), parseInt(stock),
       imagen_url || '/img/default.png', id_categoria]
    );
    res.redirect('/inventario');
  } catch (err) {
    console.error(err);
    res.redirect('/inventario?error=servidor');
  }
});

module.exports = router;