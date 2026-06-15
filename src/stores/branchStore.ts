import { atom } from 'nanostores';
import type { BranchData, Notification } from '../types';
import { $notifications } from './inventoryStore';

export const $branches = atom<BranchData[]>([]);

const STORAGE_KEY = 'branches_local';

function addNotification(message: string, type: 'success' | 'error') {
  const id = Date.now();
  $notifications.set([...$notifications.get(), { id, message, type }]);
  setTimeout(() => {
    $notifications.set($notifications.get().filter(n => n.id !== id));
  }, 3000);
}

function loadFromStorage(): BranchData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(branches: BranchData[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(branches));
}

export async function loadBranches() {
  $branches.set(loadFromStorage());
}

export async function addBranch(branchData: Omit<BranchData, 'id'>): Promise<boolean> {
  const current = loadFromStorage();
  const codeExists = current.some(b => b.code === branchData.code.toUpperCase());
  if (codeExists) {
    addNotification('El código de sucursal ya existe', 'error');
    return false;
  }

  const newBranch: BranchData = {
    id: crypto.randomUUID(),
    code: branchData.code.toUpperCase(),
    name: branchData.name,
    description: branchData.description,
  };

  const updated = [...current, newBranch];
  saveToStorage(updated);
  $branches.set(updated);
  addNotification('Sucursal añadida correctamente', 'success');
  return true;
}

export async function updateBranch(id: string, branchData: Omit<BranchData, 'id'>): Promise<boolean> {
  const current = loadFromStorage();
  const codeExists = current.some(b => b.code === branchData.code.toUpperCase() && b.id !== id);
  if (codeExists) {
    addNotification('El código de sucursal ya existe', 'error');
    return false;
  }

  const updated = current.map(b =>
    b.id === id ? { id, ...branchData, code: branchData.code.toUpperCase() } : b
  );
  saveToStorage(updated);
  $branches.set(updated);
  addNotification('Sucursal actualizada correctamente', 'success');
  return true;
}

export async function deleteBranch(id: string): Promise<boolean> {
  const updated = loadFromStorage().filter(b => b.id !== id);
  saveToStorage(updated);
  $branches.set(updated);
  addNotification('Sucursal eliminada correctamente', 'success');
  return true;
}
