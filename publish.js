// Import Firebase functions
import { db } from "./firebase-config.js";
import { ref, push, set } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

// دالة لنشر السكربت
export async function publishScript() {
  const title = document.getElementById("scriptTitle").value;
  const code = document.getElementById("scriptCode").value;
  const category = document.getElementById("category").value;
  const tags = document.getElementById("tags").value.split(",").map(t => t.trim());

  if (!title || !code || !category) {
    alert("يرجى ملء جميع الحقول المطلوبة!");
    return;
  }

  try {
    const newScriptRef = push(ref(db, "scripts"));
    await set(newScriptRef, {
      title,
      code,
      category,
      tags,
      createdAt: Date.now()
    });
    alert("تم نشر السكربت بنجاح!");
    // إعادة ضبط الحقول بعد النشر
    document.getElementById("scriptTitle").value = "";
    document.getElementById("scriptCode").value = "";
    document.getElementById("category").value = "";
    document.getElementById("tags").value = "";
  } catch (err) {
    console.error(err);
    alert("فشل النشر، تحقق من إعدادات Firebase");
  }
}
