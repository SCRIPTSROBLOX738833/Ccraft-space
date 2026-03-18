const password = prompt("ادخل كلمة السر");

if(password !== "ac6asi6@@7"){
  document.body.innerHTML = "ممنوع الدخول";
}


import { db } from "./firebase-config.js";
import {
  ref,
  onValue,
  remove
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

const scriptsContainer = document.getElementById("scriptsContainer");

const scriptsRef = ref(db, "scripts");

onValue(scriptsRef, (snapshot) => {
  scriptsContainer.innerHTML = "";

  snapshot.forEach((child) => {
    const data = child.val();
    const key = child.key;

    const div = document.createElement("div");
    div.innerHTML = `
      <h3>${data.title}</h3>
      <pre>${data.code}</pre>
      <p>Category: ${data.category}</p>
      <button onclick="deleteScript('${key}')">حذف</button>
      <hr>
    `;

    scriptsContainer.appendChild(div);
  });
});

window.deleteScript = async function(key) {
  await remove(ref(db, "scripts/" + key));
  alert("تم الحذف");
};
