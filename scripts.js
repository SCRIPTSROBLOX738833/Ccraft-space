import { db } from './firebase-config.js';
import { ref, set, get, child, update } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

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

// تفعيل نظام التقييم
document.querySelectorAll('.rating').forEach(rating => {
  const scriptId = rating.dataset.id;
  const stars = rating.querySelectorAll('.star');
  const info = rating.querySelector('.rating-info');

  // جلب متوسط التقييم من Firebase
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

// فلترة السكربتات (بحث مباشر)
window.filterScripts = () => {
  const query = document.getElementById('searchScripts')?.value.toLowerCase().trim() || "";
  const cards = document.querySelectorAll('.script-card');
  cards.forEach(card => {
    const title = card.querySelector('h3')?.innerText.toLowerCase() || "";
    const category = card.querySelector('p')?.innerText.toLowerCase() || "";
    card.style.display = (title.includes(query) || category.includes(query)) ? "block" : "none";
  });
};
