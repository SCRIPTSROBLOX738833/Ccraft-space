import { db } from "./firebase-config.js";
import { ref, push, set } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

const publishForm = document.getElementById("publishForm");

publishForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = document.getElementById("scriptTitle").value;
  const description = document.getElementById("scriptDesc").value;
  const code = document.getElementById("scriptCode").value;
  const category = document.getElementById("category").value;
  const tags = document.getElementById("tags").value.split(",").map(t => t.trim());

  const newScriptRef = push(ref(db, "scripts"));
  set(newScriptRef, { title, description, code, category, tags, createdAt: Date.now() })
    .then(() => {
      alert("Script published successfully!");
      publishForm.reset();
    })
    .catch(err => {
      console.error(err);
      alert("Failed to publish script");
    });
});
