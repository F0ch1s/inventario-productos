import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { Building2, Plus, Trash2, Pencil } from 'lucide-react';
import { $branches, loadBranches, deleteBranch } from '../../stores/branchStore';
import AddBranchModal from '../modals/AddBranchModal';
import EditBranchModal from '../modals/EditBranchModal';
import type { BranchData } from '../../types';

export default function BranchManager() {
  const branches = useStore($branches);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBranchesData();
  }, []);

  const loadBranchesData = async () => {
    setIsLoading(true);
    await loadBranches();
    setIsLoading(false);
  };

  const handleEditClick = (branch: BranchData) => {
    setEditingBranch(branch);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta sucursal?')) {
      await deleteBranch(id);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Gestión de Sucursales</h3>
            <p className="mt-1 text-sm text-slate-500">Administra las sucursales del sistema.</p>
          </div>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-[#141414] text-white px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity rounded-lg"
        >
          <Plus size={16} /> Agregar
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-slate-500">Cargando sucursales...</div>
      ) : branches.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          No hay sucursales registradas
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b-2 border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-900">Código</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-900">Nombre</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-900">Descripción</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-900">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch) => (
                <tr key={branch.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{branch.code}</td>
                  <td className="px-4 py-3 text-slate-700">{branch.name}</td>
                  <td className="px-4 py-3 text-slate-600">{branch.description || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEditClick(branch)}
                        title="Modificar"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(branch.id)}
                        title="Eliminar"
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddBranchModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <EditBranchModal
        isOpen={isEditModalOpen}
        branch={editingBranch}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingBranch(null);
        }}
      />
    </div>
  );
}
