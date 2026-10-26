-- =========================================================
-- Kuyay · Pastelería de autor
-- 02 · Datos iniciales: categorías, productos y configuración
--
-- Ejecútalo en el SQL Editor de Neon DESPUÉS de 01-esquema.sql.
-- Generado a partir de js/productos.js y js/config.js, para que
-- la base de datos tenga los mismos productos que la web.
-- =========================================================

-- Categorías
insert into categorias (id, nombre, conservacion, orden) values
  ('tortas', 'Tortas', 'Refrigerada entre 2 y 6 °C. Consumir en 3 días. Sácala 20 minutos antes de servir para que la crema recupere su textura.', 1),
  ('postres', 'Postres', 'Refrigerados, salvo los alfajores (en un lugar fresco y seco). Consumir en 3 días; los alfajores duran una semana.', 2),
  ('panes', 'Panes', 'En su bolsa de papel, a temperatura ambiente. Duran 2 días; el panetón, hasta 3 semanas. Para recuperar el crocante, 3 minutos al horno.', 3),
  ('salados', 'Salados', 'Refrigerados hasta 2 días. Caliéntalos 8 minutos en horno a 180 °C; en microondas pierden lo crocante.', 4);

-- Productos
insert into productos (id, categoria_id, nombre, descripcion, porcion, precio, stock, etiqueta, ingredientes, alergenos, ilustracion) values
  ('torta-lucuma', 'tortas', 'Torta de lúcuma',
   'Bizcocho húmedo con crema de lúcuma de Huánuco y manjar blanco. La receta de la abuela.',
   'Entera · 12 porciones', 89.00, 6, 'popular',
   array['Lúcuma', 'Manjar blanco', 'Bizcocho de vainilla', 'Crema chantilly']::text[], array['Gluten', 'Lácteos', 'Huevo']::text[],
   '{"forma":"rebanada","masa":"#f3d9a4","relleno":"#e9a23b","cobertura":"#f7c873","topping":"#8e2c4e","fondo":"#fcefd6"}'::jsonb),
  ('torta-cacao', 'tortas', 'Torta de cacao de Cusco',
   'Tres capas de chocolate al 70 % con ganache y un toque de sal de Maras.',
   'Entera · 12 porciones', 95.00, 4, null,
   array['Cacao 70 %', 'Ganache', 'Sal de Maras', 'Mantequilla']::text[], array['Gluten', 'Lácteos', 'Huevo']::text[],
   '{"forma":"rebanada","masa":"#5a352c","relleno":"#a8735a","cobertura":"#3a2420","topping":"#e0a03a","fondo":"#efe1d8"}'::jsonb),
  ('tres-leches-maracuya', 'tortas', 'Tres leches de maracuyá',
   'Bizcocho bañado en tres leches con un espejo ácido de maracuyá.',
   'Entera · 10 porciones', 79.00, 5, 'nuevo',
   array['Maracuyá', 'Leche evaporada', 'Leche condensada', 'Crema de leche']::text[], array['Gluten', 'Lácteos', 'Huevo']::text[],
   '{"forma":"rebanada","masa":"#fbefd2","relleno":"#fff8ea","cobertura":"#f2b705","topping":"#5a8f5e","fondo":"#fdf3c9"}'::jsonb),
  ('cheesecake-aguaymanto', 'tortas', 'Cheesecake de aguaymanto',
   'Cheesecake horneado sobre base de galleta, con compota de aguaymanto de Cajamarca.',
   'Entero · 10 porciones', 85.00, 3, null,
   array['Queso crema', 'Aguaymanto', 'Galleta de vainilla', 'Limón']::text[], array['Gluten', 'Lácteos', 'Huevo']::text[],
   '{"forma":"rebanada","masa":"#fff6e2","relleno":"#c9945a","cobertura":"#f2a516","topping":"#f2a516","fondo":"#fdeed3"}'::jsonb),
  ('suspiro-limena', 'postres', 'Suspiro a la limeña',
   'Manjar blanco suave coronado con merengue al oporto y canela.',
   'Vaso individual', 12.00, 20, 'popular',
   array['Manjar blanco', 'Merengue', 'Oporto', 'Canela']::text[], array['Lácteos', 'Huevo']::text[],
   '{"forma":"vaso","masa":"#e9b25a","relleno":"#f3cf8e","cobertura":"#fffaf2","topping":"#a8735a","fondo":"#fbeedd"}'::jsonb),
  ('alfajores', 'postres', 'Alfajores de maicena (x6)',
   'Galletas que se deshacen en la boca, rellenas de manjar blanco y espolvoreadas con azúcar.',
   'Caja de 6 unidades', 18.00, 15, null,
   array['Maicena', 'Manjar blanco', 'Mantequilla', 'Azúcar en polvo']::text[], array['Gluten', 'Lácteos']::text[],
   '{"forma":"alfajor","masa":"#f6e4c3","relleno":"#c98a4b","cobertura":"#ffffff","topping":"#ffffff","fondo":"#f7ecdf"}'::jsonb),
  ('mazamorra-morada', 'postres', 'Mazamorra morada',
   'Maíz morado con piña, membrillo y guindones. Clásico limeño de todos los domingos.',
   'Vaso individual', 10.00, 18, null,
   array['Maíz morado', 'Piña', 'Membrillo', 'Clavo y canela']::text[], array[]::text[],
   '{"forma":"vaso","masa":"#4b1d3f","relleno":"#6b2a57","cobertura":"#7b3366","topping":"#f2c27a","fondo":"#efe0ea"}'::jsonb),
  ('crema-volteada', 'postres', 'Crema volteada',
   'Flan casero de leche con caramelo dorado. Se agota temprano.',
   'Porción individual', 11.00, 0, null,
   array['Leche', 'Huevos', 'Caramelo', 'Vainilla']::text[], array['Lácteos', 'Huevo']::text[],
   '{"forma":"vaso","masa":"#f5d58a","relleno":"#f5d58a","cobertura":"#b0631c","topping":"#b0631c","fondo":"#fbf0d8"}'::jsonb),
  ('pan-yema', 'panes', 'Pan de yema',
   'Pan suave y dorado, ideal para el desayuno con mantequilla.',
   'Bolsa de 4 unidades', 6.00, 30, null,
   array['Harina', 'Yema de huevo', 'Mantequilla', 'Ajonjolí']::text[], array['Gluten', 'Huevo', 'Lácteos', 'Ajonjolí']::text[],
   '{"forma":"pan","masa":"#d99a4e","relleno":"#f3d2a0","cobertura":"#b9742f","topping":"#fbf6ef","fondo":"#f6e9d6"}'::jsonb),
  ('pan-chancay', 'panes', 'Pan chancay',
   'Pan dulce con anís, perfecto para acompañar un café pasado.',
   'Bolsa de 4 unidades', 5.00, 25, null,
   array['Harina', 'Anís', 'Azúcar', 'Mantequilla']::text[], array['Gluten', 'Lácteos']::text[],
   '{"forma":"pan","masa":"#e3ad62","relleno":"#f6dcae","cobertura":"#c98a3c","topping":"#5a352c","fondo":"#f7ecd9"}'::jsonb),
  ('paneton-artesanal', 'panes', 'Panetón artesanal',
   'Masa madre de 48 horas con fruta confitada y pasas. Edición de temporada.',
   '1 kg', 45.00, 8, 'nuevo',
   array['Masa madre', 'Fruta confitada', 'Pasas', 'Naranja']::text[], array['Gluten', 'Huevo', 'Lácteos']::text[],
   '{"forma":"paneton","masa":"#c98a3c","relleno":"#f3d2a0","cobertura":"#8e2c4e","topping":"#e0a03a","fondo":"#f8e6ec"}'::jsonb),
  ('pan-masa-madre-quinua', 'panes', 'Pan de masa madre con quinua',
   'Corteza crocante y miga abierta, con quinua tostada de Puno.',
   'Hogaza de 700 g', 14.00, 10, null,
   array['Masa madre', 'Harina integral', 'Quinua', 'Sal marina']::text[], array['Gluten']::text[],
   '{"forma":"pan","masa":"#a8692f","relleno":"#e8c48f","cobertura":"#8a5320","topping":"#f6e4c3","fondo":"#efe2d3"}'::jsonb),
  ('empanada-carne', 'salados', 'Empanada de carne',
   'Masa hojaldrada rellena de carne, aceituna, huevo y pasas. Recién horneada.',
   '1 unidad', 9.00, 24, 'popular',
   array['Carne de res', 'Cebolla', 'Aceituna', 'Huevo']::text[], array['Gluten', 'Huevo']::text[],
   '{"forma":"empanada","masa":"#e0a75a","relleno":"#b9742f","cobertura":"#c98a3c","topping":"#fbf6ef","fondo":"#f7e8d4"}'::jsonb),
  ('empanada-aji-gallina', 'salados', 'Empanada de ají de gallina',
   'Nuestro clásico ají de gallina, cremoso y ligeramente picante, dentro de una masa dorada.',
   '1 unidad', 9.00, 20, 'nuevo',
   array['Pollo', 'Ají amarillo', 'Pan', 'Queso parmesano']::text[], array['Gluten', 'Lácteos', 'Frutos secos']::text[],
   '{"forma":"empanada","masa":"#e9b44f","relleno":"#f2b705","cobertura":"#d0912f","topping":"#fbf6ef","fondo":"#fbf0cf"}'::jsonb),
  ('pan-chicharron', 'salados', 'Pan con chicharrón',
   'Pan francés con chicharrón, camote frito y salsa criolla. El desayuno del domingo.',
   '1 sánguche', 14.00, 12, null,
   array['Chicharrón de cerdo', 'Camote', 'Salsa criolla', 'Pan francés']::text[], array['Gluten']::text[],
   '{"forma":"sanguche","masa":"#d99a4e","relleno":"#8a4b2a","cobertura":"#e9862f","topping":"#9b2f6b","fondo":"#f6e5d5"}'::jsonb),
  ('tequenos-queso', 'salados', 'Tequeños de queso (x8)',
   'Crocantes por fuera y con queso derretido por dentro. Vienen con guacamole.',
   '8 unidades + guacamole', 16.00, 14, null,
   array['Masa wantán', 'Queso andino', 'Palta', 'Limón']::text[], array['Gluten', 'Lácteos']::text[],
   '{"forma":"palitos","masa":"#e7b062","relleno":"#fff1c9","cobertura":"#c98a3c","topping":"#7fa04a","fondo":"#f3eed6"}'::jsonb);

-- Stock inicial como "producción" en el historial de inventario.
-- (Se registra sin volver a sumarlo: el stock ya está en la tabla productos.)
alter table movimientos_stock disable trigger movimientos_aplican_stock;
insert into movimientos_stock (producto_id, cantidad, motivo, nota)
select id, stock, 'produccion', 'Stock inicial' from productos where stock > 0;
alter table movimientos_stock enable trigger movimientos_aplican_stock;

-- Configuración del negocio
insert into configuracion (clave, valor) values
  ('nombre',            '"Kuyay"'::jsonb),
  ('whatsapp',          '"51987654321"'::jsonb),
  ('zona_horaria',      '"America/Lima"'::jsonb),
  ('horario',           '{"0":[9,14],"1":[8,20],"2":[8,20],"3":[8,20],"4":[8,20],"5":[8,20],"6":[8,21]}'::jsonb),
  ('minimo_descuento',  '100'::jsonb),
  ('porcentaje_descuento', '10'::jsonb),
  ('delivery_por_distrito', '{"Barranco":6,"Chorrillos":8,"Jesús María":12,"La Molina":18,"Lince":10,"Magdalena":12,"Miraflores":8,"San Borja":12,"San Isidro":10,"San Miguel":14,"Santiago de Surco":10,"Surquillo":8}'::jsonb);

-- Un cupón de bienvenida
insert into cupones (codigo, porcentaje, vence, usos_max) values
  ('KUYAY10', 10, (current_date + interval '6 months')::date, 500);

-- =========================================================
-- PRIMER ADMINISTRADOR
-- 1. Crea tu cuenta en la página "Mi cuenta" (cuenta.html) de Vercel.
-- 2. Vuelve aquí y ejecuta (cambiando el correo por el tuyo):
--
--    update usuarios set rol = 'administrador' where lower(correo) = lower('tu@correo.com');
-- =========================================================

