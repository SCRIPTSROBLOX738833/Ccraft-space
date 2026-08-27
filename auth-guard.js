import { supabase } from "./supabase-config.js";

// ⚠️ FIX: النسخة القديمة كانت بتستخدم شيم Firebase (get/ref/getDatabase)
// وبتدور على المستخدم بمسار `users/${user.uid}/banned` — ده كان بيترجم
// جوه الشيم لاستعلام `.eq('id', uid)`، لكن `uid` هنا هو الـ auth_uid
// (معرّف Supabase Auth)، مش عمود `id` الداخلي لجدول users. يعني الفحص
// كان بيفشل يلاقي الصف الصح خالص وميعملش حاجة. كمان اسم العمود الصح
// هو `is_banned` مش `banned`.
// الحل: استعلام مباشر على auth_uid + العمود الصحيح is_banned.
//
// ملحوظة: أي كود قديم كان بينادي guardAgainstBanned(app) لسه هيشتغل
// عادي — أول باراميتر هنا اختياري وبيتقرا كـ options لو فيه redirectTo،
// وأي حاجة تانية (زي كائن app القديم) بيتم تجاهلها بأمان.
export function guardAgainstBanned(options = {}) {
    const redirectTo = (options && options.redirectTo) || 'login.html';

    supabase.auth.onAuthStateChange(async (_event, session) => {
        const user = session?.user;
        if (!user) return;

        let banned = false;
        try {
            const { data } = await supabase
                .from('users')
                .select('is_banned')
                .eq('auth_uid', user.id)
                .maybeSingle();
            banned = !!(data && data.is_banned);
        } catch (e) {
            return;
        }

        if (!banned) return;

        try { await supabase.auth.signOut(); } catch (e) { /* تجاهل */ }

        const msgEl = document.getElementById('banGuardMsg');
        const text = '🚫 حسابك محظور من CCRAFT SPACE. لو ده خطأ، تواصل مع الإدارة.';
        if (msgEl) {
            msgEl.textContent = text;
            msgEl.style.display = 'block';
            setTimeout(() => { location.href = redirectTo; }, 2500);
        } else {
            alert(text);
            location.href = redirectTo;
        }
    });
}
