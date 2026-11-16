import { useEffect, useState } from 'react';
import {
  Bot, TrendingUp, TrendingDown, DollarSign, Activity, Plus,
  RefreshCw, Clock, CheckCircle2, XCircle, Hourglass, Download,
  Link2, Settings2, AlertCircle, ArrowLeft, Monitor, Rocket,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';
import { supabase } from '@/lib/supabase';
import type { Account, BotStatus, Trade } from '@/types';

export default function DashboardPage() {
  const { session, profile, loading: authLoading } = useAuth();
  const { navigate } = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [botStatuses, setBotStatuses] = useState<BotStatus[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newBrokerName, setNewBrokerName] = useState('');
  const [newAccountType, setNewAccountType] = useState<'demo' | 'real'>('demo');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'trades'>('overview');

  useEffect(() => {
    if (!authLoading && !session) {
      navigate('login');
      return;
    }
    if (session && profile) {
      loadData();
    }
  }, [session, profile, authLoading]);

  async function loadData() {
    setLoading(true);
    const { data: accountsData } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', profile?.id)
      .order('created_at', { ascending: false });

    if (accountsData) {
      setAccounts(accountsData as Account[]);

      if (accountsData.length > 0) {
        const accountIds = accountsData.map((a) => a.id);

        const { data: botData } = await supabase
          .from('bot_status')
          .select('*')
          .in('account_id', accountIds);
        setBotStatuses((botData as BotStatus[]) || []);

        const { data: tradesData } = await supabase
          .from('trades')
          .select('*')
          .in('account_id', accountIds)
          .order('opened_at', { ascending: false })
          .limit(20);
        setTrades((tradesData as Trade[]) || []);
      } else {
        setBotStatuses([]);
        setTrades([]);
      }
    }
    setLoading(false);
  }

  async function handleAddAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSubmitting(true);
    setSubmitError('');

    const { data, error } = await supabase
      .from('accounts')
      .insert({
        user_id: profile.id,
        account_number: newAccountNumber,
        broker_name: newBrokerName,
        account_type: newAccountType,
        status: 'pending',
        plan: 'free',
      })
      .select()
      .maybeSingle();

    if (error) {
      setSubmitError('حدث خطأ أثناء إضافة الحساب. تأكد من صحة البيانات.');
      setSubmitting(false);
      return;
    }

    if (data) {
      setNewAccountNumber('');
      setNewBrokerName('');
      setNewAccountType('demo');
      setShowAddAccount(false);
      await loadData();
    }
    setSubmitting(false);
  }

  async function deleteAccount(accountId: string) {
    await supabase.from('accounts').delete().eq('id', accountId);
    await loadData();
  }

  const approvedAccount = accounts.find((a) => a.status === 'approved');
  const botStatus = botStatuses.find((b) => b.account_id === approvedAccount?.id);
  const totalProfit = trades
    .filter((t) => t.status === 'closed')
    .reduce((sum, t) => sum + Number(t.profit), 0);
  const openTrades = trades.filter((t) => t.status === 'open');
  const closedTrades = trades.filter((t) => t.status === 'closed');

  if (authLoading || (session && !profile) || loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
      </div>
    );
  }

  if (!session || !profile) return null;

  const statusConfig = {
    pending: { icon: Hourglass, label: 'بانتظار الموافقة', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    approved: { icon: CheckCircle2, label: 'تمت الموافقة', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
    rejected: { icon: XCircle, label: 'مرفوض', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  };

  const hasNoAccounts = accounts.length === 0;
  const hasPendingOnly = accounts.length > 0 && !approvedAccount;

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            مرحباً، {profile.full_name || profile.email}
          </h1>
          <p className="text-slate-400">إدارة حسابات التداول والبوت الخاص بك</p>
        </div>

        {/* Progress steps banner for new users */}
        {hasNoAccounts && (
          <div className="glass-card rounded-2xl p-6 mb-8 border-teal-500/30 animate-slide-up">
            <h2 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-teal-400" />
              ابدأ رحلتك في 3 خطوات
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              أضف حساب MT5، انتظر المراجعة، ثم أكمل ربط المنصة واختبارها قبل أي تداول آلي.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-lg bg-teal-500 text-white text-sm font-bold flex items-center justify-center">1</span>
                  <span className="text-white font-semibold text-sm">اربط حسابك</span>
                </div>
                <p className="text-slate-400 text-xs">أضف رقم حساب MT5 واسم الوسيط</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-lg bg-slate-600 text-white text-sm font-bold flex items-center justify-center">2</span>
                  <span className="text-slate-300 font-semibold text-sm">انتظر الموافقة</span>
                </div>
                <p className="text-slate-500 text-xs">يوافق المدير على حسابك</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-lg bg-slate-600 text-white text-sm font-bold flex items-center justify-center">3</span>
                  <span className="text-slate-300 font-semibold text-sm">أكمل الربط</span>
                </div>
                <p className="text-slate-500 text-xs">ابدأ التداول الآلي</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddAccount(true)}
              className="mt-6 w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-teal-700 transition-all glow"
            >
              <Link2 className="w-5 h-5" />
              اربط حساب التداول الآن
            </button>
          </div>
        )}

        {/* Pending approval banner */}
        {hasPendingOnly && (
          <div className="mb-6 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-4 animate-fade-in">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Hourglass className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-1">بانتظار موافقة المدير</h3>
              <p className="text-slate-400 text-sm">
                حسابك قيد المراجعة. بعد الموافقة، سنكمل إعداد الاتصال بمنصة MT5 قبل عرض أي حالة تشغيل فعلية.
              </p>
              <button
                onClick={() => navigate('support')}
                className="mt-3 text-amber-400 text-sm font-medium hover:text-amber-300"
              >
                تواصل مع الدعم ←
              </button>
            </div>
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={DollarSign}
            label="آخر رصيد مسجل"
            value={`$${botStatus ? Number(botStatus.balance).toFixed(2) : '0.00'}`}
            color="teal"
          />
          <StatCard
            icon={botStatus && botStatus.last_24h_pnl >= 0 ? TrendingUp : TrendingDown}
            label="آخر ربح/خسارة مسجل"
            value={`${botStatus && botStatus.last_24h_pnl >= 0 ? '+' : ''}$${botStatus ? Number(botStatus.last_24h_pnl).toFixed(2) : '0.00'}`}
            color={botStatus && botStatus.last_24h_pnl >= 0 ? 'teal' : 'red'}
          />
          <StatCard
            icon={Activity}
            label="إجمالي الأرباح"
            value={`${totalProfit >= 0 ? '+' : ''}$${totalProfit.toFixed(2)}`}
            color={totalProfit >= 0 ? 'teal' : 'red'}
          />
          <StatCard
            icon={Clock}
            label="صفقات مفتوحة"
            value={String(openTrades.length)}
            color="amber"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {([
            { key: 'overview', label: 'نظرة عامة', icon: Activity },
            { key: 'accounts', label: 'الحسابات', icon: Link2 },
            { key: 'trades', label: 'الصفقات', icon: TrendingUp },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === t.key
                  ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                  : 'text-slate-400 hover:text-white border border-transparent hover:bg-white/5'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Bot status card */}
            {approvedAccount ? (
              <div className="glass-card rounded-2xl p-6 animate-slide-up">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      'bg-amber-500/10'
                    }`}>
                      <Bot className="w-7 h-7 text-amber-400" />
                    </div>
                    <div>
                      <h2 className="text-white font-bold text-lg">اتصال منصة MT5</h2>
                      <p className="text-sm font-medium text-amber-400">لم يتم التحقق من اتصال حي بعد</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <p className="text-slate-400 text-xs">حساب التداول</p>
                      <p className="text-white text-sm font-semibold">{approvedAccount.account_number}</p>
                      <p className="text-slate-500 text-xs">{approvedAccount.broker_name}</p>
                    </div>
                    <button
                      onClick={() => navigate('setup')}
                      className="px-5 py-3 rounded-xl font-semibold bg-white/10 text-slate-200 hover:bg-white/15 transition-all"
                    >
                      <Settings2 className="inline w-5 h-5 ml-2" />
                      إعداد اتصال MT5
                    </button>
                  </div>
                </div>

                {/* Quick settings */}
                <div className="mt-6 pt-6 border-t border-white/5 grid sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                    <Settings2 className="w-5 h-5 text-teal-400" />
                    <div>
                      <p className="text-slate-400 text-xs">الإعدادات</p>
                      <p className="text-white text-sm font-medium">افتراضية</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('setup')}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-right"
                  >
                    <Download className="w-5 h-5 text-amber-400" />
                    <div>
                      <p className="text-slate-400 text-xs">البوت</p>
                      <p className="text-white text-sm font-medium">طلب ملف الربط ودليل الإعداد</p>
                    </div>
                  </button>
                  <button
                    onClick={() => navigate('performance')}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-right"
                  >
                    <TrendingUp className="w-5 h-5 text-teal-400" />
                    <div>
                      <p className="text-slate-400 text-xs">الأداء</p>
                      <p className="text-white text-sm font-medium">عرض النتائج</p>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              !hasNoAccounts && (
                <div className="glass-card rounded-2xl p-8 text-center">
                  <div className="inline-flex w-16 h-16 rounded-2xl bg-amber-500/10 items-center justify-center mb-4">
                    <Hourglass className="w-8 h-8 text-amber-400" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">حسابك قيد المراجعة</h3>
                  <p className="text-slate-400 text-sm mb-4 max-w-md mx-auto">
                    ستظهر خطوات الربط بعد مراجعة الحساب. الموافقة وحدها لا تعني أن منصة MT5 متصلة أو أن التداول بدأ.
                  </p>
                  <button
                    onClick={() => setActiveTab('accounts')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500/20 text-teal-400 rounded-lg text-sm font-medium hover:bg-teal-500/30 transition-colors border border-teal-500/20"
                  >
                    عرض الحسابات
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              )
            )}

            {/* Quick actions for new users */}
            {hasNoAccounts && (
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-4">إجراءات سريعة</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <button
                    onClick={() => setShowAddAccount(true)}
                    className="flex flex-col items-center gap-3 p-5 rounded-xl bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center">
                      <Link2 className="w-6 h-6 text-teal-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-semibold text-sm">اربط حساب التداول</p>
                      <p className="text-slate-400 text-xs mt-1">أضف حساب MT5 الخاص بك</p>
                    </div>
                  </button>
                  <button
                    onClick={() => navigate('setup')}
                    className="flex flex-col items-center gap-3 p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      <Download className="w-6 h-6 text-amber-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-semibold text-sm">حمّل البوت</p>
                      <p className="text-slate-400 text-xs mt-1">دليل التثبيت الكامل</p>
                    </div>
                  </button>
                  <button
                    onClick={() => navigate('support')}
                    className="flex flex-col items-center gap-3 p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Bot className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-semibold text-sm">احصل على مساعدة</p>
                      <p className="text-slate-400 text-xs mt-1">تواصل مع الدعم</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Recent trades preview */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold text-lg">آخر الصفقات</h2>
                <button
                  onClick={() => setActiveTab('trades')}
                  className="text-teal-400 text-sm font-medium hover:text-teal-300 transition-colors"
                >
                  عرض الكل ←
                </button>
              </div>

              {trades.length === 0 ? (
                <div className="text-center py-10">
                  <div className="inline-flex w-14 h-14 rounded-2xl bg-white/5 items-center justify-center mb-3">
                    <Activity className="w-7 h-7 text-slate-500" />
                  </div>
                  <p className="text-slate-400 mb-1">لا توجد صفقات بعد</p>
                  <p className="text-slate-500 text-sm">
                    {approvedAccount
                      ? 'ستظهر الصفقات بعد ربط MT5 بمصدر بيانات موثوق.'
                      : 'اربط حسابك واحصل على موافقة لبدء التداول'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-right border-b border-white/5">
                        <th className="pb-3 text-slate-400 text-sm font-medium">الزوج</th>
                        <th className="pb-3 text-slate-400 text-sm font-medium">النوع</th>
                        <th className="pb-3 text-slate-400 text-sm font-medium">الحجم</th>
                        <th className="pb-3 text-slate-400 text-sm font-medium">الربح/الخسارة</th>
                        <th className="pb-3 text-slate-400 text-sm font-medium">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trades.slice(0, 5).map((trade) => (
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Accounts tab */}
        {activeTab === 'accounts' && (
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg">حسابات التداول</h2>
              <button
                onClick={() => setShowAddAccount(!showAddAccount)}
                className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 text-teal-400 rounded-lg text-sm font-medium hover:bg-teal-500/20 transition-colors border border-teal-500/20"
              >
                <Plus className="w-4 h-4" />
                إضافة حساب
              </button>
            </div>

            {showAddAccount && (
              <form onSubmit={handleAddAccount} className="mb-6 p-5 rounded-xl bg-white/5 border border-white/10 animate-fade-in">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-teal-400" />
                  ربط حساب تداول جديد
                </h3>

                {submitError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-400 text-sm">{submitError}</p>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-slate-300 text-sm mb-2">رقم حساب MT5</label>
                    <input
                      type="text"
                      value={newAccountNumber}
                      onChange={(e) => setNewAccountNumber(e.target.value)}
                      required
                      placeholder="مثال: 12345678"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm mb-2">اسم الوسيط</label>
                    <input
                      type="text"
                      value={newBrokerName}
                      onChange={(e) => setNewBrokerName(e.target.value)}
                      required
                      placeholder="مثال: Exness, FBS, IC Markets"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-slate-300 text-sm mb-2">نوع الحساب</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      newAccountType === 'demo' ? 'bg-teal-500/10 border-teal-500/30' : 'bg-white/5 border-white/10'
                    }`}>
                      <input
                        type="radio"
                        name="accountType"
                        value="demo"
                        checked={newAccountType === 'demo'}
                        onChange={() => setNewAccountType('demo')}
                        className="sr-only"
                      />
                      <Monitor className={`w-5 h-5 ${newAccountType === 'demo' ? 'text-teal-400' : 'text-slate-400'}`} />
                      <div>
                        <p className={`text-sm font-medium ${newAccountType === 'demo' ? 'text-teal-400' : 'text-slate-300'}`}>حساب تجريبي</p>
                        <p className="text-slate-500 text-xs">للتدريب والاختبار</p>
                      </div>
                    </label>
                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      newAccountType === 'real' ? 'bg-teal-500/10 border-teal-500/30' : 'bg-white/5 border-white/10'
                    }`}>
                      <input
                        type="radio"
                        name="accountType"
                        value="real"
                        checked={newAccountType === 'real'}
                        onChange={() => setNewAccountType('real')}
                        className="sr-only"
                      />
                      <DollarSign className={`w-5 h-5 ${newAccountType === 'real' ? 'text-teal-400' : 'text-slate-400'}`} />
                      <div>
                        <p className={`text-sm font-medium ${newAccountType === 'real' ? 'text-teal-400' : 'text-slate-300'}`}>حساب حقيقي</p>
                        <p className="text-slate-500 text-xs">أموال حقيقية</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-2 mb-4">
                  <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-blue-400 text-xs">
                    {newAccountType === "real" ? "هذا تسجيل لحساب حقيقي فقط؛ لن يتم تنفيذ أي صفقة حقيقية من هذه الواجهة. يجب إكمال اختبار الحساب التجريبي ومراجعة المخاطر قبل تفعيل التداول الحقيقي." : "هذا الحساب مخصص للتجربة. الموافقة الإدارية لا تعني أن MT5 متصل أو أن البوت بدأ التداول."}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-medium text-sm hover:from-teal-600 hover:to-teal-700 transition-all disabled:opacity-50"
                  >
                    {submitting ? 'جاري الإضافة...' : 'ربط الحساب'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddAccount(false)}
                    className="px-6 py-2.5 text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            )}

            {accounts.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex w-16 h-16 rounded-2xl bg-white/5 items-center justify-center mb-4">
                  <Link2 className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-slate-400 mb-2">لا توجد حسابات تداول بعد</p>
                <p className="text-slate-500 text-sm mb-4">أضف حساب MT5 الخاص بك للبدء</p>
                <button
                  onClick={() => setShowAddAccount(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500/20 text-teal-400 rounded-lg text-sm font-medium hover:bg-teal-500/30 transition-colors border border-teal-500/20"
                >
                  <Plus className="w-4 h-4" />
                  إضافة حساب تداول
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {accounts.map((account) => {
                  const config = statusConfig[account.status];
                  const acctBot = botStatuses.find((b) => b.account_id === account.id);
                  return (
                    <div key={account.id} className="p-5 rounded-xl bg-white/5 border border-white/5 hover:border-teal-500/20 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl ${config.bg} ${config.border} border flex items-center justify-center`}>
                            <config.icon className={`w-6 h-6 ${config.color}`} />
                          </div>
                          <div>
                            <p className="text-white font-semibold text-lg">{account.account_number}</p>
                            <p className="text-slate-400 text-sm">{account.broker_name}</p>
                            <p className="text-teal-400 text-xs">{account.account_type === 'real' ? 'حساب حقيقي' : 'حساب تجريبي'}</p>
                            <p className="text-slate-500 text-xs mt-0.5">
                              أُضيف في {new Date(account.created_at).toLocaleDateString('ar')}
                            </p>
                          </div>
                        </div>
                        <div className="text-left flex flex-col items-start sm:items-end gap-2">
                          <span className={`inline-block px-3 py-1 rounded-full ${config.bg} ${config.color} text-xs font-medium`}>
                            {config.label}
                          </span>
                          {account.status === 'approved' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => navigate('setup')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-slate-200 rounded-lg text-xs font-medium hover:bg-white/15 transition-colors"
                              >
                                <Settings2 className="w-3 h-3" />
                                إعداد الاتصال
                              </button>
                            </div>
                          )}
                          {account.status === 'rejected' && (
                            <button
                              onClick={() => deleteAccount(account.id)}
                              className="text-red-400 text-xs hover:text-red-300 transition-colors"
                            >
                              حذف الحساب
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Bot status details for approved accounts */}
                      {account.status === 'approved' && acctBot && (
                        <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-3">
                          <div>
                            <p className="text-slate-500 text-xs">الرصيد</p>
                            <p className="text-white text-sm font-semibold">${Number(acctBot.balance).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 text-xs">أرباح 24 ساعة</p>
                            <p className={`text-sm font-semibold ${Number(acctBot.last_24h_pnl) >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                              {Number(acctBot.last_24h_pnl) >= 0 ? '+' : ''}${Number(acctBot.last_24h_pnl).toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500 text-xs">آخر حالة مسجلة</p>
                            <p className={`text-sm font-semibold ${acctBot.is_running ? 'text-teal-400' : 'text-slate-400'}`}>
                              {acctBot.is_running ? 'نشط حسب آخر تسجيل' : 'لا توجد إشارة تشغيل'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Trades tab */}
        {activeTab === 'trades' && (
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg">سجل الصفقات</h2>
              <button
                onClick={() => navigate('performance')}
                className="text-teal-400 text-sm font-medium hover:text-teal-300 transition-colors"
              >
                عرض الأداء الكامل ←
              </button>
            </div>

            {trades.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex w-16 h-16 rounded-2xl bg-white/5 items-center justify-center mb-4">
                  <Activity className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-slate-400 mb-2">لا توجد صفقات بعد</p>
                <p className="text-slate-500 text-sm">
                  {approvedAccount
                    ? 'ستظهر الصفقات بعد ربط MT5 بمصدر بيانات موثوق.'
                    : 'اربط حسابك واحصل على موافقة لبدء التداول'}
                </p>
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
                      <th className="pb-3 text-slate-400 text-sm font-medium">الربح/الخسارة</th>
                      <th className="pb-3 text-slate-400 text-sm font-medium">الحالة</th>
                      <th className="pb-3 text-slate-400 text-sm font-medium">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((trade) => (
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
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; color: string }) {
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
