import { db } from './firebase-config.js';
import { ref, set, get, child } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// نسخ السكربت
window.copyScript = function(id) {
  const codeEl = document.getElementById(`code-${id}`);
  if(!codeEl) return alert("خطأ في السكربت");
  navigator.clipboard.writeText(codeEl.innerText)
    .then(() => alert("تم نسخ السكربت!"))
    .catch(err => alert("حدث خطأ في النسخ: " + err));
}

// تحديث عرض النجوم
function updateStars(stars, avg) {
  stars.forEach(s => s.classList.remove('checked'));
  stars.forEach(s => {
    if(parseInt(s.dataset.value) <= avg) s.classList.add('checked');
  });
}

// تحميل السكربتات
async function loadScripts() {
  const list = document.getElementById('scriptsList');
  list.innerHTML = '';
  const snapshot = await get(ref(db, 'scripts'));

  if(snapshot.exists()) {
    const scripts = snapshot.val();
    Object.keys(scripts).forEach(id => {
      const s = scripts[id];
      const div = document.createElement('div');
      div.className = 'script-card';
      div.dataset.id = id;
      div.innerHTML = `
        <h3>${s.title}</h3>
        <pre id="code-${id}">${s.code}</pre>
        <p>Category: ${s.category}</p>
        <button onclick="copyScript('${id}')">نسخ السكربت</button>
      `;
      list.appendChild(div);
    });
  } else {
    list.innerHTML = '<p>لا توجد سكربتات حتى الآن.</p>';
  }
}

// فلترة السكربتات بزر البحث
function filterScripts() {
  const query = document.getElementById('searchScripts').value.toLowerCase().trim();
  const cards = document.querySelectorAll('.script-card');
  const list = document.getElementById('scriptsList');
  let anyMatch = false;

  cards.forEach(card => {
    const title = card.querySelector('h3').innerText.toLowerCase();
    const category = card.querySelector('p').innerText.toLowerCase();
    const match = title.includes(query) || category.includes(query);
    card.style.display = match ? "block" : "none";
    if(match) anyMatch = true;
  });

  // إزالة رسالة "لا توجد سكربتات" القديمة
  const oldMsg = document.getElementById('noMatchMsg');
  if(oldMsg) oldMsg.remove();

  if(!anyMatch) {
    const p = document.createElement('p');
    p.id = 'noMatchMsg';
    p.innerText = 'لا توجد سكربتات مطابقة.';
    p.style.color = 'red';
    list.appendChild(p);
  }
}

// تفعيل نظام التقييم بعد تحميل السكربتات
function initRatings() {
  document.querySelectorAll('.rating').forEach(rating => {
    const scriptId = rating.dataset.id;
    const stars = rating.querySelectorAll('.star');
    const info = rating.querySelector('.rating-info');

    get(child(ref(db), `ratings/${scriptId}`)).then(snapshot => {
      if(snapshot.exists()) {
        const data = snapshot.val();
        const avg = Math.round(data.total / data.count);
        info.innerText = `(${data.count} تقييم)`;
        updateStars(stars, avg);
      }
    });

    stars.forEach(star => {
      star.addEventListener('click', () => {
        const ratingValue = parseInt(star.dataset.value);
        const ratingRef = ref(db, `ratings/${scriptId}`);
        get(ratingRef).then(snapshot => {
          let data = { total: 0, count: 0 };
          if(snapshot.exists()) data = snapshot.val();
          data.total += ratingValue;
          data.count += 1;
          set(ratingRef, data);

          const avg = Math.round(data.total / data.count);
          info.innerText = `(${data.count} تقييم)`;
          updateStars(stars, avg);
        });
      });
    });
  });
}

// تصدير الدوال للواجهة
window.loadScripts = loadScripts;
window.initRatings = initRatings;
window.copyScript = copyScript;
window.filterScripts = filterScripts;
