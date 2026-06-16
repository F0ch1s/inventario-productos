-- =============================================
-- Migración: validar cantidades enteras para unidades discretas
-- Ejecutar en Supabase SQL Editor (después de schema.sql)
--
-- Motivo: "Cajas" y "Unidades" son unidades discretas y no deben
-- aceptar cantidades fraccionarias (ej. 2.5 cajas no tiene sentido).
-- "Yardas" sí admite decimales (ej. 14.5 yardas de tela).
--
-- La app ya valida esto en el cliente (MovementModal) y en el store
-- (addMovement), pero este trigger es la última línea de defensa a
-- nivel de base de datos, por si se inserta data directamente por SQL,
-- por otra integración, o por un bug futuro en el frontend.
-- =============================================

create or replace function check_movement_quantity()
returns trigger as $$
declare
  product_unit text;
begin
  select unit into product_unit from products where id = new.product_id;

  if product_unit in ('Cajas', 'Unidades') and new.quantity != trunc(new.quantity) then
    raise exception 'La unidad "%" no admite cantidades decimales (recibido: %)', product_unit, new.quantity;
  end if;

  if new.quantity <= 0 then
    raise exception 'La cantidad debe ser mayor a 0 (recibido: %)', new.quantity;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_check_movement_quantity on movements;

create trigger trg_check_movement_quantity
  before insert or update on movements
  for each row
  execute function check_movement_quantity();
