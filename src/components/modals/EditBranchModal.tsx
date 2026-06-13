import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import type { BranchData } from '../../types';
import { updateBranch } from '../../stores/branchStore';

interface EditBranchModalProps {
  isOpen: boolean;
  branch: BranchData | null;
  onClose: () => void;
}

export default function EditBranchModal({ isOpen, branch, onClose }: EditBranchModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ code: '', name: '', description: '' });

  useEffect(() => {
    if (branch) {
      setFormData({
        code: branch.code,
        name: branch.name,
        description: branch.description || '',
      });
    }
  }, [branch, isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!branch) return;

    setIsSubmitting(true);
    const success = await updateBranch(branch.id, {
      code: formData.code.toUpperCase(),
      name: formData.name,
      description: formData.description || undefined,
    });

    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  if (!branch) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modificar Sucursal">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Código de sucursal
          </label>
          <input
            type="text"
            required
            maxLength={10}
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white uppercase"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Nombre de sucursal
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Descripción (opcional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
          {isSubmitting ? 'Actualizando...' : 'Actualizar Sucursal'}
        </button>
      </form>
    </Modal>
  );
}
