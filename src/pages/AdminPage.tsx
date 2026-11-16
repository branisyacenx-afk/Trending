import { useEffect, useState } from 'react';
import { Users, CheckCircle2, XCircle, Clock, MessageSquare, Settings, RefreshCw, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';
import { supabase } from '@/lib/supabase';
import type { Account, SupportMessage, Profile } from '@/types';

export default function AdminPage() {
  const { session, profile, loading: authLoading } = useAuth();
  const { navigate } = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'accounts' | 'messages' | 'stats'>('accounts');

  useEffect(() => {
    if (!authLoading) {
      if (!session) {
        navigate('login');
      } else if (profile && !profile.is_admin) {
        navigate('dashboard');
      } else if (profile && profile.is_admin) {
        loadAdminData();
      }
    }
  }, [session, profile, authLoading]);

  async function loadAdminData() {
    setLoading(true);

    const { data: accountsData } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: false });
    setAccounts(accountsData as Account[]);

    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    setAllProfiles(profilesData as Profile[]);

    const { data: messagesData } = await supabase
      .from('support_messages')
      .select('*')
      .order('created_at', { ascending: false });
    setSupportMessages(messagesData as SupportMessage[]);

    setLoading(false);
  }

  async function updateAccountStatus(accountId: string, status: 'approved' | 'rejected') {
    await supabase
      .from('accounts')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', accountId);
    await loadAdminData();
  }

  async function resolveMessage(messageId: string) {
    await supabase
      .from('support_messages')
      .update({ status: 'resolved' })
      .eq('id', messageId);
    await loadAdminData();
  }

  if (authLoading || (session && !profile) || loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
      </div>
    );
  }

  if (!profile?.is_admin) return null;

  const pendingAccounts = accounts.filter((a) => a.status === 'pending');
  const approvedAccounts = accounts.filter((a) => a.status === 'approved');
  const rejectedAccounts = accounts.filter((a) => a.status === 'rejected');
  const openMessages = supportMessages.filter((m) => m.status === 'open');

  const getProfileEmail = (userId: string) => {
    const p = allProfiles.find((pr) => pr.id === userId);
    return p?.email || 'غير معروف';
  };

  const statusConfig = {
    pending: { icon: Clock, label: 'بانتظار', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    approved: { icon: CheckCircle2, label: 'معتمد', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
    rejected: { icon: XCircle, label: 'مرفوض', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  };

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-7 h-7 text-amber-400" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">لوحة الإدارة</h1>
          </div>
          <p className="text-slate-400">إدارة الحسابات، الرسائل، وإحصائيات المنصة</p>
        </div>

        {/* Admin stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <AdminStat icon={Users} label="إجمالي المستخدمين" value={String(allProfiles.length)} color="teal" />
          <AdminStat icon={Clock} label="حسابات بانتظار الموافقة" value={String(pendingAccounts.length)} color="amber" />
          <AdminStat icon={CheckCircle2} label="حسابات معتمدة" value={String(approvedAccounts.length)} color="teal" />
          <AdminStat icon={MessageSquare} label="رسائل مفتوحة" value={String(openMessages.length)} color="red" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {([
            { key: 'accounts', label: 'الحسابات', icon: Users },
            { key: 'messages', label: 'الرسائل', icon: MessageSquare },
            { key: 'stats', label: 'الإحصائيات', icon: Activity },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                tab === t.key
                  ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Accounts tab */}
        {tab === 'accounts' && (
          <div className="space-y-6">
            {/* Pending accounts */}
            {pendingAccounts.length > 0 && (
              <div>
                <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  حسابات بانتظار الموافقة ({pendingAccounts.length})
                </h2>
                <div className="space-y-3">
                  {pendingAccounts.map((account) => (
                    <div key={account.id} className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">{account.account_number}</p>
                          <p className="text-slate-400 text-sm">{account.broker_name}</p>
                          <p className="text-slate-500 text-xs">{getProfileEmail(account.user_id)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateAccountStatus(account.id, 'approved')}
                          className="flex items-center gap-2 px-4 py-2 bg-teal-500/20 text-teal-400 rounded-lg text-sm font-medium hover:bg-teal-500/30 transition-colors border border-teal-500/20"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          موافقة
                        </button>
                        <button
                          onClick={() => updateAccountStatus(account.id, 'rejected')}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors border border-red-500/20"
                        >
                          <XCircle className="w-4 h-4" />
                          رفض
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All accounts */}
            <div>
              <h2 className="text-white font-bold text-lg mb-4">جميع الحسابات</h2>
              {accounts.length === 0 ? (
                <div className="glass-card rounded-2xl p-8 text-center">
                  <p className="text-slate-400">لا توجد حسابات</p>
                </div>
              ) : (
                <div className="glass-card rounded-2xl overflow-hidden overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-right border-b border-white/5">
                        <th className="px-4 py-3 text-slate-400 text-sm font-medium">المستخدم</th>
                        <th className="px-4 py-3 text-slate-400 text-sm font-medium">رقم الحساب</th>
                        <th className="px-4 py-3 text-slate-400 text-sm font-medium">الوسيط</th>
                        <th className="px-4 py-3 text-slate-400 text-sm font-medium">الحالة</th>
                        <th className="px-4 py-3 text-slate-400 text-sm font-medium">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.map((account) => {
                        const config = statusConfig[account.status];
                        return (
                          <tr key={account.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3 text-slate-300 text-sm">{getProfileEmail(account.user_id)}</td>
                            <td className="px-4 py-3 text-white text-sm font-medium">{account.account_number}</td>
                            <td className="px-4 py-3 text-slate-300 text-sm">{account.broker_name}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${config.bg} ${config.color} text-xs font-medium`}>
                                <config.icon className="w-3 h-3" />
                                {config.label}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => updateAccountStatus(account.id, 'approved')}
                                  className="p-1.5 text-teal-400 hover:bg-teal-500/10 rounded-lg transition-colors"
                                  title="موافقة"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => updateAccountStatus(account.id, 'rejected')}
                                  className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                  title="رفض"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Messages tab */}
        {tab === 'messages' && (
          <div>
            <h2 className="text-white font-bold text-lg mb-4">رسائل الدعم</h2>
            {supportMessages.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center">
                <MessageSquare className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">لا توجد رسائل</p>
              </div>
            ) : (
              <div className="space-y-3">
                {supportMessages.map((msg) => (
                  <div key={msg.id} className="glass-card rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-white font-semibold">{msg.subject}</h3>
                        <p className="text-slate-500 text-xs mt-1">
                          {getProfileEmail(msg.user_id)} • {new Date(msg.created_at).toLocaleDateString('ar')}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        msg.status === 'open' ? 'bg-amber-500/10 text-amber-400' : 'bg-teal-500/10 text-teal-400'
                      }`}>
                        {msg.status === 'open' ? 'مفتوحة' : 'تم الحل'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed mb-3">{msg.message}</p>
                    {msg.status === 'open' && (
                      <button
                        onClick={() => resolveMessage(msg.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-500/20 text-teal-400 rounded-lg text-sm font-medium hover:bg-teal-500/30 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        تحديد كمحلول
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stats tab */}
        {tab === 'stats' && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AdminStat icon={Users} label="إجمالي المستخدمين" value={String(allProfiles.length)} color="teal" />
              <AdminStat icon={CheckCircle2} label="حسابات معتمدة" value={String(approvedAccounts.length)} color="teal" />
              <AdminStat icon={Clock} label="حسابات معلقة" value={String(pendingAccounts.length)} color="amber" />
              <AdminStat icon={XCircle} label="حسابات مرفوضة" value={String(rejectedAccounts.length)} color="red" />
              <AdminStat icon={MessageSquare} label="رسائل مفتوحة" value={String(openMessages.length)} color="red" />
              <AdminStat icon={DollarSign} label="الخطة" value="مجاني" color="teal" />
            </div>

            {/* Users list */}
            <div>
              <h2 className="text-white font-bold text-lg mb-4">قائمة المستخدمين</h2>
              <div className="glass-card rounded-2xl overflow-hidden overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-right border-b border-white/5">
                      <th className="px-4 py-3 text-slate-400 text-sm font-medium">البريد</th>
                      <th className="px-4 py-3 text-slate-400 text-sm font-medium">الاسم</th>
                      <th className="px-4 py-3 text-slate-400 text-sm font-medium">مدير</th>
                      <th className="px-4 py-3 text-slate-400 text-sm font-medium">تاريخ التسجيل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allProfiles.map((p) => (
                      <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-white text-sm">{p.email}</td>
                        <td className="px-4 py-3 text-slate-300 text-sm">{p.full_name || '—'}</td>
                        <td className="px-4 py-3">
                          {p.is_admin ? (
                            <span className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium">نعم</span>
                          ) : (
                            <span className="text-slate-500 text-xs">لا</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          {new Date(p.created_at).toLocaleDateString('ar')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminStat({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; color: string }) {
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
