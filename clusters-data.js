/**
 * ============================================================================
 * 11TH FLOOR CLUSTERS - DAILY PUZZLE DATA (clusters-data.js)
 * ============================================================================
 * Aesthetic: Pure black / sharp red minimalist design system.
 * Cultural Vibe: British-leaning and global lateral connection puzzles.
 * Progression: Floors 01-04 (Warmup: 6 tiles), Floors 05-08 (Squeeze: 9 tiles), 
 * Floors 09-11 (The Wall: 16 tiles).
 * ============================================================================
 */

window.CLUSTERS_DATA = {
  "2026-09-26": {
    date: "2026-09-26",
    title: "Puzzle #01: The Meridian Sequence",
    floors: {
      // ==========================================
      // WARMUP PHASE (Floors 01–04)
      // 6 Tiles total. Find the target group of 3.
      // ==========================================
      1: {
        type: "warmup",
        tiles: ["THAMES", "SEVERN", "HUMBER", "BAKER", "FLEET", "TYBURN"],
        targetGroup: ["THAMES", "SEVERN", "HUMBER"],
        targetCategory: "Major British rivers",
        decoyGroup: ["BAKER", "FLEET", "TYBURN"],
        decoyCategory: "Historic / Underground rivers of London"
      },
      2: {
        type: "warmup",
        tiles: ["OXBRIDGE", "DURHAM", "YORK", "RED", "BLUE", "GREEN"],
        targetGroup: ["OXBRIDGE", "DURHAM", "YORK"],
        targetCategory: "Historic UK university cities/institutions",
        decoyGroup: ["RED", "BLUE", "GREEN"],
        decoyCategory: "Primary chromatic colors"
      },
      3: {
        type: "warmup",
        tiles: ["MARPLE", "MORSE", "WIMSEY", "CHANCELLOR", "TREASURER", "SECRETARY"],
        targetGroup: ["MARPLE", "MORSE", "WIMSEY"],
        targetCategory: "Fictional British literary detectives",
        decoyGroup: ["CHANCELLOR", "TREASURER", "SECRETARY"],
        decoyCategory: "Great Officers of State roles"
      },
      4: {
        type: "warmup",
        tiles: ["ORWELL", "HUXLEY", "WAUGH", "SHERATON", "HILTON", "SAVOY"],
        targetGroup: ["ORWELL", "HUXLEY", "WAUGH"],
        targetCategory: "Satirical 20th-century British novelists",
        decoyGroup: ["SHERATON", "HILTON", "SAVOY"],
        decoyCategory: "International luxury hotel chains"
      },

      // ==========================================
      // SQUEEZE PHASE (Floors 05–08)
      // 9 Tiles total. Find 3 groups of 3.
      // ==========================================
      5: {
        type: "squeeze",
        tiles: ["BADGER", "TOAD", "RAT", "BADEN", "POWELL", "SMYTH", "COPPER", "ZINC", "BRASS"],
        groups: [
          { words: ["BADGER", "TOAD", "RAT"], category: "Characters in The Wind in the Willows" },
          { words: ["BADEN", "POWELL", "SMYTH"], category: "Founders/early leaders of Scouting" },
          { words: ["COPPER", "ZINC", "BRASS"], category: "Metallic elements / alloys" }
        ]
      },
      6: {
        type: "squeeze",
        tiles: ["DOWNING", "WHITEHALL", "PALL MALL", "PICCADILLY", "STRAND", "REGENT", "TOWER", "ST PAULS", "BIG BEN"],
        groups: [
          { words: ["DOWNING", "WHITEHALL", "PALL MALL"], category: "Famous London government & political streets" },
          { words: ["PICCADILLY", "STRAND", "REGENT"], category: "Major West End thoroughfares" },
          { words: ["TOWER", "ST PAULS", "BIG BEN"], category: "Iconic London architectural landmarks" }
        ]
      },
      7: {
        type: "squeeze",
        tiles: ["TUDOR", "STUART", "WINDSOR", "TORNADO", "TYPHOON", "SPITFIRE", "MERLOT", "SHIRAZ", "MALBEC"],
        groups: [
          { words: ["TUDOR", "STUART", "WINDSOR"], category: "British Royal Houses" },
          { words: ["TORNADO", "TYPHOON", "SPITFIRE"], category: "Classic British military aircraft" },
          { words: ["MERLOT", "SHIRAZ", "MALBEC"], category: "Red wine grape varieties" }
        ]
      },
      8: {
        type: "squeeze",
        tiles: ["CARROLL", "TWAIN", "DOYLE", "STONEHENGE", "AVEBURY", "SILBURY", "CRICKET", "DARTS", "SNOOKER"],
        groups: [
          { words: ["CARROLL", "TWAIN", "DOYLE"], category: "Authors who wrote under famous pen names" },
          { words: ["STONEHENGE", "AVEBURY", "SILBURY"], category: "Wiltshire prehistoric monuments" },
          { words: ["CRICKET", "DARTS", "SNOOKER"], category: "Sports with strong British pub/traditional roots" }
        ]
      },

      // ==========================================
      // THE WALL PHASE (Floors 09–11)
      // 16 Tiles total. Find 4 groups of 4.
      // ==========================================
      9: {
        type: "wall",
        tiles: [
          "THAMES", "SEVERN", "TRENT", "CLYDE",
          "GOLD", "SILVER", "BRONZE", "PLATINUM",
          "MARBLE", "GRANITE", "SLATE", "CHALK",
          "OXFORD", "BOND", "FLEET", "LOMBARD"
        ],
        groups: [
          { words: ["THAMES", "SEVERN", "TRENT", "CLYDE"], category: "Major British rivers" },
          { words: ["GOLD", "SILVER", "BRONZE", "PLATINUM"], category: "Precious metals" },
          { words: ["MARBLE", "GRANITE", "SLATE", "CHALK"], category: "Types of stone / geological materials" },
          { words: ["OXFORD", "BOND", "FLEET", "LOMBARD"], category: "Famous London streets" }
        ]
      },
      10: {
        type: "wall",
        tiles: [
          "WHIST", "BRIDGE", "EUCHRE", "CRIBBAGE",
          "BADGER", "TOAD", "RAT", "MOLE",
          "TUDOR", "STUART", "WINDSOR", "HANOVER",
          "PIE", "CHIPS", "MASH", "BEANS"
        ],
        groups: [
          { words: ["WHIST", "BRIDGE", "EUCHRE", "CRIBBAGE"], category: "Traditional card games" },
          { words: ["BADGER", "TOAD", "RAT", "MOLE"], category: "Main animal characters in The Wind in the Willows" },
          { words: ["TUDOR", "STUART", "WINDSOR", "HANOVER"], category: "British royal dynasties" },
          { words: ["PIE", "CHIPS", "MASH", "BEANS"], category: "Classic British pub/café comfort foods" }
        ]
      },
      11: {
        type: "wall",
        tiles: [
          "APOLLO", "HERMES", "ATHENA", "ARES",
          "RED", "BLUE", "GREEN", "YELLOW",
          "COPPER", "IRON", "TIN", "LEAD",
          "KING", "QUEEN", "KNIGHT", "ROOK"
        ],
        groups: [
          { words: ["APOLLO", "HERMES", "ATHENA", "ARES"], category: "Greek Olympian gods" },
          { words: ["RED", "BLUE", "GREEN", "YELLOW"], category: "Coloured balls in a game of snooker" },
          { words: ["COPPER", "IRON", "TIN", "LEAD"], category: "Common elemental base metals" },
          { words: ["KING", "QUEEN", "KNIGHT", "ROOK"], category: "Chess pieces" }
        ]
      }
    }
  }
};
