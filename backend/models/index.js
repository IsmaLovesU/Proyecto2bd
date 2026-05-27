// models/index.js — Modelos Sequelize para operaciones CRUD
const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

// ── Modelo: Producto (CRUD 1) ──────────────────────────────
const Producto = sequelize.define('producto', {
  id_producto: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true,
  },
  nombre: {
    type:      DataTypes.STRING(150),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
  },
  precio: {
    type:      DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  stock: {
    type:         DataTypes.INTEGER,
    allowNull:    false,
    defaultValue: 0,
  },
  imagen_url: {
    type: DataTypes.TEXT,
  },
  id_categoria: {
    type:      DataTypes.INTEGER,
    allowNull: false,
  },
  id_proveedor: {
    type:      DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName:  'producto',
  timestamps: false,
});

// ── Modelo: Empleado (CRUD 2) ──────────────────────────────
const Empleado = sequelize.define('empleado', {
  id_empleado: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true,
  },
  nombre: {
    type:      DataTypes.STRING(100),
    allowNull: false,
  },
  apellido: {
    type:      DataTypes.STRING(100),
    allowNull: false,
  },
  cargo: {
    type: DataTypes.STRING(100),
  },
  telefono: {
    type: DataTypes.STRING(20),
  },
  email: {
    type: DataTypes.STRING(150),
  },
}, {
  tableName:  'empleado',
  timestamps: false,
});

// ── Modelo: Cliente (CRUD 3) ───────────────────────────────
const Cliente = sequelize.define('cliente', {
  id_cliente: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true,
  },
  nombre: {
    type:      DataTypes.STRING(100),
    allowNull: false,
  },
  apellido: {
    type:      DataTypes.STRING(100),
    allowNull: false,
  },
  telefono: {
    type: DataTypes.STRING(20),
  },
  email: {
    type: DataTypes.STRING(150),
  },
  id_usuario: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName:  'cliente',
  timestamps: false,
});

module.exports = { Producto, Empleado, Cliente };