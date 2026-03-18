import { getDatabase, ref, get, remove } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";
import { app } from "./firebase-config.js";

const db = getDatabase(app);
const scriptsList = document.getElementById("scriptsList");

async function loadScripts() {
  const snapshot = await get(ref(db, "scripts"));
  scriptsList.innerHTML = ""; // تنظيف القائمة

  if(snapshot.exists()){
    const scripts = snapshot.val();
    for(const key in scripts){
      const li = document.createElement("li");
      li.textContent = scripts[key].title;

      // زر الحذف
      const delBtn = document.createElement("button");
      delBtn.textContent = "حذف";
      delBtn.onclick = async () => {
        if(confirm("هل أنت متأكد من حذف هذا السكربت؟")){
          await remove(ref(db, `scripts/${key}`));
          alert("تم الحذف!");
          loadScripts(); // إعادة تحميل القائمة
        }
      };

      li.appendChild(delBtn);
      scriptsList.appendChild(li);
    }
  } else {
    scriptsList.textContent = "لا يوجد سكربتات حالياً";
  }
}

loadScripts();
