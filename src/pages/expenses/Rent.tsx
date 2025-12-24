import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

interface Rent {
  id: string;
  month: number;
  year: number;
  amount: number;
  status: 'paid' | 'due';
  date_paid: string | null;
  created_at: string;
}

export function Rent() {
  const [rents, setRents] = useState<Rent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    month: '',
    year: new Date().getFullYear().toString(),
    amount: '',
    status: 'due' as 'paid' | 'due',
    date_paid: '',
  });

  useEffect(() => {
    loadRents();
  }, []);

  const loadRents = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('rent')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (data) {
      setRents(data);
    }
    setLoading(false);
  };

  const openModal = (rent?: Rent) => {
    if (rent) {
      setEditingId(rent.id);
      setFormData({
        month: String(rent.month),
        year: String(rent.year),
        amount: String(rent.amount),
        status: rent.status,
        date_paid: rent.date_paid || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        month: '',
        year: new Date().getFullYear().toString(),
        amount: '',
        status: 'due',
        date_paid: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      month: Number(formData.month),
      year: Number(formData.year),
      amount: Number(formData.amount),
      status: formData.status,
      date_paid: formData.status === 'paid' && formData.date_paid ? formData.date_paid : null,
    };

    if (editingId) {
      await supabase.from('rent').update(data).eq('id', editingId);
    } else {
      const { error } = await supabase.from('rent').insert([data]);
      if (error) {
        alert(error.message);
        return;
      }
    }

    closeModal();
    loadRents();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this rent record?')) {
      await supabase.from('rent').delete().eq('id', id);
      loadRents();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    return new Date(2000, month - 1).toLocaleString('default', { month: 'long' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-800">Rent Records</h3>
        <button
          onClick={() => openModal()}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Rent Record</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      ) : rents.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-slate-600">No rent records found. Add your first record to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Month</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700">Amount</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Date Paid</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rents.map((rent) => (
                <tr key={rent.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {getMonthName(rent.month)} {rent.year}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-700">
                    {formatCurrency(rent.amount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        rent.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rent.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-700">
                    {rent.date_paid ? new Date(rent.date_paid).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => openModal(rent)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rent.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">
                {editingId ? 'Edit Rent Record' : 'Add Rent Record'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Month
                  </label>
                  <select
                    required
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Month</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        {getMonthName(m)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'paid' | 'due' })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="due">Due</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              {formData.status === 'paid' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date Paid
                  </label>
                  <input
                    type="date"
                    value={formData.date_paid}
                    onChange={(e) => setFormData({ ...formData, date_paid: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
