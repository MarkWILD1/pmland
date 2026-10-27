/**
 * Ecosistema: la frase se escribe con el scroll mientras el cerebro de puntos se ensambla.
 */
import { mountBrainOrb } from './brain-orb.js';

const SEGMENTS = [
    { text: 'tu ' },
    { text: 'supercerebro', accent: true },
    { text: ' pedagógico' },
];
const TYPE_END = 0.72;
const BRAIN_END = 0.9;
const CTA_START = 0.76;
const CTA_END = 0.9;

const section = document.getElementById('ecosistema');
const stage = section && section.querySelector('.brain-stage');
const phrase = section && section.querySelector('.brain-phrase');
const typed = section && section.querySelector('.brain-phrase-typed');
const caret = section && section.querySelector('.brain-caret');
const cta = section && section.querySelector('.brain-cta');
const visual = section && section.querySelector('.brain-visual');
const host = document.getElementById('brain-orb');

if (section && stage && phrase && typed && caret && cta && visual && host) init();

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

function orbSize() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (vw <= 767) return Math.min(420, vw - 40, vh * 0.42);
    return Math.min(880, visual.clientWidth * 1.25, vh * 1.0);
}

function init() {
    const chars = SEGMENTS.map((segment) => Array.from(segment.text));
    const total = chars.reduce((sum, list) => sum + list.length, 0);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let shown = -1;

    // Caret travels inside the phrase: typed text, caret, then the rest kept invisible so lines never reflow.
    phrase.removeChild(caret);
    caret.style.marginRight = '-0.13em';

    const renderText = (count) => {
        if (count === shown) return;
        shown = count;
        let left = count;
        let before = '';
        let after = '';
        for (let s = 0; s < SEGMENTS.length; s += 1) {
            const list = chars[s];
            const take = Math.max(0, Math.min(list.length, left));
            left -= take;
            const head = escapeHtml(list.slice(0, take).join(''));
            const tail = escapeHtml(list.slice(take).join(''));
            const cls = SEGMENTS[s].accent ? 'brain-phrase-accent' : '';
            if (head) before += cls ? '<span class="' + cls + '">' + head + '</span>' : head;
            if (tail) after += '<span' + (cls ? ' class="' + cls + '"' : '') + ' style="opacity:0">' + tail + '</span>';
        }
        typed.innerHTML = before;
        typed.appendChild(caret);
        typed.insertAdjacentHTML('beforeend', after);
        phrase.classList.toggle('is-complete', count >= total);
    };

    const orb = mountBrainOrb(host, { size: orbSize, label: 'Cerebro de puntos: tu supercerebro pedagógico' });

    const apply = (p) => {
        renderText(Math.round(clamp01(p / TYPE_END) * total));
        if (orb) orb.setProgress(clamp01(p / BRAIN_END));
        const c = smooth((p - CTA_START) / (CTA_END - CTA_START));
        cta.style.opacity = c.toFixed(3);
        cta.style.transform = 'translateY(' + ((1 - c) * 16).toFixed(1) + 'px)';
        cta.classList.toggle('is-visible', c > 0.5);
        section.style.setProperty('--brain-glow', (0.25 + 0.75 * smooth(p / BRAIN_END)).toFixed(3));
    };

    if (reduce || !window.gsap || !window.ScrollTrigger) {
        apply(1);
        return;
    }

    gsap.registerPlugin(ScrollTrigger);
    apply(0);
    ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => '+=' + Math.round(window.innerHeight * (window.innerWidth <= 767 ? 2 : 2.6)),
        pin: true,
        pinSpacing: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => apply(self.progress),
    });
    ScrollTrigger.refresh();
}
