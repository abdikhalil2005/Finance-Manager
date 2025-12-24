import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, X, Upload, FileSpreadsheet } from 'lucide-react';

interface Salary {
  id: string;
  month: number;
  year: number;
  total_amount: number;
  payroll_file_url: string | null;
  created_at: string;
}

export function Salaries() {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    month: '',
    year: new Date().getFullYear().toString(),
    total_amount: '',
    payroll_file: null as File | null,
  });

  useEffect(() => {
    loadSalaries();
  }, []);

  const loadSalaries = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('salaries')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (data) {
      setSalaries(data);
    }
    setLoading(false);
  };

  const openModal = (salary?: Salary) => {
    if (salary) {
      setEditingId(salary.id);
      setFormData({
        month: String(salary.month),
        year: String(salary.year),
        total_amount: String(salary.total_amount),
        payroll_file: null,
      });
    } else {
      setEditingId(null);
      setFormData({
        month: '',
        year: new Date().getFullYear().toString(),
        total_amount: '',
        payroll_file: null,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, payroll_file: e.target.files[0] });
    }
  };

  const uploadFile = async (file: File) => {
    const fileName = `payroll_${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('payroll')
      .upload(fileName, file);

    if (error) throw error;

    const { data: publicData } = supabase.storage
      .from('payroll')
      .getPublicUrl(fileName);

    return publicData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let payroll_file_url = null;

      if (formData.payroll_file) {
        payroll_file_url = await uploadFile(formData.payroll_file);
      }

      const data = {
        month: Number(formData.month),
        year: Number(formData.year),
        total_amount: Number(formData.total_amount),
        ...(payroll_file_url && { payroll_file_url }),
      };

      if (editingId) {
        await supabase.from('salaries').update(data).eq('id', editingId);
      } else {
        const { error } = await supabase.from('salaries').insert([data]);
        if (error) {
          alert(error.message);
          setUploading(false);
          return;
        }
      }

      closeModal();
      loadSalaries();
    } catch (error) {
      alert('Error uploading file. Please try again.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this salary record?')) {
      await supabase.from('salaries').delete().eq('id', id);
      loadSalaries();
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
        <h3 className="text-lg font-semibold text-slate-800">Salary Records</h3>
        <button
          onClick={() => openModal()}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Salary Record</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      ) : salaries.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-slate-600">No salary records found. Add your first record to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Month</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700">Total Amount</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Payroll File</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {salaries.map((salary) => (
                <tr key={salary.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {getMonthName(salary.month)} {salary.year}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-700">
                    {formatCurrency(salary.total_amount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {salary.payroll_file_url ? (
                      <a
                        href={salary.payroll_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span className="text-sm">View File</span>
                      </a>
                    ) : (
                      <span className="text-slate-500 text-sm">No file</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => openModal(salary)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(salary.id)}
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
                {editingId ? 'Edit Salary Record' : 'Add Salary Record'}
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
                  Total Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.total_amount}
                  onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Payroll Excel File (Optional)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="payroll-file"
                  />
                  <label
                    htmlFor="payroll-file"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-600">
                      {formData.payroll_file
                        ? formData.payroll_file.name
                        : 'Click to upload payroll file'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : editingId ? 'Update' : 'Create'}
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
