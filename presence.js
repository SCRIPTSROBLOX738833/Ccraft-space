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

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db  = getDatabase(app);


let sessionId = localStorage.getItem('ccraft_presence_id');
if (!sessionId) {
    sessionId = 'p_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
    localStorage.setItem('ccraft_presence_id', sessionId);
}

const myPresenceRef = ref(db, `presence/${sessionId}`);
const currentPage = (location.pathname.split('/').pop() || 'index.html');

function markOnline() {
    set(myPresenceRef, { online: true, ts: Date.now(), page: currentPage });
}

onValue(ref(db, '.info/connected'), (snap) => {
    if (snap.val() === true) {
        onDisconnect(myPresenceRef).remove();
        markOnline();
    }
});

setInterval(markOnline, 25000);

window.addEventListener('pagehide', () => {
    try { set(myPresenceRef, null); } catch (e) {}
});
