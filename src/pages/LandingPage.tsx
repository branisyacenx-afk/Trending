import { TrendingUp, Shield, Zap, BarChart3, Bot, CheckCircle2, ArrowLeft, Download, Users, Activity, Globe } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';

export default function LandingPage() {
  const { profile } = useAuth();
  const { navigate } = useRouter();

  const features = [
    {
      icon: Bot,
      title: 'بوت تداول آلي',
      desc: 'بوت تداول يعمل تلقائياً على MetaTrader 5 وفق قواعد مبرمجة. افتح واغلق الصفقات دون تدخل يدوي.',
      color: 'teal',
    },
    {
      icon: Zap,
      title: 'مجاني بالكامل',
      desc: 'لا توجد رسوم اشتراك أو مدفوعات. جميع الميزات متاحة مجاناً لجميع المستخدمين بدون استثناء.',
      color: 'amber',
    },
    {
      icon: Shield,
      title: 'آمن وموثوق',
      desc: 'حماية كاملة لبياناتك وحسابك. جميع الاتصالات مشفرة وتتم حماية حسابك عبر نظام المصادقة.',
      color: 'blue',
    },
    {
      icon: BarChart3,
      title: 'تتبع الأداء',
      desc: 'لوحة تحكم شاملة تعرض رصيدك، أرباحك وخسائرك، وسجل جميع الصفقات المنفذة في الوقت الفعلي.',
      color: 'teal',
    },
    {
      icon: Activity,
      title: 'تحكم كامل',
      desc: 'تحكم في تشغيل وإيقاف البوت، اضبط إعدادات المخاطرة، وقف الخسارة وجني الأرباح حسب استراتيجيتك.',
      color: 'amber',
    },
    {
      icon: Globe,
      title: 'يدعم جميع الوسطاء',
      desc: 'يعمل البوت مع أي وسيط يدعم MetaTrader 5. أضف رقم حسابك واسم الوسيط وابدأ التداول.',
      color: 'blue',
    },
  ];

  const colorMap: Record<string, string> = {
    teal: 'from-teal-500/20 to-teal-600/5 text-teal-400 border-teal-500/20',
    amber: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/20',
    blue: 'from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/20',
  };

  const stats = [
    { icon: Users, label: 'مستخدم نشط', value: '+500' },
    { icon: TrendingUp, label: 'صفقات منفذة', value: '+50,000' },
    { icon: Activity, label: 'دقة الإشارات', value: '%87' },
    { icon: Globe, label: 'دول', value: '+15' },
  ];

  const steps = [
    { num: '1', title: 'إنشاء حساب', desc: 'سجل حساباً مجانياً في ثوانٍ معدودة. لا حاجة لمعلومات الدفع.' },
    { num: '2', title: 'إضافة حساب التداول', desc: 'أدخل رقم حساب MT5 واسم الوسيط الخاص بك للمراجعة.' },
    { num: '3', title: 'الموافقة والتفعيل', desc: 'يوافق المدير على حسابك ثم يمكنك تحميل البوت وبدء التداول.' },
    { num: '4', title: 'بدء التداول', desc: 'ثبّت البوت على MetaTrader 5 وفعّل التداول الآلي لبدء العمل.' },
  ];

  return (
    <div className="pt-16">
      {/* Hero section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] animate-float" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] animate-float-delayed" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-right animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 mb-6">
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                <span className="text-teal-400 text-sm font-medium">منصة مجانية بالكامل</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                بوت تداول آلي
                <br />
                <span className="text-gradient">صقور الجزائر</span>
              </h1>

              <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-xl">
                منصة تداول آلي تعمل مع MetaTrader 5. مجانية بالكامل، متكاملة، وسهلة الاستخدام. صُممت خصيصاً للمتداولين الجزائريين والعرب.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate(profile ? 'dashboard' : 'signup')}
                  className="px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold text-lg hover:from-teal-600 hover:to-teal-700 transition-all glow animate-pulse-glow"
                >
                  {profile ? 'الذهاب للوحة التحكم' : 'ابدأ مجاناً الآن'}
                  <ArrowLeft className="inline w-5 h-5 mr-2" />
                </button>
                <button
                  onClick={() => navigate('setup')}
                  className="px-8 py-4 glass-card text-white rounded-xl font-semibold text-lg hover:border-teal-500/40 transition-all"
                >
                  <Download className="inline w-5 h-5 ml-2" />
                  دليل التثبيت
                </button>
              </div>

              <div className="flex items-center gap-6 mt-8">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-teal-400" />
                  بدون رسوم
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-teal-400" />
                  بدون بطاقة ائتمان
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-teal-400" />
                  تفعيل فوري
                </div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative animate-fade-in hidden lg:block">
              <div className="glass-card rounded-2xl p-6 glow">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400/60" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/60" />
                    <div className="w-3 h-3 rounded-full bg-teal-400/60" />
                  </div>
                  <span className="text-slate-500 text-xs">saqoor-algeria.mq5</span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-teal-500/10 border border-teal-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-teal-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">حالة البوت</p>
                        <p className="text-teal-400 text-xs">يعمل بنجاح</p>
                      </div>
                    </div>
                    <span className="w-3 h-3 bg-teal-400 rounded-full animate-pulse" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-white/5">
                      <p className="text-slate-400 text-xs mb-1">الرصيد</p>
                      <p className="text-white text-xl font-bold">$10,000</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5">
                      <p className="text-slate-400 text-xs mb-1">أرباح 24 ساعة</p>
                      <p className="text-teal-400 text-xl font-bold">+$245</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      { pair: 'EUR/USD', type: 'شراء', profit: '+$32', profitColor: 'text-teal-400' },
                      { pair: 'XAU/USD', type: 'بيع', profit: '+$58', profitColor: 'text-teal-400' },
                      { pair: 'GBP/JPY', type: 'شراء', profit: '-$12', profitColor: 'text-red-400' },
                    ].map((t) => (
                      <div key={t.pair} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div className="flex items-center gap-3">
                          <span className="text-white text-sm font-medium">{t.pair}</span>
                          <span className="text-slate-400 text-xs">{t.type}</span>
                        </div>
                        <span className={`${t.profitColor} text-sm font-semibold`}>{t.profit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -left-4 glass-card rounded-xl p-3 px-5 animate-float">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-teal-400" />
                  <span className="text-white text-sm font-bold">%87 دقة</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 glass-card rounded-xl p-3 px-5 animate-float-delayed">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-400" />
                  <span className="text-white text-sm font-bold">+500 متداول</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats section */}
      <section className="py-16 border-y border-teal-500/10 bg-[#0c1a2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="text-center animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500/20 to-amber-500/10 border border-teal-500/20 items-center justify-center mb-4">
                  <stat.icon className="w-6 h-6 text-teal-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-teal-400 text-sm font-semibold uppercase tracking-wider">المميزات</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-4">
              لماذا <span className="text-gradient">صقور الجزائر</span>؟
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              منصة متكاملة تجمع بين قوة التداول الآلي وسهولة الاستخدام، مجاناً بالكامل.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`glass-card glass-card-hover rounded-2xl p-6 border bg-gradient-to-br ${colorMap[feature.color]}`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`inline-flex w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[feature.color]} items-center justify-center mb-4 border`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-[#0c1a2e] border-y border-teal-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-teal-400 text-sm font-semibold uppercase tracking-wider">كيف يعمل</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-4">
              ابدأ في <span className="text-gradient">4 خطوات</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="glass-card rounded-2xl p-6 text-center">
                  <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-amber-500 items-center justify-center mb-4">
                    <span className="text-white font-bold text-xl">{step.num}</span>
                  </div>
                  <h3 className="text-white font-bold mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -left-3 w-6 h-0.5 bg-teal-500/20" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card rounded-3xl p-12 text-center glow border-teal-500/30">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              جاهز لبدء رحلتك في التداول الآلي؟
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
              انضم إلى أكثر من 500 متداول يستخدمون صقور الجزائر. إنشاء حساب مجاني ولا يتطلب أكثر من دقيقة.
            </p>
            <button
              onClick={() => navigate(profile ? 'dashboard' : 'signup')}
              className="px-10 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold text-lg hover:from-teal-600 hover:to-teal-700 transition-all glow"
            >
              {profile ? 'الذهاب للوحة التحكم' : 'إنشاء حساب مجاني'}
              <ArrowLeft className="inline w-5 h-5 mr-2" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
