// استيراد مكتبات Firebase و Node.js
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";
import fs from "fs"; // Node.js فقط

// إعدادات Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD5GP4AjhiruLww-9Ow2DC3JCKyRUNKdz4",
  authDomain: "ccraft-space-scripts.firebaseapp.com",
  databaseURL: "https://ccraft-space-scripts-default-rtdb.firebaseio.com",
  projectId: "ccraft-space-scripts",
  storageBucket: "ccraft-space-scripts.firebasestorage.app",
  messagingSenderId: "816078027492",
  appId: "1:816078027492:web:6472cce474078fd4d90af1",
  measurementId: "G-MHDM7YYYBN"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function generateSitemap() {
  try {
    const scriptsRef = ref(db, "scripts"); // جميع السكربتات
    const snapshot = await get(scriptsRef);

    if (!snapshot.exists()) {
      console.log("No scripts found in the database.");
      return;
    }

    // بداية ملف Sitemap
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    snapshot.forEach((childSnapshot) => {
      const id = childSnapshot.key; // معرّف السكربت
      const lastMod = childSnapshot.val().lastModified || new Date().toISOString().split("T")[0];

      sitemap += `  <url>\n`;
      sitemap += `    <loc>https://ccraftspace.netlify.app/script.html?id=${id}</loc>\n`;
      sitemap += `    <lastmod>${lastMod}</lastmod>\n`;
      sitemap += `  </url>\n`;
    });

    sitemap += `</urlset>`;

    // حفظ الملف في مجلد المشروع root
    fs.writeFileSync("sitemap.xml", sitemap, "utf8");
    console.log("Sitemap generated successfully!");
  } catch (error) {
    console.error("Error generating sitemap:", error);
  }
}

// تشغيل الوظيفة
generateSitemap();
