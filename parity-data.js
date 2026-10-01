// ==========================================================================
// 11th Floor Parity — Daily Dataset & Curated Vector Pairs
// Theme: "Guess Who?" Retro Avatars (10 Sequential Floors)
// ==========================================================================

window.PARITY_DAILY_SET = {
    title: "Guess Who? Retro Avatars",
    floors: [
        { floor: 1, pairs: 1, timeLimit: 12, icons: ["detective"] },
        { floor: 2, pairs: 2, timeLimit: 16, icons: ["detective", "chef"] },
        { floor: 3, pairs: 3, timeLimit: 22, icons: ["detective", "chef", "pirate"] },
        { floor: 4, pairs: 4, timeLimit: 28, icons: ["detective", "chef", "pirate", "spectacles"] },
        { floor: 5, pairs: 5, timeLimit: 34, icons: ["detective", "chef", "pirate", "spectacles", "beanie"] },
        { floor: 6, pairs: 6, timeLimit: 40, icons: ["detective", "chef", "pirate", "spectacles", "beanie", "monocle"] },
        { floor: 7, pairs: 7, timeLimit: 46, icons: ["detective", "chef", "pirate", "spectacles", "beanie", "monocle", "dj"] },
        { floor: 8, pairs: 8, timeLimit: 52, icons: ["detective", "chef", "pirate", "spectacles", "beanie", "monocle", "dj", "astronaut"] },
        { floor: 9, pairs: 9, timeLimit: 58, icons: ["detective", "chef", "pirate", "spectacles", "beanie", "monocle", "dj", "astronaut", "beret"] },
        { floor: 10, pairs: 10, timeLimit: 64, icons: ["detective", "chef", "pirate", "spectacles", "beanie", "monocle", "dj", "astronaut", "beret", "disguise"] }
    ],
    svgMap: {
        detective: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#3b82f6"/><path d="M5 10 C 6 6, 18 6, 19 10 L 21 11 H 3 Z" fill="#1e293b"/><rect x="7" y="11" width="10" height="2" fill="#ef4444"/><ellipse cx="12" cy="15" rx="3" ry="2" fill="#fde047"/><rect x="8" y="14" width="8" height="2" fill="#020617"/></svg>`,
        chef: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#ef4444"/><path d="M8 10 C 6 6, 18 6, 16 10 Z" fill="#ffffff"/><rect x="8" y="10" width="8" height="3" fill="#f8fafc"/><path d="M7 16 C 9 18, 15 18, 17 16" fill="none" stroke="#020617" stroke-width="2" stroke-linecap="round"/><circle cx="9" cy="14" r="1" fill="#020617"/><circle cx="15" cy="14" r="1" fill="#020617"/></svg>`,
        pirate: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#10b981"/><path d="M4 8 C 8 2, 16 2, 20 8 H 4 Z" fill="#020617"/><circle cx="9" cy="12" r="2.5" fill="#020617"/><line x1="4" y1="10" x2="14" y2="14" stroke="#020617" stroke-width="1.5"/><circle cx="15" cy="12" r="1" fill="#020617"/><path d="M10 17 Q 12 19 14 17" stroke="#020617" stroke-width="1.5" fill="none"/></svg>`,
        spectacles: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#f59e0b"/><rect x="5" y="10" width="5" height="4" rx="1" fill="#ef4444"/><rect x="14" y="10" width="5" height="4" rx="1" fill="#3b82f6"/><line x1="10" y1="12" x2="14" y2="12" stroke="#ffffff" stroke-width="2"/><path d="M9 17 Q 12 19 15 17" stroke="#ffffff" stroke-width="1.5" fill="none"/></svg>`,
        beanie: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#8b5cf6"/><path d="M6 10 C 6 4, 18 4, 18 10 Z" fill="#ec4899"/><rect x="5" y="9" width="14" height="3" rx="1" fill="#f472b6"/><circle cx="12" cy="4" r="1.5" fill="#ffffff"/><circle cx="9" cy="15" r="1" fill="#ffffff"/><circle cx="15" cy="15" r="1" fill="#ffffff"/><path d="M8 18 C 10 21, 14 21, 16 18" fill="#d97706"/></svg>`,
        monocle: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#f43f5e"/><rect x="7" y="4" width="10" height="6" fill="#0f172a"/><rect x="5" y="10" width="14" height="1" fill="#0f172a"/><circle cx="15" cy="13" r="2.5" fill="none" stroke="#facc15" stroke-width="1.5"/><line x1="17.5" y1="13" x2="19" y2="19" stroke="#facc15" stroke-width="1"/><circle cx="9" cy="13" r="1" fill="#0f172a"/></svg>`,
        dj: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#06b6d4"/><rect x="3" y="10" width="3" height="6" rx="1" fill="#1e293b"/><rect x="18" y="10" width="3" height="6" rx="1" fill="#1e293b"/><path d="M4 10 C 4 4, 20 4, 20 10" fill="none" stroke="#1e293b" stroke-width="2"/><circle cx="9" cy="13" r="1.5" fill="#ffffff"/><circle cx="15" cy="13" r="1.5" fill="#ffffff"/><rect x="7" y="12" width="10" height="2" fill="#020617"/></svg>`,
        astronaut: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#64748b"/><circle cx="12" cy="12" r="6" fill="#020617" stroke="#e2e8f0" stroke-width="1.5"/><path d="M8 10 C 10 8, 14 8, 16 10 C 14 12, 10 12, 8 10 Z" fill="#fbbf24" opacity="0.8"/></svg>`,
        beret: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#14b8a6"/><path d="M4 10 C 4 6, 20 6, 20 10 Z" fill="#dc2626"/><circle cx="12" cy="5" r="1" fill="#dc2626"/><circle cx="9" cy="14" r="1" fill="#0f172a"/><circle cx="15" cy="14" r="1" fill="#0f172a"/><path d="M9 17 Q 12 18 15 17" stroke="#0f172a" stroke-width="1.5" fill="none"/></svg>`,
        disguise: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#a855f7"/><circle cx="8" cy="10" r="2.5" fill="#0f172a"/><circle cx="16" cy="10" r="2.5" fill="#0f172a"/><line x1="10.5" y1="10" x2="13.5" y2="10" stroke="#0f172a" stroke-width="2"/><ellipse cx="12" cy="14" rx="2.5" ry="2" fill="#f87171"/><path d="M6 16 Q 12 21 18 16" fill="#0f172a"/></svg>`
    }
};
