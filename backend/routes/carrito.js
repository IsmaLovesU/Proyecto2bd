const express = require('express');
const pool    = require('../db');
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

router.post('/comprar', requireLogin, async (req, res) => {
  const carrito = req.session.carrito || [];
  const usuario = req.session.usuario;
  if (carrito.length === 0) return res.redirect('/carrito');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: clienteRows } = await client.query(
      'SELECT id_cliente FROM cliente WHERE id_usuario = $1', [usuario.id]
    );
    if (clienteRows.length === 0) throw new Error('Cliente no encontrado');
    const id_cliente  = clienteRows[0].id_cliente;
    const id_empleado = 1;
    const total = carrito.reduce((s, p) => s + p.precio * p.cantidad, 0);

    const { rows: ventaRows } = await client.query(
      'INSERT INTO venta (total, id_cliente, id_empleado) VALUES ($1, $2, $3) RETURNING id_venta',
      [total, id_cliente, id_empleado]
    );
    const id_venta = ventaRows[0].id_venta;

    for (const item of carrito) {
      const { rows: stockRows } = await client.query(
        'SELECT stock FROM producto WHERE id_producto = $1 FOR UPDATE', [item.id_producto]
      );
      if (stockRows[0].stock < item.cantidad) {
        throw new Error('Stock insuficiente para: ' + item.nombre);
      }
      await client.query(
        'INSERT INTO detalle_venta (cantidad, precio_unitario, subtotal, id_venta, id_producto) VALUES ($1,$2,$3,$4,$5)',
        [item.cantidad, item.precio, item.precio * item.cantidad, id_venta, item.id_producto]
      );
      await client.query(
        'UPDATE producto SET stock = stock - $1 WHERE id_producto = $2',
        [item.cantidad, item.id_producto]
      );
    }

    await client.query('COMMIT');
    req.session.carrito = [];
    res.redirect('/confirmacion/' + id_venta);

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