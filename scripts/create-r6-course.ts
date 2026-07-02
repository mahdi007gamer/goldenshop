import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Find R6 product to link
  const r6Product = await prisma.product.findFirst({
    where: {
      game: "R6 Siege",
    },
    select: { id: true, name: true, slug: true },
  });

  if (!r6Product) {
    console.error("No R6 product found. Please seed products first.");
    process.exit(1);
  }

  console.log(`Found R6 product: ${r6Product.name} (${r6Product.id})`);

  // Check if course already exists
  const existingCourse = await prisma.course.findUnique({
    where: { slug: "r6-wallhack-tutorial" },
  });

  if (existingCourse) {
    console.log("Course already exists, updating...");
    await prisma.course.update({
      where: { slug: "r6-wallhack-tutorial" },
      data: {
        productId: r6Product.id,
        status: "published",
        title: "آموزش کامل وال‌هک رینبو اکس شیفت",
        titleEn: "Complete R6 Siege Wallhack Tutorial",
        description: "راهنمای گام به گام استفاده از وال‌هک در Rainbow Six Siege برای دید دشمنان از پشت دیوار",
        descriptionEn: "Step-by-step guide to using wallhack in Rainbow Six Siege to see enemies through walls",
        fullDescription: `
          <h2>دوره آموزشی کامل وال‌هک رینبو سیز سیج</h2>
          <p>این دوره به شما یاد می‌دهد که چگونه از قابلیت وال‌هک (Wallhack/ESP) در رینبو سیز سیج استفاده کنید تا موقعیت دشمنان را از پشت دیوارها و موانع ببینید.</p>
          <h3>چه چیزی یاد می‌گیرید:</h3>
          <ul>
            <li>نصب و راه‌اندازی چیت وال‌هک</li>
            <li>پیکربندی تنظیمات ESP برای بهترین دید</li>
            <li>تنظیمات Bone ESP و Box ESP</li>
            <li>نکات امنیتی برای اجتناب از بن شدن</li>
            <li>عیب‌یابی مشکلات رایج</li>
          </ul>
          <p><strong>پیش‌نیاز:</strong> خرید محصول Valkyrie Structural Radar یا محصول معادل R6 Siege</p>
        `,
        fullDescriptionEn: `
          <h2>Complete R6 Siege Wallhack Tutorial</h2>
          <p>This course teaches you how to use the wallhack (ESP) feature in Rainbow Six Siege to see enemy positions through walls and obstacles.</p>
          <h3>What you'll learn:</h3>
          <ul>
            <li>Installing and setting up the wallhack cheat</li>
            <li>Configuring ESP settings for optimal visibility</li>
            <li>Bone ESP and Box ESP configuration</li>
            <li>Security tips to avoid bans</li>
            <li>Troubleshooting common issues</li>
          </ul>
          <p><strong>Prerequisite:</strong> Purchase of Valkyrie Structural Radar or equivalent R6 Siege product</p>
        `,
        prerequisites: `
          <ul>
            <li>حساب کاربری فعال در Golden Cheat</li>
            <li>خرید محصول Valkyrie Structural Radar</li>
            <li>ویندوز ۱۰/۱۱ (۶۴ بیت)</li>
            <li>دسترسی ادمین برای اجرای چیت</li>
          </ul>
        `,
        prerequisitesEn: `
          <ul>
            <li>Active Golden Cheat account</li>
            <li>Purchase of Valkyrie Structural Radar product</li>
            <li>Windows 10/11 (64-bit)</li>
            <li>Admin privileges to run cheat</li>
          </ul>
        `,
        thumbnail: "/images/courses/r6-wallhack.jpg",
      },
    });

    // Delete existing lessons
    await prisma.lesson.deleteMany({
      where: { courseId: existingCourse.id },
    });

    console.log("Existing course updated, creating new lessons...");
    await createLessons(existingCourse.id);
  } else {
    // Create new course
    const course = await prisma.course.create({
      data: {
        slug: "r6-wallhack-tutorial",
        productId: r6Product.id,
        status: "published",
        title: "آموزش کامل وال‌هک رینبو اکس شیفت",
        titleEn: "Complete R6 Siege Wallhack Tutorial",
        description: "راهنمای گام به گام استفاده از وال‌هک در Rainbow Six Siege برای دید دشمنان از پشت دیوار",
        descriptionEn: "Step-by-step guide to using wallhack in Rainbow Six Siege to see enemies through walls",
        fullDescription: `
          <h2>دوره آموزشی کامل وال‌هک رینبو سیز سیج</h2>
          <p>این دوره به شما یاد می‌دهد که چگونه از قابلیت وال‌هک (Wallhack/ESP) در رینبو سیز سیج استفاده کنید تا موقعیت دشمنان را از پشت دیوارها و موانع ببینید.</p>
          <h3>چه چیزی یاد می‌گیرید:</h3>
          <ul>
            <li>نصب و راه‌اندازی چیت وال‌هک</li>
            <li>پیکربندی تنظیمات ESP برای بهترین دید</li>
            <li>تنظیمات Bone ESP و Box ESP</li>
            <li>نکات امنیتی برای اجتناب از بن شدن</li>
            <li>عیب‌یابی مشکلات رایج</li>
          </ul>
          <p><strong>پیش‌نیاز:</strong> خرید محصول Valkyrie Structural Radar یا محصول معادل R6 Siege</p>
        `,
        fullDescriptionEn: `
          <h2>Complete R6 Siege Wallhack Tutorial</h2>
          <p>This course teaches you how to use the wallhack (ESP) feature in Rainbow Six Siege to see enemy positions through walls and obstacles.</p>
          <h3>What you'll learn:</h3>
          <ul>
            <li>Installing and setting up the wallhack cheat</li>
            <li>Configuring ESP settings for optimal visibility</li>
            <li>Bone ESP and Box ESP configuration</li>
            <li>Security tips to avoid bans</li>
            <li>Troubleshooting common issues</li>
          </ul>
          <p><strong>Prerequisite:</strong> Purchase of Valkyrie Structural Radar or equivalent R6 Siege product</p>
        `,
        prerequisites: `
          <ul>
            <li>حساب کاربری فعال در Golden Cheat</li>
            <li>خرید محصول Valkyrie Structural Radar</li>
            <li>ویندوز ۱۰/۱۱ (۶۴ بیت)</li>
            <li>دسترسی ادمین برای اجرای چیت</li>
          </ul>
        `,
        prerequisitesEn: `
          <ul>
            <li>Active Golden Cheat account</li>
            <li>Purchase of Valkyrie Structural Radar product</li>
            <li>Windows 10/11 (64-bit)</li>
            <li>Admin privileges to run cheat</li>
          </ul>
        `,
        thumbnail: "/images/courses/r6-wallhack.jpg",
        lessons: {
          create: [
            {
              title: "معرفی وال‌هک و نصب",
              order: 1,
              content: `
                <h2>نصب چیت وال‌هک R6 Siege</h2>
                <p>در این درس مراحل نصب و راه‌اندازی اولیه چیت را یاد می‌گیرید.</p>
                <h3>مراحل نصب:</h3>
                <ol>
                  <li>فایل چیت را از بخش دانلود دوره دریافت کنید</li>
                  <li>ویندوز ديفندر و آنتی‌ویروس را موقتاً غیرفعال کنید</li>
                  <li>فایل را به عنوان Administrator اجرا کنید</li>
                  <li>منتظر بمانید تا چیت در حافظه لود شود</li>
                  <li>بازی Rainbow Six Siege را اجرا کنید</li>
                </ol>
                <p class="text-amber-400"><strong>نکته مهم:</strong> حتماً فایل را در پوشه جداگانه و خارج از Program Files اجرا کنید.</p>
              `,
              duration: 15,
              guideContent: JSON.stringify({
                steps: [
                  {
                    step: 1,
                    title: "دانلود فایل چیت",
                    titleEn: "Download Cheat File",
                    description: "فایل را از بخش دانلود دوره دریافت کنید",
                    descriptionEn: "Download the file from the course downloads section",
                    imageUrl: "",
                    videoUrl: "",
                  },
                  {
                    step: 2,
                    title: "غیرفعال کردن آنتی‌ویروس",
                    titleEn: "Disable Antivirus",
                    description: "ویندوز ديفندر و آنتی‌ویروس را موقتاً غیرفعال کنید",
                    descriptionEn: "Temporarily disable Windows Defender and antivirus",
                    imageUrl: "",
                    videoUrl: "",
                  },
                  {
                    step: 3,
                    title: "اجرای به عنوان ادمین",
                    titleEn: "Run as Administrator",
                    description: "فایل را راست‌کلیک کرده و Run as Administrator بزنید",
                    descriptionEn: "Right-click the file and select Run as Administrator",
                    imageUrl: "",
                    videoUrl: "",
                  },
                  {
                    step: 4,
                    title: "منتظر لود شدن",
                    titleEn: "Wait for Load",
                    description: "چیت در حافظه لود می‌شود، چند ثانیه صبر کنید",
                    descriptionEn: "Cheat loads into memory, wait a few seconds",
                    imageUrl: "",
                    videoUrl: "",
                  },
                  {
                    step: 5,
                    title: "اجرای بازی",
                    titleEn: "Launch Game",
                    description: "Rainbow Six Siege را از استیم یا یوپلی اجرا کنید",
                    descriptionEn: "Launch Rainbow Six Siege from Steam or Ubisoft Connect",
                    imageUrl: "",
                    videoUrl: "",
                  },
                ],
              }),
              fileUrl: "/files/r6-wallhack-setup.zip",
              fileName: "r6-wallhack-setup.zip",
              filePassword: "golden123",
            },
            {
              title: "تنظیمات اولیه ESP",
              order: 2,
              content: `
                <h2>پیکربندی تنظیمات ESP</h2>
                <p>تنظیمات اولیه برای فعال‌سازی وال‌هک و تنظیم نمایش دشمنان.</p>
                <h3>فعال‌سازی ESP:</h3>
                <ol>
                  <li>در منوی چیت، کلید <kbd>Insert</kbd> را فشار دهید</li>
                  <li>به تب <strong>Visuals</strong> بروید</li>
                  <li>گزینه <strong>Enable ESP</strong> را فعال کنید</li>
                  <li><strong>Bone ESP</strong> را برای اسکلت دشمنان فعال کنید</li>
                  <li><strong>Box ESP</strong> برای کادر دور بدن فعال کنید</li>
                </ol>
                <h3>تنظیمات پیشنهادی:</h3>
                <ul>
                  <li>ESP Color: قرمز برای دشمن، سبز برای تیم</li>
                  <li>Max Distance: 100 متر</li>
                  <li>Bone Thickness: 2px</li>
                  <li>Box Style: Corner یا Full</li>
                </ul>
              `,
              duration: 20,
              guideContent: JSON.stringify({
                steps: [
                  {
                    step: 1,
                    title: "باز کردن منو",
                    titleEn: "Open Menu",
                    description: "کلید Insert را بزنید تا منوی چیت باز شود",
                    descriptionEn: "Press Insert key to open cheat menu",
                    imageUrl: "",
                    videoUrl: "",
                  },
                  {
                    step: 2,
                    title: "تب Visuals",
                    titleEn: "Visuals Tab",
                    description: "به تب Visuals بروید",
                    descriptionEn: "Navigate to Visuals tab",
                    imageUrl: "",
                    videoUrl: "",
                  },
                  {
                    step: 3,
                    title: "فعال‌سازی ESP",
                    titleEn: "Enable ESP",
                    description: "Enable ESP را تیک بزنید",
                    descriptionEn: "Check Enable ESP",
                    imageUrl: "",
                    videoUrl: "",
                  },
                  {
                    step: 4,
                    title: "Bone ESP",
                    titleEn: "Bone ESP",
                    description: "Bone ESP را برای نمایش اسکلت فعال کنید",
                    descriptionEn: "Enable Bone ESP for skeleton display",
                    imageUrl: "",
                    videoUrl: "",
                  },
                  {
                    step: 5,
                    title: "Box ESP",
                    titleEn: "Box ESP",
                    description: "Box ESP را برای کادر دور بدن فعال کنید",
                    descriptionEn: "Enable Box ESP for body box",
                    imageUrl: "",
                    videoUrl: "",
                  },
                ],
              }),
            },
            {
              title: "نکات امنیتی و عیب‌یابی",
              order: 3,
              content: `
                <h2>امنیت و عیب‌یابی</h2>
                <p>نکات مهم برای حفظ امنیت اکانت و حل مشکلات رایج.</p>
                <h3>نکات امنیتی:</h3>
                <ul>
                  <li><strong>VPN فعال:</strong> همیشه VPN معتبر فعال داشته باشید</li>
                  <li><strong>بازی‌های رنکد:</strong> از استفاده در بازی‌های رنکد پرهیز کنید</li>
                  <li><strong>اسپکتیتور:</strong> وقتی スペクティتور دارید، ESP را غیرفعال کنید</li>
                  <li><strong>به‌روزرسانی:</strong> چیت را هر هفته یکبار به‌روز کنید</li>
                  <li><strong>فایل‌های موقت:</strong> فایل‌های Temp ویندوز را پاک کنید</li>
                </ul>
                <h3>مشکلات رایج:</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-2">مشکل</th>
                      <th className="text-left p-2">راه‌حل</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/5">
                      <td className="p-2">ESP نمایش داده نمی‌شود</td>
                      <td className="p-2">بازی را در حالت Borderless Window اجرا کنید</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="p-2">چیت کرش می‌کند</td>
                      <td className="p-2">Visual C++ Redistributable را آپدیت کنید</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="p-2">فپس دراپ شدید</td>
                      <td className="p-2">Max Distance را کاهش دهید، Bone ESP را خاموش کنید</td>
                    </tr>
                  </tbody>
                </table>
              `,
              duration: 15,
              guideContent: JSON.stringify({
                steps: [
                  {
                    step: 1,
                    title: "استفاده از VPN",
                    titleEn: "Use VPN",
                    description: "همیشه VPN معتبر و پرمیوم فعال داشته باشید",
                    descriptionEn: "Always have a valid premium VPN active",
                    imageUrl: "",
                    videoUrl: "",
                  },
                  {
                    step: 2,
                    title: "اجتناب از رنکد",
                    titleEn: "Avoid Ranked",
                    description: "از استفاده چیت در بازی‌های رنکد پرهیز کنید",
                    descriptionEn: "Avoid using cheat in ranked matches",
                    imageUrl: "",
                    videoUrl: "",
                  },
                  {
                    step: 3,
                    title: "مدیریت اسپکتیتور",
                    titleEn: "Handle Spectators",
                    description: "وقتی روی شما نگاه می‌کنند، ESP را موقتاً خاموش کنید",
                    descriptionEn: "When being spectated, temporarily disable ESP",
                    imageUrl: "",
                    videoUrl: "",
                  },
                  {
                    step: 4,
                    title: "به‌روزرسانی منظم",
                    titleEn: "Regular Updates",
                    description: "چیت را هر هفته از سایت به‌روز کنید",
                    descriptionEn: "Update cheat weekly from website",
                    imageUrl: "",
                    videoUrl: "",
                  },
                  {
                    step: 5,
                    title: "بهینه‌سازی عملکرد",
                    titleEn: "Performance Optimization",
                    description: "Max Distance و Bone ESP را برای فپس بهتر تنظیم کنید",
                    descriptionEn: "Adjust Max Distance and Bone ESP for better FPS",
                    imageUrl: "",
                    videoUrl: "",
                  },
                ],
              }),
            },
          ],
        },
      },
    });

    console.log("Course created successfully:", course.id);
  }

  console.log("✅ R6 Wallhack Tutorial course seeded successfully!");
}

async function createLessons(courseId: string) {
  const lessons = [
    {
      title: "معرفی وال‌هک و نصب",
      order: 1,
      content: `
        <h2>نصب چیت وال‌هک R6 Siege</h2>
        <p>در این درس مراحل نصب و راه‌اندازی اولیه چیت را یاد می‌گیرید.</p>
        <h3>مراحل نصب:</h3>
        <ol>
          <li>فایل چیت را از بخش دانلود دوره دریافت کنید</li>
          <li>ویندوز ديفندر و آنتی‌ویروس را موقتاً غیرفعال کنید</li>
          <li>فایل را به عنوان Administrator اجرا کنید</li>
          <li>منتظر بمانید تا چیت در حافظه لود شود</li>
          <li>بازی Rainbow Six Siege را اجرا کنید</li>
        </ol>
        <p class="text-amber-400"><strong>نکته مهم:</strong> حتماً فایل را در پوشه جداگانه و خارج از Program Files اجرا کنید.</p>
      `,
      duration: 15,
      guideContent: JSON.stringify({
        steps: [
          {
            step: 1,
            title: "دانلود فایل چیت",
            titleEn: "Download Cheat File",
            description: "فایل را از بخش دانلود دوره دریافت کنید",
            descriptionEn: "Download the file from the course downloads section",
            imageUrl: "",
            videoUrl: "",
          },
          {
            step: 2,
            title: "غیرفعال کردن آنتی‌ویروس",
            titleEn: "Disable Antivirus",
            description: "ویندوز ديفندر و آنتی‌ویروس را موقتاً غیرفعال کنید",
            descriptionEn: "Temporarily disable Windows Defender and antivirus",
            imageUrl: "",
            videoUrl: "",
          },
          {
            step: 3,
            title: "اجرای به عنوان ادمین",
            titleEn: "Run as Administrator",
            description: "فایل را راست‌کلیک کرده و Run as Administrator بزنید",
            descriptionEn: "Right-click the file and select Run as Administrator",
            imageUrl: "",
            videoUrl: "",
          },
          {
            step: 4,
            title: "منتظر لود شدن",
            titleEn: "Wait for Load",
            description: "چیت در حافظه لود می‌شود، چند ثانیه صبر کنید",
            descriptionEn: "Cheat loads into memory, wait a few seconds",
            imageUrl: "",
            videoUrl: "",
          },
          {
            step: 5,
            title: "اجرای بازی",
            titleEn: "Launch Game",
            description: "Rainbow Six Siege را از استیم یا یوپلی اجرا کنید",
            descriptionEn: "Launch Rainbow Six Siege from Steam or Ubisoft Connect",
            imageUrl: "",
            videoUrl: "",
          },
        ],
      }),
      fileUrl: "/files/r6-wallhack-setup.zip",
      fileName: "r6-wallhack-setup.zip",
      filePassword: "golden123",
    },
    {
      title: "تنظیمات اولیه ESP",
      order: 2,
      content: `
        <h2>پیکربندی تنظیمات ESP</h2>
        <p>تنظیمات اولیه برای فعال‌سازی وال‌هک و تنظیم نمایش دشمنان.</p>
        <h3>فعال‌سازی ESP:</h3>
        <ol>
          <li>در منوی چیت، کلید <kbd>Insert</kbd> را فشار دهید</li>
          <li>به تب <strong>Visuals</strong> بروید</li>
          <li>گزینه <strong>Enable ESP</strong> را فعال کنید</li>
          <li><strong>Bone ESP</strong> را برای اسکلت دشمنان فعال کنید</li>
          <li><strong>Box ESP</strong> برای کادر دور بدن فعال کنید</li>
        </ol>
        <h3>تنظیمات پیشنهادی:</h3>
        <ul>
          <li>ESP Color: قرمز برای دشمن، سبز برای تیم</li>
          <li>Max Distance: 100 متر</li>
          <li>Bone Thickness: 2px</li>
          <li>Box Style: Corner یا Full</li>
        </ul>
      `,
      duration: 20,
      guideContent: JSON.stringify({
        steps: [
          {
            step: 1,
            title: "باز کردن منو",
            titleEn: "Open Menu",
            description: "کلید Insert را بزنید تا منوی چیت باز شود",
            descriptionEn: "Press Insert key to open cheat menu",
            imageUrl: "",
            videoUrl: "",
          },
          {
            step: 2,
            title: "تب Visuals",
            titleEn: "Visuals Tab",
            description: "به تب Visuals بروید",
            descriptionEn: "Navigate to Visuals tab",
            imageUrl: "",
            videoUrl: "",
          },
          {
            step: 3,
            title: "فعال‌سازی ESP",
            titleEn: "Enable ESP",
            description: "Enable ESP را تیک بزنید",
            descriptionEn: "Check Enable ESP",
            imageUrl: "",
            videoUrl: "",
          },
          {
            step: 4,
            title: "Bone ESP",
            titleEn: "Bone ESP",
            description: "Bone ESP را برای نمایش اسکلت فعال کنید",
            descriptionEn: "Enable Bone ESP for skeleton display",
            imageUrl: "",
            videoUrl: "",
          },
          {
            step: 5,
            title: "Box ESP",
            titleEn: "Box ESP",
            description: "Box ESP را برای کادر دور بدن فعال کنید",
            descriptionEn: "Enable Box ESP for body box",
            imageUrl: "",
            videoUrl: "",
          },
        ],
      }),
    },
    {
      title: "نکات امنیتی و عیب‌یابی",
      order: 3,
      content: `
        <h2>امنیت و عیب‌یابی</h2>
        <p>نکات مهم برای حفظ امنیت اکانت و حل مشکلات رایج.</p>
        <h3>نکات امنیتی:</h3>
        <ul>
          <li><strong>VPN فعال:</strong> همیشه VPN معتبر فعال داشته باشید</li>
          <li><strong>بازی‌های رنکد:</strong> از استفاده در بازی‌های رنکد پرهیز کنید</li>
          <li><strong>اسپکتیتور:</strong> وقتی اسپکتیتور دارید، ESP را غیرفعال کنید</li>
          <li><strong>به‌روزرسانی:</strong> چیت را هر هفته یکبار به‌روز کنید</li>
          <li><strong>فایل‌های موقت:</strong> فایل‌های Temp ویندوز را پاک کنید</li>
        </ul>
        <h3>مشکلات رایج:</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-2">مشکل</th>
              <th className="text-left p-2">راه‌حل</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-white/5">
              <td className="p-2">ESP نمایش داده نمی‌شود</td>
              <td className="p-2">بازی را در حالت Borderless Window اجرا کنید</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="p-2">چیت کرش می‌کند</td>
              <td className="p-2">Visual C++ Redistributable را آپدیت کنید</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="p-2">فپس دراپ شدید</td>
              <td className="p-2">Max Distance را کاهش دهید، Bone ESP را خاموش کنید</td>
            </tr>
          </tbody>
        </table>
      `,
      duration: 15,
      guideContent: JSON.stringify({
        steps: [
          {
            step: 1,
            title: "استفاده از VPN",
            titleEn: "Use VPN",
            description: "همیشه VPN معتبر و پرمیوم فعال داشته باشید",
            descriptionEn: "Always have a valid premium VPN active",
            imageUrl: "",
            videoUrl: "",
          },
          {
            step: 2,
            title: "اجتناب از رنکد",
            titleEn: "Avoid Ranked",
            description: "از استفاده چیت در بازی‌های رنکد پرهیز کنید",
            descriptionEn: "Avoid using cheat in ranked matches",
            imageUrl: "",
            videoUrl: "",
          },
          {
            step: 3,
            title: "مدیریت اسپکتیتور",
            titleEn: "Handle Spectators",
            description: "وقتی روی شما نگاه می‌کنند، ESP را موقتاً خاموش کنید",
            descriptionEn: "When being spectated, temporarily disable ESP",
            imageUrl: "",
            videoUrl: "",
          },
          {
            step: 4,
            title: "به‌روزرسانی منظم",
            titleEn: "Regular Updates",
            description: "چیت را هر هفته از سایت به‌روز کنید",
            descriptionEn: "Update cheat weekly from website",
            imageUrl: "",
            videoUrl: "",
          },
          {
            step: 5,
            title: "بهینه‌سازی عملکرد",
            titleEn: "Performance Optimization",
            description: "Max Distance و Bone ESP را برای فپس بهتر تنظیم کنید",
            descriptionEn: "Adjust Max Distance and Bone ESP for better FPS",
            imageUrl: "",
            videoUrl: "",
          },
        ],
      }),
    },
  ];

  for (const lesson of lessons) {
    await prisma.lesson.create({
      data: {
        courseId,
        ...lesson,
      },
    });
    console.log(`Created lesson: ${lesson.title}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });