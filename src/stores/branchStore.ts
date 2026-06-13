import { atom } from 'nanostores';
import { publicSupabase } from '../lib/supabaseClient';
import type { BranchData, Notification } from '../types';
import { $notifications } from './inventoryStore';

export const $branches = atom<BranchData[]>([]);

// Add notification function
export function addNotification(message: string, type: 'success' | 'error') {
  const id = Date.now();
  $notifications.set([
    ...$notifications.get(),
    { id, message, type },
  ]);

  setTimeout(() => {
    const current = $notifications.get();
    $notifications.set(current.filter(n => n.id !== id));
  }, 3000);
}

// Load branches from database
export async function loadBranches() {
  try {
    const { data, error } = await publicSupabase
      .from('branches')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    const branches: BranchData[] = (data || []).map(b => ({
      id: b.id,
      code: b.code,
      name: b.name,
      description: b.description,
    }));

    $branches.set(branches);
  } catch (error) {
    console.error('Error loading branches:', error);
    addNotification('Error al cargar sucursales', 'error');
  }
}

// Add new branch
export async function addBranch(branchData: Omit<BranchData, 'id'>): Promise<boolean> {
  try {
    const { data, error } = await publicSupabase
      .from('branches')
      .insert({
        code: branchData.code,
        name: branchData.name,
        description: branchData.description || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        addNotification('El código de sucursal ya existe', 'error');
      } else {
        addNotification(`Error al crear sucursal: ${error.message}`, 'error');
      }
      return false;
    }

    const newBranch: BranchData = {
      id: data.id,
      code: data.code,
      name: data.name,
      description: data.description,
    };

    $branches.set([...$branches.get(), newBranch]);
    addNotification('Sucursal añadida correctamente', 'success');
    return true;
  } catch (error) {
    console.error('Error adding branch:', error);
    addNotification('Error de conexión al crear sucursal', 'error');
    return false;
  }
}

// Update branch
export async function updateBranch(id: string, branchData: Omit<BranchData, 'id'>): Promise<boolean> {
  try {
    const { error } = await publicSupabase
      .from('branches')
      .update({
        code: branchData.code,
        name: branchData.name,
        description: branchData.description || null,
      })
      .eq('id', id);

    if (error) {
      if (error.code === '23505') {
        addNotification('El código de sucursal ya existe', 'error');
      } else {
        addNotification(`Error al actualizar sucursal: ${error.message}`, 'error');
      }
      return false;
    }

    const updated: BranchData = { id, ...branchData };
    const branches = $branches.get();
    const index = branches.findIndex(b => b.id === id);
    if (index !== -1) {
      branches[index] = updated;
      $branches.set([...branches]);
    }

    addNotification('Sucursal actualizada correctamente', 'success');
    return true;
  } catch (error) {
    console.error('Error updating branch:', error);
    addNotification('Error de conexión al actualizar sucursal', 'error');
    return false;
  }
}

// Delete branch
export async function deleteBranch(id: string): Promise<boolean> {
  try {
    const { error } = await publicSupabase
      .from('branches')
      .delete()
      .eq('id', id);

    if (error) {
      addNotification(`Error al eliminar sucursal: ${error.message}`, 'error');
      return false;
    }

    $branches.set($branches.get().filter(b => b.id !== id));
    addNotification('Sucursal eliminada correctamente', 'success');
    return true;
  } catch (error) {
    console.error('Error deleting branch:', error);
    addNotification('Error de conexión al eliminar sucursal', 'error');
    return false;
  }
}
