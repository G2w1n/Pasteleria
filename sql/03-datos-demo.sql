-- =========================================================
-- Kuyay · Pastelería de autor
-- 03 · Datos de DEMOSTRACIÓN (opcional)
--
-- Crea 6 clientes de prueba y ~300 ventas de los últimos
-- 90 días para que los reportes muestren gráficos en la
-- presentación. Ejecútalo después de 01 y 02.
--
-- · Las ventas de prueba NO cambian el stock actual.
-- · Los clientes de prueba NO pueden iniciar sesión.
-- · Para borrarlos todo: vuelve a ejecutar 01 y 02.
-- =========================================================

-- Todo en una transacción: si algo falla, no queda nada a medias
-- (ni las reglas automáticas desactivadas).
begin;

-- Clientes de prueba (clave_hash inválido: no pueden entrar)
insert into usuarios (nombre, correo, telefono, clave_hash) values
  ('Andrea Torres',  'andrea.demo@kuyay.pe',  '987111222', 'demo-sin-acceso'),
  ('Diego Salazar',  'diego.demo@kuyay.pe',   '987222333', 'demo-sin-acceso'),
  ('Lucía Ramos',    'lucia.demo@kuyay.pe',   '987333444', 'demo-sin-acceso'),
  ('Carlos Mendoza', 'carlos.demo@kuyay.pe',  '987444555', 'demo-sin-acceso'),
  ('Valeria Quispe', 'valeria.demo@kuyay.pe', '987555666', 'demo-sin-acceso'),
  ('Martín Huamán',  'martin.demo@kuyay.pe',  '987666777', 'demo-sin-acceso');

-- Las ventas históricas no deben descontar el stock de hoy,
-- y su historial de estados se escribe con la fecha correcta.
alter table pedido_detalle disable trigger detalle_descuenta_stock;
alter table pedidos disable trigger pedidos_registran_estado;

do $$
declare
  clientes   uuid[]  := array(select id from usuarios where correo like '%.demo@kuyay.pe');
  nombres    text[]  := array(select nombre from usuarios where correo like '%.demo@kuyay.pe' order by correo);
  distritos  text[]  := array['Barranco', 'Miraflores', 'Santiago de Surco', 'San Isidro', 'Chorrillos', 'San Borja', 'Surquillo', 'Lince'];
  pagos      metodo_pago[] := array['yape', 'yape', 'yape', 'plin', 'plin', 'efectivo', 'tarjeta']::metodo_pago[];
  -- Los productos populares se venden más: se repiten en la lista
  surtido    text[]  := array['torta-lucuma', 'torta-lucuma', 'torta-lucuma', 'suspiro-limena', 'suspiro-limena',
                              'empanada-carne', 'empanada-carne', 'empanada-carne', 'tres-leches-maracuya', 'alfajores',
                              'alfajores', 'pan-yema', 'pan-chancay', 'empanada-aji-gallina', 'torta-cacao',
                              'cheesecake-aguaymanto', 'mazamorra-morada', 'pan-chicharron', 'tequenos-queso',
                              'paneton-artesanal', 'pan-masa-madre-quinua', 'crema-volteada'];
  dia        int;
  n          int;
  i          int;
  momento    timestamptz;
  nuevo_id   bigint;
  cliente    int;
  es_delivery boolean;
  estado_final estado_pedido;
  prod       text;
begin
  for dia in reverse 89..0 loop
    -- Más pedidos los fines de semana
    n := 2 + floor(random() * 3)::int
         + case when extract(isodow from current_date - dia) in (6, 7) then 2 else 0 end;
    for i in 1..n loop
      -- Hora del pedido: más movimiento al mediodía y en la tarde
      momento := ((current_date - dia)::timestamp
                  + make_interval(hours => (array[8, 9, 10, 11, 12, 12, 13, 13, 16, 17, 17, 18, 19])[1 + floor(random() * 13)::int],
                                  mins => floor(random() * 60)::int))
                 at time zone 'America/Lima';
      continue when momento > now();

      cliente := 1 + floor(random() * array_length(clientes, 1))::int;
      es_delivery := random() < 0.55;
      estado_final := case
        when dia = 0 then (array['recibido', 'en_preparacion', 'listo']::estado_pedido[])[1 + floor(random() * 3)::int]
        when random() < 0.06 then 'cancelado'
        else 'entregado' end;

      insert into pedidos (usuario_id, nombre_contacto, telefono, canal, estado, tipo_entrega, distrito, direccion,
                           metodo_pago, costo_delivery, creado_en, actualizado_en)
      values (
        case when random() < 0.8 then clientes[cliente] end,    -- 20 % son ventas en mostrador sin cuenta
        nombres[cliente], '9' || lpad(floor(random() * 99999999)::text, 8, '0'),
        (array['web', 'web', 'web', 'mostrador', 'whatsapp']::canal_venta[])[1 + floor(random() * 5)::int],
        estado_final,
        case when es_delivery then 'delivery' else 'recojo' end::tipo_entrega,
        case when es_delivery then distritos[1 + floor(random() * array_length(distritos, 1))::int] end,
        case when es_delivery then 'Dirección de prueba ' || floor(random() * 900 + 100)::int end,
        pagos[1 + floor(random() * array_length(pagos, 1))::int],
        case when es_delivery then 8 else 0 end,
        momento, momento)
      returning id into nuevo_id;

      -- Entre 1 y 3 productos distintos por pedido
      for prod in
        select distinct surtido[1 + floor(random() * array_length(surtido, 1))::int]
        from generate_series(1, 1 + floor(random() * 3)::int)
      loop
        insert into pedido_detalle (pedido_id, producto_id, cantidad, precio_unitario)
        select nuevo_id, p.id, 1 + floor(random() * 3)::int, p.precio from productos p where p.id = prod;
      end loop;

      -- 10 % de descuento si el subtotal supera S/ 100 (la misma regla de la web)
      update pedidos set descuento = round(subtotal * 0.10, 2) where id = nuevo_id and subtotal > 100;

      -- Historial: recibido y, si corresponde, el estado final
      insert into historial_estados (pedido_id, estado, creado_en) values (nuevo_id, 'recibido', momento);
      if estado_final <> 'recibido' then
        insert into historial_estados (pedido_id, estado, creado_en)
        values (nuevo_id, estado_final, momento + interval '3 hours');
      end if;
    end loop;
  end loop;
end $$;

alter table pedido_detalle enable trigger detalle_descuenta_stock;
alter table pedidos enable trigger pedidos_registran_estado;

-- Algunas tortas personalizadas para los próximos días
insert into pedidos_especiales (nombre_contacto, telefono, ocasion, tamano, bizcocho, relleno, cobertura, extras,
                                mensaje, es_regalo, fecha_entrega, franja, precio_estimado, estado)
values
  ('Andrea Torres', '987111222', 'Cumpleaños', 'grande', 'lucuma', 'manjar', 'chantilly', array['velas', 'topper'],
   '¡Feliz cumple, mamá!', true, current_date + 3, 'tarde', 212, 'recibido'),
  ('Diego Salazar', '987222333', 'Aniversario', 'mediana', 'chocolate', 'frutos-rojos', 'ganache', array['flores'],
   'Feliz aniversario', false, current_date + 5, 'manana', 145, 'en_preparacion'),
  ('Lucía Ramos', '987333444', 'Baby shower', 'fiesta', 'vainilla', 'maracuya', 'fondant', array['foto', 'flores'],
   'Bienvenido, Mateo', true, current_date + 9, 'manana', 319, 'recibido');

commit;
