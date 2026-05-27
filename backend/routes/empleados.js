const express        = require('express');
const { Empleado }   = require('../models');
const router         = express.Router();

function requireGerente(req, res, next) {
  if (!req.session.usuario) return res.redirect('/login');
  const rol = req.session.usuario.rol;
  if (rol !== 'gerente' && rol !== 'admin') return res.redirect('/');
  next();
}

// GET /empleados — Sequelize READ
router.get('/', requireGerente, async (req, res) => {
  try {
    const empleados = await Empleado.findAll({ order: [['apellido', 'ASC']] });
    res.render('empleados', { empleados, error: null });
  } catch (err) {
    console.error(err);
    res.render('error', { mensaje: 'Error al cargar empleados' });
  }
});

// POST /empleados/agregar — Sequelize CREATE
router.post('/agregar', requireGerente, async (req, res) => {
  const { nombre, apellido, cargo, telefono, email } = req.body;
  if (!nombre || !apellido) {
    const empleados = await Empleado.findAll({ order: [['apellido', 'ASC']] });
    return res.render('empleados', { empleados, error: 'Nombre y apellido son requeridos' });
  }
  try {
    await Empleado.create({ nombre, apellido, cargo, telefono, email });
    res.redirect('/empleados');
  } catch (err) {
    console.error(err);
    res.render('error', { mensaje: 'Error al agregar empleado' });
  }
});

// POST /empleados/editar — Sequelize UPDATE
router.post('/editar', requireGerente, async (req, res) => {
  const { id_empleado, nombre, apellido, cargo, telefono, email } = req.body;
  try {
    await Empleado.update(
      { nombre, apellido, cargo, telefono, email },
      { where: { id_empleado } }
    );
    res.redirect('/empleados');
  } catch (err) {
    console.error(err);
    res.render('error', { mensaje: 'Error al editar empleado' });
  }
});

// POST /empleados/eliminar — Sequelize DELETE
router.post('/eliminar', requireGerente, async (req, res) => {
  const { id_empleado } = req.body;
  try {
    await Empleado.destroy({ where: { id_empleado } });
    res.redirect('/empleados');
  } catch (err) {
    console.error(err);
    res.render('error', { mensaje: 'Error al eliminar empleado' });
  }
});

module.exports = router;