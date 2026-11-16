import { useState } from 'react';
import { MessageCircle, Send, Mail, HelpCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function SupportPage() {
  const { profile } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSending(true);
    setError('');

    const { error } = await supabase
      .from('support_messages')
      .insert({
        user_id: profile.id,
        subject,
        message,
        status: 'open',
      });

    setSending(false);

    if (error) {
      setError('حدث خطأ أثناء إرسال الرسالة. حاول مرة أخرى.');
    } else {
      setSent(true);
      setSubject('');
      setMessage('');
      setTimeout(() => setSent(false), 5000);
    }
  }

  const faqs = [
    {
      q: 'هل المنصة مجانية فعلاً؟',
      a: 'نعم، صقور الجزائر مجانية بالكامل. لا توجد رسوم اشتراك أو مدفوعات أو تكاليف خفية. جميع الميزات متاحة مجاناً.',
    },
    {
      q: 'كيف أحصل على موافقة حسابي؟',
      a: 'بعد إضافة حساب التداول الخاص بك في لوحة التحكم، سيقوم المدير بمراجعته والموافقة عليه. يمكنك التواصل معنا عبر تيليغرام لتسريع العملية.',
    },
    {
      q: 'هل يعمل البوت على الهاتف؟',
      a: 'لا، يعمل البوت على محطة MetaTrader 5 المكتبية فقط. لكن يمكنك مراقبة الصفقات من تطبيق الهاتف بعد تسجيل الدخول بنفس الحساب.',
    },
    {
      q: 'ما هو VPS وهل أحتاجه؟',
      a: 'خادم VPS يبقي MT5 يعمل 24/7 حتى عند إيقاف تشغيل جهازك. إنه اختياري لكنه مُوصى به للتداول المستمر.',
    },
    {
      q: 'كيف أحدث البوت؟',
      a: 'حمّل أحدث إصدار، استبدل ملف .ex5 القديم في مجلد MQL5/Experts، أعد تشغيل MT5 وأعد إضافة البوت.',
    },
  ];

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-amber-500 items-center justify-center mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">الدعم والمساعدة</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            نحن هنا لمساعدتك في كل ما تحتاجه — التسجيل، التثبيت، أو حل أي مشكلة.
          </p>
        </div>

        {/* Telegram contact */}
        <div className="glass-card rounded-2xl p-6 mb-8 text-center glow">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 items-center justify-center mb-4">
            <Send className="w-7 h-7 text-blue-400" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">تواصل معنا على تيليغرام</h2>
          <p className="text-slate-400 text-sm mb-6">
            محادثة واحدة لكل شيء: شراء البوت، إضافة حساب، والمساعدة التقنية.
          </p>
          <a
            href="https://t.me/saqoor_algeria"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500/20 text-blue-400 rounded-xl font-semibold border border-blue-500/30 hover:bg-blue-500/30 transition-all"
          >
            <Send className="w-5 h-5" />
            فتح تيليغرام
          </a>
          <p className="text-slate-500 text-xs mt-4">
            عند التواصل، أرفق: رقم حساب التداول، اسم الوسيط، وما تحتاجه
          </p>
        </div>

        {/* Support form */}
        {profile && (
          <div className="glass-card rounded-2xl p-6 mb-8">
            <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-teal-400" />
              إرسال رسالة دعم
            </h2>

            {sent && (
              <div className="mb-4 p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm animate-fade-in">
                تم إرسال رسالتك بنجاح! سنرد عليك في أقرب وقت ممكن.
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm mb-2">الموضوع</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="موضوع رسالتك"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-2">الرسالة</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  placeholder="اكتب رسالتك هنا..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50 transition-all resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-teal-700 transition-all disabled:opacity-50"
              >
                {sending ? 'جاري الإرسال...' : 'إرسال الرسالة'}
              </button>
            </form>
          </div>
        )}

        {/* FAQ */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-teal-400" />
            الأسئلة الشائعة
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-right hover:bg-white/5 transition-colors"
      >
        <span className="text-white font-medium text-sm">{q}</span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 mr-2 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 text-slate-400 text-sm leading-relaxed animate-fade-in">
          {a}
        </div>
      )}
    </div>
  );
}
