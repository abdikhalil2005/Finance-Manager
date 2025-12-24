import { useState } from 'react';
import { InvoiceMonths } from './InvoiceMonths';
import { Receipts } from './Receipts';

export function Invoices() {
  const [activeSubTab, setActiveSubTab] = useState<'invoice-months' | 'receipts'>('invoice-months');

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

      {activeSubTab === 'invoice-months' ? <InvoiceMonths /> : <Receipts />}
    </div>
  );
}
