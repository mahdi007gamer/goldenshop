const Database = require('better-sqlite3');
const db = new Database('prisma/dev.db.backup.1782857779');

console.log('=== COURSES ===');
const courses = db.prepare("SELECT id, title, titleEn, slug, status, productId FROM Course").all();
courses.forEach(c => console.log(c));

console.log('\n=== LESSONS ===');
const lessons = db.prepare("SELECT id, courseId, title, titleEn, \"order\", guideContent, fileUrl, filePassword FROM Lesson").all();
lessons.forEach(l => console.log(l.id, '|', l.courseId, '|', l.title, '|', l.titleEn, '|', l.order, '|', l.guideContent ? 'HAS' : 'NO', '|', l.fileUrl ? 'YES' : 'NO', '|', l.filePassword ? 'YES' : 'NO'));