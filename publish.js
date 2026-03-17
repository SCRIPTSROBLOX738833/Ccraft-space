import { db } from "./firebase-config.js";
import { ref, push, set } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

window.publishScript = async function(e) {
  if (e) e.preventDefault();

  const title = document.getElementById("scriptTitle").value;
  const code = document.getElementById("scriptCode").value;
  const category = document.getElementById("category").value;
  const tags = document.getElementById("tags").value.split(",").map(t => t.trim());

  try {
    const newScriptRef = push(ref(db, "scripts"));
    await set(newScriptRef, { title, code, category, tags, createdAt: Date.now() });
    alert("تم نشر السكربت بنجاح!");
    document.getElementById("publishForm").reset();
  } catch (err) {
    console.error(err);
    alert("فشل النشر، تحقق من إعدادات Firebase");
  }
};
