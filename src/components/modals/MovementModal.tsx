import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import Modal from '../ui/Modal';
import { $products, addMovement, getStock } from '../../stores/inventoryStore';
import type { Movement, MovementType } from '../../types';

interface MovementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MovementModal({ isOpen, onClose }: MovementModalProps) {
  const products = useStore($products);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [cost, setCost] = useState('');

  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Auto-fill cost when a product is selected
  useEffect(() => {
    if (selectedProduct) {
      setCost(String(selectedProduct.cost));
    } else {
      setCost('');
    }
  }, [selectedProductId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newMovement: Movement = {
      id: crypto.randomUUID(),
      productId: formData.get('productId') as string,
      date: new Date().toISOString(),
      type: formData.get('type') as MovementType,
      quantity: parseFloat(formData.get('quantity') as string),
      cost: parseFloat(cost) || 0,
      notes: formData.get('notes') as string,
    };

    if (await addMovement(newMovement)) {
      setSelectedProductId('');
      setCost('');
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedProductId('');
    setCost('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Registro de Kardex">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold opacity-70">Producto</label>
          <select
            name="productId"
            required
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="border-b-2 border-[#141414] py-2 focus:outline-none bg-white"
          >
            <option value="">Seleccionar producto...</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.description} (Stock: {getStock(p.id)})
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold opacity-70">Tipo de Movimiento</label>
            <select name="type" className="border-b-2 border-[#141414] py-2 focus:outline-none bg-white">
              <option value="IN">ENTRADA (+)</option>
              <option value="OUT">SALIDA (-)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold opacity-70">Cantidad</label>
            <input
              name="quantity"
              type="number"
              step="0.01"
              min="0.01"
              required
              className="border-b-2 border-[#141414] py-2 focus:outline-none focus:border-blue-600"
              placeholder="Ingrese cantidad"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold opacity-70">Costo Unitario para esta Operación</label>
          <input
            name="cost"
            type="number"
            step="0.01"
            min="0"
            required
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            className="border-b-2 border-[#141414] py-2 focus:outline-none focus:border-blue-600"
            placeholder="Ingrese costo"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold opacity-70">Notas / Referencia de Factura</label>
          <input
            name="notes"
            className="border-b-2 border-[#141414] py-2 focus:outline-none focus:border-blue-600"
            placeholder="Ej: Compra Proveedor / Venta Cliente"
          />
        </div>
        <button
          type="submit"
          className="bg-[#141414] text-white py-4 mt-4 font-bold hover:bg-[#141414]/90 transition-colors uppercase tracking-widest text-sm"
        >
          Confirmar Registro
        </button>
      </form>
    </Modal>
  );
}

