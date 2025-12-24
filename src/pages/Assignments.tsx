import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

interface Assignment {
  id: string;
  name: string;
  monthly_invoice_amount: number;
  number_of_guards: number;
  price_per_guard: number;
  guard_salary: number;
  total_net_pay: number;
}

export function Assignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    monthly_invoice_amount: '',
    number_of_guards: '',
    price_per_guard: '',
    guard_salary: '',
  });

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAssignments(data);
    }
    setLoading(false);
  };

  const openModal = (assignment?: Assignment) => {
    if (assignment) {
      setEditingId(assignment.id);
      setFormData({
        name: assignment.name,
        monthly_invoice_amount: String(assignment.monthly_invoice_amount),
        number_of_guards: String(assignment.number_of_guards),
        price_per_guard: String(assignment.price_per_guard),
        guard_salary: String(assignment.guard_salary),
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        monthly_invoice_amount: '',
        number_of_guards: '',
        price_per_guard: '',
        guard_salary: '',
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

    const numberOfGuards = Number(formData.number_of_guards);
    const guardSalary = Number(formData.guard_salary);
    const totalNetPay = numberOfGuards * guardSalary;

    const data = {
      name: formData.name,
      monthly_invoice_amount: Number(formData.monthly_invoice_amount),
      number_of_guards: numberOfGuards,
      price_per_guard: Number(formData.price_per_guard),
      guard_salary: guardSalary,
      total_net_pay: totalNetPay,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      await supabase.from('assignments').update(data).eq('id', editingId);
    } else {
      await supabase.from('assignments').insert([data]);
    }

    closeModal();
    loadAssignments();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this assignment? This will also delete all related invoice months and receipts.')) {
      await supabase.from('assignments').delete().eq('id', id);
      loadAssignments();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Assignments</h2>
        <button
          onClick={() => openModal()}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Assignment</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading assignments...</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-slate-600">No assignments found. Add your first assignment to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Assignment Name</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700">Monthly Invoice</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Guards</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700">Price/Guard</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700">Guard Salary</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700">Total Net Pay</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-900">{assignment.name}</td>
                  <td className="py-3 px-4 text-right text-slate-700">{formatCurrency(assignment.monthly_invoice_amount)}</td>
                  <td className="py-3 px-4 text-center text-slate-700">{assignment.number_of_guards}</td>
                  <td className="py-3 px-4 text-right text-slate-700">{formatCurrency(assignment.price_per_guard)}</td>
                  <td className="py-3 px-4 text-right text-slate-700">{formatCurrency(assignment.guard_salary)}</td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-900">{formatCurrency(assignment.total_net_pay)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => openModal(assignment)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(assignment.id)}
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
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">
                {editingId ? 'Edit Assignment' : 'Add New Assignment'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Assignment Name (Client/School)
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., ABC School"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Monthly Invoice Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.monthly_invoice_amount}
                    onChange={(e) => setFormData({ ...formData, monthly_invoice_amount: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Number of Guards
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.number_of_guards}
                    onChange={(e) => setFormData({ ...formData, number_of_guards: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Price Per Guard
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price_per_guard}
                    onChange={(e) => setFormData({ ...formData, price_per_guard: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Guard Salary
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.guard_salary}
                    onChange={(e) => setFormData({ ...formData, guard_salary: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600 mb-1">Total Net Pay (Calculated)</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(Number(formData.number_of_guards || 0) * Number(formData.guard_salary || 0))}
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {editingId ? 'Update Assignment' : 'Create Assignment'}
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
