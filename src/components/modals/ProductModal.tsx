import React, { useState, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import Modal from '../ui/Modal';
import { addProduct, $products } from '../../stores/inventoryStore';
import type { Product, Unit, Branch } from '../../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Genera un código automático con prefijo DY.
 * Busca el siguiente número secuencial disponible.
 * Ejemplo: MB-001, MB-002, MB-003, etc.
 */
function generateCode(description: string, existingProducts: Product[]): string {
  if (!description.trim()) return '';

  const prefix = 'MB';

  // Buscar todos los códigos existentes que empiecen con MB-
  const usedNumbers = existingProducts
    .filter(p => p.code.startsWith(prefix + '-'))
    .map(p => {
      // Extraer la parte numérica después de "MB-"
      const match = p.code.match(/^MB-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => !isNaN(n));

  const nextNum = usedNumbers.length > 0 ? Math.max(...usedNumbers) + 1 : 1;

  return `${prefix}-${String(nextNum).padStart(3, '0')}`;
}

export default function ProductModal({ isOpen, onClose }: ProductModalProps) {
  const products = useStore($products);
  const [description, setDescription] = useState('');

  const autoCode = useMemo(() => generateCode(description, products), [description, products]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newProduct: Product = {
      id: crypto.randomUUID(),
      code: autoCode,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      branch: formData.get('branch') as Branch,
      unit: formData.get('unit') as Unit,
      cost: parseFloat(formData.get('cost') as string) || 0,
    };

    if (await addProduct(newProduct)) {
      setDescription('');
      onClose();
    }
  };

  // Reset description when modal closes
  const handleClose = () => {
    setDescription('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Registrar Nuevo Producto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold opacity-70">Producto</label>
          <input
            name="name"
            required
            className="border-b-2 border-[#141414] py-2 focus:outline-none focus:border-blue-600"
            placeholder="Ej: Cinta Dynox"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold opacity-70">Código (automático)</label>
            <div className="border-b-2 border-[#141414]/30 py-2 text-sm font-mono tracking-wider bg-slate-50 px-1 text-[#141414]/80 min-h-[2rem] flex items-center">
              {autoCode || <span className="text-[#141414]/30 italic text-xs">Escribe el producto...</span>}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold opacity-70">Descripción</label>
            <input
              name="description"
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="border-b-2 border-[#141414] py-2 focus:outline-none focus:border-blue-600"
              placeholder="Ej: 14 yardas, Blanco"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold opacity-70">Categoría</label>
            <input
              name="category"
              className="border-b-2 border-[#141414] py-2 focus:outline-none focus:border-blue-600"
              placeholder="Ej: Telas, Accesorios"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold opacity-70">Sucursal</label>
            <select name="branch" required className="border-b-2 border-[#141414] py-2 focus:outline-none bg-white">
              <option value="O10">O10</option>
              <option value="G9">G9</option>
              <option value="I7">I7</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold opacity-70">Unidad de Medida</label>
            <select name="unit" className="border-b-2 border-[#141414] py-2 focus:outline-none bg-white">
              <option value="Cajas">Cajas</option>
              <option value="Yardas">Yardas</option>
              <option value="Unidades">Unidades</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold opacity-70">Costo Unitario</label>
            <input
              name="cost"
              type="number"
              step="0.01"
              required
              className="border-b-2 border-[#141414] py-2 focus:outline-none focus:border-blue-600"
              placeholder="0.00"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={!autoCode}
          className="bg-[#141414] text-white py-4 mt-4 font-bold hover:bg-[#141414]/90 transition-colors uppercase tracking-widest text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Guardar en Catálogo
        </button>
      </form>
    </Modal>
  );
}