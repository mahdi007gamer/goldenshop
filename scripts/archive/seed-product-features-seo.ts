import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

type FeatureDetail = {
  titleFa: string;
  titleEn: string;
  descriptionFa?: string;
  descriptionEn?: string;
  icon?: string;
};

type Feature = {
  fa: string;
  en: string;
  icon: string;
  descFa: string;
  descEn: string;
};

type ProductSeed = {
  slug: string;
  slugEn: string;
  name: string;
  game: string;
  category: string;
  categoryEn: string;
  features: Feature[];
  shortDescEn: string;
  descriptionEn: string;
  metaTitleEn: string;
  metaDescriptionEn: string;
  focusKeyphraseEn: string;
  metaKeywordsEn: string[];
};

const PRODUCTS: ProductSeed[] = [
  {
    slug: 'cheat-dead-by-daylight',
    slugEn: 'dead-by-daylight',
    name: 'Dead by Daylight',
    game: 'Dead by Daylight',
    category: 'ESP Overlay',
    categoryEn: 'ESP Overlay',
    shortDescEn: 'Premium DBD cheat with survivor tracker, killer ESP and hatch finder.',
    descriptionEn:
      '<h2>Dead by Daylight Cheat – Survive Every Trial</h2><p>Dominate every trial with <strong>Dead by Daylight Cheat</strong>, featuring real-time killer ESP, survivor tracker and hatch finder. Stay undetected with stream-proof protection and speed boost.</p><ul><li><strong>Killer ESP</strong> – Track every killer position</li><li><strong>Survivor Tracker</strong> – Know where teammates are</li><li><strong>Hatch Finder</strong> – Locate the hatch instantly</li></ul><p>Free tutorial included. Start surviving today!</p>',
    metaTitleEn: 'Dead by Daylight Cheat | Killer ESP | Golden Cheat',
    metaDescriptionEn:
      'Buy Dead by Daylight cheat with killer ESP, survivor tracker and hatch finder. Free tutorial. Undetected and stream-proof. Start winning trials now!',
    focusKeyphraseEn: 'Dead by Daylight Cheat',
    metaKeywordsEn: [
      'Dead by Daylight Cheat',
      'DBD ESP',
      'Dead by Daylight Hack',
      'DBD Survivor Tracker',
      'DBD Killer ESP',
      'Buy DBD Cheat',
      'Undetected Dead by Daylight Cheat',
    ],
    features: [
      { fa: 'راهنمای بقا در ‏DBD', en: 'DBD Survival Guide', icon: 'Headphones', descFa: 'راهنمای کامل برای بقا در ‏Dead by Daylight', descEn: 'Complete survival guide for Dead by Daylight trials.' },
      { fa: '‏دید قاتل', en: 'Killer ESP', icon: 'Eye', descFa: '‏نمایش موقعیت قاتل از دید', descEn: 'Reveal killer position through walls in real‑time.' },
      { fa: 'ردیاب بازماندگان', en: 'Survivor Tracker', icon: 'Radio', descFa: 'ردیابی تمام بازماندگان در نقشه', descEn: 'Track all survivors on the map at all times.' },
      { fa: '‏یافتن دریچه', en: 'Hatch Finder', icon: 'Target', descFa: 'یافتن سریع دریچه خروج', descEn: 'Instantly locate the escape hatch every trial.' },
      { fa: '‏افزایش سرعت', en: 'Speed Boost', icon: 'Zap', descFa: 'افزایش سرعت حرکت', descEn: 'Increase your movement speed beyond normal limits.' },
      { fa: '‏غیرقابل تشخیص', en: 'Undetected', icon: 'Shield', descFa: 'حفاظت کامل از تشخیص', descEn: 'Full anti‑detection protection on every session.' },
      { fa: 'اثبات استریم', en: 'Stream Proof', icon: 'Wifi', descFa: '‏مخفی در برابر ضبط و استریم', descEn: 'Invisible to screen capture and streaming tools.' },
      { fa: 'آموزش رایگان', en: 'Free Tutorial', icon: 'Headphones', descFa: '‏آموزش کامل استفاده', descEn: 'Free step‑by‑step tutorial for beginners.' },
    ],
  },
  {
    slug: 'cheat-dayz',
    slugEn: 'dayz',
    name: 'DayZ',
    game: 'DayZ',
    category: 'ESP Overlay',
    categoryEn: 'ESP Overlay',
    shortDescEn: 'DayZ ESP, teleport, god mode and item finder — fully undetected.',
    descriptionEn:
      '<h2>DayZ Cheat – Survive the Apocalypse</h2><p>Gain total control of DayZ with <strong>DayZ Cheat</strong>. Player and zombie ESP, teleport, god mode and item finder keep you alive longer than ever.</p><ul><li><strong>Player &amp; Zombie ESP</strong> – See all threats through walls</li><li><strong>Teleport</strong> – Jump anywhere on the map instantly</li><li><strong>God Mode</strong> – Become invincible in combat</li></ul><p>Stay undetected with anti‑ban. Survive longer today!</p>',
    metaTitleEn: 'DayZ Cheat | Teleport & ESP | Golden Cheat',
    metaDescriptionEn:
      'Buy DayZ cheat with player and zombie ESP, teleport and god mode. Anti‑ban protection. Dominate the apocalypse. Get it now!',
    focusKeyphraseEn: 'DayZ Cheat',
    metaKeywordsEn: [
      'DayZ Cheat',
      'DayZ ESP',
      'DayZ Teleport',
      'DayZ God Mode',
      'DayZ Hack',
      'Buy DayZ Cheat',
      'Undetected DayZ Cheat',
    ],
    features: [
      { fa: 'دید بازیکنان و زامبی', en: 'Player & Zombie ESP', icon: 'Eye', descFa: 'نمایش بازیکنان و زامبی از دید', descEn: 'See players and zombies through walls in real‑time.' },
      { fa: 'یافتن آیتم', en: 'Item Finder', icon: 'Target', descFa: 'یافتن سریع لوازم و سلاح', descEn: 'Quickly find weapons and items across the map.' },
      { fa: 'تلپورت', en: 'Teleport', icon: 'Zap', descFa: 'جابجایی آنی در نقشه', descEn: 'Instantly teleport to any location on the map.' },
      { fa: 'حالت خدا', en: 'God Mode', icon: 'Shield', descFa: 'بی‌آسیب ماندن', descEn: 'Become fully invincible during combat.' },
      { fa: 'بدون علف', en: 'No Grass', icon: 'Monitor', descFa: 'حذف علف برای دید بهتر', descEn: 'Remove grass for a clearer line of sight.' },
      { fa: 'ضد بن', en: 'Anti‑Ban', icon: 'Shield', descFa: 'محافظت از بن شدن', descEn: 'Stay protected from all anti‑cheat bans.' },
    ],
  },
  {
    slug: 'cheat-dota-2-umbrella',
    slugEn: 'dota-2-umbrella',
    name: 'Dota 2',
    game: 'Dota 2',
    category: 'Aimbot',
    categoryEn: 'Aimbot',
    shortDescEn: 'Dota 2 umbrella cheat with aimbot, ESP, skin changer and spoofer.',
    descriptionEn:
      '<h2>Dota 2 Umbrella Cheat – Dominate the Rift</h2><p>Master Dota 2 with <strong>Umbrella Cheat</strong>. Anti‑ban spoofer, aimbot, ESP overlay and skin changer all in one tool.</p><ul><li><strong>Aimbot</strong> – Auto‑aim every ability and attack</li><li><strong>ESP Overlay</strong> – See hidden enemies and wards</li><li><strong>Skin Changer</strong> – Unlock all cosmetic skins</li></ul><p>Camera zoom and player analyzer included. Climb faster!</p>',
    metaTitleEn: 'Dota 2 Cheat | Aimbot & ESP | Golden Cheat',
    metaDescriptionEn:
      'Buy Dota 2 umbrella cheat with aimbot, ESP overlay and skin changer. Anti‑ban spoofer. Stream‑proof. Dominate every match today!',
    focusKeyphraseEn: 'Dota 2 Cheat',
    metaKeywordsEn: [
      'Dota 2 Cheat',
      'Dota 2 Aimbot',
      'Dota 2 ESP',
      'Umbrella Dota 2',
      'Dota 2 Hack',
      'Buy Dota 2 Cheat',
      'Undetected Dota 2 Cheat',
    ],
    features: [
      { fa: 'ضد بن اسپوفر', en: 'Anti‑Ban Spoofer', icon: 'Shield', descFa: 'جعل هویت برای ضد بن', descEn: 'Spoof identity to bypass anti‑cheat systems.' },
      { fa: 'ایم‌بات', en: 'Aimbot', icon: 'Crosshair', descFa: 'شلیک خودکار دقیق', descEn: 'Precise auto‑aim for abilities and attacks.' },
      { fa: 'ESP', en: 'ESP Overlay', icon: 'Eye', descFa: 'نمایش دشمنان مخفی', descEn: 'Reveal hidden enemies and wards instantly.' },
      { fa: 'تغییر پوست', en: 'Skin Changer', icon: 'Palette', descFa: 'باز کردن تمام اسکین‌ها', descEn: 'Unlock every cosmetic skin with one click.' },
      { fa: 'تحلیل بازیکن', en: 'Player Analyzer', icon: 'Brain', descFa: 'تحلیل حریفان', descEn: 'Analyze opponents behavior and stats live.' },
      { fa: 'زوم دوربین', en: 'Camera Zoom', icon: 'Monitor', descFa: 'بزرگنمایی دوربین', descEn: 'Zoom out the camera for a wider view.' },
      { fa: 'اثبات استریم', en: 'Stream Proof', icon: 'Wifi', descFa: 'مخفی در استریم', descEn: 'Invisible to stream capture software.' },
    ],
  },
  {
    slug: 'cheat-apex',
    slugEn: 'apex',
    name: 'Apex Legends',
    game: 'Apex',
    category: 'Aimbot',
    categoryEn: 'Aimbot',
    shortDescEn: 'Apex aimbot, wallhack, no recoil, FPS boost and more.',
    descriptionEn:
      '<h2>Apex Legends Cheat – Win Every Match</h2><p>Dominate Apex with <strong>Apex Legends Cheat</strong>. Aimbot, wallhack, ESP overlay, HWID spoofer and no recoil all packed together.</p><ul><li><strong>Aimbot</strong> – Auto‑track every enemy</li><li><strong>Wallhack</strong> – See through all structures</li><li><strong>HWID Spoofer</strong> – Bypass hardware bans</li></ul><p>Fast delivery and stream‑proof. Win more today!</p>',
    metaTitleEn: 'Apex Legends Cheat | Aimbot & ESP | Golden Cheat',
    metaDescriptionEn:
      'Buy Apex Legends cheat with aimbot, wallhack, no recoil and HWID spoofer. Stream‑proof. Fast delivery. Start winning matches now!',
    focusKeyphraseEn: 'Apex Legends Cheat',
    metaKeywordsEn: [
      'Apex Legends Cheat',
      'Apex Aimbot',
      'Apex Legends ESP',
      'Apex Hack',
      'Buy Apex Legends Cheat',
      'Undetected Apex Legends Cheat',
    ],
    features: [
      { fa: 'ایم‌بات', en: 'Aimbot', icon: 'Crosshair', descFa: 'شلیک خودکار به دشمنان', descEn: 'Auto‑track and shoot enemies with precision.' },
      { fa: 'دید دیوارها', en: 'Wallhack', icon: 'Eye', descFa: 'دیدن از پشت دیوار', descEn: 'See enemies through walls and cover.' },
      { fa: 'اسپوفر HWID', en: 'HWID Spoofer', icon: 'Shield', descFa: 'جعل سخت‌افزار', descEn: 'Spoof hardware ID to bypass ban waves.' },
      { fa: 'ESP', en: 'ESP Overlay', icon: 'Eye', descFa: 'نمایش دشمنان و آیتم‌ها', descEn: 'Display enemies and items through walls.' },
      { fa: 'بدون لگد', en: 'No Recoil', icon: 'Target', descFa: 'حذف لگد سلاح', descEn: 'Remove recoil for every weapon instantly.' },
      { fa: 'افزایش FPS', en: 'FPS Boost', icon: 'Cpu', descFa: 'افزایش فریم‌ریت', descEn: 'Boost your FPS for smoother gameplay.' },
      { fa: 'تحویل سریع', en: 'Fast Delivery', icon: 'Download', descFa: 'ارسال سریع لایسنس', descEn: 'Get your license delivered instantly.' },
      { fa: 'اثبات استریم', en: 'Stream Proof', icon: 'Wifi', descFa: 'مخفی در استریم', descEn: 'Fully invisible to stream capture.' },
    ],
  },
  {
    slug: 'cheat-dota-2',
    slugEn: 'dota-2',
    name: 'Dota 2',
    game: 'Dota 2',
    category: 'Camera Config',
    categoryEn: 'Camera Config',
    shortDescEn: 'Dota 2 Melonity cheat with auto last‑hit, skill prediction and map hack.',
    descriptionEn:
      '<h2>Dota 2 Melonity Cheat – Master the Map</h2><p>Enhance Dota 2 with <strong>Melonity</strong>‑style cheat. Map hack, auto last‑hit, skill prediction and camera zoom for higher MMR.</p><ul><li><strong>Map Hack</strong> – Reveal the whole map</li><li><strong>Auto Last‑Hit</strong> – Perfect every creep</li><li><strong>Skill Prediction</strong> – Predict enemy abilities</li></ul><p>Cooldown tracker included. Climb ranked today!</p>',
    metaTitleEn: 'Dota 2 Melonity | Map Hack | Golden Cheat',
    metaDescriptionEn:
      'Buy Dota 2 Melonity cheat with map hack, auto last‑hit and skill prediction. Undetected and daily updates. Boost your MMR now!',
    focusKeyphraseEn: 'Dota 2 Melonity',
    metaKeywordsEn: [
      'Dota 2 Melonity',
      'Melonity Dota 2',
      'Dota 2 Melonity Cheat',
      'Dota 2 Map Hack',
      'Dota 2 Last Hit',
      'Buy Dota 2 Melonity',
    ],
    features: [
      { fa: 'هک نقشه', en: 'Map Hack', icon: 'Radio', descFa: 'دیدن کل نقشه', descEn: 'Reveal the entire map and enemy movements.' },
      { fa: 'لاست‌هیت خودکار', en: 'Auto Last‑Hit', icon: 'Cpu', descFa: 'لاست‌هیت دقیق کریپ', descEn: 'Perfect every last‑hit on creeps automatically.' },
      { fa: 'پیش‌بینی مهارت', en: 'Skill Prediction', icon: 'Brain', descFa: 'پیش‌بینی دشمن', descEn: 'Predict enemy abilities and movements.' },
      { fa: 'زوم دوربین', en: 'Camera Zoom', icon: 'Monitor', descFa: 'بزرگنمایی دوربین بیشتر', descEn: 'Extend the camera zoom for a wider view.' },
      { fa: 'آمار بازیکنان', en: 'Player Stats', icon: 'Brain', descFa: 'نمایش آمار حریفان', descEn: 'View live stats for every player in match.' },
      { fa: 'ردیاب کولدان', en: 'Cooldown Tracker', icon: 'Clock', descFa: 'نمایش زمان کولدان', descEn: 'Track ability cooldowns in real‑time.' },
      { fa: 'غیرقابل تشخیص', en: 'Undetected', icon: 'Shield', descFa: 'محافظت کامل', descEn: 'Fully undetected on every play session.' },
    ],
  },
  {
    slug: 'cheat-pubg-pc',
    slugEn: 'pubg',
    name: 'PUBG PC',
    game: 'Pubg',
    category: 'Cheat Pack',
    categoryEn: 'Cheat Pack',
    shortDescEn: 'PUBG PC cheat pack with aimbot, wallhack and loot ESP.',
    descriptionEn:
      '<h2>PUBG PC Cheat – Dominate the Battleground</h2><p>Get <strong>PUBG PC Cheat</strong> with aimbot, wallhack, ESP overlay, no recoil, loot and vehicle ESP. Fully undetected with auto‑update.</p><ul><li><strong>Aimbot</strong> – Auto‑aim at every enemy</li><li><strong>Loot &amp; Vehicle ESP</strong> – Find gear and rides instantly</li><li><strong>No Recoil</strong> – Perfect spray control</li></ul><p>Stay ahead of patches with auto‑updates. Play now!</p>',
    metaTitleEn: 'PUBG PC Cheat | Aimbot & ESP | Golden Cheat',
    metaDescriptionEn:
      'Buy PUBG PC cheat with aimbot, wallhack, loot and vehicle ESP. No recoil and auto‑update. Dominate every match today!',
    focusKeyphraseEn: 'PUBG PC Cheat',
    metaKeywordsEn: [
      'PUBG PC Cheat',
      'PUBG ESP',
      'PUBG Aimbot',
      'PUBG Hack',
      'Buy PUBG PC Cheat',
      'Undetected PUBG Cheat',
    ],
    features: [
      { fa: 'ایم‌بات', en: 'Aimbot', icon: 'Crosshair', descFa: 'شلیک خودکار دقیق', descEn: 'Precise auto‑aim at enemies instantly.' },
      { fa: 'دید دیوارها', en: 'Wallhack', icon: 'Eye', descFa: 'دیدن از پشت دیوار', descEn: 'See enemies through walls at any distance.' },
      { fa: 'ESP', en: 'ESP Overlay', icon: 'Eye', descFa: 'نمایش دشمنان از دید', descEn: 'Reveal enemies at distance through walls.' },
      { fa: 'بدون لگد', en: 'No Recoil', icon: 'Target', descFa: 'حذف کامل لگد', descEn: 'Fully remove weapon recoil on all guns.' },
      { fa: 'ESP لووت', en: 'Loot ESP', icon: 'Star', descFa: 'دیدن لووت از دید', descEn: 'See high‑tier loot through walls easily.' },
      { fa: 'ESP وسایل', en: 'Vehicle ESP', icon: 'Gamepad2', descFa: 'دیدن وسایل نقلیه', descEn: 'Locate the nearest vehicles on the map.' },
      { fa: 'غیرقابل تشخیص', en: 'Undetected', icon: 'Shield', descFa: 'ضد بن پیشرفته', descEn: 'Advanced anti‑ban protection on every session.' },
      { fa: 'آپدیت خودکار', en: 'Auto‑Update', icon: 'RefreshCw', descFa: 'بروزرسانی خودکار', descEn: 'Auto‑update the cheat after every patch.' },
    ],
  },
  {
    slug: 'cheat-r6-license',
    slugEn: 'r6-siege-license',
    name: 'R6',
    game: 'R6',
    category: 'Cheat',
    categoryEn: 'Cheat',
    shortDescEn: 'R6 cheat with wallhack, ESP, aimbot and full license system.',
    descriptionEn:
      '<h2>Rainbow Six Siege Cheat – Tactical Advantage</h2><p><strong>R6 Cheat</strong> with wallhack, ESP, aimbot, no recoil and glow ESP. Custom panel with daily updates and full license system.</p><ul><li><strong>Wallhack</strong> – See operators through walls</li><li><strong>Glow ESP</strong> – Highlight enemies with glow</li><li><strong>License System</strong> – Protected personal license</li></ul><p>Daily updates guarantee compatibility. Play smarter today!</p>',
    metaTitleEn: 'R6 Cheat | Aimbot & ESP | Golden Cheat',
    metaDescriptionEn:
      'Buy Rainbow Six Siege cheat with wallhack, glow ESP and aimbot. License system with daily updates. Dominate ranked today!',
    focusKeyphraseEn: 'Rainbow Six Siege Cheat',
    metaKeywordsEn: [
      'Rainbow Six Siege Cheat',
      'R6 Cheat',
      'R6 ESP',
      'R6 Hack',
      'Buy R6 Cheat',
      'Undetected R6 Cheat',
    ],
    features: [
      { fa: 'دید دیوارها', en: 'Wallhack', icon: 'Eye', descFa: 'دیدن اپراتورها از دید', descEn: 'See enemy operators through walls instantly.' },
      { fa: 'ESP', en: 'ESP Overlay', icon: 'Eye', descFa: 'نمایش دشمنان', descEn: 'Reveal every enemy position on the map.' },
      { fa: 'ایم‌بات', en: 'Aimbot', icon: 'Crosshair', descFa: 'شلیک خودکار به دشمن', descEn: 'Auto‑aim at enemies with perfect precision.' },
      { fa: 'بدون لگد', en: 'No Recoil', icon: 'Target', descFa: 'حذف لگد سلاح', descEn: 'Remove recoil for every weapon instantly.' },
      { fa: 'ESP درخشان', en: 'Glow ESP', icon: 'Star', descFa: 'درخشش دشمنان', descEn: 'Highlight enemies with glowing outlines.' },
      { fa: 'پنل سفارشی', en: 'Custom Panel', icon: 'Lock', descFa: 'پنل اختصاصی', descEn: 'Personal custom panel with unique options.' },
      { fa: 'سیستم لایسنس', en: 'License System', icon: 'Lock', descFa: 'سیستم لایسنس امن', descEn: 'Safe license system with personal key.' },
      { fa: 'آپدیت روزانه', en: 'Daily Update', icon: 'RefreshCw', descFa: 'بروزرسانی هر روز', descEn: 'Daily updates keep the cheat working.' },
    ],
  },
  {
    slug: 'cheat-csgo',
    slugEn: 'csgo',
    name: 'CS2',
    game: 'CS:GO/CS2',
    category: 'Aim',
    categoryEn: 'Aim',
    shortDescEn: 'CS2 cheat with aimbot, wallhack, triggerbot and skin changer.',
    descriptionEn:
      '<h2>CS2 Cheat – Win Every Round</h2><p>Dominate CS:GO and CS2 with <strong>CS2 Cheat</strong>. Aimbot, wallhack, triggerbot, ESP overlay and skin changer. Undetected with daily updates.</p><ul><li><strong>Aimbot</strong> – Auto‑aim headshots</li><li><strong>Triggerbot</strong> – Fire on crosshair contact</li><li><strong>Skin Changer</strong> – Unlock every weapon skin</li></ul><p>No recoil included. Win rounds now!</p>',
    metaTitleEn: 'CS2 Cheat | Aimbot & ESP | Golden Cheat',
    metaDescriptionEn:
      'Buy CS2 cheat with aimbot, wallhack, triggerbot and skin changer. Undetected and daily updates. Win every round today!',
    focusKeyphraseEn: 'CS2 Cheat',
    metaKeywordsEn: [
      'CS2 Cheat',
      'CSGO Cheat',
      'CS2 Aimbot',
      'CS2 ESP',
      'CS2 Hack',
      'Buy CS2 Cheat',
      'Undetected CS2 Cheat',
    ],
    features: [
      { fa: 'ایم‌بات', en: 'Aimbot', icon: 'Crosshair', descFa: 'شلیک خودکار به سر دشمن', descEn: 'Land headshots automatically every round.' },
      { fa: 'دید دیوارها', en: 'Wallhack', icon: 'Eye', descFa: 'دیدن دشمن از دید', descEn: 'See enemies through walls in real‑time.' },
      { fa: 'تریگربات', en: 'Triggerbot', icon: 'Zap', descFa: 'شلیک خودکار هنگام اصابت', descEn: 'Auto‑fire the moment an enemy hits your crosshair.' },
      { fa: 'ESP', en: 'ESP Overlay', icon: 'Eye', descFa: 'نمایش دشمنان', descEn: 'Reveal all enemies through smoke and walls.' },
      { fa: 'تغییر پوست سلاح', en: 'Skin Changer', icon: 'Palette', descFa: 'باز کردن تمام اسکین‌ها', descEn: 'Unlock every weapon skin instantly.' },
      { fa: 'بدون لگد', en: 'No Recoil', icon: 'Target', descFa: 'حذف لگد کامل', descEn: 'Remove recoil for all weapons completely.' },
      { fa: 'غیرقابل تشخیص', en: 'Undetected', icon: 'Shield', descFa: 'ضد بن کامل', descEn: 'Full anti‑cheat bypass every session.' },
      { fa: 'آپدیت روزانه', en: 'Daily Update', icon: 'RefreshCw', descFa: 'بروزرسانی هر روز', descEn: 'Daily updates after every Valve patch.' },
    ],
  },
  {
    slug: 'cheat-gta5',
    slugEn: 'gta5',
    name: 'GTA 5',
    game: 'GTA',
    category: 'Mod Menu',
    categoryEn: 'Mod Menu',
    shortDescEn: 'GTA 5 mod menu with money boost, god mode and vehicle spawner.',
    descriptionEn:
      '<h2>GTA 5 Cheat – Rule Los Santos</h2><p>Take over GTA 5 with <strong>GTA 5 Mod Menu</strong>. Money boost, god mode, vehicle spawner, weapon unlock and teleport. Fully undetected.</p><ul><li><strong>Money Boost</strong> – Earn cash fast</li><li><strong>Vehicle Spawner</strong> – Spawn any vehicle</li><li><strong>Teleport</strong> – Travel anywhere instantly</li></ul><p>Undetected mod menu. Rule the streets today!</p>',
    metaTitleEn: 'GTA 5 Cheat | Money & Mod | Golden Cheat',
    metaDescriptionEn:
      'Buy GTA 5 mod menu with money boost, god mode and vehicle spawner. Teleport and weapon unlock. Undetected. Rule Los Santos now!',
    focusKeyphraseEn: 'GTA 5 Cheat',
    metaKeywordsEn: [
      'GTA 5 Cheat',
      'GTA 5 Mod Menu',
      'GTA 5 Money',
      'GTA 5 Hack',
      'Buy GTA 5 Cheat',
      'Undetected GTA 5 Cheat',
    ],
    features: [
      { fa: 'افزایش پول', en: 'Money Boost', icon: 'Star', descFa: 'پول بیشتر در بازی', descEn: 'Earn GTA dollars quickly and easily.' },
      { fa: 'حالت خدا', en: 'God Mode', icon: 'Shield', descFa: 'بی‌آسیب در نبرد', descEn: 'Become fully invincible in any combat.' },
      { fa: 'ساخت وسیله', en: 'Vehicle Spawner', icon: 'Gamepad2', descFa: 'ساخت هر وسیله‌ای', descEn: 'Spawn any vehicle instantly with one click.' },
      { fa: 'باز کردن اسلحه', en: 'Weapon Unlock', icon: 'Crosshair', descFa: 'باز کردن تمام سلاح‌ها', descEn: 'Unlock all weapons in GTA 5 immediately.' },
      { fa: 'تلپورت', en: 'Teleport', icon: 'Zap', descFa: 'جابجایی آنی در نقشه', descEn: 'Teleport anywhere on the map instantly.' },
      { fa: 'منو مود', en: 'Mod Menu', icon: 'Palette', descFa: 'منو مود اختصاصی', descEn: 'Custom mod menu with all cheat options.' },
      { fa: 'غیرقابل تشخیص', en: 'Undetected', icon: 'Shield', descFa: 'محافظت از بن شدن', descEn: 'Stay protected from Rockstar anti‑cheat.' },
    ],
  },
  {
    slug: 'cheat-pubg-mobile-tencent',
    slugEn: 'pubg-mobile-tencent',
    name: 'PUBG Mobile Tencent',
    game: 'PUBG Mobile',
    category: 'ESP',
    categoryEn: 'ESP',
    shortDescEn: 'PUBG Mobile Tencent cheat with aimbot, ESP and loot ESP.',
    descriptionEn:
      '<h2>PUBG Mobile Tencent Cheat – Win Royale</h2><p>Dominate PUBG Mobile Tencent with <strong>PUBG Mobile Cheat</strong>. Aimbot, ESP, no recoil, loot ESP and anti‑ban. Custom launcher and private panel.</p><ul><li><strong>Aimbot</strong> – Auto‑aim every enemy</li><li><strong>Loot ESP</strong> – See high tier items</li><li><strong>Custom Launcher</strong> – Safe activation method</li></ul><p>Private panel included. Win every match!</p>',
    metaTitleEn: 'PUBG Mobile Cheat | Aimbot & ESP | Golden Cheat',
    metaDescriptionEn:
      'Buy PUBG Mobile Tencent cheat with aimbot, ESP and loot ESP. Anti‑ban and custom launcher. Win every battle royale today!',
    focusKeyphraseEn: 'PUBG Mobile Tencent Cheat',
    metaKeywordsEn: [
      'PUBG Mobile Cheat',
      'PUBG Mobile Tencent',
      'PUBG Mobile ESP',
      'PUBG Mobile Hack',
      'Buy PUBG Mobile Cheat',
      'Undetected PUBG Mobile',
    ],
    features: [
      { fa: 'ایم‌بات', en: 'Aimbot', icon: 'Crosshair', descFa: 'شلیک خودکار دقیق', descEn: 'Precise auto‑aim at every enemy instantly.' },
      { fa: 'ESP', en: 'ESP Overlay', icon: 'Eye', descFa: 'دیدن دشمنان از دید', descEn: 'Spot enemies through walls and terrain.' },
      { fa: 'بدون لگد', en: 'No Recoil', icon: 'Target', descFa: 'حذف لگد کامل', descEn: 'Remove recoil on every weapon you use.' },
      { fa: 'ESP لووت', en: 'Loot ESP', icon: 'Star', descFa: 'دیدن لووت سطح بالا', descEn: 'See high‑tier loot across the map.' },
      { fa: 'ضد بن', en: 'Anti‑Ban', icon: 'Shield', descFa: 'محافظت از بن شدن', descEn: 'Avoid all bans with anti‑ban protection.' },
      { fa: 'لانچر اختصاصی', en: 'Custom Launcher', icon: 'Download', descFa: 'لانچر امن', descEn: 'Safe custom launcher for activation.' },
      { fa: 'پنل خصوصی', en: 'Private Panel', icon: 'Lock', descFa: 'پنل شخصی اختصاصی', descEn: 'Personal private panel for your license.' },
      { fa: 'آپدیت خودکار', en: 'Auto‑Update', icon: 'RefreshCw', descFa: 'بروزرسانی خودکار', descEn: 'Auto‑update after every game patch.' },
    ],
  },
  {
    slug: 'fps-boost-pack',
    slugEn: 'fps-boost-pack',
    name: 'FPS Boost Pack',
    game: 'Universal',
    category: 'Performance',
    categoryEn: 'Performance',
    shortDescEn: 'FPS boost pack with GPU, CPU optimization and config tuning.',
    descriptionEn:
      '<h2>FPS Boost Pack – Boost Your Gaming Performance</h2><p>Increase FPS across every game with <strong>FPS Boost Pack</strong>. FPS optimization, lag reduction, GPU and CPU optimization, memory cleaning and config tuning.</p><ul><li><strong>FPS Optimization</strong> – Gains in any game</li><li><strong>GPU Boost</strong> – Optimize video card performance</li><li><strong>Config Tuning</strong> – Best config for each title</li></ul><p>Play smoother starting today!</p>',
    metaTitleEn: 'FPS Boost Pack | Less Lag | Golden Cheat',
    metaDescriptionEn:
      'Buy FPS boost pack with GPU, CPU optimization and config tuning. Reduce lag and increase FPS in any game. Play smoother now!',
    focusKeyphraseEn: 'FPS Boost Pack',
    metaKeywordsEn: [
      'FPS Boost',
      'FPS Optimization',
      'Reduce Lag',
      'Gaming FPS Boost',
      'PC FPS Boost',
      'Buy FPS Boost Pack',
    ],
    features: [
      { fa: 'بهینه‌سازی FPS', en: 'FPS Optimization', icon: 'Cpu', descFa: 'افزایش فریم‌ریت در بازی', descEn: 'Increase FPS across every game automatically.' },
      { fa: 'کاهش تاخیر', en: 'Reduce Lag', icon: 'Clock', descFa: 'کاهش تاخیر بازی', descEn: 'Reduce input and network lag while gaming.' },
      { fa: 'تقویت GPU', en: 'GPU Boost', icon: 'Cpu', descFa: 'افزایش کارت گرافیک', descEn: 'Boost your GPU performance for higher FPS.' },
      { fa: 'بهینه‌سازی CPU', en: 'CPU Optimization', icon: 'Cpu', descFa: 'بهینه‌سازی پردازنده', descEn: 'Optimize CPU core usage for gaming.' },
      { fa: 'پاکسازی حافظه', en: 'Memory Clean', icon: 'RefreshCw', descFa: 'پاکسازی RAM قبل از بازی', descEn: 'Clean RAM before launching any game.' },
      { fa: 'تنظیم کانفیگ', en: 'Config Tuning', icon: 'Monitor', descFa: 'تنظیمات بهترین کانفیگ', descEn: 'Best config presets for each game title.' },
    ],
  },
  {
    slug: 'cheat-gta-v',
    slugEn: 'gta-v',
    name: 'GTA V',
    game: 'GTA V',
    category: 'Cheat Pack',
    categoryEn: 'Cheat Pack',
    shortDescEn: 'GTA V cheat pack with god mode, money drops and vehicle spawner.',
    descriptionEn:
      '<h2>GTA V Cheat Pack – Rule the Map</h2><p>Take over GTA V with <strong>GTA V Cheat Pack</strong>. God mode, teleport, money drops, vehicle spawner, weapon mods and radar ESP. Undetected.</p><ul><li><strong>God Mode</strong> – Invincibility in combat</li><li><strong>Money Drops</strong> – Earn cash instantly</li><li><strong>Vehicle Spawner</strong> – Spawn any ride</li></ul><p>Full cheat pack. Dominate GTA V now!</p>',
    metaTitleEn: 'GTA V Cheat Pack | God Mode | Golden Cheat',
    metaDescriptionEn:
      'Buy GTA V cheat pack with god mode, money drops and vehicle spawner. Teleport and weapon mods. Undetected. Rule the map today!',
    focusKeyphraseEn: 'GTA V Cheat Pack',
    metaKeywordsEn: [
      'GTA V Cheat',
      'GTA V Mod Menu',
      'GTA V God Mode',
      'GTA V Hack',
      'Buy GTA V Cheat',
      'Undetected GTA V',
    ],
    features: [
      { fa: 'حالت خدا', en: 'God Mode', icon: 'Shield', descFa: 'بی‌آسیب در نبرد', descEn: 'Become invincible during every fight.' },
      { fa: 'تلپورت', en: 'Teleport', icon: 'Zap', descFa: 'جابجایی آنی', descEn: 'Jump to any location on the map instantly.' },
      { fa: 'ریزش پول', en: 'Money Drops', icon: 'Star', descFa: 'پول بیشتر خودکار', descEn: 'Earn cash quickly with money drops.' },
      { fa: 'ساخت وسیله', en: 'Vehicle Spawner', icon: 'Gamepad2', descFa: 'ساخت هر وسیله', descEn: 'Spawn any car, bike or plane instantly.' },
      { fa: 'مدیفای اسلحه', en: 'Weapon Mods', icon: 'Crosshair', descFa: 'تغییر و ارتقای اسلحه', descEn: 'Modify and upgrade any weapon easily.' },
      { fa: 'رادار ESP', en: 'Radar ESP', icon: 'Radio', descFa: 'نمایش در رادار', descEn: 'Reveal all blips on the minimap.' },
      { fa: 'غیرقابل تشخیص', en: 'Undetected', icon: 'Shield', descFa: 'ضد بن کامل', descEn: 'Full anti‑cheat protection every session.' },
    ],
  },
  {
    slug: 'cheat-pubg-mobile-pro',
    slugEn: 'pubg-mobile',
    name: 'PUBG Mobile Pro',
    game: 'PUBG Mobile',
    category: 'Multi-Hack',
    categoryEn: 'Multi-Hack',
    shortDescEn: 'PUBG Mobile multi‑hack with ESP, aimbot, wallhack and Android support.',
    descriptionEn:
      '<h2>PUBG Mobile Multi‑Hack – Dominate Mobile</h2><p><strong>PUBG Mobile Multi‑Hack</strong> with ESP, aimbot, wallhack, no recoil, speed hack, anti‑ban and Android support. Auto‑updated.</p><ul><li><strong>ESP &amp; Wallhack</strong> – See everyone clearly</li><li><strong>Speed Hack</strong> – Move faster than enemies</li><li><strong>Android Support</strong> – Works on every Android</li></ul><p>Anti‑ban and auto‑update included. Win now!</p>',
    metaTitleEn: 'PUBG Mobile Cheat | Multi‑Hack | Golden Cheat',
    metaDescriptionEn:
      'Buy PUBG Mobile multi‑hack with ESP, aimbot and wallhack. Speed hack and Android support. Anti‑ban. Win every match today!',
    focusKeyphraseEn: 'PUBG Mobile Multi‑Hack',
    metaKeywordsEn: [
      'PUBG Mobile Cheat',
      'PUBG Multi‑Hack',
      'PUBG Mobile ESP',
      'PUBG Mobile Hack',
      'Buy PUBG Mobile Cheat',
      'Undetected PUBG Mobile',
    ],
    features: [
      { fa: 'ESP', en: 'ESP Overlay', icon: 'Eye', descFa: 'نمایش دشمنان از دید', descEn: 'See every enemy through walls clearly.' },
      { fa: 'ایم‌بات', en: 'Aimbot', icon: 'Crosshair', descFa: 'شلیک خودکار دقیق', descEn: 'Precise auto‑aim on mobile devices.' },
      { fa: 'دید دیوارها', en: 'Wallhack', icon: 'Eye', descFa: 'دیدن از پشت دیوار', descEn: 'Spot enemies through terrain and walls.' },
      { fa: 'بدون لگد', en: 'No Recoil', icon: 'Target', descFa: 'حذف لگد کامل', descEn: 'Remove recoil on all weapons instantly.' },
      { fa: 'هک سرعت', en: 'Speed Hack', icon: 'Zap', descFa: 'حرکت سریع‌تر', descEn: 'Move faster than all other players.' },
      { fa: 'ضد بن', en: 'Anti‑Ban', icon: 'Shield', descFa: 'محافظت کامل از بن', descEn: 'Stay protected from every ban wave.' },
      { fa: 'آپدیت خودکار', en: 'Auto‑Update', icon: 'RefreshCw', descFa: 'بروزرسانی هر روز', descEn: 'Auto‑updates after every game update.' },
      { fa: 'پشتیبانی اندروید', en: 'Android Support', icon: 'Download', descFa: 'سازگار با اندروید', descEn: 'Compatible with every Android version.' },
    ],
  },
  {
    slug: 'cheat-scum',
    slugEn: 'scum',
    name: 'SCUM',
    game: 'SCUM',
    category: 'ESP',
    categoryEn: 'ESP',
    shortDescEn: 'SCUM cheat with player ESP, teleport and god mode.',
    descriptionEn:
      '<h2>SCUM Cheat – Survive the Island</h2><p>Dominate SCUM with <strong>SCUM Cheat</strong>. Player ESP, item finder, teleport, god mode, no hunger and speed hack. Undetected.</p><ul><li><strong>Player ESP</strong> – See every player</li><li><strong>Teleport</strong> – Hop anywhere instantly</li><li><strong>No Hunger</strong> – Ignore survival needs</li></ul><p>Stay undetected. Survive longer today!</p>',
    metaTitleEn: 'SCUM Cheat | Player ESP | Golden Cheat',
    metaDescriptionEn:
      'Buy SCUM cheat with player ESP, teleport and god mode. Item finder and no hunger. Undetected. Survive longer today!',
    focusKeyphraseEn: 'SCUM Cheat',
    metaKeywordsEn: [
      'SCUM Cheat',
      'SCUM ESP',
      'SCUM Survival',
      'SCUM Hack',
      'Buy SCUM Cheat',
      'Undetected SCUM',
    ],
    features: [
      { fa: 'ESP بازیکنان', en: 'Player ESP', icon: 'Eye', descFa: 'دیدن تمام بازیکنان', descEn: 'Spot all players on the map instantly.' },
      { fa: 'یافتن آیتم', en: 'Item Finder', icon: 'Target', descFa: 'یافتن سریع لوازم', descEn: 'Find loot, weapons and gear quickly.' },
      { fa: 'تلپورت', en: 'Teleport', icon: 'Zap', descFa: 'جابجایی آنی', descEn: 'Jump to any location on the island.' },
      { fa: 'حالت خدا', en: 'God Mode', icon: 'Shield', descFa: 'بی‌آسیب ماندن', descEn: 'Become invincible at all times.' },
      { fa: 'بدون گرسنگی', en: 'No Hunger', icon: 'Star', descFa: 'نادیده گرفتن گرسنگی', descEn: 'Ignore every survival need while playing.' },
      { fa: 'هک سرعت', en: 'Speed Hack', icon: 'Zap', descFa: 'حرکت سریع‌تر', descEn: 'Move faster than all other players.' },
      { fa: 'غیرقابل تشخیص', en: 'Undetected', icon: 'Shield', descFa: 'ضد بن کامل', descEn: 'Fully protected from all anti‑cheat.' },
    ],
  },
  {
    slug: 'cheat-zula',
    slugEn: 'zula',
    name: 'Zula',
    game: 'Zula',
    category: 'ESP',
    categoryEn: 'ESP',
    shortDescEn: 'Zula cheat with aimbot, wallhack and speed hack — auto‑updated.',
    descriptionEn:
      '<h2>Zula Cheat – Dominate Every Round</h2><p>Dominate Zula with <strong>Zula Cheat</strong>. Aimbot, wallhack, ESP, no recoil, speed hack and anti‑detection. Auto‑updated daily.</p><ul><li><strong>Aimbot</strong> – Auto‑aim enemies</li><li><strong>Speed Hack</strong> – Faster movement</li><li><strong>Anti‑Detection</strong> – Stay safe always</li></ul><p>Auto‑update included. Start winning!</p>',
    metaTitleEn: 'Zula Cheat | Aimbot & ESP | Golden Cheat',
    metaDescriptionEn:
      'Buy Zula cheat with aimbot, wallhack and speed hack. Anti‑detection and auto‑update. Dominate every round. Get it now!',
    focusKeyphraseEn: 'Zula Cheat',
    metaKeywordsEn: [
      'Zula Cheat',
      'Zula ESP',
      'Zula Aimbot',
      'Zula Hack',
      'Buy Zula Cheat',
      'Undetected Zula',
    ],
    features: [
      { fa: 'ایم‌بات', en: 'Aimbot', icon: 'Crosshair', descFa: 'شلیک خودکار دقیق', descEn: 'Auto‑aim at enemies with precision.' },
      { fa: 'دید دیوارها', en: 'Wallhack', icon: 'Eye', descFa: 'دیدن دشمن از دید', descEn: 'See enemies through walls in real time.' },
      { fa: 'ESP', en: 'ESP Overlay', icon: 'Eye', descFa: 'نمایش دشمنان', descEn: 'Reveal all enemies positions on screen.' },
      { fa: 'بدون لگد', en: 'No Recoil', icon: 'Target', descFa: 'حذف لگد کامل', descEn: 'Remove recoil completely on all weapons.' },
      { fa: 'هک سرعت', en: 'Speed Hack', icon: 'Zap', descFa: 'حرکت سریع‌تر', descEn: 'Move faster than all opponents.' },
      { fa: 'ضد تشخیص', en: 'Anti‑Detection', icon: 'Shield', descFa: 'محافظت از بن', descEn: 'Stay safe from all detection methods.' },
      { fa: 'آپدیت خودکار', en: 'Auto‑Update', icon: 'RefreshCw', descFa: 'بروزرسانی روزانه', descEn: 'Daily auto‑update after every patch.' },
    ],
  },
  {
    slug: 'cheat-csgo-system-bot',
    slugEn: 'csgo-system-bot',
    name: 'CS:GO',
    game: 'CS:GO',
    category: 'Lifetime',
    categoryEn: 'Lifetime',
    shortDescEn: 'CS:GO system bot lifetime with auto‑aim and anti‑cheat bypass.',
    descriptionEn:
      '<h2>CSGO System Bot Lifetime – Never Pay Again</h2><p>Buy once, use forever. <strong>CSGO System Bot</strong> with auto‑aim, triggerbot, wallhack, ESP, anti‑cheat bypass, lifetime license and no recoil.</p><ul><li><strong>Auto‑Aim</strong> – Every headshot lands</li><li><strong>Anti‑Cheat Bypass</strong> – Never get caught</li><li><strong>Lifetime License</strong> – One payment forever</li></ul><p>No recoil included. Buy once today!</p>',
    metaTitleEn: 'CSGO Bot | Lifetime Cheat | Golden Cheat',
    metaDescriptionEn:
      'Buy CSGO system bot lifetime cheat with auto‑aim, wallhack and anti‑cheat bypass. Lifetime license and no recoil. One payment forever!',
    focusKeyphraseEn: 'CSGO System Bot Lifetime',
    metaKeywordsEn: [
      'CSGO System Bot',
      'CSGO Lifetime Cheat',
      'CSGO Lifetime Hack',
      'CSGO Auto Aim',
      'Buy CSGO System Bot',
      'Undetected CSGO',
    ],
    features: [
      { fa: 'اتو-ایم', en: 'Auto‑Aim', icon: 'Crosshair', descFa: 'شلیک خودکار به سر', descEn: 'Every shot lands a headshot automatically.' },
      { fa: 'تریگربات', en: 'Triggerbot', icon: 'Zap', descFa: 'شلیک سریع هنگام اصابت', descEn: 'Instant fire on crosshair contact.' },
      { fa: 'دید دیوارها', en: 'Wallhack', icon: 'Eye', descFa: 'دیدن دشمن از دید', descEn: 'See enemies through walls constantly.' },
      { fa: 'ESP', en: 'ESP Overlay', icon: 'Eye', descFa: 'نمایش دشمنان', descEn: 'Reveal enemy positions at all angles.' },
      { fa: 'ضد چیت بای‌پس', en: 'Anti‑Cheat Bypass', icon: 'Shield', descFa: 'عبور از ضدچیت', descEn: 'Bypass every anti‑cheat system instantly.' },
      { fa: 'لایسنس مادام‌العمر', en: 'Lifetime License', icon: 'Lock', descFa: 'پرداخت یک‌باره برای همیشه', descEn: 'Pay once, use forever. No renewal ever.' },
      { fa: 'بدون لگد', en: 'No Recoil', icon: 'Target', descFa: 'حذف لگد کامل', descEn: 'Remove recoil on all weapons permanently.' },
    ],
  },
  {
    slug: 'cheat-pubg-lite',
    slugEn: 'pubg-lite',
    name: 'PUBG Lite',
    game: 'PUBG Lite',
    category: 'ESP',
    categoryEn: 'ESP',
    shortDescEn: 'PUBG Lite cheat with wallhack, aimbot and vehicle ESP.',
    descriptionEn:
      '<h2>PUBG Lite Cheat – Lightweight Domination</h2><p>Dominate PUBG Lite with <strong>PUBG Lite Cheat</strong>. Wallhack, ESP, aimbot, vehicle ESP, anti‑ban and no recoil. Lightweight build for smooth play.</p><ul><li><strong>Wallhack</strong> – See through cover</li><li><strong>Vehicle ESP</strong> – Find rides quickly</li><li><strong>Anti‑Ban</strong> – Stay safe</li></ul><p>Smooth and undetected. Join now!</p>',
    metaTitleEn: 'PUBG Lite Cheat | Aimbot & ESP | Golden Cheat',
    metaDescriptionEn:
      'Buy PUBG Lite cheat with wallhack, aimbot and vehicle ESP. No recoil and anti‑ban. Undetected lightweight build. Dominate today!',
    focusKeyphraseEn: 'PUBG Lite Cheat',
    metaKeywordsEn: [
      'PUBG Lite Cheat',
      'PUBG Lite ESP',
      'PUBG Lite Aimbot',
      'PUBG Lite Hack',
      'Buy PUBG Lite Cheat',
      'Undetected PUBG Lite',
    ],
    features: [
      { fa: 'دید دیوارها', en: 'Wallhack', icon: 'Eye', descFa: 'دیدن از پشت دیوار', descEn: 'See enemies through walls instantly.' },
      { fa: 'ESP', en: 'ESP Overlay', icon: 'Eye', descFa: 'نمایش دشمنان و موارد', descEn: 'Reveal enemies and items through walls.' },
      { fa: 'ایم‌بات', en: 'Aimbot', icon: 'Crosshair', descFa: 'شلیک خودکار دقیق', descEn: 'Auto‑aim at enemies with precision.' },
      { fa: 'ESP وسایل', en: 'Vehicle ESP', icon: 'Gamepad2', descFa: 'دیدن وسایل نقلیه', descEn: 'Locate the nearest vehicle quickly.' },
      { fa: 'ضد بن', en: 'Anti‑Ban', icon: 'Shield', descFa: 'محافظت از بن شدن', descEn: 'Stay protected from every anti‑cheat.' },
      { fa: 'بدون لگد', en: 'No Recoil', icon: 'Target', descFa: 'حذف لگد کامل', descEn: 'Remove recoil on all weapons completely.' },
    ],
  },
  {
    slug: 'cheat-battlefield-6',
    slugEn: 'battlefield-6',
    name: 'Battlefield 6',
    game: 'Battlefield 6',
    category: 'ESP',
    categoryEn: 'ESP',
    shortDescEn: 'Battlefield 6 cheat with wallhack, enemy ESP and BattleEye bypass.',
    descriptionEn:
      '<h2>Battlefield 6 ESP – Dominate the Field</h2><p>Control Battlefield 6 with <strong>BF6 Cheat</strong>. Wallhack, enemy ESP, vehicle ESP, aimbot, no recoil, BattleEye bypass. Daily updates.</p><ul><li><strong>Enemy ESP</strong> – Track every soldier</li><li><strong>Vehicle ESP</strong> – Spot all tanks and APCs</li><li><strong>BattleEye Bypass</strong> – Stay undetected</li></ul><p>Daily updates included. Dominate the field!</p>',
    metaTitleEn: 'Battlefield 6 ESP | Aimbot | Golden Cheat',
    metaDescriptionEn:
      'Buy Battlefield 6 cheat with enemy ESP, vehicle ESP and aimbot. BattleEye bypass and daily updates. Dominate the battlefield today!',
    focusKeyphraseEn: 'Battlefield 6 ESP',
    metaKeywordsEn: [
      'Battlefield 6 Cheat',
      'Battlefield 6 ESP',
      'Battlefield 6 Wallhack',
      'Battlefield 6 Hack',
      'Buy Battlefield 6 Cheat',
      'Undetected Battlefield 6',
    ],
    features: [
      { fa: 'دید دیوارها', en: 'Wallhack', icon: 'Eye', descFa: 'دیدن دشمن از دید', descEn: 'See enemies through cover instantly.' },
      { fa: 'ESP دشمن', en: 'Enemy ESP', icon: 'Eye', descFa: 'نمایش تمام دشمنان', descEn: 'Reveal all enemy soldiers positions.' },
      { fa: 'ESP وسایل', en: 'Vehicle ESP', icon: 'Gamepad2', descFa: 'دیدن تانک و هواپیما', descEn: 'Spot planes and APCs instantly.' },
      { fa: 'ایم‌بات', en: 'Aimbot', icon: 'Crosshair', descFa: 'شلیک خودکار دقیق', descEn: 'Auto‑aim enemies with precision.' },
      { fa: 'بدون لگد', en: 'No Recoil', icon: 'Target', descFa: 'حذف لگد کامل', descEn: 'Remove recoil for every gun instantly.' },
      { fa: 'BattleEye بای‌پس', en: 'BattleEye Bypass', icon: 'Shield', descFa: 'عبور از BattleEye', descEn: 'Bypass BattleEye anti‑cheat fully.' },
      { fa: 'آپدیت روزانه', en: 'Daily Update', icon: 'RefreshCw', descFa: 'بروزرسانی هر روز', descEn: 'Daily updates after every patch.' },
    ],
  },
  {
    slug: 'cheat-mobile-legends',
    slugEn: 'mobile-legends',
    name: 'Mobile Legends',
    game: 'Mobile Legends',
    category: 'ESP',
    categoryEn: 'ESP',
    shortDescEn: 'Mobile Legends cheating with map hack, zoom hack and auto‑combo.',
    descriptionEn:
      '<h2>Mobile Legends Cheat – Climb Ranks Faster</h2><p>Dominate Mobile Legends with <strong>ML Cheat</strong>. Map hack, zoom hack, ESP, auto‑combo, 360 warning and anti‑ban. Undetected.</p><ul><li><strong>Map Hack</strong> – See full map</li><li><strong>Auto‑Combo</strong> – Execute perfect combos</li><li><strong>360 Warning</strong> – Know when enemies approach</li></ul><p>Anti‑ban included. Climb ranks now!</p>',
    metaTitleEn: 'Mobile Legends Cheat | Map Hack | Golden Cheat',
    metaDescriptionEn:
      'Buy Mobile Legends cheat with map hack, zoom hack and ESP. Auto‑combo and 360 warning. Undetected. Climb ranks faster now!',
    focusKeyphraseEn: 'Mobile Legends Cheat',
    metaKeywordsEn: [
      'Mobile Legends Cheat',
      'ML Cheat',
      'Mobile Legends Map Hack',
      'Mobile Legends ESP',
      'Mobile Legends Hack',
      'Buy Mobile Legends Cheat',
    ],
    features: [
      { fa: 'هک نقشه', en: 'Map Hack', icon: 'Radio', descFa: 'دیدن کل نقشه', descEn: 'Reveal the entire minimap instantly.' },
      { fa: 'هک زوم', en: 'Zoom Hack', icon: 'Monitor', descFa: 'بزرگنمایی بیشتر', descEn: 'Zoom out camera for a wider view.' },
      { fa: 'ESP', en: 'ESP Overlay', icon: 'Eye', descFa: 'نمایش دشمن در جنگل', descEn: 'Spot enemies in the jungle instantly.' },
      { fa: 'کومبو خودکار', en: 'Auto‑Combo', icon: 'Cpu', descFa: 'کامبو بدون خطا', descEn: 'Execute perfect ability combos automatically.' },
      { fa: 'هشدار ۳۶۰', en: '360 Warning', icon: 'Radio', descFa: 'هشدار نزدیکی دشمن', descEn: 'Be alerted when enemies are near you.' },
      { fa: 'ضد بن', en: 'Anti‑Ban', icon: 'Shield', descFa: 'محافظت از بن', descEn: 'Stay safe from all ban waves.' },
      { fa: 'غیرقابل تشخیص', en: 'Undetected', icon: 'Shield', descFa: 'امن در تمام بازی‌ها', descEn: 'Fully undetected on every match.' },
    ],
  },
  {
    slug: 'cheat-delta-force',
    slugEn: 'delta-force',
    name: 'Delta Force',
    game: 'Delta Force',
    category: 'ESP',
    categoryEn: 'ESP',
    shortDescEn: 'Delta Force cheat with wallhack, radar hack and aimbot.',
    descriptionEn:
      '<h2>Delta Force Cheat – Tactical Supremacy</h2><p>Dominate Delta Force with <strong>Delta Force Cheat</strong>. Wallhack, ESP, aimbot, no recoil, radar hack, undetected with daily updates.</p><ul><li><strong>Wallhack</strong> – See through cover</li><li><strong>Radar Hack</strong> – Reveal all minimap blips</li><li><strong>Daily Updates</strong> – Always working</li></ul><p>Undetected. Dominate every match now!</p>',
    metaTitleEn: 'Delta Force Cheat | Aimbot & ESP | Golden Cheat',
    metaDescriptionEn:
      'Buy Delta Force cheat with wallhack, radar hack and aimbot. No recoil and daily updates. Undetected. Win every match today!',
    focusKeyphraseEn: 'Delta Force Cheat',
    metaKeywordsEn: [
      'Delta Force Cheat',
      'Delta Force ESP',
      'Delta Force Wallhack',
      'Delta Force Hack',
      'Buy Delta Force Cheat',
      'Undetected Delta Force',
    ],
    features: [
      { fa: 'دید دیوارها', en: 'Wallhack', icon: 'Eye', descFa: 'دیدن از پشت دیوار', descEn: 'See enemies through walls instantly.' },
      { fa: 'ESP', en: 'ESP Overlay', icon: 'Eye', descFa: 'نمایش دشمنان', descEn: 'Reveal enemy positions at all times.' },
      { fa: 'ایم‌بات', en: 'Aimbot', icon: 'Crosshair', descFa: 'شلیک خودکار دقیق', descEn: 'Auto‑aim every enemy with precision.' },
      { fa: 'بدون لگد', en: 'No Recoil', icon: 'Target', descFa: 'حذف لگد کامل', descEn: 'Remove recoil from every weapon.' },
      { fa: 'هک رادار', en: 'Radar Hack', icon: 'Radio', descFa: 'نمایش کامل رادار', descEn: 'Reveal every blip on the minimap.' },
      { fa: 'غیرقابل تشخیص', en: 'Undetected', icon: 'Shield', descFa: 'ضد بن کامل', descEn: 'Fully protected from anti‑cheat.' },
      { fa: 'آپدیت روزانه', en: 'Daily Update', icon: 'RefreshCw', descFa: 'بروزرسانی هر روز', descEn: 'Daily update after each game patch.' },
    ],
  },
  {
    slug: 'cheat-fivem',
    slugEn: 'fivem',
    name: 'FiveM',
    game: 'FiveM',
    category: 'Mod Menu',
    categoryEn: 'Mod Menu',
    shortDescEn: 'FiveM mod menu with god mode, vehicle spawner and skin changer.',
    descriptionEn:
      '<h2>FiveM Cheat – Rule Any Server</h2><p>Dominate any FiveM server with <strong>FiveM Mod Menu</strong>. God mode, vehicle spawner, weapon mods, money boost, teleport, ESP, anti‑ban and skin changer.</p><ul><li><strong>God Mode</strong> – Invincible on any server</li><li><strong>Vehicle Spawner</strong> – Spawn any ride</li><li><strong>Skin Changer</strong> – Unlock all skins</li></ul><p>Anti‑ban included. Rule servers today!</p>',
    metaTitleEn: 'FiveM Cheat | God Mode | Golden Cheat',
    metaDescriptionEn:
      'Buy FiveM mod menu with god mode, vehicle spawner and money boost. ESP and skin changer. Anti‑ban. Rule any server today!',
    focusKeyphraseEn: 'FiveM Cheat',
    metaKeywordsEn: [
      'FiveM Cheat',
      'FiveM Mod Menu',
      'FiveM ESP',
      'FiveM God Mode',
      'FiveM Hack',
      'Buy FiveM Cheat',
    ],
    features: [
      { fa: 'حالت خدا', en: 'God Mode', icon: 'Shield', descFa: 'بی‌آسیب در تمام سرورها', descEn: 'Become invincible on any FiveM server.' },
      { fa: 'ساخت وسیله', en: 'Vehicle Spawner', icon: 'Gamepad2', descFa: 'ساخت هر وسیله', descEn: 'Spawn any vehicle instantly while playing.' },
      { fa: 'مدیفای اسلحه', en: 'Weapon Mods', icon: 'Crosshair', descFa: 'تغییر و ارتقای اسلحه', descEn: 'Modify and upgrade any weapon easily.' },
      { fa: 'افزایش پول', en: 'Money Boost', icon: 'Star', descFa: 'پول بیشتر در FiveM', descEn: 'Earn cash fast on every FiveM server.' },
      { fa: 'تلپورت', en: 'Teleport', icon: 'Zap', descFa: 'جابجایی آنی در سرور', descEn: 'Teleport anywhere on the server instantly.' },
      { fa: 'ESP', en: 'ESP Overlay', icon: 'Eye', descFa: 'نمایش بازیکنان از دید', descEn: 'See all players through walls easily.' },
      { fa: 'ضد بن', en: 'Anti‑Ban', icon: 'Shield', descFa: 'محافظت از بن در سرور', descEn: 'Stay protected on modded servers.' },
      { fa: 'تغییر اسکین', en: 'Skin Changer', icon: 'Palette', descFa: 'باز کردن تمام اسکین‌ها', descEn: 'Unlock every available skin instantly.' },
    ],
  },
  {
    slug: 'cheat-rainbow-six',
    slugEn: 'rainbow-six',
    name: 'Rainbow Six Siege',
    game: 'R6',
    category: 'ESP',
    categoryEn: 'ESP',
    shortDescEn: 'R6 cheat with wallhack, enemy/glow ESP and anti‑detection.',
    descriptionEn:
      '<h2>Rainbow Six Siege Cheat – Tactical Edge</h2><p>Control R6 with <strong>Rainbow Six Siege Cheat</strong>. Wallhack, enemy ESP, glow ESP, aimbot, no recoil, anti‑detection and daily updates.</p><ul><li><strong>Enemy ESP</strong> – Spot every operator</li><li><strong>Glow ESP</strong> – Glowing outlines</li><li><strong>Anti‑Detection</strong> – Always safe</li></ul><p>Daily updates. Win ranked today!</p>',
    metaTitleEn: 'Rainbow Six Cheat | R6 ESP | Golden Cheat',
    metaDescriptionEn:
      'Buy Rainbow Six Siege cheat with enemy ESP, glow ESP and aimbot. Anti‑detection and daily updates. Dominate ranked today!',
    focusKeyphraseEn: 'Rainbow Six Siege Cheat',
    metaKeywordsEn: [
      'Rainbow Six Siege Cheat',
      'R6 Cheat',
      'R6 Wallhack',
      'R6 ESP',
      'R6 Hack',
      'Buy R6 Cheat',
    ],
    features: [
      { fa: 'دید دیوارها', en: 'Wallhack', icon: 'Eye', descFa: 'دیدن اپراتور از دید', descEn: 'See operators through walls instantly.' },
      { fa: 'ESP دشمن', en: 'Enemy ESP', icon: 'Eye', descFa: 'نمایش دشمنان', descEn: 'Reveal every enemy operator position.' },
      { fa: 'ESP درخشان', en: 'Glow ESP', icon: 'Star', descFa: 'درخشش دشمنان', descEn: 'Highlight enemies with glowing outlines.' },
      { fa: 'ایم‌بات', en: 'Aimbot', icon: 'Crosshair', descFa: 'شلیک خودکار دقیق', descEn: 'Auto‑aim at enemies with complete precision.' },
      { fa: 'بدون لگد', en: 'No Recoil', icon: 'Target', descFa: 'حذف لگد کامل', descEn: 'Remove recoil from every R6 weapon.' },
      { fa: 'ضد تشخیص', en: 'Anti‑Detection', icon: 'Shield', descFa: 'محافظت از بن', descEn: 'Stay safe from all detection methods.' },
      { fa: 'آپدیت روزانه', en: 'Daily Update', icon: 'RefreshCw', descFa: 'بروزرسانی هر روز', descEn: 'Daily update after each Ubisoft patch.' },
    ],
  },
  {
    slug: 'cheat-pubg-pc-recoil',
    slugEn: 'pubg-pc-recoil',
    name: 'PUBG PC Recoil',
    game: 'PUBG PC',
    category: 'Recoil Control',
    categoryEn: 'Recoil Control',
    shortDescEn: 'PUBG PC recoil control with natural spray and private panel.',
    descriptionEn:
      '<h2>PUBG Recoil Control – Perfect Spray</h2><p>Eliminate recoil in PUBG PC with <strong>PUBG Recoil Control</strong>. No recoil, natural spray, anti‑detection, daily updates, private panel, license system.</p><ul><li><strong>No Recoil</strong> – Zero vertical spray</li><li><strong>Natural Spray</strong> – Human‑like pattern</li><li><strong>Private Panel</strong> – Personal config</li></ul><p>Anti‑detection included. Download now!</p>',
    metaTitleEn: 'PUBG Recoil Control | No Recoil | Golden Cheat',
    metaDescriptionEn:
      'Buy PUBG recoil control with natural spray and anti‑detection. Daily updates and private panel. Perfect your spray today!',
    focusKeyphraseEn: 'PUBG Recoil Control',
    metaKeywordsEn: [
      'PUBG Recoil',
      'PUBG No Recoil',
      'PUBG Recoil Control',
      'PUBG Spray Control',
      'Buy PUBG Recoil',
      'PUBG Anti Recoil',
    ],
    features: [
      { fa: 'بدون لگد', en: 'No Recoil', icon: 'Target', descFa: 'حذف کامل لگد', descEn: 'Remove all vertical and horizontal recoil.' },
      { fa: 'ا�پری طبیعی', en: 'Natural Spray', icon: 'Target', descFa: 'الگوی شلیک طبیعی', descEn: 'Human‑like spray pattern that looks legit.' },
      { fa: 'ضد تشخیص', en: 'Anti‑Detection', icon: 'Shield', descFa: 'محافظت از بن', descEn: 'Stay safe from all anti‑cheat systems.' },
      { fa: 'آپدیت روزانه', en: 'Daily Update', icon: 'RefreshCw', descFa: 'بروزرسانی هر روز', descEn: 'Auto‑update after every PUBG patch.' },
      { fa: 'پنل اختصاصی', en: 'Private Panel', icon: 'Lock', descFa: 'پنل شخصی شما', descEn: 'Personal private panel with custom config.' },
      { fa: 'سیستم لایسنس', en: 'License System', icon: 'Lock', descFa: 'لایسنس شخصی امن', descEn: 'Safe personal license system for you.' },
    ],
  },
  {
    slug: 'cheat-r6-recoil',
    slugEn: 'r6recoil',
    name: 'R6 Recoil',
    game: 'R6',
    category: 'Recoil Control',
    categoryEn: 'Recoil Control',
    shortDescEn: 'R6 recoil control with natural spray and license system.',
    descriptionEn:
      '<h2>R6 Recoil Control – Perfect Recoil Removal</h2><p>Eliminate recoil in Rainbow Six Siege with <strong>R6 Recoil Control</strong>. No recoil, natural spray, custom panel, license system, daily updates, anti‑detection.</p><ul><li><strong>No Recoil</strong> – Perfect aim every shot</li><li><strong>Custom Panel</strong> – Personal options</li><li><strong>License System</strong> – Safe key system</li></ul><p>Anti‑detection included. Start landing shots now!</p>',
    metaTitleEn: 'R6 Recoil Control | No Recoil | Golden Cheat',
    metaDescriptionEn:
      'Buy R6 recoil control with natural spray and license system. Custom panel and daily updates. Perfect your aim today!',
    focusKeyphraseEn: 'R6 Recoil Control',
    metaKeywordsEn: [
      'R6 Recoil',
      'R6 No Recoil',
      'R6 Recoil Control',
      'Rainbow Six Recoil',
      'Buy R6 Recoil',
      'R6 Recoil Hack',
    ],
    features: [
      { fa: 'بدون لگد', en: 'No Recoil', icon: 'Target', descFa: 'حذف کامل لگد', descEn: 'Remove all recoil from every R6 weapon.' },
      { fa: 'ا�پری طبیعی', en: 'Natural Spray', icon: 'Target', descFa: 'الگوی شلیک طبیعی', descEn: 'Legit‑looking human spray pattern for each gun.' },
      { fa: 'پنل سفارشی', en: 'Custom Panel', icon: 'Lock', descFa: 'پنل اختصاصی شما', descEn: 'Personal custom panel with unique options.' },
      { fa: 'سیستم لایسنس', en: 'License System', icon: 'Lock', descFa: 'لایسنس امن شخصی', descEn: 'Safe, personal license key system.' },
      { fa: 'آپدیت روزانه', en: 'Daily Update', icon: 'RefreshCw', descFa: 'بروزرسانی هر روز', descEn: 'Daily update after every Ubisoft patch.' },
      { fa: 'ضد تشخیص', en: 'Anti‑Detection', icon: 'Shield', descFa: 'محافظت از بن', descEn: 'Stay safe from all anti‑cheat systems.' },
    ],
  },
];

async function main(): Promise<void> {
  let updated = 0;
  for (const prod of PRODUCTS) {
    const featuresDetail: FeatureDetail[] = prod.features.map((f) => ({
      titleFa: f.fa,
      titleEn: f.en,
      descriptionFa: f.descFa,
      descriptionEn: f.descEn,
      icon: f.icon,
    }));

    const data = {
      features: JSON.stringify(prod.features.map((f) => f.fa)),
      featuresEn: JSON.stringify(prod.features.map((f) => f.en)),
      featuresDetail: JSON.stringify(featuresDetail),
      shortDescEn: prod.shortDescEn,
      descriptionEn: prod.descriptionEn,
      metaTitleEn: prod.metaTitleEn,
      metaDescriptionEn: prod.metaDescriptionEn,
      focusKeyphraseEn: prod.focusKeyphraseEn,
      metaKeywordsEn: JSON.stringify(prod.metaKeywordsEn),
      categoryEn: prod.categoryEn,
      ogTitleEn: prod.metaTitleEn,
      ogDescriptionEn: prod.metaDescriptionEn,
      twitterTitleEn: prod.metaTitleEn,
      twitterDescriptionEn: prod.metaDescriptionEn,
      canonicalUrl: `https://goldencheat.com/en/products/${prod.slugEn}`,
    };

    const existing = await p.product.findUnique({ where: { slugEn: prod.slugEn } });
    if (!existing) {
      console.log(`skip ${prod.slug} (slugEn: ${prod.slugEn}) not found`);
      continue;
    }

    await p.product.update({
      where: { slug: prod.slug },
      data,
    });

    updated++;
    console.log(`updated ${prod.slug}`);
  }
  console.log(`\nDone! ${updated}/${PRODUCTS.length} products updated.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
