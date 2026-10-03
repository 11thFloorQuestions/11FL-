// ==========================================================================
// 11th Floor Parity — Daily Dataset & Curated Vector Pairs
// Theme: "Neon Cyber Icons" (10 Sequential Floors)
// ==========================================================================

window.PARITY_DAILY_SET = {
    title: "Neon Cyber Icons",
    floors: [
        { floor: 1, pairs: 1, timeLimit: 12, icons: ["chip"] },
        { floor: 2, pairs: 2, timeLimit: 16, icons: ["chip", "signal"] },
        { floor: 3, pairs: 3, timeLimit: 22, icons: ["chip", "signal", "laser"] },
        { floor: 4, pairs: 4, timeLimit: 28, icons: ["chip", "signal", "laser", "hypercube"] },
        { floor: 5, pairs: 5, timeLimit: 34, icons: ["chip", "signal", "laser", "hypercube", "orbit"] },
        { floor: 6, pairs: 6, timeLimit: 40, icons: ["chip", "signal", "laser", "hypercube", "orbit", "node"] },
        { floor: 7, pairs: 7, timeLimit: 46, icons: ["chip", "signal", "laser", "hypercube", "orbit", "node", "nexus"] },
        { floor: 8, pairs: 8, timeLimit: 52, icons: ["chip", "signal", "laser", "hypercube", "orbit", "node", "nexus", "pulse"] },
        { floor: 9, pairs: 9, timeLimit: 58, icons: ["chip", "signal", "laser", "hypercube", "orbit", "node", "nexus", "pulse", "matrix"] },
        { floor: 10, pairs: 10, timeLimit: 64, icons: ["chip", "signal", "laser", "hypercube", "orbit", "node", "nexus", "pulse", "matrix", "core"] }
    ],
    svgMap: {
        chip: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" fill="#0d1117" stroke="#00F0FF" stroke-width="1.5"/><rect x="8" y="8" width="8" height="8" rx="1" fill="#00F0FF"/><line x1="12" y1="1" x2="12" y2="3" stroke="#00F0FF" stroke-width="2"/><line x1="12" y1="21" x2="12" y2="23" stroke="#00F0FF" stroke-width="2"/><line x1="1" y1="12" x2="3" y2="12" stroke="#00F0FF" stroke-width="2"/><line x1="21" y1="12" x2="23" y2="12" stroke="#00F0FF" stroke-width="2"/></svg>`,
        signal: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#0d1117" stroke="#FF007F" stroke-width="1.5"/><path d="M7 12 A 5 5 0 0 1 17 12" fill="none" stroke="#FF007F" stroke-width="2" stroke-linecap="round"/><path d="M9 14 A 3 3 0 0 1 15 14" fill="none" stroke="#FF007F" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="16" r="1.5" fill="#FF007F"/></svg>`,
        laser: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#0d1117" stroke="#39FF14" stroke-width="1.5"/><polygon points="12,4 15,11 21,12 15,13 12,20 9,13 3,12 9,11" fill="#39FF14"/></svg>`,
        hypercube: `<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" fill="#0d1117" stroke="#7000FF" stroke-width="1.5"/><rect x="8" y="8" width="8" height="8" rx="1" fill="none" stroke="#39FF14" stroke-width="1.5"/><line x1="4" y1="4" x2="8" y2="8" stroke="#7000FF" stroke-width="1.5"/><line x1="20" y1="4" x2="16" y2="8" stroke="#7000FF" stroke-width="1.5"/><line x1="4" y1="20" x2="8" y2="16" stroke="#7000FF" stroke-width="1.5"/><line x1="20" y1="20" x2="16" y2="16" stroke="#7000FF" stroke-width="1.5"/></svg>`,
        orbit: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#0d1117" stroke="#FF007F" stroke-width="1.5"/><ellipse cx="12" cy="12" rx="7" ry="3" fill="none" stroke="#00F0FF" stroke-width="1.5" transform="rotate(-30 12 12)"/><circle cx="12" cy="12" r="2.5" fill="#FF007F"/></svg>`,
        node: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="9" fill="#0d1117" stroke="#39FF14" stroke-width="1.5"/><circle cx="7" cy="7" r="2" fill="#39FF14"/><circle cx="17" cy="7" r="2" fill="#39FF14"/><circle cx="12" cy="17" r="2" fill="#39FF14"/><line x1="7" y1="7" x2="17" y2="7" stroke="#39FF14" stroke-width="1.5"/><line x1="7" y1="7" x2="12" y2="17" stroke="#39FF14" stroke-width="1.5"/><line x1="17" y1="7" x2="12" y2="17" stroke="#39FF14" stroke-width="1.5"/></svg>`,
        nexus: `<svg viewBox="0 0 24 24"><polygon points="12,2 22,7 22,17 12,22 2,17 2,7" fill="#0d1117" stroke="#00F0FF" stroke-width="1.5"/><polygon points="12,6 18,9.5 18,14.5 12,18 6,14.5 6,9.5" fill="#7000FF"/></svg>`,
        pulse: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" fill="#0d1117" stroke="#FF007F" stroke-width="1.5"/><path d="M4 12 L8 12 L10 6 L14 18 L16 12 L20 12" fill="none" stroke="#FF007F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        matrix: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#0d1117" stroke="#7000FF" stroke-width="1.5"/><rect x="7" y="7" width="3" height="3" fill="#00F0FF"/><rect x="14" y="7" width="3" height="3" fill="#39FF14"/><rect x="7" y="14" width="3" height="3" fill="#FF007F"/><rect x="14" y="14" width="3" height="3" fill="#00F0FF"/></svg>`,
        core: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#0d1117" stroke="#00F0FF" stroke-width="1.5"/><circle cx="12" cy="12" r="5" fill="#FF007F"/><circle cx="12" cy="12" r="2" fill="#39FF14"/></svg>`
    }
};
