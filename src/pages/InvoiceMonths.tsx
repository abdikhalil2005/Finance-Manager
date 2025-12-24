import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ChevronRight, Plus, Edit2, Trash2, X, ArrowLeft } from 'lucide-react';

interface Assignment {
  id: string;
  name: string;
  monthly_invoice_amount: number;
}

interface InvoiceMonth {
  id: string;
  assignment_id: string;
  month: number;
  year: number;
  total_invoice_amount: number;
  status: 'paid' | 'due';
  date_paid: string | null;
}

export function InvoiceMonths() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [invoiceMonths, setInvoiceMonths] = useState<InvoiceMonth[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    month: '',
    year: new Date().getFullYear().toString(),
    total_invoice_amount: '',
    status: 'due' as 'paid' | 'due',
    date_paid: '',
  });

  useEffect(() => {
    loadAssignments();
  }, []);

  useEffect(() => {
    if (selectedAssignment) {
      loadInvoiceMonths();
    }
  }, [selectedAssignment]);

  const loadAssignments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('assignments')
      .select('id, name, monthly_invoice_amount')
      .order('name');

    if (data) {
      setAssignments(data);
    }
    setLoading(false);
  };

  const loadInvoiceMonths = async () => {
    if (!selectedAssignment) return;

    const { data } = await supabase
      .from('invoice_months')
      .select('*')
      .eq('assignment_id', selectedAssignment.id)
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (data) {
      setInvoiceMonths(data);
    }
  };

  const openModal = (invoice?: InvoiceMonth) => {
    if (invoice) {
      setEditingId(invoice.id);
      setFormData({
        month: String(invoice.month),
        year: String(invoice.year),
        total_invoice_amount: String(invoice.total_invoice_amount),
        status: invoice.status,
        date_paid: invoice.date_paid || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        month: '',
        year: new Date().getFullYear().toString(),
        total_invoice_amount: selectedAssignment?.monthly_invoice_amount.toString() || '',
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
      assignment_id: selectedAssignment!.id,
      month: Number(formData.month),
      year: Number(formData.year),
      total_invoice_amount: Number(formData.total_invoice_amount),
      status: formData.status,
      date_paid: formData.status === 'paid' && formData.date_paid ? formData.date_paid : null,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      await supabase.from('invoice_months').update(data).eq('id', editingId);
    } else {
      const { error } = await supabase.from('invoice_months').insert([data]);
      if (error) {
        alert(error.message);
        return;
      }
    }

    closeModal();
    loadInvoiceMonths();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this invoice month? This will also delete related receipts.')) {
      await supabase.from('invoice_months').delete().eq('id', id);
      loadInvoiceMonths();
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!selectedAssignment) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Select an Assignment</h3>
        {assignments.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-slate-600">No assignments found. Create an assignment first.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.map((assignment) => (
              <button
                key={assignment.id}
                onClick={() => setSelectedAssignment(assignment)}
                className="bg-white p-6 rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {assignment.name}
                  </h4>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <p className="text-sm text-slate-600">
                  Default Amount: {formatCurrency(assignment.monthly_invoice_amount)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSelectedAssignment(null)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{selectedAssignment.name}</h3>
            <p className="text-sm text-slate-600">Invoice Months</p>
          </div>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Invoice Month</span>
        </button>
      </div>

      {invoiceMonths.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-slate-600">No invoice months found. Add your first invoice month to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Month</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700">Invoice Amount</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Date Paid</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoiceMonths.map((invoice) => (
                <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {getMonthName(invoice.month)} {invoice.year}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-700">
                    {formatCurrency(invoice.total_invoice_amount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {invoice.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-700">
                    {invoice.date_paid ? new Date(invoice.date_paid).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => openModal(invoice)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(invoice.id)}
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
                {editingId ? 'Edit Invoice Month' : 'Add Invoice Month'}
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
                  Total Invoice Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.total_invoice_amount}
                  onChange={(e) => setFormData({ ...formData, total_invoice_amount: e.target.value })}
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
