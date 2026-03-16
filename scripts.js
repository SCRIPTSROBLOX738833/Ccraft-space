import { db } from './firebase-config.js';
import { ref, set, get, child, update } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// نسخ السكربت
window.copyScript = function(id) {
  const code = document.getElementById(`code-${id}`).innerText;
  navigator.clipboard.writeText(code)
    .then(() => alert("تم نسخ السكربت!"))
    .catch(err => alert("حدث خطأ في النسخ: " + err));
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
      stars.forEach(s => s.classList.remove('checked'));
      stars.forEach(s => {
        if(s.dataset.value <= avg) s.classList.add('checked');
      });
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
        stars.forEach(s => s.classList.remove('checked'));
        stars.forEach(s => {
          if(s.dataset.value <= avg) s.classList.add('checked');
        });
      });
    });
  });
});
