const express = require('express');
const bcrypt  = require('bcrypt');
const pool    = require('../db');
const router  = express.Router();

// GET /login
router.get('/login', (req, res) => {
  if (req.session.usuario) return res.redirect('/');
  res.render('login', { error: null });
});

// POST /login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.render('login', { error: 'Completa todos los campos' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT * FROM usuario WHERE username = $1', [username]
    );

    if (rows.length === 0) {
      return res.render('login', { error: 'Usuario o contraseña incorrectos' });
    }

    const usuario = rows[0];
    const match   = await bcrypt.compare(password, usuario.password_hash);

    if (!match) {
      return res.render('login', { error: 'Usuario o contraseña incorrectos' });
    }

    req.session.usuario = {
      id:          usuario.id_usuario,
      username:    usuario.username,
      rol:         usuario.rol,
      id_empleado: usuario.id_empleado
    };

    if (usuario.rol === 'admin' || usuario.rol === 'empleado') {
      return res.redirect('/inventario');
    }
    res.redirect('/');

  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Error del servidor, intenta de nuevo' });
  }
});

// GET /logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;