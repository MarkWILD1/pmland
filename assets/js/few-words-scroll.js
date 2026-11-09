/**
 * "En pocas palabras": el título y la frase se escriben con el scroll
 * y las tres cards entran con su check.
 */
const TITLE = [{ text: '...en pocas palabras' }];
const LEAD = [
    { text: 'Plan Maestro', strong: true },
    { text: ' trabaja para vós con BASE en documentación oficial de ANEP - 2027.' },
];
const VERSION = [{ text: 'Versión 7.0' }];
const TITLE_END = 0.26;
const LEAD_START = 0.2;
const LEAD_END = 0.58;
const VERSION_START = 0.54;
const VERSION_END = 0.7;
const CARDS = [0.58, 0.7, 0.82];
const CARD_SPAN = 0.16;

const section = document.getElementById('definicion');
const stage = section && section.querySelector('.few-words-stage');
const title = section && section.querySelector('.few-words-title');
const titleTyped = section && section.querySelector('[data-few="title"]');
const lead = section && section.querySelector('.few-words-lead');
const leadTyped = section && section.querySelector('[data-few="lead"]');
const version = section && section.querySelector('.few-words-version');
const versionTyped = section && section.querySelector('[data-few="version"]');
const caret = section && section.querySelector('.few-words-caret');
const cards = section ? Array.prototype.slice.call(section.querySelectorAll('.few-words-points li')) : [];

if (section && stage && title && titleTyped && lead && leadTyped && version && versionTyped && caret && cards.length === 3) init();

function clamp01(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
}

function smooth(v) {
    const t = clamp01(v);
    return t * t * (3 - 2 * t);
}

function escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function charCount(segments) {
    return segments.reduce((sum, segment) => sum + Array.from(segment.text).length, 0);
}

function render(host, segments, count, caretEl) {
    const lists = segments.map((segment) => Array.from(segment.text));
    let left = count;
    let before = '';
    let after = '';
    for (let s = 0; s < segments.length; s += 1) {
        const list = lists[s];
        const take = Math.max(0, Math.min(list.length, left));
        left -= take;
        const head = escapeHtml(list.slice(0, take).join(''));
        const tail = escapeHtml(list.slice(take).join(''));
        const open = segments[s].strong ? '<strong>' : '';
        const close = segments[s].strong ? '</strong>' : '';
        if (head) before += open + head + close;
        if (tail) after += open + '<span style="opacity:0">' + tail + '</span>' + close;
    }
    host.innerHTML = before;
    if (caretEl) host.appendChild(caretEl);
    if (after) host.insertAdjacentHTML('beforeend', after);
}

function init() {
    const titleTotal = charCount(TITLE);
    const leadTotal = charCount(LEAD);
    const versionTotal = charCount(VERSION);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let titleShown = -1;
    let leadShown = -1;
    let versionShown = -1;
    let caretWhere = '';

    const apply = (p) => {
        const titleCount = Math.round(clamp01(p / TITLE_END) * titleTotal);
        const leadCount = Math.round(clamp01((p - LEAD_START) / (LEAD_END - LEAD_START)) * leadTotal);
        const versionCount = Math.round(clamp01((p - VERSION_START) / (VERSION_END - VERSION_START)) * versionTotal);
        const titleDone = titleCount >= titleTotal;
        const leadDone = leadCount >= leadTotal;
        const versionDone = versionCount >= versionTotal;
        const where = !titleDone ? 'title' : !leadDone ? 'lead' : 'version';
        if (titleCount !== titleShown || caretWhere !== where) {
            titleShown = titleCount;
            render(titleTyped, TITLE, titleCount, where === 'title' ? caret : null);
        }
        if (leadCount !== leadShown || caretWhere !== where) {
            leadShown = leadCount;
            render(leadTyped, LEAD, leadCount, where === 'lead' ? caret : null);
        }
        if (versionCount !== versionShown || caretWhere !== where) {
            versionShown = versionCount;
            render(versionTyped, VERSION, versionCount, where === 'version' ? caret : null);
        }
        caretWhere = where;
        title.classList.toggle('is-complete', titleDone);
        lead.classList.toggle('is-complete', leadDone);
        version.classList.toggle('is-complete', versionDone);

        cards.forEach((card, index) => {
            const t = smooth((p - CARDS[index]) / CARD_SPAN);
            const stamp = smooth((t - 0.38) / 0.5);
            card.style.opacity = t.toFixed(3);
            card.style.transform = 'translateY(' + ((1 - t) * 28).toFixed(1) + 'px)';
            const check = card.querySelector('.few-words-check');
            if (check) check.style.transform = 'translate(-50%, -50%) scale(' + stamp.toFixed(3) + ')';
        });
    };

    if (reduce || !window.gsap || !window.ScrollTrigger) {
        apply(1);
        return;
    }

    section.classList.add('is-scrub');
    gsap.registerPlugin(ScrollTrigger);
    apply(0);
    ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => '+=' + Math.round(window.innerHeight * (window.innerWidth <= 767 ? 1.8 : 2.2)),
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => apply(self.progress),
    });
    ScrollTrigger.refresh();
}
