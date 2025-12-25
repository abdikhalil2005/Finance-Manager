import { useAuth } from '../contexts/AuthContext';
import { LogOut, Building2, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const { signOut } = useAuth();
  const [expandedInvoices, setExpandedInvoices] = useState(false);
  const [expandedExpenses, setExpandedExpenses] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', type: 'main' },
    { id: 'assignments', label: 'Assignments', type: 'main' },
    { id: 'invoices', label: 'Invoices', type: 'main', hasSubmenu: true },
    { id: 'invoices-months', label: 'Invoice Month', type: 'sub', parent: 'invoices' },
    { id: 'invoices-receipts', label: 'Receipts', type: 'sub', parent: 'invoices' },
    { id: 'expenses', label: 'Expenses', type: 'main', hasSubmenu: true },
    { id: 'expenses-salaries', label: 'Salaries', type: 'sub', parent: 'expenses' },
    { id: 'expenses-rent', label: 'Rent', type: 'sub', parent: 'expenses' },
    { id: 'expenses-uniforms', label: 'Uniforms', type: 'sub', parent: 'expenses' },
    { id: 'expenses-fuel', label: 'Fuel', type: 'sub', parent: 'expenses' },
    { id: 'expenses-food-bill', label: 'Food Bill', type: 'sub', parent: 'expenses' },
    { id: 'expenses-petty-cashes', label: 'Petty Cashes', type: 'sub', parent: 'expenses' },
    { id: 'expenses-advance', label: 'Advance', type: 'sub', parent: 'expenses' },
    { id: 'report', label: 'Reports', type: 'main' },
  ];

  const handleNavClick = (id: string, hasSubmenu?: boolean) => {
    if (id === 'invoices') {
      setExpandedInvoices(!expandedInvoices);
    } else if (id === 'expenses') {
      setExpandedExpenses(!expandedExpenses);
    } else {
      onTabChange(id);
    }
  };

  const isSubMenuItemActive = (itemId: string) => {
    if (itemId === 'invoices-months') return activeTab === 'invoices' && activeTab === 'invoices-months';
    if (itemId === 'invoices-receipts') return activeTab === 'invoices-receipts';
    if (itemId.startsWith('expenses-')) return activeTab === itemId;
    return activeTab === itemId;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900">FMS</h1>
              <p className="text-xs text-slate-500">Security Services</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1 flex-1">
          {navigationItems.map((item) => {
            if (item.type === 'main') {
              const isExpanded = (item.id === 'invoices' && expandedInvoices) ||
                              (item.id === 'expenses' && expandedExpenses);

              return (
                <div key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.id, item.hasSubmenu)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all text-sm ${
                      activeTab === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.hasSubmenu && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>

                  {item.hasSubmenu && isExpanded && (
                    <div className="mt-1 space-y-1 ml-2 pl-2 border-l border-slate-200">
                      {navigationItems
                        .filter((sub) => sub.parent === item.id)
                        .map((subItem) => (
                          <button
                            key={subItem.id}
                            onClick={() => onTabChange(subItem.id)}
                            className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              activeTab === subItem.id
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {subItem.label}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="bg-white border-b border-slate-200 shadow-sm">
          <div className="px-8 py-4">
            <h2 className="text-lg font-bold text-slate-900">Financial Management System</h2>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
