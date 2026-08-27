import { supabase } from "./supabase-config.js";

export function guardAgainstBanned(app, options = {}) {
    const redirectTo = options.redirectTo || 'login.html';

    supabase.auth.onAuthStateChange(async (event, session) => {
        const user = session?.user;
        if (!user) return;
        await checkBanned(user, redirectTo);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
        const user = session?.user;
        if (!user) return;
        await checkBanned(user, redirectTo);
    });
}

async function checkBanned(user, redirectTo) {
    let banned = false;
    try {
        const { data, error } = await supabase
            .from('users')
            .select('is_banned')
            .eq('auth_uid', user.id)
            .maybeSingle();
        if (error) throw error;
        banned = data?.is_banned === true;
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
}
