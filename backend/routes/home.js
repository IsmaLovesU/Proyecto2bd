const express = require('express');
const pool    = require('../db');
const router  = express.Router();

function requireLogin(req, res, next) {
  if (!req.session.usuario) return res.redirect('/login');
  next();
}

router.get('/', requireLogin, async (req, res) => {
  const { categoria } = req.query;

  try {
    let query = `
      SELECT p.id_producto, p.nombre, p.descripcion,
             p.precio, p.stock, p.imagen_url,
             c.nombre AS categoria_nombre
      FROM   producto p
      JOIN   categoria c ON p.id_categoria = c.id_categoria
      WHERE  p.stock > 0
    `;
    const params = [];

    if (categoria) {
      query += ' AND p.id_categoria = $1';
      params.push(categoria);
    }
    query += ' ORDER BY c.nombre, p.nombre';

    const { rows: productos }  = await pool.query(query, params);
    const { rows: categorias } = await pool.query(
      'SELECT * FROM categoria ORDER BY id_categoria'
    );

    res.render('home', {
      productos,
      categorias,
      categoriaActiva: categoria || ''
    });

  } catch (err) {
    console.error(err);
    res.render('error', { mensaje: 'Error al cargar los productos' });
  }
});

module.exports = router;