/**
 * avatar.js — CCRAFT SPACE Character System
 * بيولد SVG للشخصية من بياناتها
 * استخدام: import { buildAvatar, loadAvatar } from './avatar.js'
 */

// ============================================================
// الخيارات المتاحة
// ============================================================

export const AVATAR_OPTIONS = {
    skinColors:  ['#FDDBB4','#F1C27D','#E0AC69','#C68642','#8D5524','#FFE0BD','#FFCD94'],
    hairColors:  ['#1a1a1a','#4a3000','#8B4513','#D2691E','#DAA520','#C0C0C0','#ffffff','#8b5cf6','#00f2fe','#f87171'],
    eyeColors:   ['#1a1a2e','#2d5a27','#4a3000','#1565C0','#6a0dad','#00838F'],
    lipColors:   ['#c0686a','#e08080','#ff9999','#8B2252','#d4736e'],
    outfitColors:['#8b5cf6','#3b82f6','#10b981','#f59e0b','#ef4444','#6366f1','#0ea5e9','#1a1a2e','#fff','#f472b6'],
};

export const HAIR_STYLES = ['short','long','curly','bun','mohawk','none'];
export const OUTFIT_STYLES = ['hoodie','tshirt','suit','jacket','robe'];
export const EYE_STYLES = ['normal','happy','cool','sleepy'];
export const ACCESSORY_STYLES = ['none','glasses','crown','headphones','hat'];

// ============================================================
// Default character
// ============================================================

export const DEFAULT_CHAR = {
    skinColor:   '#F1C27D',
    hairColor:   '#1a1a1a',
    hairStyle:   'short',
    eyeColor:    '#1a1a2e',
    eyeStyle:    'normal',
    lipColor:    '#c0686a',
    outfitColor: '#8b5cf6',
    outfitStyle: 'hoodie',
    accessory:   'none',
};

// ============================================================
// buildAvatar(char, size) — يرجع SVG string
// ============================================================

export function buildAvatar(char = {}, size = 80) {
    const c = { ...DEFAULT_CHAR, ...char };
    const s = size;
    const cx = s / 2;

    // نسب ثابتة
    const headR    = s * 0.22;
    const headCY   = s * 0.30;
    const bodyTop  = headCY + headR - 2;
    const bodyH    = s * 0.30;
    const bodyW    = s * 0.36;
    const neckH    = s * 0.05;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
        <defs>
            <clipPath id="circle-clip-${s}">
                <circle cx="${cx}" cy="${cx}" r="${cx - 2}"/>
            </clipPath>
            <radialGradient id="skin-grad-${s}" cx="50%" cy="40%">
                <stop offset="0%" stop-color="${lighten(c.skinColor, 15)}"/>
                <stop offset="100%" stop-color="${c.skinColor}"/>
            </radialGradient>
        </defs>

        <!-- خلفية -->
        <circle cx="${cx}" cy="${cx}" r="${cx - 1}" fill="#1a1a2e" stroke="rgba(139,92,246,0.4)" stroke-width="1.5"/>

        <g clip-path="url(#circle-clip-${s})">
            <!-- الملابس/الجسم -->
            ${drawOutfit(c, cx, bodyTop, bodyW, bodyH, s)}

            <!-- الرقبة -->
            <rect x="${cx - s*0.06}" y="${headCY + headR - 2}" width="${s*0.12}" height="${neckH + 4}"
                  fill="${c.skinColor}" rx="2"/>

            <!-- الرأس -->
            <ellipse cx="${cx}" cy="${headCY}" rx="${headR}" ry="${headR * 1.05}"
                     fill="url(#skin-grad-${s})"/>

            <!-- الأذنان -->
            <ellipse cx="${cx - headR + 1}" cy="${headCY + 2}" rx="${s*0.035}" ry="${s*0.045}" fill="${c.skinColor}"/>
            <ellipse cx="${cx + headR - 1}" cy="${headCY + 2}" rx="${s*0.035}" ry="${s*0.045}" fill="${c.skinColor}"/>

            <!-- الشعر -->
            ${drawHair(c, cx, headCY, headR, s)}

            <!-- العيون -->
            ${drawEyes(c, cx, headCY, headR, s)}

            <!-- الأنف -->
            <ellipse cx="${cx}" cy="${headCY + headR*0.25}" rx="${s*0.02}" ry="${s*0.025}"
                     fill="${darken(c.skinColor, 15)}" opacity="0.5"/>

            <!-- الفم -->
            ${drawMouth(c, cx, headCY, headR, s)}

            <!-- الإكسسوار -->
            ${drawAccessory(c, cx, headCY, headR, s)}
        </g>
    </svg>`;
}

// ============================================================
// رسم الشعر
// ============================================================

function drawHair(c, cx, cy, r, s) {
    const hc = c.hairColor;
    if (c.hairStyle === 'none') return '';

    if (c.hairStyle === 'short') return `
        <ellipse cx="${cx}" cy="${cy - r*0.6}" rx="${r*1.05}" ry="${r*0.55}" fill="${hc}"/>
        <rect x="${cx - r}" y="${cy - r*0.5}" width="${r*2}" height="${r*0.3}" fill="${hc}"/>
        <ellipse cx="${cx - r + 1}" cy="${cy}" rx="${s*0.045}" ry="${r*0.4}" fill="${hc}"/>
        <ellipse cx="${cx + r - 1}" cy="${cy}" rx="${s*0.045}" ry="${r*0.4}" fill="${hc}"/>
    `;

    if (c.hairStyle === 'long') return `
        <ellipse cx="${cx}" cy="${cy - r*0.6}" rx="${r*1.05}" ry="${r*0.55}" fill="${hc}"/>
        <rect x="${cx - r}" y="${cy - r*0.5}" width="${r*2}" height="${r*0.3}" fill="${hc}"/>
        <rect x="${cx - r - 2}" y="${cy}" width="${r*0.55}" height="${r*1.8}" fill="${hc}" rx="6"/>
        <rect x="${cx + r - r*0.55 + 2}" y="${cy}" width="${r*0.55}" height="${r*1.8}" fill="${hc}" rx="6"/>
    `;

    if (c.hairStyle === 'curly') return `
        <ellipse cx="${cx}" cy="${cy - r*0.5}" rx="${r*1.15}" ry="${r*0.65}" fill="${hc}"/>
        ${[...Array(6)].map((_, i) => {
            const angle = (i / 6) * Math.PI * 2 - Math.PI/2;
            const ex = cx + (r + s*0.05) * Math.cos(angle);
            const ey = cy - r*0.3 + (r + s*0.05) * Math.sin(angle) * 0.5;
            return `<circle cx="${ex}" cy="${ey}" r="${s*0.055}" fill="${hc}"/>`;
        }).join('')}
    `;

    if (c.hairStyle === 'bun') return `
        <ellipse cx="${cx}" cy="${cy - r*0.6}" rx="${r*1.05}" ry="${r*0.4}" fill="${hc}"/>
        <circle cx="${cx}" cy="${cy - r*1.05}" r="${r*0.4}" fill="${hc}"/>
        <circle cx="${cx}" cy="${cy - r*1.05}" r="${r*0.22}" fill="${darken(hc, 10)}"/>
    `;

    if (c.hairStyle === 'mohawk') return `
        <ellipse cx="${cx}" cy="${cy - r*0.6}" rx="${r*1.05}" ry="${r*0.35}" fill="${hc}"/>
        <rect x="${cx - s*0.05}" y="${cy - r*1.6}" width="${s*0.10}" height="${r*1.1}" fill="${hc}" rx="4"/>
    `;

    return '';
}

// ============================================================
// رسم العيون
// ============================================================

function drawEyes(c, cx, cy, r, s) {
    const ex1 = cx - r*0.38, ex2 = cx + r*0.38;
    const ey  = cy - r*0.08;
    const er  = s * 0.045;
    const ec  = c.eyeColor;

    if (c.eyeStyle === 'happy') return `
        <path d="M ${ex1-er} ${ey} Q ${ex1} ${ey - er*1.2} ${ex1+er} ${ey}" stroke="${ec}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <path d="M ${ex2-er} ${ey} Q ${ex2} ${ey - er*1.2} ${ex2+er} ${ey}" stroke="${ec}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    `;

    if (c.eyeStyle === 'cool') return `
        <line x1="${ex1 - er}" y1="${ey - er*0.3}" x2="${ex1 + er}" y2="${ey - er*0.3}" stroke="${ec}" stroke-width="2" stroke-linecap="round"/>
        <line x1="${ex2 - er}" y1="${ey - er*0.3}" x2="${ex2 + er}" y2="${ey - er*0.3}" stroke="${ec}" stroke-width="2" stroke-linecap="round"/>
        <ellipse cx="${ex1}" cy="${ey + er*0.3}" rx="${er*0.9}" ry="${er*0.55}" fill="${ec}"/>
        <ellipse cx="${ex2}" cy="${ey + er*0.3}" rx="${er*0.9}" ry="${er*0.55}" fill="${ec}"/>
        <circle cx="${ex1 + er*0.25}" cy="${ey + er*0.15}" r="${er*0.25}" fill="white"/>
        <circle cx="${ex2 + er*0.25}" cy="${ey + er*0.15}" r="${er*0.25}" fill="white"/>
    `;

    if (c.eyeStyle === 'sleepy') return `
        <path d="M ${ex1-er} ${ey} Q ${ex1} ${ey + er} ${ex1+er} ${ey}" stroke="${ec}" stroke-width="1.5" fill="${lighten(ec,40)}" stroke-linecap="round"/>
        <path d="M ${ex2-er} ${ey} Q ${ex2} ${ey + er} ${ex2+er} ${ey}" stroke="${ec}" stroke-width="1.5" fill="${lighten(ec,40)}" stroke-linecap="round"/>
    `;

    // normal
    return `
        <ellipse cx="${ex1}" cy="${ey}" rx="${er}" ry="${er*1.1}" fill="white"/>
        <ellipse cx="${ex2}" cy="${ey}" rx="${er}" ry="${er*1.1}" fill="white"/>
        <circle cx="${ex1}" cy="${ey}" r="${er*0.65}" fill="${ec}"/>
        <circle cx="${ex2}" cy="${ey}" r="${er*0.65}" fill="${ec}"/>
        <circle cx="${ex1}" cy="${ey}" r="${er*0.28}" fill="#000" opacity="0.85"/>
        <circle cx="${ex2}" cy="${ey}" r="${er*0.28}" fill="#000" opacity="0.85"/>
        <circle cx="${ex1 + er*0.22}" cy="${ey - er*0.22}" r="${er*0.14}" fill="white"/>
        <circle cx="${ex2 + er*0.22}" cy="${ey - er*0.22}" r="${er*0.14}" fill="white"/>
        <!-- حواجب -->
        <path d="M ${ex1-er*0.9} ${ey-er*1.4} Q ${ex1} ${ey-er*1.9} ${ex1+er*0.9} ${ey-er*1.4}"
              stroke="${c.hairColor}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <path d="M ${ex2-er*0.9} ${ey-er*1.4} Q ${ex2} ${ey-er*1.9} ${ex2+er*0.9} ${ey-er*1.4}"
              stroke="${c.hairColor}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    `;
}

// ============================================================
// رسم الفم
// ============================================================

function drawMouth(c, cx, cy, r, s) {
    const my = cy + r * 0.5;
    const mw = r * 0.55;
    return `
        <path d="M ${cx - mw} ${my} Q ${cx} ${my + r*0.28} ${cx + mw} ${my}"
              stroke="${c.lipColor}" stroke-width="1.4" fill="${lighten(c.lipColor, 20)}" opacity="0.85"
              stroke-linecap="round"/>
    `;
}

// ============================================================
// رسم الملابس
// ============================================================

function drawOutfit(c, cx, bodyTop, bodyW, bodyH, s) {
    const oc = c.outfitColor;
    const bx = cx - bodyW/2;
    const by = bodyTop + s*0.04;

    if (c.outfitStyle === 'hoodie') return `
        <rect x="${bx}" y="${by}" width="${bodyW}" height="${bodyH}" fill="${oc}" rx="10"/>
        <!-- كيس الهودي -->
        <path d="M ${cx - bodyW*0.18} ${by} Q ${cx} ${by + bodyH*0.25} ${cx + bodyW*0.18} ${by}"
              fill="${darken(oc,15)}" opacity="0.7"/>
        <!-- جيب -->
        <rect x="${cx - bodyW*0.25}" y="${by + bodyH*0.55}" width="${bodyW*0.5}" height="${bodyH*0.3}"
              fill="${darken(oc,20)}" rx="5" opacity="0.6"/>
        <!-- أكمام -->
        <rect x="${bx - s*0.06}" y="${by}" width="${s*0.1}" height="${bodyH*0.65}" fill="${oc}" rx="5"/>
        <rect x="${bx + bodyW - s*0.04}" y="${by}" width="${s*0.1}" height="${bodyH*0.65}" fill="${oc}" rx="5"/>
    `;

    if (c.outfitStyle === 'tshirt') return `
        <rect x="${bx}" y="${by}" width="${bodyW}" height="${bodyH}" fill="${oc}" rx="8"/>
        <rect x="${bx - s*0.06}" y="${by}" width="${s*0.10}" height="${bodyH*0.45}" fill="${oc}" rx="4"/>
        <rect x="${bx + bodyW - s*0.04}" y="${by}" width="${s*0.10}" height="${bodyH*0.45}" fill="${oc}" rx="4"/>
        <!-- خط رقبة -->
        <path d="M ${cx - bodyW*0.2} ${by + 2} Q ${cx} ${by + s*0.06} ${cx + bodyW*0.2} ${by + 2}"
              stroke="${darken(oc,20)}" stroke-width="1.2" fill="none"/>
    `;

    if (c.outfitStyle === 'suit') return `
        <rect x="${bx}" y="${by}" width="${bodyW}" height="${bodyH}" fill="${darken(oc,10)}" rx="8"/>
        <!-- قميص أبيض -->
        <rect x="${cx - bodyW*0.18}" y="${by}" width="${bodyW*0.36}" height="${bodyH}" fill="white" opacity="0.9"/>
        <!-- كرافتة -->
        <path d="M ${cx - s*0.03} ${by + s*0.02} L ${cx} ${by + bodyH*0.7} L ${cx + s*0.03} ${by + s*0.02} Z"
              fill="#ef4444"/>
        <!-- طوق السترة -->
        <path d="M ${cx - bodyW*0.18} ${by} L ${cx - bodyW*0.05} ${by + bodyH*0.4}" stroke="${darken(oc,10)}" stroke-width="2.5" fill="none"/>
        <path d="M ${cx + bodyW*0.18} ${by} L ${cx + bodyW*0.05} ${by + bodyH*0.4}" stroke="${darken(oc,10)}" stroke-width="2.5" fill="none"/>
    `;

    if (c.outfitStyle === 'jacket') return `
        <rect x="${bx}" y="${by}" width="${bodyW}" height="${bodyH}" fill="${oc}" rx="8"/>
        <rect x="${bx - s*0.06}" y="${by}" width="${s*0.10}" height="${bodyH*0.7}" fill="${oc}" rx="5"/>
        <rect x="${bx + bodyW - s*0.04}" y="${by}" width="${s*0.10}" height="${bodyH*0.7}" fill="${oc}" rx="5"/>
        <!-- سحاب -->
        <line x1="${cx}" y1="${by}" x2="${cx}" y2="${by + bodyH}" stroke="${darken(oc,25)}" stroke-width="2" opacity="0.6"/>
        <!-- جيوب -->
        <rect x="${bx + s*0.03}" y="${by + bodyH*0.5}" width="${bodyW*0.28}" height="${bodyH*0.3}" fill="${darken(oc,20)}" rx="4" opacity="0.5"/>
        <rect x="${bx + bodyW - bodyW*0.28 - s*0.03}" y="${by + bodyH*0.5}" width="${bodyW*0.28}" height="${bodyH*0.3}" fill="${darken(oc,20)}" rx="4" opacity="0.5"/>
    `;

    if (c.outfitStyle === 'robe') return `
        <path d="M ${cx - bodyW*0.1} ${by} L ${bx - s*0.04} ${by + bodyH} L ${bx + bodyW + s*0.04} ${by + bodyH} L ${cx + bodyW*0.1} ${by} Z"
              fill="${oc}" opacity="0.95"/>
        <!-- خط وسط -->
        <line x1="${cx}" y1="${by}" x2="${cx}" y2="${by + bodyH}" stroke="${darken(oc,20)}" stroke-width="1.5" opacity="0.5"/>
        <!-- نجوم زخرفية -->
        <text x="${cx - bodyW*0.2}" y="${by + bodyH*0.4}" font-size="${s*0.08}" fill="gold" opacity="0.7">✦</text>
        <text x="${cx + bodyW*0.1}" y="${by + bodyH*0.6}" font-size="${s*0.06}" fill="gold" opacity="0.5">✦</text>
    `;

    return `<rect x="${bx}" y="${by}" width="${bodyW}" height="${bodyH}" fill="${oc}" rx="8"/>`;
}

// ============================================================
// رسم الإكسسوار
// ============================================================

function drawAccessory(c, cx, cy, r, s) {
    if (c.accessory === 'none') return '';

    if (c.accessory === 'glasses') return `
        <rect x="${cx - r*0.78}" y="${cy - r*0.12}" width="${r*0.6}" height="${r*0.5}" rx="${r*0.15}"
              stroke="#aaa" stroke-width="1.2" fill="rgba(100,200,255,0.12)"/>
        <rect x="${cx + r*0.18}" y="${cy - r*0.12}" width="${r*0.6}" height="${r*0.5}" rx="${r*0.15}"
              stroke="#aaa" stroke-width="1.2" fill="rgba(100,200,255,0.12)"/>
        <line x1="${cx - r*0.18}" y1="${cy + r*0.05}" x2="${cx + r*0.18}" y2="${cy + r*0.05}"
              stroke="#aaa" stroke-width="1"/>
    `;

    if (c.accessory === 'crown') return `
        <path d="M ${cx - r*0.6} ${cy - r*0.95}
                 L ${cx - r*0.6} ${cy - r*1.35}
                 L ${cx - r*0.3} ${cy - r*1.1}
                 L ${cx}         ${cy - r*1.45}
                 L ${cx + r*0.3} ${cy - r*1.1}
                 L ${cx + r*0.6} ${cy - r*1.35}
                 L ${cx + r*0.6} ${cy - r*0.95} Z"
              fill="gold" stroke="#b8860b" stroke-width="0.8"/>
        <circle cx="${cx}" cy="${cy - r*1.45}" r="${r*0.1}" fill="#ef4444"/>
        <circle cx="${cx - r*0.6}" cy="${cy - r*1.35}" r="${r*0.08}" fill="#3b82f6"/>
        <circle cx="${cx + r*0.6}" cy="${cy - r*1.35}" r="${r*0.08}" fill="#3b82f6"/>
    `;

    if (c.accessory === 'headphones') return `
        <path d="M ${cx - r*0.95} ${cy} A ${r*0.95} ${r*0.95} 0 0 1 ${cx + r*0.95} ${cy}"
              stroke="#333" stroke-width="${s*0.04}" fill="none" stroke-linecap="round"/>
        <rect x="${cx - r*1.05}" y="${cy - r*0.15}" width="${r*0.35}" height="${r*0.55}"
              fill="#8b5cf6" rx="${r*0.08}"/>
        <rect x="${cx + r*0.70}" y="${cy - r*0.15}" width="${r*0.35}" height="${r*0.55}"
              fill="#8b5cf6" rx="${r*0.08}"/>
    `;

    if (c.accessory === 'hat') return `
        <ellipse cx="${cx}" cy="${cy - r*0.82}" rx="${r*1.1}" ry="${r*0.2}" fill="${c.hairColor}"/>
        <rect x="${cx - r*0.65}" y="${cy - r*1.6}" width="${r*1.3}" height="${r*0.82}" fill="${c.hairColor}" rx="4"/>
        <rect x="${cx - r*0.55}" y="${cy - r*0.82}" width="${r*1.1}" height="${r*0.12}" fill="${lighten(c.hairColor, 20)}" opacity="0.5"/>
    `;

    return '';
}

// ============================================================
// Helper — lighten / darken hex
// ============================================================

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return [r,g,b];
}

function rgbToHex(r,g,b) {
    return '#' + [r,g,b].map(v => Math.min(255,Math.max(0,Math.round(v))).toString(16).padStart(2,'0')).join('');
}

export function lighten(hex, pct) {
    try {
        const [r,g,b] = hexToRgb(hex);
        return rgbToHex(r + (255-r)*pct/100, g + (255-g)*pct/100, b + (255-b)*pct/100);
    } catch { return hex; }
}

export function darken(hex, pct) {
    try {
        const [r,g,b] = hexToRgb(hex);
        return rgbToHex(r*(1-pct/100), g*(1-pct/100), b*(1-pct/100));
    } catch { return hex; }
}

// ============================================================
// loadAvatar(uid, db) — يجيب بيانات الشخصية من Firebase
// ============================================================

export async function loadAvatar(uid, db, ref, get) {
    try {
        const snap = await get(ref(db, `users/${uid}/avatar`));
        return snap.exists() ? snap.val() : DEFAULT_CHAR;
    } catch {
        return DEFAULT_CHAR;
    }
}
