import { db } from "./firebase-config.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

const scriptsContainer = document.getElementById("scriptsContainer");
const scriptsRef = ref(db, "scripts");

onValue(scriptsRef, (snapshot) => {
  scriptsContainer.innerHTML = "";
  snapshot.forEach(childSnap => {
    const data = childSnap.val();
    const div = document.createElement("div");
    div.className = "script-item";
    div.innerHTML = `
      <h3>${data.title}</h3>
      <p>${data.description}</p>
      <pre><code>${data.code}</code></pre>
      <p>Category: ${data.category} | Tags: ${data.tags?.join(", ")}</p>
    `;
    scriptsContainer.appendChild(div);
  });
});
