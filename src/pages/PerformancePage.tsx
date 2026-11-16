import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Activity, RefreshCw, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';
import { supabase } from '@/lib/supabase';
import type { Trade } from '@/types';

export default function PerformancePage() {
  const { session, profile, loading: authLoading } = useAuth();
  const { navigate } = useRouter();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');

  useEffect(() => {
    if (!authLoading && !session) {
      navigate('login');
      return;
    }
    if (session && profile) {
      loadTrades();
    }
  }, [session, profile, authLoading]);

  async function loadTrades() {
    setLoading(true);
    const { data } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', profile?.id)
      .order('opened_at', { ascending: false });
    setTrades(data as Trade[]);
    setLoading(false);
  }

  if (authLoading || (session && !profile) || loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
      </div>
    );
  }

  if (!session || !profile) return null;

  const filteredTrades = trades.filter((t) => filter === 'all' || t.status === filter);
  const closedTrades = trades.filter((t) => t.status === 'closed');
  const totalProfit = closedTrades.reduce((sum, t) => sum + Number(t.profit), 0);
  const wins = closedTrades.filter((t) => Number(t.profit) > 0);
  const losses = closedTrades.filter((t) => Number(t.profit) < 0);
  const winRate = closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0;
  const avgProfit = closedTrades.length > 0 ? totalProfit / closedTrades.length : 0;
  const bestTrade = closedTrades.reduce((best, t) => (Number(t.profit) > best ? Number(t.profit) : best), 0);
  const worstTrade = closedTrades.reduce((worst, t) => (Number(t.profit) < worst ? Number(t.profit) : worst), 0);

  // Daily P&L chart data (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const dailyPnL = last7Days.map((date) => {
    const dayTrades = closedTrades.filter((t) => {
      if (!t.closed_at) return false;
      const tradeDate = new Date(t.closed_at);
      return tradeDate.toDateString() === date.toDateString();
    });
    return {
      date,
      pnl: dayTrades.reduce((sum, t) => sum + Number(t.profit), 0),
      count: dayTrades.length,
    };
  });

  const maxAbsPnL = Math.max(...dailyPnL.map((d) => Math.abs(d.pnl)), 1);

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">الأداء</h1>
          <p className="text-slate-400">النتائج اليومية وسجل الصفقات الكامل للبوت</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <PerfStat
            icon={Activity}
            label="إجمالي الأرباح"
            value={`${totalProfit >= 0 ? '+' : ''}$${totalProfit.toFixed(2)}`}
            color={totalProfit >= 0 ? 'teal' : 'red'}
          />
          <PerfStat
            icon={TrendingUp}
            label="نسبة الفوز"
            value={`${winRate.toFixed(1)}%`}
            color="teal"
          />
          <PerfStat
            icon={BarChart3}
            label="إجمالي الصفقات"
            value={String(trades.length)}
            color="amber"
          />
          <PerfStat
            icon={TrendingDown}
            label="متوسط الربح/الصفقة"
            value={`${avgProfit >= 0 ? '+' : ''}$${avgProfit.toFixed(2)}`}
            color={avgProfit >= 0 ? 'teal' : 'red'}
          />
        </div>

        {/* Daily P&L chart */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-400" />
            الأرباح والخسائر اليومية (آخر 7 أيام)
          </h2>
          <div className="flex items-end justify-between gap-2 sm:gap-4 h-48">
            {dailyPnL.map((day, i) => {
              const height = (Math.abs(day.pnl) / maxAbsPnL) * 100;
              const isProfit = day.pnl >= 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <span className={`text-xs font-semibold mb-2 ${isProfit ? 'text-teal-400' : 'text-red-400'}`}>
                    {day.pnl !== 0 ? `${isProfit ? '+' : ''}$${day.pnl.toFixed(0)}` : ''}
                  </span>
                  <div className="w-full flex justify-center" style={{ height: `${height}%`, minHeight: '4px' }}>
                    <div
                      className={`w-full max-w-[60px] rounded-t-lg transition-all hover:opacity-80 ${
                        isProfit ? 'bg-gradient-to-t from-teal-600 to-teal-400' : 'bg-gradient-to-t from-red-600 to-red-400'
                      }`}
                      style={{ height: '100%' }}
                    />
                  </div>
                  <span className="text-slate-500 text-xs mt-2">
                    {day.date.toLocaleDateString('ar', { weekday: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Best/Worst trades */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="glass-card rounded-2xl p-5">
            <p className="text-slate-400 text-sm mb-2">أفضل صفقة</p>
            <p className="text-3xl font-bold text-teal-400">+${bestTrade.toFixed(2)}</p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <p className="text-slate-400 text-sm mb-2">أسوأ صفقة</p>
            <p className="text-3xl font-bold text-red-400">${worstTrade.toFixed(2)}</p>
          </div>
        </div>

        {/* Win/Loss summary */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">صفقات رابحة</p>
              <p className="text-2xl font-bold text-teal-400">{wins.length}</p>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">صفقات خاسرة</p>
              <p className="text-2xl font-bold text-red-400">{losses.length}</p>
            </div>
          </div>
        </div>

        {/* Full trade history */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-bold text-lg">سجل الصفقات الكامل</h2>
            <div className="flex gap-2">
              {(['all', 'open', 'closed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === f
                      ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                      : 'text-slate-400 hover:text-white border border-transparent'
                  }`}
                >
                  {f === 'all' ? 'الكل' : f === 'open' ? 'مفتوحة' : 'مغلقة'}
                </button>
              ))}
            </div>
          </div>

          {filteredTrades.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex w-16 h-16 rounded-2xl bg-white/5 items-center justify-center mb-4">
                <Activity className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-slate-400">لا توجد صفقات لعرضها</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-right border-b border-white/5">
                    <th className="pb-3 text-slate-400 text-sm font-medium">الزوج</th>
                    <th className="pb-3 text-slate-400 text-sm font-medium">النوع</th>
                    <th className="pb-3 text-slate-400 text-sm font-medium">الحجم</th>
                    <th className="pb-3 text-slate-400 text-sm font-medium">سعر الفتح</th>
                    <th className="pb-3 text-slate-400 text-sm font-medium">سعر الإغلاق</th>
                    <th className="pb-3 text-slate-400 text-sm font-medium">الربح/الخسارة</th>
                    <th className="pb-3 text-slate-400 text-sm font-medium">الحالة</th>
                    <th className="pb-3 text-slate-400 text-sm font-medium">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrades.map((trade) => (
                    <tr key={trade.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 text-white text-sm font-medium">{trade.symbol}</td>
                      <td className="py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          trade.type === 'buy' ? 'bg-teal-500/10 text-teal-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {trade.type === 'buy' ? 'شراء' : 'بيع'}
                        </span>
                      </td>
                      <td className="py-3 text-slate-300 text-sm">{Number(trade.volume).toFixed(2)}</td>
                      <td className="py-3 text-slate-300 text-sm">{Number(trade.open_price).toFixed(5)}</td>
                      <td className="py-3 text-slate-300 text-sm">
                        {trade.close_price ? Number(trade.close_price).toFixed(5) : '—'}
                      </td>
                      <td className={`py-3 text-sm font-semibold ${
                        Number(trade.profit) >= 0 ? 'text-teal-400' : 'text-red-400'
                      }`}>
                        {Number(trade.profit) >= 0 ? '+' : ''}{Number(trade.profit).toFixed(2)}$
                      </td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          trade.status === 'open' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-500/10 text-slate-400'
                        }`}>
                          {trade.status === 'open' ? 'مفتوحة' : 'مغلقة'}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500 text-xs">
                        {new Date(trade.opened_at).toLocaleDateString('ar')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PerfStat({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    teal: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5">
      <div className={`inline-flex w-10 h-10 rounded-xl ${colorMap[color]} items-center justify-center mb-3 border`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-slate-400 text-sm mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colorMap[color].split(' ')[0]}`}>{value}</p>
    </div>
  );
}
