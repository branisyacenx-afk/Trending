import { useRouter } from '@/context/RouterContext';
import type { Page } from '@/types';

export default function Footer() {
  const { navigate } = useRouter();

  const links: { label: string; page: Page }[] = [
    { label: 'الرئيسية', page: 'landing' },
    { label: 'لوحة التحكم', page: 'dashboard' },
    { label: 'دليل التثبيت', page: 'setup' },
    { label: 'الدعم', page: 'support' },
    { label: 'الأداء', page: 'performance' },
    { label: 'إخلاء المسؤولية', page: 'risk' },
  ];

  return (
    <footer className="bg-[#0a1628] border-t border-teal-500/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-amber-500 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                  <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.3l5.5 3.4v8.6L12 19.7l-5.5-3.4V7.7L12 4.3z"/>
                </svg>
              </div>
              <div>
                <span className="block text-white font-bold">صقور الجزائر</span>
                <span className="block text-teal-400 text-xs">Saqoor Algeria</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              منصة بوت تداول آلي مجانية بالكامل لمنصة MetaTrader 5. صُممت للمتداولين الجزائريين والعرب.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">روابط سريعة</h3>
            <div className="space-y-2">
              {links.map((link) => (
                <button
                  key={link.page}
                  onClick={() => navigate(link.page)}
                  className="block text-slate-400 hover:text-teal-400 text-sm transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">إخلاء المسؤولية</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              تنطوي التجارة في سوق الفوركس ومنتجات الرافعة المالية على مستوى عالٍ من المخاطر وقد لا تناسب الجميع. لا تداول بأموال لا تستطيع تحمل خسارتها.
            </p>
            <p className="text-slate-500 text-xs mt-3">
              MetaTrader 5 علامة تجارية لشركة MetaQuotes Ltd. هذا الموقع غير تابع لـ MetaQuotes.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-slate-500 text-sm">
            © 2026 صقور الجزائر — جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </footer>
  );
}
