export type Unit = 'Cajas' | 'Yardas' | 'Unidades';
export type MovementType = 'IN' | 'OUT';

export type Branch = 'O10' | 'G9' | 'I7';

export interface Product {
  id: string;
  code: string;
  name: string; // Producto in Excel
  description: string; // Descripción in Excel
  category: string;
  branch: Branch;
  unit: Unit;
  cost: number;
  initialStock?: number;
}

export interface Movement {
  id: string;
  productId: string;
  date: string;
  type: MovementType;
  quantity: number;
  cost: number;
  notes?: string;
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  totalMovements: number;
  mostSold: { name: string; sales: number; code: string } | null;
  leastSold: { name: string; sales: number; code: string } | null;
}

export type TabType = 'dashboard' | 'products' | 'movements' | 'reports' | 'settings';

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}
