import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useMonth } from '../contexts/MonthContext';
import { formatCurrency, getMonthName } from '../lib/formatting';
import { FileText } from 'lucide-react';

interface InvoiceData {
  assignment_name: string;
  invoice_amount: number;
}

interface PaymentData {
  assignment_name: string;
  amount_paid: number;
}

interface OutstandingData {
  assignment_name: string;
  amount_outstanding: number;
}

interface ExpenseSummary {
  salaries: number;
  rent: number;
  uniforms: number;
  fuel: number;
  foodBill: number;
  pettyCash: number;
  advance: number;
}

export function Report() {
  const { selectedMonth, setSelectedMonth } = useMonth();
  const [availableMonths, setAvailableMonths] = useState<{ month: number; year: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<{
    invoices: InvoiceData[];
    payments: PaymentData[];
    outstanding: OutstandingData[];
    expenses: ExpenseSummary;
  } | null>(null);

  useEffect(() => {
    loadAvailableMonths();
  }, []);

  const loadAvailableMonths = async () => {
    const { data } = await supabase
      .from('invoice_months')
      .select('month, year')
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (data) {
      const uniqueMonths = Array.from(
        new Set(data.map((item) => `${item.year}-${item.month}`))
      ).map((key) => {
        const [year, month] = key.split('-').map(Number);
        return { year, month };
      });
      setAvailableMonths(uniqueMonths);
    }
  };

  const generateReport = async () => {
    if (!selectedMonth) return;

    setLoading(true);
    const [year, month] = selectedMonth.split('-').map(Number);

    try {
      const { data: invoiceMonths } = await supabase
        .from('invoice_months')
        .select(`
          total_invoice_amount,
          status,
          assignments (name)
        `)
        .eq('year', year)
        .eq('month', month);

      const invoices: InvoiceData[] = [];
      const payments: PaymentData[] = [];
      const outstanding: OutstandingData[] = [];

      invoiceMonths?.forEach((inv: any) => {
        const assignmentName = inv.assignments.name;
        const amount = Number(inv.total_invoice_amount);

        invoices.push({
          assignment_name: assignmentName,
          invoice_amount: amount,
        });

        if (inv.status === 'paid') {
          payments.push({
            assignment_name: assignmentName,
            amount_paid: amount,
          });
        } else {
          outstanding.push({
            assignment_name: assignmentName,
            amount_outstanding: amount,
          });
        }
      });

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

      const { data: advance } = await supabase
        .from('advance')
        .select('amount')
        .eq('year', year)
        .eq('month', month)
        .maybeSingle();

      const expenses: ExpenseSummary = {
        salaries: Number(salaries?.total_amount || 0),
        rent: Number(rent?.amount || 0),
        uniforms: uniforms?.reduce((sum, u) => sum + Number(u.amount), 0) || 0,
        fuel: fuel?.reduce((sum, f) => sum + Number(f.amount), 0) || 0,
        foodBill: Number(foodBill?.total_amount || 0),
        pettyCash: pettyCash?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0,
        advance: Number(advance?.amount || 0),
      };

      setReportData({ invoices, payments, outstanding, expenses });
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMonth) {
      const [year, month] = selectedMonth.split('-').map(Number);
      setReportData(null);
    }
  }, [selectedMonth]);

  const totalInvoiced = reportData?.invoices.reduce((sum, inv) => sum + inv.invoice_amount, 0) || 0;
  const totalReceived = reportData?.payments.reduce((sum, pay) => sum + pay.amount_paid, 0) || 0;
  const totalOutstanding = reportData?.outstanding.reduce((sum, out) => sum + out.amount_outstanding, 0) || 0;

  const totalExpenses = reportData
    ? Object.values(reportData.expenses).reduce((sum, exp) => sum + exp, 0)
    : 0;

  const netBalance = totalReceived - totalExpenses;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Financial Report</h2>
        <div className="flex items-center space-x-3">
          <label htmlFor="report-month" className="text-sm font-medium text-slate-700">
            Select Month:
          </label>
          <select
            id="report-month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Choose a month</option>
            {availableMonths.map((item) => (
              <option key={`${item.year}-${item.month}`} value={`${item.year}-${item.month}`}>
                {getMonthName(item.month)} {item.year}
              </option>
            ))}
          </select>
          <button
            onClick={generateReport}
            disabled={!selectedMonth || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {!reportData ? (
        <div className="text-center py-16 bg-slate-50 rounded-lg border border-slate-200">
          <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 text-lg mb-2">No report generated yet</p>
          <p className="text-slate-500 text-sm">Select a month and click "Generate Report" to view financial data</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6">INCOME</h3>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Invoices</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-slate-300">
                        <th className="text-left py-2 px-4 font-semibold text-slate-700">School / Assignment</th>
                        <th className="text-right py-2 px-4 font-semibold text-slate-700">Invoice Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.invoices.map((inv, idx) => (
                        <tr key={idx} className="border-b border-slate-100">
                          <td className="py-2 px-4 text-slate-900">{inv.assignment_name}</td>
                          <td className="py-2 px-4 text-right text-slate-900">{formatCurrency(inv.invoice_amount)}</td>
                        </tr>
                      ))}
                      <tr className="bg-blue-50 font-bold">
                        <td className="py-2 px-4 text-slate-900">Total Invoiced</td>
                        <td className="py-2 px-4 text-right text-blue-900">{formatCurrency(totalInvoiced)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Payments Received</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-slate-300">
                        <th className="text-left py-2 px-4 font-semibold text-slate-700">School</th>
                        <th className="text-right py-2 px-4 font-semibold text-slate-700">Amount Paid</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.payments.length > 0 ? (
                        <>
                          {reportData.payments.map((pay, idx) => (
                            <tr key={idx} className="border-b border-slate-100">
                              <td className="py-2 px-4 text-slate-900">{pay.assignment_name}</td>
                              <td className="py-2 px-4 text-right text-slate-900">{formatCurrency(pay.amount_paid)}</td>
                            </tr>
                          ))}
                          <tr className="bg-green-50 font-bold">
                            <td className="py-2 px-4 text-slate-900">Total Received</td>
                            <td className="py-2 px-4 text-right text-green-900">{formatCurrency(totalReceived)}</td>
                          </tr>
                        </>
                      ) : (
                        <tr>
                          <td colSpan={2} className="py-4 px-4 text-center text-slate-500">No payments received</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Outstanding</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-slate-300">
                        <th className="text-left py-2 px-4 font-semibold text-slate-700">School</th>
                        <th className="text-right py-2 px-4 font-semibold text-slate-700">Amount Outstanding</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.outstanding.length > 0 ? (
                        <>
                          {reportData.outstanding.map((out, idx) => (
                            <tr key={idx} className="border-b border-slate-100">
                              <td className="py-2 px-4 text-slate-900">{out.assignment_name}</td>
                              <td className="py-2 px-4 text-right text-slate-900">{formatCurrency(out.amount_outstanding)}</td>
                            </tr>
                          ))}
                          <tr className="bg-amber-50 font-bold">
                            <td className="py-2 px-4 text-slate-900">Total Outstanding</td>
                            <td className="py-2 px-4 text-right text-amber-900">{formatCurrency(totalOutstanding)}</td>
                          </tr>
                        </>
                      ) : (
                        <tr>
                          <td colSpan={2} className="py-4 px-4 text-center text-slate-500">No outstanding payments</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6">EXPENSES</h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-300">
                    <th className="text-left py-2 px-4 font-semibold text-slate-700">Category</th>
                    <th className="text-right py-2 px-4 font-semibold text-slate-700">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-4 text-slate-900">Salaries</td>
                    <td className="py-2 px-4 text-right text-slate-900">{formatCurrency(reportData.expenses.salaries)}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-4 text-slate-900">Rent</td>
                    <td className="py-2 px-4 text-right text-slate-900">{formatCurrency(reportData.expenses.rent)}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-4 text-slate-900">Uniforms</td>
                    <td className="py-2 px-4 text-right text-slate-900">{formatCurrency(reportData.expenses.uniforms)}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-4 text-slate-900">Fuel</td>
                    <td className="py-2 px-4 text-right text-slate-900">{formatCurrency(reportData.expenses.fuel)}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-4 text-slate-900">Food Bill</td>
                    <td className="py-2 px-4 text-right text-slate-900">{formatCurrency(reportData.expenses.foodBill)}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-4 text-slate-900">Petty Cashes</td>
                    <td className="py-2 px-4 text-right text-slate-900">{formatCurrency(reportData.expenses.pettyCash)}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-4 text-slate-900">Advance</td>
                    <td className="py-2 px-4 text-right text-slate-900">{formatCurrency(reportData.expenses.advance)}</td>
                  </tr>
                  <tr className="bg-red-50 font-bold">
                    <td className="py-2 px-4 text-slate-900">Total Expenses</td>
                    <td className="py-2 px-4 text-right text-red-900">{formatCurrency(totalExpenses)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl border-2 border-blue-300 shadow-lg">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">SUMMARY</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-slate-600 mb-2">Total Received</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(totalReceived)}</p>
              </div>

              <div className="bg-white p-5 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-slate-600 mb-2">Total Expenses</p>
                <p className="text-2xl font-bold text-red-700">{formatCurrency(totalExpenses)}</p>
              </div>

              <div className="bg-white p-5 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-slate-600 mb-2">Net Balance</p>
                <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatCurrency(netBalance)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
