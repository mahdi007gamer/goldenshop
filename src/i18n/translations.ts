export type Lang = "fa" | "en";

// ── Key-based translations (for existing components) ──────────────────────
const translations: Record<string, Record<Lang, string>> = {
  // Navigation
  "nav.home": { fa: "خانه", en: "Home" },
  "nav.shop": { fa: "فروشگاه", en: "Shop" },
  "nav.licenses": { fa: "لایسنس‌ها", en: "Licenses" },
  "nav.support": { fa: "پشتیبانی", en: "Support" },
  "nav.admin": { fa: "مدیریت", en: "Admin" },
  "nav.login": { fa: "ورود", en: "Login" },
  "nav.logout": { fa: "خروج", en: "Logout" },
  "nav.dashboard": { fa: "داشبورد", en: "Dashboard" },
  "nav.account": { fa: "حساب کاربری", en: "Account" },
  "nav.gameCheats": { fa: "چیت‌های بازی", en: "Game Cheats" },
  "nav.pricing": { fa: "قیمت‌گذاری", en: "Pricing" },
  "nav.faq": { fa: "سوالات متداول", en: "FAQ" },

  // Hero
  "hero.eyebrow": { fa: "نگهبان کد", en: "GUARDIAN OF THE CODE" },
  "hero.headline.1": { fa: "گلدن چیـت،", en: "UNLOCK" },
  "hero.headline.2": { fa: "بهترین ساقیِ", en: "THE ULTIMATE" },
  "hero.headline.3": { fa: "چیتِ بدون بن", en: "ADVANTAGE" },
  "hero.subheadline": {
    fa: "دسترسی به حرفه‌ای‌ترین ابزارهای گیمینگ با امنیت بی‌نظیر و قدرت مطلق.",
    en: "Access Elite Game Hacks with Ancient Security and Total Power.",
  },
  "hero.subBold": { fa: "غیرقابل شناسایی. قدرتمند. بی‌رقیب.", en: "Undetectable. Empowered." },
  "hero.btnPrimary": { fa: "خرید چیت", en: "SHOP CHEATS" },
  "hero.btnSecondary": { fa: "راهنماها", en: "EXPLORE GUIDES" },
  "hero.scroll": { fa: "↓ بیشتر ببین", en: "SCROLL FOR MORE" },

  // Hero cards
  "hero.card.1.title": { fa: "ویژگی‌های الیت", en: "ELITE FEATURES" },
  "hero.card.1.desc": {
    fa: "ابزارهای چیت پریمیوم با سفارشی‌سازی پیشرفته، پشتیبانی ماکرو و تکنولوژی بهینه‌شده.",
    en: "Premium cheat tools with advanced customization, macro support, and performance-optimized technology.",
  },
  "hero.card.2.title": { fa: "موتور غیرقابل شناسایی", en: "UNDETECTABLE ENGINE" },
  "hero.card.2.desc": {
    fa: "تکنولوژی امنیتی نظامی برای دور زدن سیستم‌های آنتی‌چیت و ماندن کاملاً نامرئی.",
    en: "Military-grade security tech to bypass anti-cheat systems and remain completely invisible and undetected.",
  },
  "hero.card.3.title": { fa: "پشتیبانی ۲۴/۷", en: "24/7 PRIORITY SUPPORT" },
  "hero.card.3.desc": {
    fa: "خدمات مشتری شبانه‌روزی برای مشکلات حساب، راه‌اندازی و به‌روزرسانی‌های چیت.",
    en: "Round-the-clock customer service for account issues, configuration help, and real-time cheat updates.",
  },

  // Hero stats
  "hero.stat.bypass": { fa: "نرخ بایپس", en: "BYPASS RATE" },
  "hero.stat.licenses": { fa: "لایسنس تحویل داده‌شده", en: "LICENSES DELIVERED" },
  "hero.stat.users": { fa: "کاربران فعال", en: "ACTIVE USERS" },

  // Features section
  "features.title": {
    fa: "چرا گلدن چیت را انتخاب کنیم؟",
    en: "Why Choose Golden Cheat?",
  },
  "features.instant.title": { fa: "تحویل آنی", en: "Instant Delivery" },
  "features.instant.desc": {
    fa: "لایسنس شما بلافاصله پس از پرداخت تولید و تحویل داده می‌شود",
    en: "Your license is generated and delivered immediately after payment",
  },
  "features.support.title": { fa: "پشتیبانی ۲۴/۷", en: "24/7 Support" },
  "features.support.desc": {
    fa: "تیم پشتیبانی ما در هر ساعت از شبانه‌روز آماده کمک است",
    en: "Our support team is ready to help at any hour of the day",
  },
  "features.undetected.title": { fa: "غیرقابل تشخیص", en: "Undetected" },
  "features.undetected.desc": {
    fa: "آخرین فناوری ضد بن برای حفظ حساب شما",
    en: "Latest anti-ban technology to keep your account safe",
  },
  "features.hwid.title": { fa: "HWID اسپوفر", en: "HWID Spoofer" },
  "features.hwid.desc": {
    fa: "محافظت کامل از سخت‌افزار شما در برابر محدودیت‌ها",
    en: "Complete hardware protection against restrictions",
  },
  "features.secure.title": { fa: "پرداخت امن", en: "Secure Payment" },
  "features.secure.desc": {
    fa: "رمزنگاری ۲۵۶ بیتی SSL برای تمام تراکنش‌ها",
    en: "256-bit SSL encryption for all transactions",
  },
  "features.update.title": { fa: "به‌روزرسانی مداوم", en: "Constant Updates" },
  "features.update.desc": {
    fa: "به‌روزرسانی خودکار بعد از هر پچ بازی",
    en: "Automatic updates after every game patch",
  },

  // Stats
  "stats.warriors": { fa: "جنگجوی فعال", en: "Active Warriors" },
  "stats.licenses": { fa: "لایسنس صادر شده", en: "Licenses Issued" },
  "stats.uptime": { fa: "آپتایم سرور", en: "Server Uptime" },
  "stats.countries": { fa: "کشور فعال", en: "Active Countries" },

  // Store / GameCheats
  "store.title": { fa: "فروشگاه محصولات", en: "Product Store" },
  "store.subtitle": {
    fa: "بهترین ابزارهای بازی را با کیفیت بالا و قیمت مناسب تجربه کنید",
    en: "Experience the best gaming tools with high quality and fair pricing",
  },
  "store.allGames": { fa: "همه بازی‌ها", en: "All Games" },
  "store.addToCart": { fa: "افزودن به سبد", en: "Add to Cart" },
  "store.quickView": { fa: "مشاهده سریع", en: "Quick View" },
  "store.noProducts": { fa: "محصولی یافت نشد", en: "No products found" },
  "store.monthly": { fa: "ماهانه", en: "Monthly" },
  "store.lifetime": { fa: "مادام‌العمر", en: "Lifetime" },
  "store.perMonth": { fa: "در ماه", en: "per month" },
  "store.oneTime": { fa: "پرداخت یکجا", en: "one-time" },
  "store.save40": { fa: "۴۰٪ صرفه‌جویی", en: "SAVE 40%" },
  "store.checkout": { fa: "پرداخت", en: "Checkout" },
  "store.viewCart": { fa: "مشاهده سبد", en: "View Cart" },
  "store.buyNow": { fa: "خرید", en: "BUY NOW" },
  "store.rating": { fa: "امتیاز", en: "rating" },

  // Pricing
  "pricing.title": { fa: "پلن‌های قیمت‌گذاری", en: "Pricing Plans" },
  "pricing.subtitle": {
    fa: "پلن مناسب خود را انتخاب کنید",
    en: "Choose the plan that fits you",
  },
  "pricing.monthly": { fa: "ماهانه", en: "Monthly" },
  "pricing.lifetime": { fa: "مادام‌العمر", en: "Lifetime" },
  "pricing.save40": { fa: "۴۰٪ صرفه‌جویی", en: "SAVE 40%" },
  "pricing.popular": { fa: "محبوب‌ترین", en: "MOST POPULAR" },
  "pricing.getStarted": { fa: "شروع کنید", en: "GET STARTED" },
  "pricing.basic.name": { fa: "پایه", en: "BASIC" },
  "pricing.basic.desc": { fa: "ابزارهای ضروری برای بازیکنان معمولی", en: "Essential tools for casual players" },
  "pricing.elite.name": { fa: "الیت", en: "ELITE" },
  "pricing.elite.desc": { fa: "سلاح‌های کامل برای سلطه رقابتی", en: "Full arsenal for competitive dominance" },
  "pricing.ultimate.name": { fa: "نهایی", en: "ULTIMATE" },
  "pricing.ultimate.desc": { fa: "دسترسی کامل برای حرفه‌ای‌ها", en: "Complete access for professionals" },

  // FAQ
  "faq.title": { fa: "سوالات متداول", en: "Frequently Asked Questions" },
  "faq.subtitle": {
    fa: "پاسخ سوالات رایج را بیابید",
    en: "Find answers to common questions",
  },

  // Testimonials
  "testimonials.title": { fa: "نظرات جنگجویان", en: "Warrior Reviews" },
  "testimonials.subtitle": {
    fa: "ببینید کاربران ما چه می‌گویند",
    en: "See what our users have to say",
  },

  // CTA
  "cta.title": { fa: "آماده سلطه هستید؟", en: "Ready to Dominate?" },
  "cta.subtitle": {
    fa: "به هزاران جنگجوی فعال بپیوندید و تجربه‌ای متفاوت را شروع کنید",
    en: "Join thousands of active warriors and start a different experience",
  },
  "cta.button": { fa: "عضویت در نخبگان", en: "Join the Elite" },

  // Blog
  "blog.title": { fa: "بلاگ", en: "Blog" },
  "blog.subtitle": { fa: "مقالات و راهنماها", en: "Articles & Guides" },
  "blog.readMore": { fa: "ادامه مطلب", en: "Read More" },
  "blog.publishedOn": { fa: "منتشر شده در", en: "Published on" },
  "blog.byAuthor": { fa: "توسط", en: "by" },
  "blog.readingTime": { fa: "دقیقه خواندن", en: "min read" },
  "blog.categories": { fa: "دسته‌بندی‌ها", en: "Categories" },
  "blog.tags": { fa: "برچسب‌ها", en: "Tags" },
  "blog.search": { fa: "جستجو...", en: "Search..." },
  "blog.noResults": { fa: "مقاله‌ای یافت نشد", en: "No articles found" },
  "blog.allArticles": { fa: "همه مقالات", en: "All Articles" },
  "blog.viewAllArticles": { fa: "مشاهده همه مقالات", en: "View All Articles" },
  "blog.backToBlog": { fa: "بازگشت به بلاگ", en: "Back to Blog" },

  // Footer
  "footer.description": {
    fa: "پلتفرم پیشرفته گیمینگ با بهترین ابزارها و پشتیبانی ۲۴/۷",
    en: "Premium gaming platform with the best tools and 24/7 support",
  },
  "footer.products": { fa: "محصولات", en: "Products" },
  "footer.company": { fa: "شرکت", en: "Company" },
  "footer.legal": { fa: "قانونی", en: "Legal" },
  "footer.about": { fa: "درباره ما", en: "About Us" },
  "footer.contact": { fa: "تماس", en: "Contact" },
  "footer.terms": { fa: "قوانین", en: "Terms" },
  "footer.privacy": { fa: "حریم خصوصی", en: "Privacy" },
  "footer.newsletter": { fa: "خبرنامه", en: "Newsletter" },
  "footer.newsletterDesc": {
    fa: "برای دریافت آخرین اخبار و به‌روزرسانی‌ها عضو شوید",
    en: "Subscribe to receive the latest news and updates",
  },
  "footer.emailPlaceholder": { fa: "ایمیل شما...", en: "Your email..." },
  "footer.subscribe": { fa: "عضویت", en: "Subscribe" },
  "footer.rights": { fa: "تمامی حقوق محفوظ است", en: "All rights reserved" },
  "footer.status": { fa: "وضعیت سرور: آنلاین", en: "Server Status: Online" },

  // Product Detail
  "product.backToShop": { fa: "بازگشت به فروشگاه", en: "Back to Shop" },
  "product.keyFeatures": { fa: "ویژگی‌های کلیدی", en: "Key Features" },
  "product.selectPlan": { fa: "مدت اشتراک را انتخاب کنید", en: "Select Subscription Plan" },
  "product.daily": { fa: "روزانه", en: "Daily" },
  "product.weekly": { fa: "هفتگی", en: "Weekly" },
  "product.monthly": { fa: "ماهانه", en: "Monthly" },
  "product.lifetime": { fa: "مادام‌العمر", en: "Lifetime" },
  "product.perDay": { fa: "روز", en: "day" },
  "product.perWeek": { fa: "هفته", en: "wk" },
  "product.perMonth": { fa: "ماه", en: "mo" },
  "product.oneTime": { fa: "پرداخت یکجا", en: "one-time" },
  "product.buyNow": { fa: "خرید فوری", en: "Buy Now" },
  "product.addToCart": { fa: "افزودن به سبد", en: "Add to Cart" },
  "product.gallery": { fa: "گالری تصاویر", en: "Gallery" },
  "product.video": { fa: "ویدیوی معرفی", en: "Video Preview" },
  "product.audio": { fa: "پیشنمایش صدا", en: "Audio Preview" },
  "product.secureDownload": { fa: "دانلود امن", en: "Secure Download" },
  "product.instantDelivery": { fa: "تحویل آنی", en: "Instant Delivery" },
  "product.support247": { fa: "پشتیبانی ۲۴/۷", en: "24/7 Support" },
  "product.bypassRate": { fa: "نرخ بایپس", en: "Bypass Rate" },
  "product.updateStatus": { fa: "وضعیت آپدیت", en: "Update Status" },
  "product.reviews": { fa: "نظر", en: "reviews" },

  // Reviews
  "reviews.title": { fa: "نظرات کاربران", en: "Customer Reviews" },
  "reviews.subtitle": { fa: "تجربه واقعی کاربران با این محصول", en: "Real user experiences with this product" },
  "reviews.writeReview": { fa: "ثبت نظر", en: "Write a Review" },
  "reviews.placeholder": { fa: "تجربه خود را با دیگران به اشتراک بگذارید...", en: "Share your experience with other users..." },
  "reviews.submit": { fa: "ارسال نظر", en: "Submit Review" },
  "reviews.loginRequired": { fa: "برای ثبت نظر وارد حساب کاربری خود شوید", en: "Please login to write a review" },
  "reviews.purchaseRequired": { fa: "برای ثبت نظر باید این محصول را خریداری کرده باشید", en: "You must purchase this product to leave a review" },
  "reviews.alreadyReviewed": { fa: "شما قبلاً برای این محصول نظر ثبت کرده‌اید", en: "You have already reviewed this product" },
  "reviews.noReviews": { fa: "هنوز نظری ثبت نشده. اولین نفری باشید که نظر می‌دهید!", en: "No reviews yet. Be the first to review!" },
  "reviews.thanksRating": { fa: "از نظر شما متشکریم!", en: "Thank you for your review!" },
  "reviews.helpful": { fa: "مفید بود", en: "Helpful" },
  "reviews.sortNewest": { fa: "جدیدترین", en: "Newest" },
  "reviews.sortHighest": { fa: "بالاترین امتیاز", en: "Highest Rated" },
  "reviews.sortLowest": { fa: "پایین‌ترین امتیاز", en: "Lowest Rated" },
  "reviews.outOf5": { fa: "از ۵", en: "out of 5" },
  "reviews.by": { fa: "توسط", en: "by" },
  "reviews.verifiedPurchase": { fa: "خریدار تأیید شده", en: "Verified Purchase" },
  "product.undetected": { fa: "غیرقابل شناسایی", en: "Undetected" },
  "product.testing": { fa: "در حال تست", en: "Testing" },
  "product.updating": { fa: "در حال بروزرسانی", en: "Updating" },
  "product.from": { fa: "از", en: "from" },
  "product.toman": { fa: "تومان", en: "" },
  "product.unavailable": { fa: "این محصول در حال حاضر در دسترس نیست", en: "This product is currently unavailable" },

  // Currency
  "currency.toman": { fa: "تومان", en: "" },
  "currency.from": { fa: "از", en: "from" },
  "currency.rate": { fa: "نرخ دلار", en: "USD Rate" },
  "currency.live": { fa: "زنده", en: "LIVE" },

  // Cart
  "cart.title": { fa: "سبد خرید", en: "Your Cart" },
  "cart.empty": { fa: "سبد خرید خالی است", en: "Your cart is empty" },
  "cart.emptyDesc": {
    fa: "برای شروع چند محصول اضافه کنید!",
    en: "Add some products to get started!",
  },
  "cart.total": { fa: "مجموع", en: "Total" },
  "cart.checkout": { fa: "پرداخت", en: "Checkout" },
  "cart.remove": { fa: "حذف", en: "Remove" },

  // Checkout
  "checkout.orderSummary": { fa: "خلاصه سفارش", en: "Order Summary" },
  "checkout.total": { fa: "مبلغ قابل پرداخت", en: "Total Due" },
  "checkout.pay": { fa: "تکمیل خرید", en: "Complete Purchase" },
  "checkout.processing": { fa: "در حال پردازش...", en: "Processing..." },
  "checkout.success": { fa: "خرید موفق!", en: "Purchase Successful!" },
  "checkout.successMsg": {
    fa: "لایسنس‌های شما تولید شد. از پنل لایسنس‌ها مشاهده کنید.",
    en: "Your licenses have been generated. Check your Licenses panel.",
  },
  "checkout.goDashboard": { fa: "مشاهده لایسنس‌ها", en: "View Licenses" },
  "checkout.encrypted": { fa: "پرداخت امن و رمزنگاری شده", en: "Secure encrypted payment" },
  "checkout.step.auth": { fa: "ورود", en: "Login" },
  "checkout.step.review": { fa: "بررسی", en: "Review" },
  "checkout.step.payment": { fa: "پرداخت", en: "Payment" },
  "checkout.authRequired": { fa: "برای خرید وارد شوید", en: "Login to Checkout" },
  "checkout.loggedInAs": { fa: "وارد شده به عنوان", en: "Logged in as" },
  "checkout.proceedToPayment": { fa: "ادامه به پرداخت", en: "Proceed to Payment" },
  "checkout.paymentMethod": { fa: "روش پرداخت", en: "Payment Method" },
  "checkout.paymentDesc": { fa: "روش پرداخت را انتخاب کنید", en: "Choose your payment method" },
  "checkout.cardToCard": { fa: "کارت به کارت", en: "Card to Card" },
  "checkout.cardToCardDesc": { fa: "انتقال مستقیم به کارت بانکی", en: "Direct bank card transfer" },
  "checkout.back": { fa: "بازگشت", en: "Back" },
  "checkout.confirmPay": { fa: "تأیید و پرداخت", en: "Confirm & Pay" },
  "checkout.orderPlaced": { fa: "سفارش ثبت شد!", en: "Order Placed!" },
  "checkout.failed": { fa: "ثبت سفارش با مشکل مواجه شد", en: "Order placement failed" },
  "checkout.orderId": { fa: "شماره سفارش", en: "Order ID" },
  "checkout.licensesGenerated": { fa: "لایسنس‌های تولید شده", en: "Licenses Generated" },

  // Login
  "login.title": { fa: "ورود به حساب", en: "Login to Account" },
  "login.username": { fa: "نام کاربری", en: "Username" },
  "login.password": { fa: "رمز عبور", en: "Password" },
  "login.remember": { fa: "مرا به خاطر بسپار", en: "Remember me" },
  "login.submit": { fa: "ورود", en: "Login" },
  "login.discord": { fa: "ورود با دیسکورد", en: "Login with Discord" },
  "login.steam": { fa: "ورود با استیم", en: "Login with Steam" },
  "login.tip": {
    fa: "نکته: برای دسترسی مدیر از 'admin' استفاده کنید",
    en: "Tip: use 'admin' for admin access",
  },
  "login.welcome": { fa: "خوش آمدی جنگجو!", en: "Welcome back, Warrior!" },
  "login.loggedInAs": { fa: "وارد شده به عنوان", en: "Logged in as" },
  "login.admin": { fa: "مدیر", en: "Administrator" },
  "login.warrior": { fa: "جنگجو", en: "Warrior" },

  // Auth (inline on cart page)
  "auth.login": { fa: "ورود", en: "Login" },
  "auth.register": { fa: "ثبت‌نام", en: "Register" },
  "auth.username": { fa: "نام کاربری", en: "Username" },
  "auth.usernamePlaceholder": { fa: "نام کاربری خود را وارد کنید", en: "Enter your username" },
  "auth.phone": { fa: "شماره موبایل", en: "Phone Number" },
  "auth.phonePlaceholder": { fa: "09xxxxxxxxx", en: "09xxxxxxxxx" },
  "auth.password": { fa: "رمز عبور", en: "Password" },
  "auth.fillAllFields": { fa: "لطفاً تمام فیلدها را پر کنید", en: "Please fill all fields" },
  "auth.loginSuccess": { fa: "ورود موفق", en: "Login successful" },
  "auth.loginFailed": { fa: "ورود ناموفق", en: "Login failed" },
  "auth.registerSuccess": { fa: "ثبت‌نام موفق", en: "Registration successful" },
  "auth.registerFailed": { fa: "ثبت‌نام ناموفق", en: "Registration failed" },

  // Common
  "common.error": { fa: "خطا", en: "Error" },
  "common.loading": { fa: "در حال بارگذاری...", en: "Loading..." },
  "common.search": { fa: "جستجو...", en: "Search..." },
  "common.close": { fa: "بستن", en: "Close" },
  "common.save": { fa: "ذخیره", en: "Save" },
  "common.cancel": { fa: "لغو", en: "Cancel" },
  "common.delete": { fa: "حذف", en: "Delete" },
  "common.edit": { fa: "ویراش", en: "Edit" },
  "common.back": { fa: "بازگشت", en: "Back" },
  "common.next": { fa: "بعدی", en: "Next" },
  "common.prev": { fa: "قبلی", en: "Previous" },

  // 404
  "404.title": { fa: "۴۰۴", en: "404" },
  "404.heading": { fa: "صفحه یافت نشد", en: "Page Not Found" },
  "404.desc": {
    fa: "به نظر می‌رسد وارد سرزمین ناشناخته شده‌اید",
    en: "It seems you've entered uncharted territory",
  },
  "404.button": { fa: "بازگشت به خانه", en: "Return Home" },

  // Toasts
  "toast.addedToCart": { fa: "به سبد اضافه شد", en: "Added to Cart" },
  "toast.removedFromCart": { fa: "از سبد حذف شد", en: "Removed from Cart" },
  "toast.paymentSuccess": { fa: "پرداخت موفق!", en: "Payment Successful!" },
  "toast.licensesGenerated": {
    fa: "لایسنس تولید شد. پنل لایسنس‌ها را بررسی کنید.",
    en: "license(s) generated. Check your Licenses panel.",
  },
  "toast.ticketCreated": { fa: "تیکت ایجاد شد", en: "Ticket Created" },
  "toast.loggedOut": { fa: "خداحافظ", en: "Logged out" },

  // Go to top
  "gotop.aria": { fa: "رفتن به بالا", en: "Go to top" },

  // Products listing
  "products.title": { fa: "فروشگاه محصولات", en: "PRODUCT STORE" },
  "products.subtitle": {
    fa: "بهترین ابزارهای بازی را با کیفیت بالا و قیمت مناسب تجربه کنید",
    en: "Experience the best gaming tools with high quality and fair pricing",
  },
  "products.noProducts": { fa: "محصولی یافت نشد", en: "No products found" },
  "products.showing": { fa: "نمایش", en: "Showing" },
  "products.of": { fa: "از", en: "of" },
  "products.product": { fa: "محصول", en: "products" },
  "products.filterTag": { fa: "فیلتر برچسب", en: "Tag filter" },
  "products.clearFilter": { fa: "حذف فیلتر", en: "Clear filter" },
  "products.popular": { fa: "محبوب", en: "POPULAR" },
  "products.buy": { fa: "خرید", en: "BUY" },
  "products.reviews": { fa: "نظر", en: "reviews" },
  "products.prev": { fa: "قبلی", en: "Previous" },
  "products.next": { fa: "بعدی", en: "Next" },
  "products.toman": { fa: "تومان", en: "" },
  "products.from": { fa: "از", en: "from" },

  // Product detail page
  "product.game": { fa: "بازی", en: "Game" },
  "product.category": { fa: "دسته‌بندی", en: "Category" },
  "product.about": { fa: "درباره محصول", en: "About This Product" },
  "product.tags": { fa: "برچسب‌ها", en: "Tags" },
  "product.breadcrumb": { fa: "فروشگاه", en: "Shop" },
};

export function t(key: string, lang: Lang): string {
  return translations[key]?.[lang] ?? translations[key]?.["en"] ?? key;
}

export default translations;
