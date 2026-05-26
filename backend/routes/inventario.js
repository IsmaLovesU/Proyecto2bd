const express = require('express');
const { pool }   = require('../db');
const { Producto } = require('../models');
const router  = express.Router();

function requireAdmin(req, res, next) {
  if (!req.session.usuario) return res.redirect('/login');
  const rol = req.session.usuario.rol;
  if (rol === 'cliente' || rol === 'proveedor') return res.redirect('/');
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.usuario) return res.redirect('/login');
  if (req.session.usuario.rol !== 'admin') return res.redirect('/');
  next();
}


router.get('/', requireAdmin, async (req, res) => {
  try {
    // Sequelize: listar productos con subquery de ventas via raw
    const productos = await Producto.findAll({
      order: [['nombre', 'ASC']],
    });
 
    // Enriquecer con nombre de categoría y total vendido via raw
    const { rows: detalle } = await pool.query(`
      SELECT p.id_producto,
             c.nombre AS categoria_nombre,
             (SELECT SUM(dv.cantidad)
              FROM detalle_venta dv
              WHERE dv.id_producto = p.id_producto) AS total_vendido
      FROM producto p
      JOIN categoria c ON p.id_categoria = c.id_categoria
    `);
    const mapaDetalle = {};
    detalle.forEach(d => { mapaDetalle[d.id_producto] = d; });
 
    const { rows: categorias } = await pool.query(
      'SELECT * FROM categoria ORDER BY id_categoria'
    );
 
    const productosVista = productos.map(p => ({
      ...p.dataValues,
      categoria_nombre: mapaDetalle[p.id_producto]?.categoria_nombre || '',
      total_vendido:    mapaDetalle[p.id_producto]?.total_vendido    || 0,
    }));
 
    res.render('inventario', { productos: productosVista, categorias });
  } catch (err) {
    console.error(err);
    res.render('error', { mensaje: 'Error al cargar el inventario' });
  }
});

// POST /inventario/agregar — usa stored procedure sp_agregar_producto
router.post('/agregar', requireAdmin, async (req, res) => {
  const { nombre, descripcion, precio, stock, imagen_url, id_categoria } = req.body;
 
  if (!nombre || !precio || !stock || !id_categoria) {
    return res.redirect('/inventario?error=campos');
  }
 
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
 
    await client.query(
      'SELECT sp_agregar_producto($1, $2, $3, $4, $5, $6, $7)',
      [nombre, descripcion, parseFloat(precio), parseInt(stock),
       imagen_url || '/img/default.png', id_categoria, 1]
    );
 
    await client.query('COMMIT');
    res.redirect('/inventario');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.redirect('/inventario?error=servidor');
  } finally {
    client.release();
  }
});
 
// POST /inventario/stock — actualiza stock via SP sp_actualizar_stock
router.post('/stock', requireAdminOrEmpleado, async (req, res) => {
  const { id_producto, nuevo_stock } = req.body;
 
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'SELECT sp_actualizar_stock($1, $2)',
      [id_producto, parseInt(nuevo_stock)]
    );
    await client.query('COMMIT');
    res.redirect('/inventario');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.redirect('/inventario?error=servidor');
  } finally {
    client.release();
  }
});

module.exports = router;