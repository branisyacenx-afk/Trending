import { useState } from 'react';
import { Menu, X, LogOut, LayoutDashboard, Settings, LifeBuoy, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';
import type { Page } from '@/types';

export default function Navbar() {
  const { profile, signOut } = useAuth();
  const { page, navigate } = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems: { label: string; page: Page }[] = [
    { label: 'الرئيسية', page: 'landing' },
    { label: 'لوحة التحكم', page: 'dashboard' },
    { label: 'دليل التثبيت', page: 'setup' },
    { label: 'الدعم', page: 'support' },
    { label: 'الأداء', page: 'performance' },
  ];

  const isAdmin = profile?.is_admin === true;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a1628]/90 backdrop-blur-lg border-b border-teal-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => navigate('landing')} className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-amber-500 flex items-center justify-center transition-transform group-hover:scale-110">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.3l5.5 3.4v8.6L12 19.7l-5.5-3.4V7.7L12 4.3z"/>
                <path d="M12 7l-3 1.9v4.2L12 15l3-1.9V8.9L12 7z"/>
              </svg>
            </div>
            <div className="text-right">
              <span className="block text-white font-bold text-lg leading-tight">صقور الجزائر</span>
              <span className="block text-teal-400 text-xs">Saqoor Algeria</span>
            </div>
          </button>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => navigate(item.page)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  page === item.page
                    ? 'text-teal-400 bg-teal-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Auth area */}
          <div className="hidden lg:flex items-center gap-3">
            {!profile ? (
              <>
                <button
                  onClick={() => navigate('login')}
                  className="px-4 py-2 text-slate-300 hover:text-white text-sm font-medium transition-colors"
                >
                  تسجيل الدخول
                </button>
                <button
                  onClick={() => navigate('signup')}
                  className="px-5 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg text-sm font-semibold hover:from-teal-600 hover:to-teal-700 transition-all glow"
                >
                  إنشاء حساب مجاني
                </button>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-amber-500 flex items-center justify-center text-white text-sm font-bold">
                    {profile.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm text-slate-200 max-w-[120px] truncate">{profile.email}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute left-0 mt-2 w-56 bg-[#13243d] rounded-xl border border-teal-500/20 shadow-xl z-50 overflow-hidden animate-fade-in">
                      <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-sm text-slate-200 truncate">{profile.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full font-medium">
                            مدير
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => { navigate('dashboard'); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-white/5 hover:text-white text-sm transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        لوحة التحكم
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => { navigate('admin'); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-white/5 hover:text-white text-sm transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          لوحة الإدارة
                        </button>
                      )}
                      <button
                        onClick={() => { navigate('setup'); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-white/5 hover:text-white text-sm transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        دليل التثبيت
                      </button>
                      <button
                        onClick={() => { navigate('support'); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-white/5 hover:text white text-sm transition-colors"
                      >
                        <LifeBuoy className="w-4 h-4" />
                        الدعم
                      </button>
                      <button
                        onClick={() => { navigate('risk'); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-white/5 hover:text-white text-sm transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        إخلاء المسؤولية
                      </button>
                      <div className="border-t border-white/5">
                        <button
                          onClick={() => { signOut(); setUserMenuOpen(false); navigate('landing'); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 text-sm transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          تسجيل الخروج
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-white"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#0a1628] border-t border-teal-500/10 animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => { navigate(item.page); setMobileOpen(false); }}
                className={`w-full text-right px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  page === item.page
                    ? 'text-teal-400 bg-teal-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={() => { navigate('admin'); setMobileOpen(false); }}
                className="w-full text-right px-4 py-3 rounded-lg text-amber-400 hover:bg-amber-500/10 text-sm font-medium transition-all"
              >
                لوحة الإدارة
              </button>
            )}
            <div className="pt-2 border-t border-white/5">
              {!profile ? (
                <div className="space-y-2">
                  <button
                    onClick={() => { navigate('login'); setMobileOpen(false); }}
                    className="w-full px-4 py-3 text-slate-300 text-sm font-medium text-right"
                  >
                    تسجيل الدخول
                  </button>
                  <button
                    onClick={() => { navigate('signup'); setMobileOpen(false); }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg text-sm font-semibold"
                  >
                    إنشاء حساب مجاني
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { signOut(); setMobileOpen(false); navigate('landing'); }}
                  className="w-full flex items-center justify-between px-4 py-3 text-red-400 text-sm font-medium"
                >
                  تسجيل الخروج
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
