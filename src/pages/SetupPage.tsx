import { Download, FileText, Monitor, Wifi, Settings2, RefreshCw, AlertTriangle, Server, CheckCircle2 } from 'lucide-react';
import { useRouter } from '@/context/RouterContext';

export default function SetupPage() {
  const { navigate } = useRouter();

  const requirements = [
    {
      icon: Monitor,
      title: 'محطة MetaTrader 5',
      desc: 'يعمل البوت على المحطة المكتبية لـ MT5، على جهاز كمبيوتر أو خادم VPS. لا يمكن تشغيله على تطبيق الهاتف، لكن يمكنك مراقبة الصفقات من هاتفك.',
    },
    {
      icon: FileText,
      title: 'حساب تداول معتمد',
      desc: 'يجب أن يكون حسابك معتمداً من المدير. إذا لم تتم الموافقة بعد، تواصل مع الدعم عبر تيليغرام.',
    },
    {
      icon: Wifi,
      title: 'اتصال مستقر',
      desc: 'يتداول البوت فقط عندما تكون المحطة مفتوحة ومتصلة بالإنترنت. يُنصح باستخدام VPS لضمان استمرارية العمل.',
    },
  ];

  const steps = [
    {
      num: '1',
      title: 'الحصول على ملف الربط الرسمي',
      desc: 'اطلب ملف Expert Advisor المعتمد من الدعم بعد نشره والتحقق من مصدره وتوقيعه.'
    },
    {
      num: '2',
      title: 'فتح مجلد البيانات',
      desc: 'في MetaTrader 5، افتح File → Open Data Folder.',
    },
    {
      num: '3',
      title: 'نسخ الملف',
      desc: 'اذهب إلى MQL5 → Experts وانسخ ملف البوت إلى هذا المجلد.',
    },
    {
      num: '4',
      title: 'تحديث القائمة',
      desc: 'انقر بزر الماوس الأيمن على Expert Advisors في لوحة Navigator واختر Refresh، أو أعد تشغيل المحطة.',
    },
    {
      num: '5',
      title: 'تسجيل الدخول',
      desc: 'سجّل الدخول إلى حسابك المعتمد وافتح رسم بياني للزوج والإطار الزمني الذي تريد التداول عليه.',
    },
    {
      num: '6',
      title: 'إضافة البوت للرسم',
      desc: 'بعد استلام النسخة الرسمية والتحقق منها، أضفها إلى الرسم البياني التجريبي أولاً واتبع تعليمات الإصدار.',
    },
    {
      num: '7',
      title: 'تفعيل التداول الآلي',
      desc: 'لا تفعّل Algo Trading إلا بعد اختبار النسخة على حساب تجريبي والتأكد من إعدادات المخاطرة والاتصال.',
    },
  ];

  const inputSettings = [
    { title: 'إعدادات المخاطرة', desc: 'حجم كل صفقة وكمية رأس المال المخاطر بها في صفقة واحدة.' },
    { title: 'إعدادات التداول', desc: 'وقف الخسارة، جني الأرباح ومعايير الخروج الأخرى.' },
    { title: 'الفلاتر', desc: 'شروط توقف فتح صفقات جديدة، مثل أقصى سبريد.' },
  ];

  const troubleshooting = [
    {
      q: 'البوت مضاف لكنه لا يتداول',
      a: 'تأكد من أن Algo Trading مفعّل، وأن Allow Algo Trading مؤشر في تبويب Common، وأن السوق مفتوح.',
    },
    {
      q: 'الزوج غير موجود',
      a: 'بعض الوسطاء يضيفون لاحقة لأسماء الأزواج (مثل EURUSD.m). استخدم نسخة الوسيط من اسم الزوج.',
    },
    {
      q: 'أخطاء أخرى',
      a: 'انسخ الرسائل من تبويبي Experts و Journal وأرسلها للدعم عبر تيليغرام.',
    },
  ];

  const vpsSteps = [
    'استأجر خادم Windows VPS، يُفضّل قريب من خادم تداول الوسيط.',
    'ثبّت MT5 عليه، سجّل الدخول إلى حسابك وثبّت البوت كما هو مذكور أعلاه.',
    'اترك المحطة مفتوحة. قطع الاتصال بالجلسة البعيدة لا يغلقها.',
  ];

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-amber-500 items-center justify-center mb-4">
            <Download className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">دليل ربط منصة التداول</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            حضّر حساب MT5، ولا تبدأ التداول الآلي قبل توفير ملف الربط الرسمي واختباره.
          </p>
        </div>

        {/* Official connector request */}
        <div className="glass-card rounded-2xl p-8 text-center mb-12 glow">
          <h2 className="text-white font-bold text-xl mb-2">طلب ملف الربط الرسمي</h2>
          <p className="text-slate-400 text-sm mb-6">لا يوجد حالياً ملف Expert Advisor موثّق داخل المستودع، لذلك لن نعرض زر تحميل وهمياً.</p>
          <button
            onClick={() => navigate('support')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold text-lg hover:from-teal-600 hover:to-teal-700 transition-all glow"
          >
            <Download className="w-5 h-5" />
            طلب ملف الربط من الدعم
          </button>
          <p className="text-slate-500 text-xs mt-4">
            لا تثبّت ملفات EX5 من مصادر غير موثوقة، ولا تفعّل التداول الحقيقي قبل اختبار النسخة على حساب تجريبي.
          </p>
        </div>

        {/* Requirements */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">المتطلبات</h2>
          <div className="space-y-4">
            {requirements.map((req, i) => (
              <div key={i} className="glass-card glass-card-hover rounded-2xl p-5 flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                  <req.icon className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{req.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{req.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">خطوات التثبيت</h2>
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="glass-card glass-card-hover rounded-2xl p-5 flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-amber-500 flex items-center justify-center">
                  <span className="text-white font-bold">{step.num}</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Settings */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">إعدادات البوت</h2>
          <div className="glass-card rounded-2xl p-6">
            <p className="text-slate-400 text-sm mb-6">
              جميع الإعدادات موجودة في تبويب Inputs الخاص بالبوت. يمكنك تغييرها عند إضافته أو لاحقاً بالضغط على F7 على الرسم البياني.
            </p>
            <div className="space-y-4">
              {inputSettings.map((setting, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/5">
                  <Settings2 className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-white font-semibold text-sm mb-1">{setting.title}</h3>
                    <p className="text-slate-400 text-sm">{setting.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-amber-400 text-sm">
                ابدأ بالإعدادات الافتراضية وغيّر إعداداً واحداً في كل مرة. اختبر على حساب تجريبي أولاً.
              </p>
            </div>
          </div>
        </section>

        {/* VPS section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">
            <Server className="inline w-6 h-6 text-teal-400 ml-2" />
            خادم VPS (اختياري)
          </h2>
          <div className="glass-card rounded-2xl p-6">
            <p className="text-slate-400 text-sm mb-4">
              خادم VPS يبقي MT5 يعمل حتى عند إيقاف تشغيل جهازك.
            </p>
            <div className="space-y-3">
              {vpsSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-300 text-sm">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Update section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">
            <RefreshCw className="inline w-6 h-6 text-teal-400 ml-2" />
            تحديث البوت
          </h2>
          <div className="glass-card rounded-2xl p-6">
            <div className="space-y-3">
              {[
                'حمّل أحدث إصدار.',
                'استبدل ملف .ex5 القديم في مجلد MQL5/Experts.',
                'أعد تشغيل MT5 وأعد إضافة البوت. احفظ إعداداتك كملف .set أولاً لتتمكن من تحميلها مجدداً.',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="text-slate-300 text-sm">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">استكشاف الأخطاء</h2>
          <div className="space-y-4">
            {troubleshooting.map((item, i) => (
              <div key={i} className="glass-card rounded-2xl p-5">
                <h3 className="text-white font-semibold mb-2 flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  {item.q}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mr-7">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
