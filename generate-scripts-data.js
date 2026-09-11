#!/usr/bin/env node
/**
 * generate-scripts-data.js
 * ------------------------------------------------------------
 * يجيب كل السكربتات من Supabase (REST/PostgREST) ويطلع ملف
 * scripts-data.js (window.__SCRIPTS_DATA__) — ده اللي بيستخدمه
 * script.html (صفحة عرض السكربت) و scripts.html (صفحة القائمة)
 * كرسم أولي فوري قبل ما Supabase يرد، لصالح السيو وبوتات الزحف.
 *
 * ⚠️ هُجِّر المصدر من Firebase لـ Supabase — الموقع بالكامل بقى
 * شغال على Supabase، وكانت النسخة القديمة بتجيب من Firebase وده
 * كان معناه إن الملف الثابت بيعرض داتا قديمة/مش متزامنة خالص مع
 * قاعدة البيانات الحقيقية.
 *
 * ملاحظة: مقصودًا بيستبعد حقل الصورة (image_base64) لأنها base64
 * كبيرة جدًا — ده اللي كان بيخلي scripts-data.js يكبر أوي. الصور
 * بترجع عادي أول ما Supabase يرد فعليًا (JS الحي مش متأثر).
 *
 * ترتيب البيانات: created_at تصاعديًا (الأقدم أولاً) — ده مقصود
 * ومتزامن مع scripts.html اللي بيعمل .reverse() على البيانات دي
 * عشان يعرض الأحدث أولاً في الرسم الأولي (لصالح فهرسة جوجل).
 *
 * الاستخدام:
 *   node generate-scripts-data.js
 *
 * الأفضل تشغّله بشكل دوري (مثلاً كل ساعة عبر GitHub Actions cron
 * أو أي جدولة تانية عندك) عشان الملف الثابت يفضل قريب من الداتا
 * الحقيقية.
 * ------------------------------------------------------------
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ⚠️ نفس مفتاح anon/publishable اللي مستخدم فعليًا جوه scripts.html —
// آمن يتحط هنا لأن جدول scripts أصلاً مقروء بالكامل لأي حد
// (RLS policy: scripts_select_all → SELECT true)
const SUPABASE_URL = 'https://nthqrfsdshsreqdoksyv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_kHd5Y4bBnUDJxCFV-aKg-Q_T9XRJckN';

const OUTPUT_FILE = path.join(__dirname, 'scripts-data.js');
const PAGE_SIZE = 1000; // أقصى حجم صفحة يرجّعها PostgREST دفعة واحدة

// الحقول اللي بنجيبها من Supabase — من غير image_base64 (كبيرة جدًا)
const SELECT_FIELDS = [
    'id', 'title', 'code', 'description', 'category',
    'author_name', 'uploader_id', 'created_at',
    'rating', 'votes', 'likes_count', 'views',
    'has_key', 'tags', 'is_verified', 'extra',
].join(',');

// شبكة أمان: أي حقل اسمه فيه "email" بيتشال تلقائيًا حتى لو حد
// ضافه غلط لـ SELECT_FIELDS مستقبلًا (جدول scripts الحالي مفيهوش
// عمود إيميل أصلاً، لكن ده احتياط لأي تغيير مستقبلي في السكيما)
function stripSensitiveFields(obj) {
    for (const key of Object.keys(obj)) {
        if (/email/i.test(key)) delete obj[key];
    }
    return obj;
}

function fetchPage(offset) {
    return new Promise((resolve, reject) => {
        const url = `${SUPABASE_URL}/rest/v1/scripts?select=${SELECT_FIELDS}&order=created_at.asc,id.asc`;
        const options = {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Range-Unit': 'items',
                'Range': `${offset}-${offset + PAGE_SIZE - 1}`,
            },
        };
        https.get(url, options, res => {
            if (res.statusCode < 200 || res.statusCode >= 300) {
                let errBody = '';
                res.on('data', c => { errBody += c; });
                res.on('end', () => reject(new Error(`HTTP ${res.statusCode} — ${url}\n${errBody}`)));
                return;
            }
            let raw = '';
            res.on('data', chunk => { raw += chunk; });
            res.on('end', () => {
                try { resolve(JSON.parse(raw)); }
                catch (e) { reject(e); }
            });
        }).on('error', reject);
    });
}

// يحوّل صف Supabase لشكل مسطّح — map/key بييجوا من جوه عمود extra
// (jsonb)، بنفس الشكل اللي scripts.html بيتوقعه (getMap(s) بيدور
// على s.map الأول، لو مش لاقيه يدوّر جوه s.extra.map)
function slim(row) {
    const out = {
        title: row.title,
        code: row.code,
        description: row.description,
        category: row.category,
        author_name: row.author_name,
        uploader_id: row.uploader_id,
        created_at: row.created_at,
        rating: row.rating,
        votes: row.votes,
        likes_count: row.likes_count,
        views: row.views,
        has_key: row.has_key,
        tags: row.tags,
        is_verified: row.is_verified,
    };
    if (row.extra && row.extra.map) out.map = row.extra.map;
    if (row.extra && row.extra.key) out.key = row.extra.key;

    // نشيل أي مفتاح undefined عشان الملف الناتج يبقى أنضف وأصغر
    for (const k of Object.keys(out)) {
        if (out[k] === undefined || out[k] === null) delete out[k];
    }
    return stripSensitiveFields(out);
}

async function fetchAllScripts() {
    let offset = 0;
    let all = [];
    while (true) {
        const page = await fetchPage(offset);
        if (!Array.isArray(page)) {
            throw new Error('الرد من Supabase مش Array — تأكد من اسم الجدول والصلاحيات (RLS select).');
        }
        all = all.concat(page);
        if (page.length < PAGE_SIZE) break;
        offset += PAGE_SIZE;
    }
    return all;
}

async function main() {
    console.log('⏳ جارٍ جلب السكربتات من Supabase...');
    const rows = await fetchAllScripts();

    const slimmed = {};
    let count = 0;
    for (const row of rows) {
        if (!row || !row.id || !row.title) continue; // تجاهل السجلات التالفة
        slimmed[row.id] = slim(row);
        count++;
    }

    const banner =
`/* ============================================================
   scripts-data.js — يتولّد أوتوماتيك من Supabase، متعدلوش يدوي.
   آخر تحديث: ${new Date().toISOString()}
   عدد السكربتات: ${count}
   ============================================================ */
`;

    const body = `window.__SCRIPTS_DATA__ = ${JSON.stringify(slimmed)};\n`;

    fs.writeFileSync(OUTPUT_FILE, banner + body, 'utf8');

    const sizeKB = (fs.statSync(OUTPUT_FILE).size / 1024).toFixed(1);
    console.log(`✅ تم إنشاء ${OUTPUT_FILE}`);
    console.log(`   ${count} سكربت — الحجم: ${sizeKB} كيلوبايت`);
}

main().catch(err => {
    console.error('❌ فشل توليد scripts-data.js:', err.message);
    process.exit(1);
});
