// presence.js — نظام تتبع "المتصلين الآن" الحقيقي (Real-time Presence)
//
// طريقة الاستخدام: ضيف السطر ده في أي صفحة عايز تحسب زوارها ضمن عداد الأونلاين
// (تقدر تحطه في <head> أو قبل نهاية <body>، مايهمش الترتيب):
//
//   <script type="module" src="presence.js"></script>
//
// كل صفحة فيها السطر ده هتسجل نفسها كـ "أونلاين" تلقائيًا، وهتتشال تلقائيًا
// من غير أي كود إضافي لما التاب يتقفل أو النت يتقطع (بفضل onDisconnect).

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getDatabase, ref, set, onDisconnect, onValue } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyD5GP4AjhiruLww-9Ow2DC3JCKyRUNKdz4",
    authDomain: "ccraft-space-scripts.firebaseapp.com",
    databaseURL: "https://ccraft-space-scripts-default-rtdb.firebaseio.com",
    projectId: "ccraft-space-scripts",
    storageBucket: "ccraft-space-scripts.firebasestorage.app",
    messagingSenderId: "816078027492",
    appId: "1:816078027492:web:6472cce474078fd4d90af1",
    measurementId: "G-MHDM7YYYBN"
};

// إعادة استخدام نفس تطبيق Firebase لو الصفحة عندها استدعاء تاني لـ initializeApp
// (عشان منوقعش في خطأ "Firebase App already exists" لو الصفحة فيها سكريبت تاني بيعمل نفس الحاجة)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db  = getDatabase(app);

// جلسة فريدة لكل تاب مفتوح (مش لكل شخص) — بالظبط زي أي عداد أونلاين حقيقي،
// لو نفس الشخص فاتح تابين هيتحسب مرتين، وده طبيعي وصحيح.
let sessionId = sessionStorage.getItem('ccraft_presence_id');
if (!sessionId) {
    sessionId = 'p_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
    sessionStorage.setItem('ccraft_presence_id', sessionId);
}

const myPresenceRef = ref(db, `presence/${sessionId}`);
const currentPage = (location.pathname.split('/').pop() || 'index.html');

function markOnline() {
    set(myPresenceRef, { online: true, ts: Date.now(), page: currentPage });
}

// .info/connected مسار خاص في Firebase بيتفعل تلقائيًا كل ما الاتصال بالسيرفر يترجع
// (أول تحميل، أو بعد ما النت يتقطع ويرجع تاني)
onValue(ref(db, '.info/connected'), (snap) => {
    if (snap.val() === true) {
        // لو التاب اتقفل أو الاتصال اتقطع فجأة، Firebase نفسه هيمسح السطر ده من عنده تلقائيًا
        onDisconnect(myPresenceRef).remove();
        markOnline();
    }
});

// نبضة كل 25 ثانية عشان الـ timestamp يفضل حديث
// (الصفحات اللي بتعرض العداد بتستبعد أي حد الـ ts بتاعه أقدم من 60 ثانية)
setInterval(markOnline, 25000);

// محاولة إضافية (best effort) لمسح الحضور فورًا لو المستخدم غيّر الصفحة بسرعة
window.addEventListener('pagehide', () => {
    try { set(myPresenceRef, null); } catch (e) {}
});
