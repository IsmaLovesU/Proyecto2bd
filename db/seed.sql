-- ============================================
-- seed.sql — Datos de prueba ecommerce.com
-- ============================================

INSERT INTO categoria (id_categoria, nombre, descripcion) VALUES
(1, 'Tecnología',  'Dispositivos electrónicos y accesorios'),
(2, 'Belleza',     'Cuidado personal y cosméticos'),
(3, 'Deportes',    'Equipamiento y ropa deportiva'),
(4, 'Adornos',     'Decoración y artículos ornamentales'),
(5, 'Cocina',      'Utensilios y electrodomésticos de cocina');

INSERT INTO proveedor (nombre, telefono, email, direccion) VALUES
('TechDistrib S.A.',    '2234-5678', 'ventas@techdistrib.com',   'Zona 9, Guatemala'),
('BellezaTotal Ltda.',  '2245-6789', 'info@bellezatotal.com',    'Zona 10, Guatemala'),
('SportMax Guatemala',  '2256-7890', 'contacto@sportmax.gt',     'Zona 13, Guatemala'),
('DecorArte S.A.',      '2267-8901', 'pedidos@decorarte.com',    'Zona 4, Guatemala'),
('CocinaPlus Dist.',    '2278-9012', 'ventas@cocinaplus.gt',     'Zona 12, Guatemala');

INSERT INTO empleado (nombre, apellido, cargo, telefono, email) VALUES
('Carlos',   'Méndez',   'Administrador', '5534-1234', 'carlos@ecommerce.com'),
('María',    'López',    'Vendedor',      '5534-5678', 'maria@ecommerce.com'),
('José',     'García',   'Vendedor',      '5534-9012', 'jose@ecommerce.com'),
('Ana',      'Pérez',    'Vendedor',      '5534-3456', 'ana@ecommerce.com'),
('Luis',     'Ramírez',  'Soporte',       '5534-7890', 'luis@ecommerce.com');

INSERT INTO usuario (username, password_hash, rol, id_empleado) VALUES
('admin',    '$2b$10$w8vZbA9z1QwXkLmN3pRt8eYhT5sU7vKj2mF4nG6oH0iJ1kL3mN5oP', 'admin',    1),
('maria',    '$2b$10$w8vZbA9z1QwXkLmN3pRt8eYhT5sU7vKj2mF4nG6oH0iJ1kL3mN5oP', 'empleado', 2),
('cliente1', '$2b$10$w8vZbA9z1QwXkLmN3pRt8eYhT5sU7vKj2mF4nG6oH0iJ1kL3mN5oP', 'cliente',  NULL),
('cliente2', '$2b$10$w8vZbA9z1QwXkLmN3pRt8eYhT5sU7vKj2mF4nG6oH0iJ1kL3mN5oP', 'cliente',  NULL),
('cliente3', '$2b$10$w8vZbA9z1QwXkLmN3pRt8eYhT5sU7vKj2mF4nG6oH0iJ1kL3mN5oP', 'cliente',  NULL);

INSERT INTO cliente (nombre, apellido, telefono, email, id_usuario) VALUES
('Pedro',   'Hernández', '5512-1111', 'pedro@mail.com',   3),
('Sofía',   'Castillo',  '5512-2222', 'sofia@mail.com',   4),
('Diego',   'Morales',   '5512-3333', 'diego@mail.com',   5),
('Valeria', 'Ruiz',      '5512-4444', 'valeria@mail.com', NULL),
('Andrés',  'Torres',    '5512-5555', 'andres@mail.com',  NULL);

INSERT INTO producto (nombre, descripcion, precio, stock, imagen_url, id_categoria, id_proveedor) VALUES
('Laptop HP 15"',        'Procesador i5, 8GB RAM, 512GB SSD',        3500.00, 15, '/img/default.png', 1, 1),
('Mouse inalámbrico',    'USB, 3 botones, alcance 10m',                150.00, 50, '/img/default.png', 1, 1),
('Teclado mecánico',     'Switch blue, retroiluminado RGB',            450.00, 30, '/img/default.png', 1, 1),
('Audífonos Bluetooth',  'Cancelación de ruido, 30h batería',          850.00, 25, '/img/default.png', 1, 1),
('Cargador USB-C 65W',   'Carga rápida, compatible multi-dispositivo', 120.00, 60, '/img/default.png', 1, 1),
('Crema hidratante',     'Con vitamina E, 200ml, todo tipo de piel',    85.00, 40, '/img/default.png', 2, 2),
('Sérum vitamina C',     'Antioxidante, 30ml, uso diario',             220.00, 35, '/img/default.png', 2, 2),
('Shampoo nutritivo',    'Con keratina, 400ml, cabello seco',           95.00, 45, '/img/default.png', 2, 2),
('Set de brochas',       '12 piezas, pelo sintético, estuche incluido',180.00, 20, '/img/default.png', 2, 2),
('Perfume floral 50ml',  'Notas de jazmín y rosa, larga duración',     350.00, 18, '/img/default.png', 2, 2),
('Balón de fútbol',      'Talla 5, cuero sintético, uso exterior',     150.00, 25, '/img/default.png', 3, 3),
('Guantes de box',       '12oz, cuero genuino, par',                   280.00, 20, '/img/default.png', 3, 3),
('Cuerda para saltar',   'Acero trenzado, ajustable, rodamientos',      75.00, 40, '/img/default.png', 3, 3),
('Botella deportiva',    '1 litro, acero inoxidable, térmica',         120.00, 50, '/img/default.png', 3, 3),
('Rodilleras x2',        'Neopreno, talla única, soporte reforzado',    90.00, 30, '/img/default.png', 3, 3),
('Florero de vidrio',    'Transparente, 30cm alto, diseño moderno',     60.00, 15, '/img/default.png', 4, 4),
('Marco de fotos 4x6',   'Madera natural, acabado mate',                45.00, 30, '/img/default.png', 4, 4),
('Velas aromáticas x3',  'Lavanda, vainilla y canela, 40h cada una',  110.00, 25, '/img/default.png', 4, 4),
('Cactus artificial',    'Maceta cerámica, 25cm, sin mantenimiento',    80.00, 20, '/img/default.png', 4, 4),
('Reloj de pared',       'Madera, 30cm diámetro, silencioso',          195.00, 12, '/img/default.png', 4, 4),
('Sartén antiadherente', '28cm, libre de PFOA, mango ergonómico',     120.00, 20, '/img/default.png', 5, 5),
('Licuadora 600W',       '3 velocidades, vaso vidrio 1.5L',            320.00, 18, '/img/default.png', 5, 5),
('Set cuchillos x5',     'Acero inoxidable, bloque incluido',          275.00, 15, '/img/default.png', 5, 5),
('Tazas x4 cerámica',    '350ml, aptas microondas y lavavajillas',      98.00, 30, '/img/default.png', 5, 5),
('Tabla de corte bambú', '40x25cm, antideslizante, antibacterial',      85.00, 25, '/img/default.png', 5, 5);

INSERT INTO venta (fecha, total, id_cliente, id_empleado) VALUES
('2026-04-01 10:30:00', 3650.00, 1, 2),
('2026-04-05 14:15:00',  430.00, 2, 2),
('2026-04-10 09:00:00',  370.00, 3, 3),
('2026-04-15 16:45:00',  240.00, 1, 3),
('2026-04-20 11:20:00',  595.00, 2, 2);

INSERT INTO detalle_venta (cantidad, precio_unitario, subtotal, id_venta, id_producto) VALUES
(1, 3500.00, 3500.00, 1,  1),
(1,  150.00,  150.00, 1,  2),
(1,  220.00,  220.00, 2,  7),
(2,   85.00,  170.00, 2,  6),
(1,  280.00,  280.00, 3, 12),
(1,   90.00,   90.00, 3, 15),
(2,  120.00,  240.00, 4, 14),
(1,  320.00,  320.00, 5, 22),
(1,  275.00,  275.00, 5, 23);