import { useState } from 'react';
import { Salaries } from './expenses/Salaries';
import { Rent } from './expenses/Rent';
import { Uniforms } from './expenses/Uniforms';
import { Fuel } from './expenses/Fuel';
import { FoodBill } from './expenses/FoodBill';
import { PettyCashes } from './expenses/PettyCashes';

type ExpenseTab = 'salaries' | 'rent' | 'uniforms' | 'fuel' | 'food-bill' | 'petty-cashes';

export function Expenses() {
  const [activeTab, setActiveTab] = useState<ExpenseTab>('salaries');

  const tabs = [
    { id: 'salaries' as ExpenseTab, label: 'Salaries' },
    { id: 'rent' as ExpenseTab, label: 'Rent' },
    { id: 'uniforms' as ExpenseTab, label: 'Uniforms' },
    { id: 'fuel' as ExpenseTab, label: 'Fuel' },
    { id: 'food-bill' as ExpenseTab, label: 'Food Bill' },
    { id: 'petty-cashes' as ExpenseTab, label: 'Petty Cashes' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'salaries':
        return <Salaries />;
      case 'rent':
        return <Rent />;
      case 'uniforms':
        return <Uniforms />;
      case 'fuel':
        return <Fuel />;
      case 'food-bill':
        return <FoodBill />;
      case 'petty-cashes':
        return <PettyCashes />;
      default:
        return null;
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Expenses</h2>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium transition-colors rounded-t-lg border-b-2 ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {renderContent()}
    </div>
  );
}
