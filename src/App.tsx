import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { MonthProvider } from './contexts/MonthContext';
import { Dashboard } from './pages/Dashboard';
import { Assignments } from './pages/Assignments';
import { Invoices } from './pages/Invoices';
import { Expenses } from './pages/Expenses';
import { Report } from './pages/Report';
import { InvoiceMonths } from './pages/InvoiceMonths';
import { Receipts } from './pages/Receipts';
import { Salaries } from './pages/expenses/Salaries';
import { Rent } from './pages/expenses/Rent';
import { Uniforms } from './pages/expenses/Uniforms';
import { Fuel } from './pages/expenses/Fuel';
import { FoodBill } from './pages/expenses/FoodBill';
import { PettyCashes } from './pages/expenses/PettyCashes';
import { Advance } from './pages/expenses/Advance';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'assignments':
        return <Assignments />;
      case 'invoices':
        return <Invoices />;
      case 'invoices-months':
        return <InvoiceMonths />;
      case 'invoices-receipts':
        return <Receipts />;
      case 'expenses':
        return <Expenses />;
      case 'expenses-salaries':
        return <Salaries />;
      case 'expenses-rent':
        return <Rent />;
      case 'expenses-uniforms':
        return <Uniforms />;
      case 'expenses-fuel':
        return <Fuel />;
      case 'expenses-food-bill':
        return <FoodBill />;
      case 'expenses-petty-cashes':
        return <PettyCashes />;
      case 'expenses-advance':
        return <Advance />;
      case 'report':
        return <Report />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AuthProvider>
      <MonthProvider>
        <ProtectedRoute>
          <Layout activeTab={activeTab} onTabChange={setActiveTab}>
            {renderContent()}
          </Layout>
        </ProtectedRoute>
      </MonthProvider>
    </AuthProvider>
  );
}

export default App;
