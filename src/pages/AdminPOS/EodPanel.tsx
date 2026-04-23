import React, { useState } from 'react';
import { FileText, Printer, Mail, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { printZReport } from './PrintingService';
import { SHOP_CONFIG } from '../../shopConfig';

interface EodPanelProps {
  posDarkMode: boolean;
}

export const EodPanel: React.FC<EodPanelProps> = ({ posDarkMode }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any | null>(null);

  const runEodReport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const isDev = import.meta.env.DEV;
      const apiBase = isDev ? (import.meta.env.VITE_API_URL || 'http://localhost:8080') : '';

      // 1. Call Go Backend to generate Z-Report and queue email
      const response = await fetch(`${apiBase}/api/v1/reports/daily`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate report on server');
      }

      const data = await response.json();
      setSummary(data);

      // 2. Dispatch to Epson Printer
      try {
        const printerConfig = { ip: '192.168.1.215', protocol: 'http' as const };
        await printZReport(data, printerConfig);
        setSuccess(true);
      } catch (printErr: any) {
        console.error('Printer error:', printErr);
        setError('Report generated and emailed, but failed to print: ' + printErr.message);
        // Still show summary even if print fails
      }
    } catch (err: any) {
      console.error('EOD Error:', err);
      setError(err.message || 'An error occurred running the Z-Report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-8 overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-display font-bold tracking-tight mb-2">End of Day (Z-Report)</h2>
        <p className={`text-sm ${posDarkMode ? 'text-white/60' : 'text-pine/60'}`}>
          Generate today's sales summary, print the physical receipt, and email the report to management.
        </p>
      </div>

      <div className={`flex-1 rounded-[2rem] p-8 flex flex-col items-center justify-center border ${posDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-pine/10 shadow-xl'}`}>
        {!summary && !loading && (
          <div className="text-center max-w-md">
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${posDarkMode ? 'bg-white/5 text-white' : 'bg-pine/5 text-pine'}`}>
              <FileText size={48} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Ready to Close?</h3>
            <p className={`mb-8 ${posDarkMode ? 'text-white/60' : 'text-pine/60'}`}>
              Running the Z-Report will aggregate all sales, refunds, and payments for today.
            </p>
            <button
              onClick={runEodReport}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-3 ${
                posDarkMode ? 'bg-terracotta text-pine' : 'bg-pine text-white'
              }`}
            >
              <Printer size={18} />
              Generate & Print Z-Report
            </button>
          </div>
        )}

        {loading && (
          <div className="text-center flex flex-col items-center">
            <Loader2 size={48} className={`animate-spin mb-6 ${posDarkMode ? 'text-terracotta' : 'text-pine'}`} />
            <h3 className="text-xl font-bold">Generating Report...</h3>
            <p className={`mt-2 ${posDarkMode ? 'text-white/60' : 'text-pine/60'}`}>Calculating totals and connecting to printer.</p>
          </div>
        )}

        {error && !loading && !success && !summary && (
          <div className="text-center max-w-md">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center bg-red-500/20 text-red-500">
              <AlertTriangle size={48} />
            </div>
            <h3 className="text-xl font-bold text-red-500 mb-2">Error</h3>
            <p className="mb-8 opacity-80">{error}</p>
            <button
              onClick={runEodReport}
              className={`py-3 px-8 rounded-xl font-bold transition-all ${posDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`}
            >
              Try Again
            </button>
          </div>
        )}

        {(success || summary) && !loading && (
          <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-center gap-3 mb-8">
              <CheckCircle2 size={32} className="text-green-500" />
              <h3 className="text-3xl font-display font-bold">Z-Report Complete</h3>
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-orange-500/20 border border-orange-500/50 rounded-xl flex items-start gap-3">
                <AlertTriangle size={20} className="text-orange-500 shrink-0 mt-0.5" />
                <p className="text-sm text-orange-200">{error}</p>
              </div>
            )}

            <div className={`rounded-3xl p-8 mb-8 ${posDarkMode ? 'bg-black/40' : 'bg-gray-50'}`}>
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1">Total Revenue</p>
                  <p className={`text-4xl font-black tracking-tighter ${posDarkMode ? 'text-terracotta' : 'text-pine'}`}>
                    £{(summary?.total_revenue || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1">Total Orders</p>
                  <p className="text-4xl font-black tracking-tighter">{summary?.order_count || 0}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-current border-opacity-10">
                  <span className="opacity-70">Cash Transactions</span>
                  <span className="font-bold">£{(summary?.cash_total || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-current border-opacity-10">
                  <span className="opacity-70">Card Transactions</span>
                  <span className="font-bold">£{(summary?.card_total || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-current border-opacity-10">
                  <span className="opacity-70">Dojo (Automated)</span>
                  <span className="font-bold">£{(summary?.dojo_total || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-red-400">Refunds ({summary?.refund_count || 0})</span>
                  <span className="font-bold text-red-400">-£{(summary?.refund_total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl ${success ? 'bg-green-500/20 text-green-500' : 'bg-white/5 opacity-50'}`}>
                <Printer size={18} />
                <span className="font-bold text-sm">{success ? 'Printed Successfully' : 'Print Failed'}</span>
              </div>
              <div className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl bg-blue-500/20 text-blue-500">
                <Mail size={18} />
                <span className="font-bold text-sm">Email Queued</span>
              </div>
            </div>
            
            <button
              onClick={() => { setSummary(null); setSuccess(false); setError(null); }}
              className={`w-full mt-8 py-4 rounded-2xl font-bold transition-all ${posDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`}
            >
              Run Another Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
