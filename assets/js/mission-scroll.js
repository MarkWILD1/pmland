/**
 * "Nuestra misión": la ceja, el título, el párrafo y la cita se escriben
 * con el scroll. Las tres tarjetas entran al final.
 * En mobile la sección es más alta que la pantalla y no se fija: cada bloque
 * se escribe con su propio recorrido y termina mientras sigue legible.
 */
const EYEBROW = [{ text: 'Nuestra misión' }];
const TITLE = [
    { text: 'Fortalecer y potenciar la labor docente, y hacerla más ' },
    { text: 'leve', className: 'text-gradient' },
    { text: '.' },
];
const LEAD = [{
    text: 'Plan Maestro existe para que disfrutes tu profesión, vivas tu carrera con orgullo y la lleves más lejos. No se trata de la herramienta: se trata de vos.',
}];
const QUOTE = [
    { text: 'Nuestros resultados no son para engrandecernos. Tienen una misión clara: ' },
    { text: 'fortalecer y potenciar', strong: true },
    { text: ' tu labor docente.' },
];
const EYEBROW_END = 0.12;
const TITLE_START = 0.08;
const TITLE_END = 0.42;
const LEAD_START = 0.36;
const LEAD_END = 0.64;
const QUOTE_START = 0.78;
const QUOTE_END = 1;
const CARDS = [0.58, 0.7, 0.82];
const CARD_SPAN = 0.16;

const section = document.getElementById('mision');
const stage = section && section.querySelector('.mission-stage');
const eyebrow = section && section.querySelector('.mission-eyebrow');
const eyebrowTyped = section && section.querySelector('[data-mission="eyebrow"]');
const title = section && section.querySelector('.mission-title');
const titleTyped = section && section.querySelector('[data-mission="title"]');
const lead = section && section.querySelector('.mission-lead');
const leadTyped = section && section.querySelector('[data-mission="lead"]');
const quote = section && section.querySelector('.mission-quote');
const quoteTyped = section && section.querySelector('[data-mission="quote"]');
const caret = section && section.querySelector('.mission-caret');
const cards = section ? Array.prototype.slice.call(section.querySelectorAll('.mission-card')) : [];
const narrowQuery = window.matchMedia('(max-width: 767px)');

if (
    section && stage && eyebrow && eyebrowTyped && title && titleTyped
    && lead && leadTyped && quote && quoteTyped && caret && cards.length === 3
) init();

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

function wrap(segment, inner) {
    let html = inner;
    if (segment.className) html = '<span class="' + segment.className + '">' + html + '</span>';
    if (segment.strong) html = '<strong>' + html + '</strong>';
    return html;
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
        if (head) before += wrap(segments[s], head);
        if (tail) after += '<span style="opacity:0">' + wrap(segments[s], tail) + '</span>';
    }
    host.innerHTML = before;
    if (caretEl) host.appendChild(caretEl);
    if (after) host.insertAdjacentHTML('beforeend', after);
}

function rangeCount(progress, start, end, total) {
    return Math.round(clamp01((progress - start) / (end - start)) * total);
}

function init() {
    const eyebrowTotal = charCount(EYEBROW);
    const titleTotal = charCount(TITLE);
    const leadTotal = charCount(LEAD);
    const quoteTotal = charCount(QUOTE);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let eyebrowShown = -1;
    let titleShown = -1;
    let leadShown = -1;
    let quoteShown = -1;
    let caretWhere = '';
    let triggers = [];

    const paint = (eyebrowCount, titleCount, leadCount, quoteCount) => {
        const eyebrowDone = eyebrowCount >= eyebrowTotal;
        const titleDone = titleCount >= titleTotal;
        const leadDone = leadCount >= leadTotal;
        const quoteDone = quoteCount >= quoteTotal;
        const where = !eyebrowDone ? 'eyebrow' : !titleDone ? 'title' : !leadDone ? 'lead' : 'quote';
        if (eyebrowCount !== eyebrowShown || caretWhere !== where) {
            eyebrowShown = eyebrowCount;
            render(eyebrowTyped, EYEBROW, eyebrowCount, where === 'eyebrow' ? caret : null);
        }
        if (titleCount !== titleShown || caretWhere !== where) {
            titleShown = titleCount;
            render(titleTyped, TITLE, titleCount, where === 'title' ? caret : null);
        }
        if (leadCount !== leadShown || caretWhere !== where) {
            leadShown = leadCount;
            render(leadTyped, LEAD, leadCount, where === 'lead' ? caret : null);
        }
        if (quoteCount !== quoteShown || caretWhere !== where) {
            quoteShown = quoteCount;
            render(quoteTyped, QUOTE, quoteCount, where === 'quote' ? caret : null);
        }
        caretWhere = where;
        quote.classList.toggle('is-writing', quoteCount > 0);
        eyebrow.classList.toggle('is-complete', eyebrowDone);
        title.classList.toggle('is-complete', titleDone);
        lead.classList.toggle('is-complete', leadDone);
        quote.classList.toggle('is-complete', quoteDone);
    };

    const applyText = (p) => {
        paint(
            Math.round(clamp01(p / EYEBROW_END) * eyebrowTotal),
            rangeCount(p, TITLE_START, TITLE_END, titleTotal),
            rangeCount(p, LEAD_START, LEAD_END, leadTotal),
            rangeCount(p, QUOTE_START, QUOTE_END, quoteTotal),
        );
    };

    const applyCards = (amounts) => {
        cards.forEach((card, index) => {
            const t = smooth(amounts[index]);
            card.style.opacity = t.toFixed(3);
            card.style.transform = 'translateY(' + ((1 - t) * 28).toFixed(1) + 'px)';
        });
    };

    const apply = (p) => {
        applyText(p);
        applyCards(CARDS.map((start) => (p - start) / CARD_SPAN));
    };

    const blockSeen = (el, startRatio, endRatio) => {
        const vh = window.innerHeight || 1;
        const top = el.getBoundingClientRect().top;
        const start = vh * startRatio;
        const end = vh * endRatio;
        return clamp01((start - top) / (start - end || 1));
    };

    const typedCount = (el, total, start, end) => Math.round(blockSeen(el, start, end) * total);

    const applyNarrow = () => {
        paint(
            typedCount(eyebrow, eyebrowTotal, 0.96, 0.78),
            typedCount(title, titleTotal, 0.92, 0.5),
            typedCount(lead, leadTotal, 0.9, 0.4),
            typedCount(quote, quoteTotal, 0.9, 0.46),
        );
        applyCards(cards.map((card) => blockSeen(card, 0.94, 0.62)));
    };

    if (reduce || !window.gsap || !window.ScrollTrigger) {
        apply(1);
        return;
    }

    section.classList.add('is-scrub');
    gsap.registerPlugin(ScrollTrigger);

    const killTriggers = () => {
        triggers.forEach((item) => item.kill());
        triggers = [];
    };

    const mount = () => {
        killTriggers();
        const narrow = narrowQuery.matches;
        section.classList.add('is-scrub');
        if (narrow) {
            applyNarrow();
            triggers.push(ScrollTrigger.create({
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
                invalidateOnRefresh: true,
                onUpdate: applyNarrow,
            }));
            return;
        }
        apply(0);
        triggers.push(ScrollTrigger.create({
            trigger: section,
            start: 'top top',
            end: () => '+=' + Math.round(window.innerHeight * 2.2),
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => apply(self.progress),
        }));
    };

    mount();
    ScrollTrigger.refresh();
    narrowQuery.addEventListener('change', () => {
        mount();
        ScrollTrigger.refresh();
    });
    window.addEventListener('resize', () => {
        if (narrowQuery.matches) applyNarrow();
    });
}
