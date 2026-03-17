import { db } from "./firebase-config.js";
import { ref, push, set } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

export const publishScript = async () => {
  const title = document.getElementById('scriptTitle').value.trim();
  const code = document.getElementById('scriptCode').value.trim();
  const category = document.getElementById('category').value.trim();

  if (!title || !code || !category) {
    return alert("مطلوب كل الحقول!");
  }

  const newScriptRef = push(ref(db, 'scripts'));
  try {
    await set(newScriptRef, {
      title,
      code,
      category,
      timestamp: Date.now(),
      rating: 0,
      votes: 0
    });

    alert("تم نشر السكربت بنجاح!");
    document.getElementById('publishForm').reset();
  } catch (err) {
    console.error(err);
    alert("فشل النشر، تحقق من إعدادات Firebase");
  }
};
