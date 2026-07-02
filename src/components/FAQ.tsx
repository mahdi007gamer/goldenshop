"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInViewSafe } from "@/hooks/useInViewSafe";
import { Plus, Minus } from "lucide-react";
import { useLang } from "@/context/LangContext";
import { t } from "@/i18n/translations";

const FAQ_ITEMS_EN = [
  {
    question: "Are the cheats truly undetectable?",
    answer:
      "Yes. Our cheat engine uses military-grade bypass technology that operates at the kernel level, making it invisible to all major anti-cheat systems including Vanguard, VAC, BattleEye, and Easy Anti-Cheat. We update our signatures daily to stay ahead of detection.",
  },
  {
    question: "How quickly do I get access after purchase?",
    answer:
      "Instantly. Once your payment is confirmed, you'll receive your license key and download link immediately via email. The entire setup process takes less than 5 minutes.",
  },
  {
    question: "What happens if I get banned?",
    answer:
      "We offer a free replacement license if you experience a ban while using our tools within the supported period. Our HWID spoofer also ensures your hardware identity remains protected.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We provide a 48-hour refund window if our software doesn't work as described on your system. Contact our support team with your order details and we'll process the refund within 24 hours.",
  },
  {
    question: "Which games do you currently support?",
    answer:
      "We currently support Valorant, CS2, Dota 2, Rainbow Six Siege, and Apex Legends. New game support is added regularly based on community demand. Check our store for the latest additions.",
  },
  {
    question: "Is my personal information safe?",
    answer:
      "Absolutely. We use end-to-end encryption for all transactions and never store sensitive payment details. Your account information is protected with optional two-factor authentication.",
  },
  {
    question: "How often are the cheats updated?",
    answer:
      "Our Elite and Ultimate plans receive daily updates to ensure compatibility with the latest game patches. Basic plan subscribers receive updates every 7 days. All updates are delivered automatically through our launcher.",
  },
];

const FAQ_ITEMS_FA = [
  {
    question: "آیا چیت‌ها واقعاً غیرقابل شناسایی هستند؟",
    answer:
      "بله. موتور چیت ما از فناوری بایپس درجه نظامی استفاده می‌کند که در سطح کرنل عمل می‌کند و نامرئی برای تمام سیستم‌های آنتی‌چیت اصلی از جمله وانگارد، VAC، بتل‌ای و ایزی آنتی‌چیت است. ما امضاهای خود را روزانه به‌روز می‌کنیم.",
  },
  {
    question: "بعد از خرید چقدر سریع دسترسی پیدا می‌کنم؟",
    answer:
      "بلافاصله. پس از تأیید پرداخت، کلید لایسنس و لینک دانلود را فوراً از طریق ایمیل دریافت می‌کنید. کل فرآیند نصب کمتر از ۵ دقیقه طول می‌کشد.",
  },
  {
    question: "اگر بن شوم چه اتفاقی می‌افتد؟",
    answer:
      "اگر در دوره پشتیبانی با استفاده از ابزارهای ما بن شوید، لایسنس جایگزین رایگان ارائه می‌دهیم. HWID اسپوفر ما همچنین هویت سخت‌افزاری شما را محافظت می‌کند.",
  },
  {
    question: "آیا بازگشت پول دارید؟",
    answer:
      "اگر نرم‌افزار ما در سیستم شما مطابق توضیحات کار نکند، ۴۸ ساعت پنجره بازگشت پول ارائه می‌دهیم. با تیم پشتیبانی با جزئیات سفارش خود تماس بگیرید.",
  },
  {
    question: "الان از چه بازی‌هایی پشتیبانی می‌کنید؟",
    answer:
      "ما در حال حاضر والرانت، CS2، دوتا ۲، رینبو سیکس سایج و ایپکس لجندز را پشتیبانی می‌کنیم. پشتیبانی بازی‌های جدید به طور منظم بر اساس تقاضای جامعه اضافه می‌شود.",
  },
  {
    question: "آیا اطلاعات شخصی من امن است؟",
    answer:
      "قطعاً. ما از رمزنگاری سرتاسری برای تمام تراکنش‌ها استفاده می‌کنیم و هرگز جزئیات پرداخت حساس را ذخیره نمی‌کنیم. اطلاعات حساب شما با احراز هویت دو مرحله‌ای اختیاری محافظت می‌شود.",
  },
  {
    question: "چقدر چیت‌ها به‌روز می‌شوند؟",
    answer:
      "پلن‌های الیت و نهایی به‌روزرسانی روزانه دریافت می‌کنند. مشترکین پلن پایه هر ۷ روز به‌روزرسانی می‌شوند. تمام به‌روزرسانی‌ها به صورت خودکار از طریق لانچر ما ارائه می‌شوند.",
  },
];

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
  isRTL,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  isRTL: boolean;
}) {
  const fontFa = isRTL ? "'Vazirmatn', sans-serif" : "'Inter', sans-serif";
  return (
    <div className="border-b border-card-border last:border-b-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors group"
      >
        <span
          className="text-sm font-semibold text-white group-hover:text-gold transition-colors"
          style={{ fontFamily: isRTL ? fontFa : "'Rajdhani', sans-serif", letterSpacing: "0.03em" }}
        >
          {question}
        </span>
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-gold/30 text-gold transition-colors group-hover:bg-gold/10">
          {isOpen ? <Minus size={14} /> : <Plus size={14} />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" as const }}
            className="overflow-hidden"
          >
            <p
              className="pb-5 text-sm leading-relaxed text-muted"
              style={{ fontFamily: fontFa }}
            >
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  // placeholder removed
  const { ref, isInView } = useInViewSafe<HTMLDivElement>({ once: true, margin: "-100px" });
  const { lang, isRTL } = useLang();

  const faqItems = lang === 'fa' ? FAQ_ITEMS_FA : FAQ_ITEMS_EN;
  const title = t('faq.title', lang);
  const subtitle = t('faq.subtitle', lang);

  return (
    <section id="faq" className="relative py-24" ref={ref as React.RefObject<HTMLDivElement>}>
      <div className="mx-auto max-w-3xl px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-gold-text"
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            {subtitle}
          </p>
          <h2
            className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {title.split(' ')[0]} <span className="text-gold-gradient">{title.split(' ').slice(1).join(' ')}</span>
          </h2>
        </motion.div>

        {/* FAQ accordion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card p-6 sm:p-8"
        >
          {faqItems.map((item, i) => (
            <FAQItem
              key={`${lang}-${i}`}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              isRTL={isRTL}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
