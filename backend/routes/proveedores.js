const express        = require('express');
const { pool }       = require('../db');
const { Producto }   = require('../models');
const router         = express.Router();

function requireProveedor(req, res, next) {
  if (!req.session.usuario) return res.redirect('/login');
  const rol = req.session.usuario.rol;
  if (rol !== 'proveedor' && rol !== 'admin') return res.redirect('/');
  next();
}

// GET /proveedores — lista productos del proveedor autenticado (Sequelize READ)
router.get('/', requireProveedor, async (req, res) => {
  try {
    const id_proveedor = req.session.usuario.id_proveedor;
    const productos = await Producto.findAll({
      where: { id_proveedor },
      order: [['nombre', 'ASC']],
    });
    res.render('proveedores', { productos, error: null });
  } catch (err) {
    console.error(err);
    res.render('error', { mensaje: 'Error al cargar productos' });
  }
});

// POST /proveedores/stock — actualiza stock de sus productos via SP
router.post('/stock', requireProveedor, async (req, res) => {
  const { id_producto, nuevo_stock } = req.body;
  const id_proveedor = req.session.usuario.id_proveedor;

  const client = await pool.connect();
  try {
    // Verificar que el producto pertenece a este proveedor
    const producto = await Producto.findOne({
      where: { id_producto, id_proveedor }
    });
    if (!producto) return res.redirect('/proveedores?error=no_autorizado');

    await client.query('BEGIN');
    await client.query('SELECT sp_actualizar_stock($1, $2)', [id_producto, parseInt(nuevo_stock)]);
    await client.query('COMMIT');
    res.redirect('/proveedores');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.render('error', { mensaje: 'Error al actualizar stock' });
  } finally {
    client.release();
  }
});

// POST /proveedores/editar — edita nombre/descripción/precio de sus productos (Sequelize UPDATE)
router.post('/editar', requireProveedor, async (req, res) => {
  const { id_producto, nombre, descripcion, precio } = req.body;
  const id_proveedor = req.session.usuario.id_proveedor;

  try {
    await Producto.update(
      { nombre, descripcion, precio: parseFloat(precio) },
      { where: { id_producto, id_proveedor } }
    );
    res.redirect('/proveedores');
  } catch (err) {
    console.error(err);
    res.render('error', { mensaje: 'Error al editar producto' });
  }
});

module.exports = router;