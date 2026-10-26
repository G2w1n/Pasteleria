-- =========================================================
-- Kuyay · Pastelería de autor
-- 01 · Esquema de la base de datos (PostgreSQL / Neon)
--
-- Cómo usarlo: en Neon, abre "SQL Editor", pega TODO este
-- archivo y presiona "Run". Después ejecuta 02-datos.sql.
--
-- Se puede ejecutar más de una vez: primero borra lo que
-- existe (¡incluidos los datos!) y lo vuelve a crear.
-- =========================================================

drop schema if exists public cascade;
create schema public;
set timezone = 'America/Lima';

-- ---------------------------------------------------------
-- Tipos (valores permitidos)
-- ---------------------------------------------------------
create type rol_usuario   as enum ('cliente', 'empleado', 'administrador');
create type estado_pedido as enum ('recibido', 'en_preparacion', 'listo', 'en_camino', 'entregado', 'cancelado');
create type tipo_entrega  as enum ('recojo', 'delivery');
create type metodo_pago   as enum ('yape', 'plin', 'efectivo', 'tarjeta');
create type canal_venta   as enum ('web', 'mostrador', 'whatsapp');
create type franja_hora   as enum ('manana', 'tarde');
create type motivo_stock  as enum ('venta', 'cancelacion', 'produccion', 'ajuste', 'merma');

-- ---------------------------------------------------------
-- Usuarios: clientes, empleados y administradores
-- La contraseña NUNCA se guarda: solo su hash (bcrypt), que
-- calcula la API antes de insertar.
-- ---------------------------------------------------------
create table usuarios (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null check (length(trim(nombre)) >= 3),
  correo      text not null check (correo ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  telefono    text check (telefono ~ '^9[0-9]{8}$'),
  clave_hash  text not null,
  rol         rol_usuario not null default 'cliente',
  activo      boolean not null default true,
  creado_en   timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
-- El correo es único sin importar mayúsculas (Ana@x.com = ana@x.com)
create unique index usuarios_correo_unico on usuarios (lower(correo));

create table direcciones (
  id          bigint generated always as identity primary key,
  usuario_id  uuid not null references usuarios (id) on delete cascade,
  distrito    text not null,
  direccion   text not null,
  referencia  text,
  principal   boolean not null default false
);
create index direcciones_usuario on direcciones (usuario_id);

-- ---------------------------------------------------------
-- Catálogo
-- ---------------------------------------------------------
create table categorias (
  id            text primary key,            -- 'tortas', 'postres'...
  nombre        text not null,
  conservacion  text,
  orden         int not null default 0
);

create table productos (
  id            text primary key,            -- 'torta-lucuma' (el mismo id de la web)
  categoria_id  text not null references categorias (id),
  nombre        text not null,
  descripcion   text not null default '',
  porcion       text,
  precio        numeric(8, 2) not null check (precio > 0),
  stock         int not null default 0 check (stock >= 0),   -- nunca negativo
  stock_minimo  int not null default 5,                      -- para el reporte de stock bajo
  etiqueta      text check (etiqueta in ('nuevo', 'popular')),
  ingredientes  text[] not null default '{}',
  alergenos     text[] not null default '{}',
  ilustracion   jsonb,                                       -- forma y colores del dibujo SVG
  foto          text,
  activo        boolean not null default true,
  creado_en     timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
create index productos_categoria on productos (categoria_id);

create table cupones (
  codigo      text primary key check (codigo = upper(codigo)),
  porcentaje  int not null check (porcentaje between 1 and 100),
  vence       date,
  usos_max    int check (usos_max > 0),
  usos        int not null default 0,
  activo      boolean not null default true
);

-- ---------------------------------------------------------
-- Ventas
-- ---------------------------------------------------------
create table pedidos (
  id              bigint generated always as identity primary key,
  -- Código legible para el cliente: KY-000001
  codigo          text generated always as ('KY-' || lpad(id::text, 6, '0')) stored,
  usuario_id      uuid references usuarios (id) on delete set null,  -- null = venta en mostrador sin cuenta
  nombre_contacto text not null,
  telefono        text not null,
  canal           canal_venta not null default 'web',
  estado          estado_pedido not null default 'recibido',
  tipo_entrega    tipo_entrega not null default 'recojo',
  distrito        text,
  direccion       text,
  fecha_entrega   date,
  franja          franja_hora,
  metodo_pago     metodo_pago not null default 'yape',
  cupon_codigo    text references cupones (codigo),
  subtotal        numeric(10, 2) not null default 0 check (subtotal >= 0),
  descuento       numeric(10, 2) not null default 0 check (descuento >= 0),
  costo_delivery  numeric(10, 2) not null default 0 check (costo_delivery >= 0),
  total           numeric(10, 2) generated always as (subtotal - descuento + costo_delivery) stored,
  notas           text,
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now(),
  -- Si es delivery, la dirección es obligatoria
  constraint pedidos_delivery_con_direccion
    check (tipo_entrega = 'recojo' or (distrito is not null and direccion is not null))
);
create index pedidos_usuario on pedidos (usuario_id);
create index pedidos_estado  on pedidos (estado);
create index pedidos_fecha   on pedidos (creado_en);

-- Productos de cada pedido. El precio se copia al momento de la venta:
-- si mañana sube el precio, el pedido de hoy no cambia.
create table pedido_detalle (
  pedido_id        bigint not null references pedidos (id) on delete cascade,
  producto_id      text not null references productos (id),
  cantidad         int not null check (cantidad > 0),
  precio_unitario  numeric(8, 2) not null check (precio_unitario > 0),
  importe          numeric(10, 2) generated always as (cantidad * precio_unitario) stored,
  primary key (pedido_id, producto_id)
);

-- Línea de tiempo de cada pedido: quién lo cambió y cuándo
create table historial_estados (
  id          bigint generated always as identity primary key,
  pedido_id   bigint not null references pedidos (id) on delete cascade,
  estado      estado_pedido not null,
  usuario_id  uuid references usuarios (id) on delete set null,
  creado_en   timestamptz not null default now()
);
create index historial_pedido on historial_estados (pedido_id);

-- Tortas personalizadas (formulario "Diseña tu torta")
create table pedidos_especiales (
  id               bigint generated always as identity primary key,
  codigo           text generated always as ('TP-' || lpad(id::text, 5, '0')) stored,
  usuario_id       uuid references usuarios (id) on delete set null,
  nombre_contacto  text not null,
  telefono         text not null check (telefono ~ '^9[0-9]{8}$'),
  correo           text,
  ocasion          text,
  tamano           text not null check (tamano in ('mini', 'mediana', 'grande', 'fiesta')),
  bizcocho         text not null,
  relleno          text not null,
  cobertura        text not null,
  extras           text[] not null default '{}',
  mensaje          text check (length(mensaje) <= 40),
  es_regalo        boolean not null default false,
  dedicatoria      text check (length(dedicatoria) <= 140),
  alergias         text,
  fecha_entrega    date not null,
  franja           franja_hora not null,
  tipo_entrega     tipo_entrega not null default 'recojo',
  distrito         text,
  direccion        text,
  precio_estimado  numeric(8, 2) not null check (precio_estimado > 0),
  adelanto         numeric(8, 2) not null default 0,
  estado           estado_pedido not null default 'recibido',
  creado_en        timestamptz not null default now(),
  actualizado_en   timestamptz not null default now(),
  -- Los domingos solo se entrega en la mañana (la tienda cierra a las 2 p. m.)
  constraint especiales_domingo_manana check (extract(dow from fecha_entrega) <> 0 or franja = 'manana'),
  constraint especiales_delivery_con_direccion
    check (tipo_entrega = 'recojo' or (distrito is not null and direccion is not null))
);
create index especiales_fecha on pedidos_especiales (fecha_entrega);

-- ---------------------------------------------------------
-- Inventario: cada entrada o salida queda registrada
-- ---------------------------------------------------------
create table movimientos_stock (
  id           bigint generated always as identity primary key,
  producto_id  text not null references productos (id),
  cantidad     int not null check (cantidad <> 0),   -- + entra, - sale
  motivo       motivo_stock not null,
  pedido_id    bigint references pedidos (id) on delete set null,
  usuario_id   uuid references usuarios (id) on delete set null,
  nota         text,
  creado_en    timestamptz not null default now()
);
create index movimientos_producto on movimientos_stock (producto_id);

-- ---------------------------------------------------------
-- Reseñas (solo de clientes que compraron el producto)
-- ---------------------------------------------------------
create table resenas (
  id           bigint generated always as identity primary key,
  producto_id  text not null references productos (id) on delete cascade,
  usuario_id   uuid not null references usuarios (id) on delete cascade,
  estrellas    int not null check (estrellas between 1 and 5),
  comentario   text,
  visible      boolean not null default true,
  creado_en    timestamptz not null default now(),
  unique (producto_id, usuario_id)   -- una reseña por cliente y producto
);

-- ---------------------------------------------------------
-- Configuración del negocio (lo que hoy está en js/config.js)
-- ---------------------------------------------------------
create table configuracion (
  clave  text primary key,
  valor  jsonb not null
);

-- =========================================================
-- REGLAS AUTOMÁTICAS (triggers)
-- =========================================================

-- Actualiza "actualizado_en" en cada cambio
create function marcar_actualizado() returns trigger language plpgsql as $$
begin
  new.actualizado_en := now();
  return new;
end $$;

create trigger usuarios_actualizado  before update on usuarios  for each row execute function marcar_actualizado();
create trigger productos_actualizado before update on productos for each row execute function marcar_actualizado();
create trigger pedidos_actualizado   before update on pedidos   for each row execute function marcar_actualizado();
create trigger especiales_actualizado before update on pedidos_especiales for each row execute function marcar_actualizado();

-- Cada movimiento de inventario cambia el stock del producto.
-- Si el stock quedara negativo, el CHECK de productos lo impide
-- y toda la venta se cancela (nadie compra lo que no hay).
create function aplicar_movimiento_stock() returns trigger language plpgsql as $$
begin
  update productos set stock = stock + new.cantidad where id = new.producto_id;
  return new;
end $$;

create trigger movimientos_aplican_stock
  after insert on movimientos_stock
  for each row execute function aplicar_movimiento_stock();

-- Vender un producto descuenta su stock (registrando el movimiento)
create function descontar_stock_venta() returns trigger language plpgsql as $$
begin
  insert into movimientos_stock (producto_id, cantidad, motivo, pedido_id)
  values (new.producto_id, -new.cantidad, 'venta', new.pedido_id);
  return new;
end $$;

create trigger detalle_descuenta_stock
  after insert on pedido_detalle
  for each row execute function descontar_stock_venta();

-- Guarda cada cambio de estado en el historial.
-- Si un pedido se cancela, los productos vuelven al stock.
create function registrar_estado_pedido() returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' or new.estado is distinct from old.estado then
    insert into historial_estados (pedido_id, estado, usuario_id)
    values (new.id, new.estado, nullif(current_setting('kuyay.usuario_id', true), '')::uuid);
  end if;

  if tg_op = 'UPDATE' and new.estado = 'cancelado' and old.estado <> 'cancelado' then
    insert into movimientos_stock (producto_id, cantidad, motivo, pedido_id)
    select producto_id, cantidad, 'cancelacion', pedido_id
    from pedido_detalle where pedido_id = new.id;
  end if;
  return new;
end $$;

create trigger pedidos_registran_estado
  after insert or update of estado on pedidos
  for each row execute function registrar_estado_pedido();

-- Recalcula el subtotal del pedido cuando cambian sus productos
create function recalcular_subtotal() returns trigger language plpgsql as $$
declare
  id_pedido bigint := coalesce(new.pedido_id, old.pedido_id);
begin
  update pedidos
     set subtotal = coalesce((select sum(importe) from pedido_detalle where pedido_id = id_pedido), 0)
   where id = id_pedido;
  return null;
end $$;

create trigger detalle_recalcula_subtotal
  after insert or update or delete on pedido_detalle
  for each row execute function recalcular_subtotal();

-- =========================================================
-- VISTAS PARA LOS REPORTES
-- (los pedidos cancelados no cuentan como venta;
--  las fechas y horas son las de Lima)
-- =========================================================

create view ventas as
select p.*,
       (p.creado_en at time zone 'America/Lima')::date          as fecha_lima,
       extract(hour from p.creado_en at time zone 'America/Lima') as hora_lima,
       extract(isodow from p.creado_en at time zone 'America/Lima') as dia_semana  -- 1 = lunes
from pedidos p
where p.estado <> 'cancelado';

-- Ventas por día
create view reporte_ventas_diarias as
select fecha_lima as fecha,
       count(*)                 as pedidos,
       sum(total)               as total,
       round(avg(total), 2)     as ticket_promedio
from ventas
group by fecha_lima
order by fecha_lima;

-- Ventas por mes
create view reporte_ventas_mensuales as
select to_char(fecha_lima, 'YYYY-MM') as mes,
       count(*)              as pedidos,
       sum(total)            as total,
       round(avg(total), 2)  as ticket_promedio
from ventas
group by 1
order by 1;

-- Productos más vendidos
create view reporte_productos as
select pr.id, pr.nombre, pr.categoria_id,
       coalesce(sum(d.cantidad), 0) as unidades,
       coalesce(sum(d.importe), 0)  as ingresos
from productos pr
left join pedido_detalle d on d.producto_id = pr.id
                          and d.pedido_id in (select id from ventas)
group by pr.id
order by unidades desc, ingresos desc;

-- Ventas por categoría
create view reporte_categorias as
select c.id, c.nombre,
       coalesce(sum(d.cantidad), 0) as unidades,
       coalesce(sum(d.importe), 0)  as ingresos
from categorias c
left join productos pr on pr.categoria_id = c.id
left join pedido_detalle d on d.producto_id = pr.id
                          and d.pedido_id in (select id from ventas)
group by c.id
order by ingresos desc;

-- Ventas por distrito (solo delivery)
create view reporte_distritos as
select distrito, count(*) as pedidos, sum(total) as total
from ventas
where tipo_entrega = 'delivery'
group by distrito
order by total desc;

-- Horas y días pico
create view reporte_horas as
select dia_semana, hora_lima as hora, count(*) as pedidos, sum(total) as total
from ventas
group by dia_semana, hora_lima
order by dia_semana, hora_lima;

-- Mejores clientes
create view reporte_clientes as
select u.id, u.nombre, u.correo,
       count(v.id)                as pedidos,
       sum(v.total)               as total_gastado,
       max(v.creado_en)           as ultima_compra
from usuarios u
join ventas v on v.usuario_id = u.id
group by u.id
order by total_gastado desc;

-- Productos con stock bajo
create view reporte_stock_bajo as
select id, nombre, categoria_id, stock, stock_minimo
from productos
where activo and stock <= stock_minimo
order by stock, nombre;

-- Resumen para el panel principal: hoy, esta semana y este mes
create view reporte_resumen as
select
  coalesce(sum(total) filter (where fecha_lima = (now() at time zone 'America/Lima')::date), 0)              as ventas_hoy,
  count(*)           filter (where fecha_lima = (now() at time zone 'America/Lima')::date)                   as pedidos_hoy,
  coalesce(sum(total) filter (where fecha_lima >= date_trunc('week',  now() at time zone 'America/Lima')), 0) as ventas_semana,
  coalesce(sum(total) filter (where fecha_lima >= date_trunc('month', now() at time zone 'America/Lima')), 0) as ventas_mes,
  round(coalesce(avg(total) filter (where fecha_lima >= date_trunc('month', now() at time zone 'America/Lima')), 0), 2) as ticket_promedio_mes,
  (select count(*) from pedidos where estado in ('recibido', 'en_preparacion', 'listo', 'en_camino')) as pedidos_pendientes
from ventas;
