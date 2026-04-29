const express        = require('express');
const session        = require('express-session');
const pgSession      = require('connect-pg-simple')(session);
const path           = require('path');
const pool           = require('./db');

const authRoutes       = require('./routes/auth');
const homeRoutes       = require('./routes/home');
const carritoRoutes    = require('./routes/carrito');
const historialRoutes  = require('./routes/historial');
const inventarioRoutes = require('./routes/inventario');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  store: new pgSession({ pool, createTableIfMissing: true }),
  secret:            process.env.SESSION_SECRET,
  resave:            false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  next();
});

app.use('/',           authRoutes);
app.use('/',           homeRoutes);
app.use('/carrito',    carritoRoutes);
app.use('/historial',  historialRoutes);
app.use('/inventario', inventarioRoutes);

app.use((req, res) => {
  res.status(404).render('error', { mensaje: 'Página no encontrada' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { mensaje: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});