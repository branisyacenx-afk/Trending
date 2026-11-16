import { Shield, AlertTriangle } from 'lucide-react';

export default function RiskPage() {
  const sections = [
    {
      title: 'التداول الآلي',
      content: 'البوت يضع الصفقات تلقائياً وفق قواعده المبرمجة. هذا لا يزيل مخاطر السوق. التداول الآلي قد يؤدي إلى خسائر كبيرة، بما في ذلك خسارة كامل رأس مالك. قد تحدث الخسائر بسرعة، حتى عندما لا تراقب الحساب.',
    },
    {
      title: 'أرقام الأداء',
      points: [
        'الأداء السابق، سواء كان مباشراً أو محاكياً، لا يضمن نتائج مستقبلية.',
        'نتائج الاختبار الرجعي افتراضية. تُنتج ببيانات تاريخية ولا تأخذ في الاعتبار الانزلاق السعري، إعادة التسعير، السيولة، التأخير، أو تغييرات السبريد في العالم الحقيقي.',
        'النتائج المباشرة تعتمد على الوسيط، نوع الحساب، الرافعة المالية، حجم الإيداع، الإعدادات والفترة المتداولة. ستختلف نتائجك.',
      ],
    },
    {
      title: 'المخاطر التقنية',
      content: 'يعتمد البوت على محطة MetaTrader 5، اتصالك بالإنترنت، خوادم الوسيط، وإن استخدمت خادم VPS. أي فشل في هذه المكونات قد يمنع فتح أو تعديل أو إغلاق الصفقات.',
    },
    {
      title: 'لا استشارة',
      content: 'نحن نوفر برمجيات. لا نقدم استشارات استثمارية أو مالية أو قانونية أو ضريبية، ولا ندير الحسابات. أنت مسؤول عن قراراتك التداولية وعن الإعدادات التي تختارها.',
    },
  ];

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">إخلاء المسؤولية</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            اقرأ هذا البيان بعناية قبل استخدام منصة صقور الجزائر.
          </p>
        </div>

        {/* Warning box */}
        <div className="glass-card rounded-2xl p-6 mb-8 border-amber-500/20">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-white font-bold text-lg mb-2">تنبيه المخاطر</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                ينطوي التداول في سوق الفوركس وعقود الفروقات ومنتجات الرافعة المالية الأخرى على مستوى عالٍ من المخاطر وقد لا يناسب الجميع. يمكنك خسارة جزء من أو كل رأس مالك التداولي. لا تتداول بأموال لا تستطيع تحمل خسارتها.
              </p>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, i) => (
            <div key={i} className="glass-card rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-3">{section.title}</h2>
              {section.content && (
                <p className="text-slate-400 text-sm leading-relaxed">{section.content}</p>
              )}
              {section.points && (
                <ul className="space-y-2">
                  {section.points.map((point, j) => (
                    <li key={j} className="flex items-start gap-3 text-slate-400 text-sm leading-relaxed">
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-teal-400 mt-2" />
                      {point}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Trademark notice */}
        <div className="mt-8 glass-card rounded-2xl p-6">
          <p className="text-slate-500 text-sm leading-relaxed">
            MetaTrader 5 علامة تجارية لشركة MetaQuotes Ltd. هذا الموقع غير تابع لـ MetaQuotes أو أي وسيط مذكور.
          </p>
        </div>
      </div>
    </div>
  );
}
