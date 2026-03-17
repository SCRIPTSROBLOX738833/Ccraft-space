import { db } from "./firebase-config.js";
import { ref, push, set } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

const publishForm = document.getElementById("publishForm");

publishForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // يمنع الصفحة من إعادة التحميل

  const title = document.getElementById("scriptTitle").value.trim();
  const code = document.getElementById("scriptCode").value.trim();
  const category = document.getElementById("category").value;
  const tags = document.getElementById("tags").value.split(",").map(t => t.trim()).filter(t => t);

  if (!title || !code || !category) {
    alert("املأ كل الحقول المطلوبة!");
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
    publishForm.reset();
  } catch (err) {
    console.error(err);
    alert("فشل النشر، تحقق من إعدادات Firebase");
  }
});
