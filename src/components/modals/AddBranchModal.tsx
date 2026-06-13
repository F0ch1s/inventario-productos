import { useState } from 'react';
import Modal from '../ui/Modal';
import type { BranchData } from '../../types';
import { addBranch } from '../../stores/branchStore';

interface AddBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddBranchModal({ isOpen, onClose }: AddBranchModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const success = await addBranch({
      code: (formData.get('code') as string).toUpperCase(),
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || undefined,
    });

    setIsSubmitting(false);
    if (success) {
      (e.target as HTMLFormElement).reset();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Agregar Sucursal">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Código de sucursal
          </label>
          <input
            name="code"
            type="text"
            required
            placeholder="Ej: O10, G9, I7"
            maxLength={10}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white uppercase"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Nombre de sucursal
          </label>
          <input
            name="name"
            type="text"
            required
            placeholder="Ej: Sucursal Principal"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Descripción (opcional)
          </label>
          <textarea
            name="description"
            placeholder="Detalles adicionales sobre la sucursal..."
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#141414] text-white py-3 font-semibold hover:bg-[#141414]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
        >
          {isSubmitting ? 'Agregando...' : 'Agregar Sucursal'}
        </button>
      </form>
    </Modal>
  );
}
