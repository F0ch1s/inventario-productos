-- =============================================
-- Movimientos de ejemplo
-- Ejecutar en Supabase SQL Editor DESPUÉS del seed_products.sql
-- =============================================

-- ENTRADAS de inventario (compras a proveedores)
INSERT INTO movements (product_id, type, quantity, cost, notes) VALUES
  -- Dormitorio
  ((SELECT id FROM products WHERE code = 'MB-001'), 'IN', 8, 2800.00, 'Compra inicial proveedor MaderaSur'),
  ((SELECT id FROM products WHERE code = 'MB-002'), 'IN', 12, 1950.00, 'Compra inicial proveedor MaderaSur'),
  ((SELECT id FROM products WHERE code = 'MB-003'), 'IN', 30, 280.00, 'Compra lote veladores'),
  ((SELECT id FROM products WHERE code = 'MB-004'), 'IN', 10, 1200.00, 'Compra proveedor CedroFino'),
  ((SELECT id FROM products WHERE code = 'MB-005'), 'IN', 6, 2400.00, 'Compra roperos lote mayo'),
  ((SELECT id FROM products WHERE code = 'MB-006'), 'IN', 8, 950.00, 'Compra tocadores MaderaSur'),

  -- Oficina
  ((SELECT id FROM products WHERE code = 'MB-007'), 'IN', 15, 1100.00, 'Compra escritorios OficinaMax'),
  ((SELECT id FROM products WHERE code = 'MB-008'), 'IN', 25, 650.00, 'Compra sillas ergonómicas lote grande'),
  ((SELECT id FROM products WHERE code = 'MB-009'), 'IN', 20, 420.00, 'Compra estantes MetalPro'),
  ((SELECT id FROM products WHERE code = 'MB-010'), 'IN', 4, 1800.00, 'Compra mesas reuniones'),
  ((SELECT id FROM products WHERE code = 'MB-011'), 'IN', 12, 780.00, 'Compra libreros OficinaMax'),

  -- Cocina
  ((SELECT id FROM products WHERE code = 'MB-012'), 'IN', 10, 850.00, 'Compra reposteros CocinaTotal'),
  ((SELECT id FROM products WHERE code = 'MB-013'), 'IN', 7, 1400.00, 'Compra reposteros con granito'),
  ((SELECT id FROM products WHERE code = 'MB-014'), 'IN', 15, 520.00, 'Compra mesas cocina'),
  ((SELECT id FROM products WHERE code = 'MB-015'), 'IN', 8, 680.00, 'Compra alacenas rústicas'),

  -- Sala
  ((SELECT id FROM products WHERE code = 'MB-016'), 'IN', 5, 3200.00, 'Compra sofás premium'),
  ((SELECT id FROM products WHERE code = 'MB-017'), 'IN', 18, 450.00, 'Compra mesas centro lote'),
  ((SELECT id FROM products WHERE code = 'MB-018'), 'IN', 14, 680.00, 'Compra muebles TV'),

  -- Comedor
  ((SELECT id FROM products WHERE code = 'MB-019'), 'IN', 6, 2600.00, 'Compra juegos comedor CedroFino'),
  ((SELECT id FROM products WHERE code = 'MB-020'), 'IN', 5, 1350.00, 'Compra vitrinas');

-- SALIDAS de inventario (ventas a clientes)
INSERT INTO movements (product_id, type, quantity, cost, notes) VALUES
  -- Productos más vendidos
  ((SELECT id FROM products WHERE code = 'MB-008'), 'OUT', 18, 650.00, 'Ventas sillas mayo - varios clientes'),
  ((SELECT id FROM products WHERE code = 'MB-003'), 'OUT', 22, 280.00, 'Ventas veladores mayo'),
  ((SELECT id FROM products WHERE code = 'MB-007'), 'OUT', 11, 1100.00, 'Ventas escritorios home office'),
  ((SELECT id FROM products WHERE code = 'MB-017'), 'OUT', 14, 450.00, 'Ventas mesas centro'),
  ((SELECT id FROM products WHERE code = 'MB-018'), 'OUT', 10, 680.00, 'Ventas muebles TV'),
  ((SELECT id FROM products WHERE code = 'MB-009'), 'OUT', 15, 420.00, 'Ventas estantes oficina'),
  ((SELECT id FROM products WHERE code = 'MB-014'), 'OUT', 12, 520.00, 'Ventas mesas cocina'),
  ((SELECT id FROM products WHERE code = 'MB-002'), 'OUT', 9, 1950.00, 'Ventas camas Queen'),
  ((SELECT id FROM products WHERE code = 'MB-011'), 'OUT', 8, 780.00, 'Ventas libreros'),
  ((SELECT id FROM products WHERE code = 'MB-001'), 'OUT', 5, 2800.00, 'Ventas camas King premium'),
  ((SELECT id FROM products WHERE code = 'MB-012'), 'OUT', 7, 850.00, 'Ventas reposteros altos'),
  ((SELECT id FROM products WHERE code = 'MB-005'), 'OUT', 4, 2400.00, 'Ventas roperos'),
  ((SELECT id FROM products WHERE code = 'MB-016'), 'OUT', 3, 3200.00, 'Ventas sofás seccionales'),
  ((SELECT id FROM products WHERE code = 'MB-019'), 'OUT', 4, 2600.00, 'Ventas juegos comedor'),
  ((SELECT id FROM products WHERE code = 'MB-004'), 'OUT', 6, 1200.00, 'Ventas cómodas'),
  ((SELECT id FROM products WHERE code = 'MB-006'), 'OUT', 5, 950.00, 'Ventas tocadores'),
  ((SELECT id FROM products WHERE code = 'MB-013'), 'OUT', 3, 1400.00, 'Ventas reposteros granito'),
  ((SELECT id FROM products WHERE code = 'MB-015'), 'OUT', 4, 680.00, 'Ventas alacenas'),
  ((SELECT id FROM products WHERE code = 'MB-010'), 'OUT', 2, 1800.00, 'Ventas mesas reuniones'),
  ((SELECT id FROM products WHERE code = 'MB-020'), 'OUT', 2, 1350.00, 'Ventas vitrinas');
