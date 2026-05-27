const express = require('express');
const { pool }    = require('../db');
const router  = express.Router();

function requireLogin(req, res, next) {
  if (!req.session.usuario) return res.redirect('/login');
  next();
}

router.get('/', requireLogin, (req, res) => {
  const carrito = req.session.carrito || [];
  const total   = carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0);
  res.render('carrito', { carrito, total });
});

router.post('/agregar', requireLogin, async (req, res) => {
  const { id_producto } = req.body;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM producto WHERE id_producto = $1 AND stock > 0',
      [id_producto]
    );
    if (rows.length === 0) return res.redirect('/?error=sin_stock');

    const producto = rows[0];
    if (!req.session.carrito) req.session.carrito = [];

    const existe = req.session.carrito.find(p => p.id_producto === producto.id_producto);
    if (existe) {
      existe.cantidad++;
    } else {
      req.session.carrito.push({
        id_producto: producto.id_producto,
        nombre:      producto.nombre,
        precio:      parseFloat(producto.precio),
        imagen_url:  producto.imagen_url,
        cantidad:    1
      });
    }
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.redirect('/?error=servidor');
  }
});

router.post('/eliminar', requireLogin, (req, res) => {
  const { id_producto } = req.body;
  req.session.carrito = (req.session.carrito || []).filter(
    p => p.id_producto != id_producto
  );
  res.redirect('/carrito');
});

// Compra usando stored procedure sp_realizar_compra con transacción explícita
router.post('/comprar', requireLogin, async (req, res) => {
  const carrito = req.session.carrito || [];
  const usuario = req.session.usuario;
  if (carrito.length === 0) return res.redirect('/carrito');
 
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
 
    // Obtener id_cliente del usuario
    const { rows: clienteRows } = await client.query(
      'SELECT id_cliente FROM cliente WHERE id_usuario = $1', [usuario.id]
    );
    if (clienteRows.length === 0) throw new Error('Cliente no encontrado');
    const id_cliente  = clienteRows[0].id_cliente;
    const id_empleado = 1;
 
    // Construir JSON de items para el stored procedure
    const items = carrito.map(item => ({
      id_producto: item.id_producto,
      cantidad:    item.cantidad,
      precio:      item.precio
    }));
 
    // Invocar stored procedure
    const { rows } = await client.query(
      'SELECT sp_realizar_compra($1, $2, $3) AS id_venta',
      [id_cliente, id_empleado, JSON.stringify(items)]
    );
 
    const id_venta = rows[0].id_venta;
 
    await client.query('COMMIT');
    req.session.carrito = [];
    res.redirect('/carrito/confirmacion/' + id_venta);
 
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.render('error', { mensaje: err.message || 'Error al procesar la compra' });
  } finally {
    client.release();
  }
});

router.get('/confirmacion/:id', requireLogin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT v.id_venta, v.fecha, v.total, c.nombre AS cliente_nombre
       FROM venta v JOIN cliente c ON v.id_cliente = c.id_cliente
       WHERE v.id_venta = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.redirect('/');
    res.render('confirmacion', { venta: rows[0] });
  } catch (err) {
    res.render('error', { mensaje: 'Error al cargar la confirmación' });
  }
});

module.exports = router;