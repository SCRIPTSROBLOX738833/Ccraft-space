import fs from "fs";

// مثال بيانات السكربتات الحالية
const scripts = [
  { id: "script1", lastMod: "2026-03-21" },
  { id: "script2", lastMod: "2026-03-21" },
  { id: "script3", lastMod: "2026-03-21" },
  // ممكن تضيف كل السكربتات هنا تلقائي لو عندك طريقة للـ export من موقعك
];

// دالة تشفير الرموز الخاصة للـ XML
function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

// توليد كل روابط السكربتات تلقائي
scripts.forEach(script => {
  sitemap += `  <url>\n`;
  sitemap += `    <loc>${escapeXml(`https://ccraftspace.netlify.app/script.html?id=${script.id}`)}</loc>\n`;
  sitemap += `    <lastmod>${escapeXml(script.lastMod)}</lastmod>\n`;
  sitemap += `  </url>\n`;
});

sitemap += `</urlset>`;

// حفظ الملف
fs.writeFileSync("sitemap.xml", sitemap, "utf8");
console.log("Sitemap generated successfully!");
