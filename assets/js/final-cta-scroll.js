/**
 * Cierre: el título y el subtítulo se escriben con el scroll y el botón entra al final.
 */
const TITLE = [{ text: '¡Empezá a planificar con placer!' }];
const LEAD = [{ text: 'Tu aliado para crear planificaciones excelentes en tiempo récord' }];
const TITLE_END = 0.42;
const LEAD_START = 0.32;
const LEAD_END = 0.74;
const BUTTON_START = 0.7;
const BUTTON_END = 0.9;

const section = document.getElementById('lanzamiento');
const title = section && section.querySelector('.final-cta-title');
const titleTyped = section && section.querySelector('[data-cta="title"]');
const lead = section && section.querySelector('.final-cta-subtitle');
const leadTyped = section && section.querySelector('[data-cta="lead"]');
const caret = section && section.querySelector('.final-cta-caret');
const button = section && section.querySelector('.final-cta-button');
const note = section && section.querySelector('.final-cta-note');

if (section && title && titleTyped && lead && leadTyped && caret && button && note) init();

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
        if (head) before += head;
        if (tail) after += '<span style="opacity:0">' + tail + '</span>';
    }
    host.innerHTML = before;
    if (caretEl) host.appendChild(caretEl);
    if (after) host.insertAdjacentHTML('beforeend', after);
}

function init() {
    const titleTotal = charCount(TITLE);
    const leadTotal = charCount(LEAD);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let titleShown = -1;
    let leadShown = -1;
    let caretAtLead = null;

    const apply = (p) => {
        const titleCount = Math.round(clamp01(p / TITLE_END) * titleTotal);
        const leadCount = Math.round(clamp01((p - LEAD_START) / (LEAD_END - LEAD_START)) * leadTotal);
        const titleDone = titleCount >= titleTotal;
        if (titleCount !== titleShown || caretAtLead !== titleDone) {
            titleShown = titleCount;
            render(titleTyped, TITLE, titleCount, titleDone ? null : caret);
        }
        if (leadCount !== leadShown || caretAtLead !== titleDone) {
            leadShown = leadCount;
            render(leadTyped, LEAD, leadCount, titleDone ? caret : null);
        }
        caretAtLead = titleDone;
        title.classList.toggle('is-complete', titleDone);
        lead.classList.toggle('is-complete', leadCount >= leadTotal);

        const rise = smooth((p - BUTTON_START) / (BUTTON_END - BUTTON_START));
        const style = 'opacity:' + rise.toFixed(3) + ';transform:translateY(' + ((1 - rise) * 16).toFixed(1) + 'px)';
        button.style.cssText = style;
        note.style.cssText = style;
        button.style.pointerEvents = rise > 0.5 ? 'auto' : 'none';
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
        end: () => '+=' + Math.round(window.innerHeight * (window.innerWidth <= 767 ? 1.45 : 1.7)),
        pin: true,
        pinSpacing: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => apply(self.progress),
    });
    ScrollTrigger.refresh();
}
