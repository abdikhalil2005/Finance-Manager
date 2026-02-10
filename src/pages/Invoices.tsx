import { useState } from 'react';
import { InvoiceMonths } from './InvoiceMonths';
import { Receipts } from './Receipts';
import { Search } from 'lucide-react';

export function Invoices() {
  const [activeSubTab, setActiveSubTab] = useState<'invoice-months' | 'receipts'>('invoice-months');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Invoices</h2>

      <div className="flex space-x-2 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('invoice-months')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeSubTab === 'invoice-months'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Invoice Month
        </button>
        <button
          onClick={() => setActiveSubTab('receipts')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeSubTab === 'receipts'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Receipts
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${activeSubTab === 'invoice-months' ? 'invoices' : 'receipts'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {activeSubTab === 'invoice-months' ? (
        <InvoiceMonths searchQuery={searchQuery} />
      ) : (
        <Receipts searchQuery={searchQuery} />
      )}
    </div>
  );
}
