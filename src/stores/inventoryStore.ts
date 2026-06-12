import { atom } from 'nanostores';
import { supabase } from '../lib/supabaseClient';
import type { Product, Movement, Notification } from '../types';
import { $settings } from './settingsStore';

// --- Atoms ---
export const $products = atom<Product[]>([]);
export const $movements = atom<Movement[]>([]);
export const $notifications = atom<Notification[]>([]);
export const $loading = atom<boolean>(false);

// --- Load from Supabase ---
export async function loadFromDatabase() {
  $loading.set(true);
  try {
    const [productsRes, movementsRes] = await Promise.all([
      supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true }),
      supabase
        .from('movements')
        .select('*')
        .order('created_at', { ascending: true }),
    ]);

    if (productsRes.error) throw productsRes.error;
    if (movementsRes.error) throw movementsRes.error;

    // Map DB snake_case to frontend camelCase
    const products: Product[] = (productsRes.data || []).map(mapDbToProduct);
    const movements: Movement[] = (movementsRes.data || []).map(mapDbToMovement);

    $products.set(products);
    $movements.set(movements);
  } catch (error) {
    console.error('Error loading from database:', error);
    addNotification('Error al cargar datos de la base de datos', 'error');
  } finally {
    $loading.set(false);
  }
}

// --- Product Actions ---
export async function addProduct(product: Product): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert({
        code: product.code,
        description: product.description,
        category: product.category || null,
        branch: product.branch,
        material: null,
        unit: product.unit,
        cost: product.cost,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        addNotification('El código de producto ya existe', 'error');
      } else {
        addNotification(`Error al crear producto: ${error.message}`, 'error');
      }
      return false;
    }

    const newProduct = mapDbToProduct(data);
    $products.set([...$products.get(), newProduct]);
    addNotification('Producto añadido correctamente', 'success');
    return true;
  } catch (error) {
    addNotification('Error de conexión al crear producto', 'error');
    return false;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === '23503') {
        addNotification('No se puede eliminar un producto con movimientos registrados', 'error');
      } else {
        addNotification(`Error al eliminar: ${error.message}`, 'error');
      }
      return false;
    }

    $products.set($products.get().filter(p => p.id !== id));
    addNotification('Producto eliminado', 'success');
    return true;
  } catch (error) {
    addNotification('Error de conexión al eliminar producto', 'error');
    return false;
  }
}

export async function updateProduct(product: Product): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({
        code: product.code,
        description: product.description,
        category: product.category || null,
        branch: product.branch,
        material: null,
        unit: product.unit,
        cost: product.cost,
      })
      .eq('id', product.id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        addNotification('El código de producto ya existe', 'error');
      } else {
        addNotification(`Error al actualizar: ${error.message}`, 'error');
      }
      return false;
    }

    const updated = mapDbToProduct(data);
    $products.set($products.get().map(p => (p.id === updated.id ? updated : p)));
    addNotification('Producto actualizado correctamente', 'success');
    return true;
  } catch (error) {
    addNotification('Error de conexión al actualizar producto', 'error');
    return false;
  }
}

export async function importProducts(newProducts: Product[]): Promise<number> {
  try {
    const current = $products.get();
    const unique = newProducts.filter(np => !current.some(p => p.code === np.code));

    if (unique.length === 0) {
      addNotification('No hay productos nuevos para importar', 'error');
      return 0;
    }

    const rows = unique.map(p => ({
      code: p.code,
      description: p.description,
      category: p.category || null,
      branch: p.branch,
      material: null,
      unit: p.unit,
      cost: p.cost,
    }));

    const { data, error } = await supabase
      .from('products')
      .insert(rows)
      .select();

    if (error) {
      addNotification(`Error al importar: ${error.message}`, 'error');
      return 0;
    }

    const imported = (data || []).map(mapDbToProduct);
    $products.set([...$products.get(), ...imported]);
    addNotification(`Importados ${imported.length} productos nuevos`, 'success');
    return imported.length;
  } catch (error) {
    addNotification('Error de conexión al importar', 'error');
    return 0;
  }
}

// --- Movement Actions ---
export async function addMovement(movement: Movement): Promise<boolean> {
  // Validate stock before sending to DB
  if (movement.type === 'OUT') {
    const currentStock = getStock(movement.productId);
    if (currentStock < movement.quantity) {
      addNotification('Stock insuficiente para esta salida', 'error');
      return false;
    }
  }

  try {
    const { data, error } = await supabase
      .from('movements')
      .insert({
        product_id: movement.productId,
        type: movement.type,
        quantity: movement.quantity,
        cost: movement.cost,
        notes: movement.notes || null,
      })
      .select()
      .single();

    if (error) {
      addNotification(`Error al registrar movimiento: ${error.message}`, 'error');
      return false;
    }

    const newMovement = mapDbToMovement(data);
    $movements.set([...$movements.get(), newMovement]);
    addNotification('Movimiento registrado', 'success');
    return true;
  } catch (error) {
    addNotification('Error de conexión al registrar movimiento', 'error');
    return false;
  }
}

// --- Stock Calculation ---
export function getStock(productId: string): number {
  const movements = $movements.get();
  return movements
    .filter(m => m.productId === productId)
    .reduce((acc, m) => (m.type === 'IN' ? acc + m.quantity : acc - m.quantity), 0);
}

export function getProductStats(productId: string) {
  const movements = $movements.get().filter(m => m.productId === productId);
  // Assume the oldest IN movement without specific 'entrada' notes or with 'Stock Inicial' is initial stock
  // But to be exactly like the Excel, let's say the very first IN movement is initial stock
  // and all subsequent IN movements are 'Entradas'
  const inMovements = movements.filter(m => m.type === 'IN').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const initialStock = inMovements.length > 0 ? inMovements[0].quantity : 0;
  const entradas = inMovements.slice(1).reduce((acc, m) => acc + m.quantity, 0);
  const salidas = movements.filter(m => m.type === 'OUT').reduce((acc, m) => acc + m.quantity, 0);
  const stock = initialStock + entradas - salidas;

  return { initialStock, entradas, salidas, stock };
}

// --- Notification Actions ---
export function addNotification(message: string, type: 'success' | 'error') {
  if (!$settings.get().notifications) return;

  const id = Date.now();
  const current = $notifications.get();
  $notifications.set([...current, { id, message, type }]);
  setTimeout(() => {
    $notifications.set($notifications.get().filter(n => n.id !== id));
  }, 3000);
}

// --- Mapping Helpers (DB snake_case ↔ Frontend camelCase) ---
function mapDbToProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    code: row.code as string,
    name: (row.name as string) || (row.description as string) || '',
    description: (row.description as string) || '',
    category: (row.category as string) || '',
    branch: (row.branch as string) || 'O10',
    unit: (row.unit as string) || 'Cajas',
    cost: Number(row.cost),
  };
}

function mapDbToMovement(row: Record<string, unknown>): Movement {
  return {
    id: row.id as string,
    productId: row.product_id as string,
    date: row.created_at as string,
    type: row.type as 'IN' | 'OUT',
    quantity: Number(row.quantity),
    cost: Number(row.cost),
    notes: (row.notes as string) || undefined,
  };
}
