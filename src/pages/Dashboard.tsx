import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, Users, Wallet, DollarSign } from 'lucide-react';

export function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [stats, setStats] = useState({
    totalInvoiced: 0,
    totalAssignments: 0,
    totalGuards: 0,
    totalSalaries: 0,
    totalRent: 0,
    totalUniforms: 0,
    totalFuel: 0,
    totalFoodBill: 0,
    totalPettyCash: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [selectedMonth]);

  const loadDashboardData = async () => {
    setLoading(true);
    const [year, month] = selectedMonth.split('-').map(Number);

    try {
      const { data: invoiceMonths } = await supabase
        .from('invoice_months')
        .select('total_invoice_amount, assignment_id')
        .eq('year', year)
        .eq('month', month);

      const { data: assignments } = await supabase
        .from('assignments')
        .select('number_of_guards');

      const { data: salaries } = await supabase
        .from('salaries')
        .select('total_amount')
        .eq('year', year)
        .eq('month', month)
        .maybeSingle();

      const { data: rent } = await supabase
        .from('rent')
        .select('amount')
        .eq('year', year)
        .eq('month', month)
        .maybeSingle();

      const { data: uniforms } = await supabase
        .from('uniforms')
        .select('amount')
        .eq('year', year)
        .eq('month', month);

      const { data: fuel } = await supabase
        .from('fuel')
        .select('amount')
        .eq('year', year)
        .eq('month', month);

      const { data: foodBill } = await supabase
        .from('food_bill')
        .select('total_amount')
        .eq('year', year)
        .eq('month', month)
        .maybeSingle();

      const { data: pettyCash } = await supabase
        .from('petty_cashes')
        .select('amount')
        .eq('year', year)
        .eq('month', month);

      const totalInvoiced = invoiceMonths?.reduce((sum, inv) => sum + Number(inv.total_invoice_amount), 0) || 0;
      const totalGuards = assignments?.reduce((sum, asg) => sum + Number(asg.number_of_guards), 0) || 0;
      const totalUniforms = uniforms?.reduce((sum, u) => sum + Number(u.amount), 0) || 0;
      const totalFuel = fuel?.reduce((sum, f) => sum + Number(f.amount), 0) || 0;
      const totalPettyCash = pettyCash?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;

      setStats({
        totalInvoiced,
        totalAssignments: invoiceMonths?.length || 0,
        totalGuards,
        totalSalaries: Number(salaries?.total_amount || 0),
        totalRent: Number(rent?.amount || 0),
        totalUniforms,
        totalFuel,
        totalFoodBill: Number(foodBill?.total_amount || 0),
        totalPettyCash,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const totalExpenses = stats.totalSalaries + stats.totalRent + stats.totalUniforms +
                        stats.totalFuel + stats.totalFoodBill + stats.totalPettyCash;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <div>
          <label htmlFor="month" className="text-sm font-medium text-slate-700 mr-3">
            Select Month:
          </label>
          <input
            type="month"
            id="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Income Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-blue-800 mb-1">Total Invoiced</p>
                <p className="text-3xl font-bold text-blue-900">{formatCurrency(stats.totalInvoiced)}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <Wallet className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-sm font-medium text-green-800 mb-1">Active Assignments</p>
                <p className="text-3xl font-bold text-green-900">{stats.totalAssignments}</p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-8 h-8 text-amber-600" />
                </div>
                <p className="text-sm font-medium text-amber-800 mb-1">Total Guards</p>
                <p className="text-3xl font-bold text-amber-900">{stats.totalGuards}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Expenses Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <p className="text-xs font-medium text-slate-600 mb-1">Salaries</p>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(stats.totalSalaries)}</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <p className="text-xs font-medium text-slate-600 mb-1">Rent</p>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(stats.totalRent)}</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <p className="text-xs font-medium text-slate-600 mb-1">Uniforms</p>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(stats.totalUniforms)}</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <p className="text-xs font-medium text-slate-600 mb-1">Fuel</p>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(stats.totalFuel)}</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <p className="text-xs font-medium text-slate-600 mb-1">Food Bill</p>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(stats.totalFoodBill)}</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <p className="text-xs font-medium text-slate-600 mb-1">Petty Cash</p>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(stats.totalPettyCash)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Monthly Expenses</p>
                <p className="text-3xl font-bold text-slate-900">{formatCurrency(totalExpenses)}</p>
              </div>
              <DollarSign className="w-12 h-12 text-slate-400" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
