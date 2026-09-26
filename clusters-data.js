/**
 * ============================================================================
 * 11TH FLOOR CLUSTERS - DAILY PUZZLE DATA (clusters-data.js)
 * ============================================================================
 * Standard: Global scope, airtight logic, zero AI slop, zero regional bias.
 * Progression: Floors 01-04 (Warmup: 6 tiles), Floors 05-08 (Squeeze: 9 tiles), 
 * Floors 09-11 (The Wall: 16 tiles).
 * ============================================================================
 */

window.CLUSTERS_DATA = {
  "2026-09-26": {
    date: "2026-09-26",
    title: "Puzzle #01: Global Alignment",
    floors: {
      // ==========================================
      // WARMUP PHASE (Floors 01–04)
      // 6 Tiles total. Find the target group of 3.
      // ==========================================
      1: {
        type: "warmup",
        tiles: ["LITRE", "KILOGRAM", "METRE", "SECOND", "KELVIN", "AMPERE"],
        targetGroup: ["LITRE", "KILOGRAM", "METRE"],
        targetCategory: "Common metric base units of measurement",
        decoyGroup: ["SECOND", "KELVIN", "AMPERE"],
        decoyCategory: "Other international SI base units"
      },
      2: {
        type: "warmup",
        tiles: ["COPPER", "SILVER", "GOLD", "OXYGEN", "NITROGEN", "HELIUM"],
        targetGroup: ["COPPER", "SILVER", "GOLD"],
        targetCategory: "Precious or historical metallic elements",
        decoyGroup: ["OXYGEN", "NITROGEN", "HELIUM"],
        decoyCategory: "Gaseous chemical elements"
      },
      3: {
        type: "warmup",
        tiles: ["MARS", "VENUS", "EARTH", "ALPHA", "PROXIMA", "SIRIUS"],
        targetGroup: ["MARS", "VENUS", "EARTH"],
        targetCategory: "Inner rocky planets of our solar system",
        decoyGroup: ["ALPHA", "PROXIMA", "SIRIUS"],
        decoyCategory: "Famous stellar systems / bright stars"
      },
      4: {
        type: "warmup",
        tiles: ["DIAMOND", "RUBY", "EMERALD", "SQUARE", "CIRCLE", "TRIANGLE"],
        targetGroup: ["DIAMOND", "RUBY", "EMERALD"],
        targetCategory: "Precious gemstones",
        decoyGroup: ["SQUARE", "CIRCLE", "TRIANGLE"],
        decoyCategory: "Basic geometric shapes"
      },

      // ==========================================
      // SQUEEZE PHASE (Floors 05–08)
      // 9 Tiles total. Find 3 groups of 3.
      // ==========================================
      5: {
        type: "squeeze",
        tiles: ["NILE", "AMAZON", "YANGTZE", "EVEREST", "K2", "KILIMANJARO", "PACIFIC", "ATLANTIC", "INDIAN"],
        groups: [
          { words: ["NILE", "AMAZON", "YANGTZE"], category: "Major global rivers" },
          { words: ["EVEREST", "K2", "KILIMANJARO"], category: "Iconic global mountain peaks" },
          { words: ["PACIFIC", "ATLANTIC", "INDIAN"], category: "Major world oceans" }
        ]
      },
      6: {
        type: "squeeze",
        tiles: ["LION", "TIGER", "LEOPARD", "EAGLE", "HAWK", "FALCON", "PYTHON", "VIPER", "COBRA"],
        groups: [
          { words: ["LION", "TIGER", "LEOPARD"], category: "Large wild cats" },
          { words: ["EAGLE", "HAWK", "FALCON"], category: "Birds of prey" },
          { words: ["PYTHON", "VIPER", "COBRA"], category: "Notable predatory snakes" }
        ]
      },
      7: {
        type: "squeeze",
        tiles: ["COPPER", "SILVER", "GOLD", "IRON", "ZINC", "TIN", "RUBY", "EMERALD", "SAPPHIRE"],
        groups: [
          { words: ["COPPER", "SILVER", "GOLD"], category: "Precious metals" },
          { words: ["IRON", "ZINC", "TIN"], category: "Common industrial base metals" },
          { words: ["RUBY", "EMERALD", "SAPPHIRE"], category: "Precious gemstones" }
        ]
      },
      8: {
        type: "squeeze",
        tiles: ["BACH", "MOZART", "BEETHOVEN", "PLATO", "ARISTOTLE", "SOCRATES", "MARS", "VENUS", "MERCURY"],
        groups: [
          { words: ["BACH", "MOZART", "BEETHOVEN"], category: "Legendary classical composers" },
          { words: ["PLATO", "ARISTOTLE", "SOCRATES"], category: "Ancient Greek philosophers" },
          { words: ["MARS", "VENUS", "MERCURY"], category: "Inner planets of the solar system" }
        ]
      },

      // ==========================================
      // THE WALL PHASE (Floors 09–11)
      // 16 Tiles total. Find 4 groups of 4.
      // ==========================================
      9: {
        type: "wall",
        tiles: [
          "NILE", "AMAZON", "YANGTZE", "DANUBE",
          "GOLD", "SILVER", "BRONZE", "PLATINUM",
          "MARS", "VENUS", "EARTH", "SATURN",
          "KING", "QUEEN", "ROOK", "BISHOP"
        ],
        groups: [
          { words: ["NILE", "AMAZON", "YANGTZE", "DANUBE"], category: "Major global rivers" },
          { words: ["GOLD", "SILVER", "BRONZE", "PLATINUM"], category: "Precious metals / Olympic medals" },
          { words: ["MARS", "VENUS", "EARTH", "SATURN"], category: "Planets of the solar system" },
          { words: ["KING", "QUEEN", "ROOK", "BISHOP"], category: "Chess pieces" }
        ]
      },
      10: {
        type: "wall",
        tiles: [
          "TOKYO", "LONDON", "PARIS", "CAIRO",
          "DIAMOND", "RUBY", "EMERALD", "SAPPHIRE",
          "COPPER", "IRON", "TIN", "LEAD",
          "RED", "BLUE", "GREEN", "YELLOW"
        ],
        groups: [
          { words: ["TOKYO", "LONDON", "PARIS", "CAIRO"], category: "Major global capital cities" },
          { words: ["DIAMOND", "RUBY", "EMERALD", "SAPPHIRE"], category: "Precious gemstones" },
          { words: ["COPPER", "IRON", "TIN", "LEAD"], category: "Common industrial base metals" },
          { words: ["RED", "BLUE", "GREEN", "YELLOW"], category: "Standard distinct colors" }
        ]
      },
      11: {
        type: "wall",
        tiles: [
          "APOLLO", "HERMES", "ATHENA", "ARES",
          "LION", "TIGER", "BEAR", "WOLF",
          "SQUARE", "CIRCLE", "TRIANGLE", "RECTANGLE",
          "PIANO", "GUITAR", "VIOLIN", "FLUTE"
        ],
        groups: [
          { words: ["APOLLO", "HERMES", "ATHENA", "ARES"], category: "Greek mythological deities" },
          { words: ["LION", "TIGER", "BEAR", "WOLF"], category: "Large wild mammalian predators" },
          { words: ["SQUARE", "CIRCLE", "TRIANGLE", "RECTANGLE"], category: "Basic geometric shapes" },
          { words: ["PIANO", "GUITAR", "VIOLIN", "FLUTE"], category: "Standard musical instruments" }
        ]
      }
    }
  }
};
