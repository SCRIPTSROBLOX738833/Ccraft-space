import { database } from "./firebase-config.js";
import { ref, push, set } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

const publishForm = document.getElementById("publishForm");

publishForm.addEventListener("submit", (e) => {
  e.preventDefault(); // يمنع الصفحة من إعادة التحميل

  const title = document.getElementById("scriptTitle").value.trim();
  const code = document.getElementById("scriptCode").value.trim();
  const category = document.getElementById("category").value;
  const tags = document.getElementById("tags").value
               .split(",")
               .map(tag => tag.trim())
               .filter(tag => tag.length > 0);

  if (!title || !code || !category) {
    alert("رجاءً أكمل جميع الحقول المطلوبة");
    return;
  }

  const newScriptRef = push(ref(database, "scripts"));
  set(newScriptRef, {
    title,
    code,
    category,
    tags,
    createdAt: Date.now()
  })
  .then(() => {
    alert("تم نشر السكربت بنجاح!");
    publishForm.reset();
  })
  .catch((err) => {
    console.error(err);
    alert("حدث خطأ أثناء نشر السكربت");
  });
});
