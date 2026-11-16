import { useState } from 'react';
import { Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';

export default function LoginPage() {
  const { signIn } = useAuth();
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      const messages: Record<string, string> = {
        'Invalid login credentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
        'Email not confirmed': 'البريد الإلكتروني غير مؤكد',
      };
      setError(messages[error] || error);
    } else {
      navigate('dashboard');
    }
  }

  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-teal-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-md w-full">
        <div className="glass-card rounded-2xl p-8 animate-slide-up">
          <div className="text-center mb-8">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-amber-500 items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
                <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.3l5.5 3.4v8.6L12 19.7l-5.5-3.4V7.7L12 4.3z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">تسجيل الدخول</h1>
            <p className="text-slate-400 text-sm">مرحباً بعودتك إلى صقور الجزائر</p>
          </div>

          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="example@email.com"
                  className="w-full pr-11 pl-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm mb-2">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pr-11 pl-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed glow"
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              ليس لديك حساب؟{' '}
              <button onClick={() => navigate('signup')} className="text-teal-400 hover:text-teal-300 font-medium">
                إنشاء حساب مجاني
              </button>
            </p>
          </div>

          <button
            onClick={() => navigate('landing')}
            className="mt-4 w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة للرئيسية
          </button>
        </div>
      </div>
    </div>
  );
}
