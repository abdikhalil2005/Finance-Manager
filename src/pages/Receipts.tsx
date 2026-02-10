import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ChevronRight, ArrowLeft, ExternalLink, Edit2, X, Trash2 } from 'lucide-react';

interface Assignment {
  id: string;
  name: string;
}

interface Receipt {
  id: string;
  invoice_month_id: string;
  assignment_id: string;
  receipt_url: string | null;
  amount: number;
  payment_date: string;
  created_at: string;
  month?: number;
  year?: number;
}

interface ReceiptsProps {
  searchQuery?: string;
}

export function Receipts({ searchQuery = '' }: ReceiptsProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);
  const [receiptUrl, setReceiptUrl] = useState('');

  useEffect(() => {
    loadAssignments();
  }, []);

  useEffect(() => {
    if (selectedAssignment) {
      loadReceipts();
    }
  }, [selectedAssignment]);

  const loadAssignments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('assignments')
      .select('id, name')
      .order('name');

    if (data) {
      setAssignments(data);
    }
    setLoading(false);
  };

  const loadReceipts = async () => {
    if (!selectedAssignment) return;

    const { data } = await supabase
      .from('receipts')
      .select(`
        *,
        invoice_months!inner(month, year)
      `)
      .eq('assignment_id', selectedAssignment.id)
      .order('payment_date', { ascending: false });

    if (data) {
      const receiptsWithMonthYear = data.map((receipt: any) => ({
        ...receipt,
        month: receipt.invoice_months.month,
        year: receipt.invoice_months.year,
      }));
      setReceipts(receiptsWithMonthYear);
    }
  };

  const openEditModal = (receipt: Receipt) => {
    setEditingReceipt(receipt);
    setReceiptUrl(receipt.receipt_url || '');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingReceipt(null);
    setReceiptUrl('');
  };

  const handleUpdateUrl = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingReceipt) {
      await supabase
        .from('receipts')
        .update({ receipt_url: receiptUrl || null })
        .eq('id', editingReceipt.id);

      closeModal();
      loadReceipts();
    }
  };

  const handleDeleteReceipt = async (receiptId: string) => {
    if (confirm('Are you sure you want to delete this receipt?')) {
      await supabase.from('receipts').delete().eq('id', receiptId);
      loadReceipts();
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

  const filteredAssignments = assignments.filter((assignment) =>
    assignment.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!selectedAssignment) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Select an Assignment</h3>
        {filteredAssignments.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-slate-600">
              {searchQuery ? 'No assignments match your search.' : 'No assignments found. Create an assignment first.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssignments.map((assignment) => (
              <button
                key={assignment.id}
                onClick={() => setSelectedAssignment(assignment)}
                className="bg-white p-6 rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {assignment.name}
                  </h4>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const filteredReceipts = receipts.filter((receipt) => {
    const monthYear = receipt.month && receipt.year ? `${getMonthName(receipt.month)} ${receipt.year}`.toLowerCase() : '';
    const amount = formatCurrency(receipt.amount).toLowerCase();
    return (
      monthYear.includes(searchQuery.toLowerCase()) ||
      amount.includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div>
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={() => setSelectedAssignment(null)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h3 className="text-xl font-bold text-slate-900">{selectedAssignment.name}</h3>
          <p className="text-sm text-slate-600">Payment Receipts</p>
        </div>
      </div>

      {filteredReceipts.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-slate-600">
            {searchQuery ? 'No receipts match your search.' : 'No receipts found. Receipts are automatically created when invoice months are marked as paid.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Month</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700">Amount</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Payment Date</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Receipt</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.map((receipt) => (
                <tr key={receipt.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {receipt.month && receipt.year
                      ? `${getMonthName(receipt.month)} ${receipt.year}`
                      : '-'}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-700">
                    {formatCurrency(receipt.amount)}
                  </td>
                  <td className="py-3 px-4 text-center text-slate-700">
                    {new Date(receipt.payment_date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {receipt.receipt_url ? (
                      <a
                        href={receipt.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <span>Download Receipt</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="text-slate-500 text-sm">Receipt not available</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => openEditModal(receipt)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit receipt URL"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReceipt(receipt.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete receipt"
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

      {showModal && editingReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">Edit Receipt URL</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateUrl} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Receipt URL (External Link)
                </label>
                <input
                  type="url"
                  value={receiptUrl}
                  onChange={(e) => setReceiptUrl(e.target.value)}
                  placeholder="https://example.com/receipt.pdf"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Enter the external URL where the receipt is hosted (e.g., Google Drive, Dropbox, etc.)
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Update URL
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
