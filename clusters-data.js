/**
 * ============================================================================
 * 11TH FLOOR CLUSTERS - DAILY PUZZLE DATA (clusters-data.js)
 * ============================================================================
 * Standard: Global scope, airtight logic, zero decoys (all tiles sorted).
 * Progression: 10 Playable Floors leading to the 11th Floor Destination.
 * ============================================================================
 */

window.CLUSTERS_DATA = {
  "2026-09-26": {
    date: "2026-09-26",
    title: "Puzzle #01: Global Alignment",
    floors: {
      // ==========================================
      // ASCENT PHASE (Floors 01–03: 6 Tiles, 2 Groups of 3)
      // ==========================================
      1: {
        type: "ascent",
        tiles: ["LITRE", "KILOGRAM", "METRE", "SECOND", "KELVIN", "AMPERE"],
        groups: [
          { words: ["LITRE", "KILOGRAM", "METRE"], category: "Common metric base units" },
          { words: ["SECOND", "KELVIN", "AMPERE"], category: "Other international SI base units" }
        ]
      },
      2: {
        type: "ascent",
        tiles: ["COPPER", "SILVER", "GOLD", "OXYGEN", "NITROGEN", "HELIUM"],
        groups: [
          { words: ["COPPER", "SILVER", "GOLD"], category: "Precious or historical metals" },
          { words: ["OXYGEN", "NITROGEN", "HELIUM"], category: "Gaseous chemical elements" }
        ]
      },
      3: {
        type: "ascent",
        tiles: ["MARS", "VENUS", "EARTH", "SIRIUS", "VEGA", "RIGEL"],
        groups: [
          { words: ["MARS", "VENUS", "EARTH"], category: "Inner rocky planets" },
          { words: ["SIRIUS", "VEGA", "RIGEL"], category: "Bright visible stars" }
        ]
      },

      // ==========================================
      // SQUEEZE PHASE (Floors 04–06: 9 Tiles, 3 Groups of 3)
      // ==========================================
      4: {
        type: "squeeze",
        tiles: ["NILE", "AMAZON", "YANGTZE", "EVEREST", "K2", "KILIMANJARO", "PACIFIC", "ATLANTIC", "INDIAN"],
        groups: [
          { words: ["NILE", "AMAZON", "YANGTZE"], category: "Major global rivers" },
          { words: ["EVEREST", "K2", "KILIMANJARO"], category: "Iconic mountain peaks" },
          { words: ["PACIFIC", "ATLANTIC", "INDIAN"], category: "Major world oceans" }
        ]
      },
      5: {
        type: "squeeze",
        tiles: ["LION", "TIGER", "LEOPARD", "EAGLE", "HAWK", "FALCON", "PYTHON", "VIPER", "COBRA"],
        groups: [
          { words: ["LION", "TIGER", "LEOPARD"], category: "Large wild cats" },
          { words: ["EAGLE", "HAWK", "FALCON"], category: "Birds of prey" },
          { words: ["PYTHON", "VIPER", "COBRA"], category: "Notable predatory snakes" }
        ]
      },
      6: {
        type: "squeeze",
        tiles: ["BACH", "MOZART", "BEETHOVEN", "PLATO", "ARISTOTLE", "SOCRATES", "MARS", "VENUS", "MERCURY"],
        groups: [
          { words: ["BACH", "MOZART", "BEETHOVEN"], category: "Classical composers" },
          { words: ["PLATO", "ARISTOTLE", "SOCRATES"], category: "Ancient Greek philosophers" },
          { words: ["MARS", "VENUS", "MERCURY"], category: "Inner solar system planets" }
        ]
      },

      // ==========================================
      // DEEP WALL PHASE (Floors 07–09: 12 Tiles, 4 Groups of 3)
      // ==========================================
      7: {
        type: "wall-12",
        tiles: [
          "TOKYO", "LONDON", "PARIS",
          "DIAMOND", "RUBY", "EMERALD",
          "COPPER", "IRON", "TIN",
          "RED", "BLUE", "GREEN"
        ],
        groups: [
          { words: ["TOKYO", "LONDON", "PARIS"], category: "Major global capital cities" },
          { words: ["DIAMOND", "RUBY", "EMERALD"], category: "Precious gemstones" },
          { words: ["COPPER", "IRON", "TIN"], category: "Common industrial base metals" },
          { words: ["RED", "BLUE", "GREEN"], category: "Primary/standard colors" }
        ]
      },
      8: {
        type: "wall-12",
        tiles: [
          "APOLLO", "HERMES", "ATHENA",
          "LION", "TIGER", "BEAR",
          "SQUARE", "CIRCLE", "TRIANGLE",
          "PIANO", "GUITAR", "VIOLIN"
        ],
        groups: [
          { words: ["APOLLO", "HERMES", "ATHENA"], category: "Greek mythological figures" },
          { words: ["LION", "TIGER", "BEAR"], category: "Large wild mammalian predators" },
          { words: ["SQUARE", "CIRCLE", "TRIANGLE"], category: "Basic geometric shapes" },
          { words: ["PIANO", "GUITAR", "VIOLIN"], category: "Standard musical instruments" }
        ]
      },
      9: {
        type: "wall-12",
        tiles: [
          "WHIST", "BRIDGE", "EUCHRE",
          "TUDOR", "STUART", "WINDSOR",
          "RAIN", "SNOW", "WIND",
          "OAK", "PINE", "MAPLE"
        ],
        groups: [
          { words: ["WHIST", "BRIDGE", "EUCHRE"], category: "Traditional card games" },
          { words: ["TUDOR", "STUART", "WINDSOR"], category: "Royal dynasties / houses" },
          { words: ["RAIN", "SNOW", "WIND"], category: "Common meteorological weather types" },
          { words: ["OAK", "PINE", "MAPLE"], category: "Common tree species" }
        ]
      },

      // ==========================================
      // THE FINAL WALL (Floor 10: 16 Tiles, 4 Groups of 4)
      // ==========================================
      10: {
        type: "wall-16",
        tiles: [
          "THAMES", "SEVERN", "TRENT", "CLYDE",
          "GOLD", "SILVER", "BRONZE", "PLATINUM",
          "MARBLE", "GRANITE", "SLATE", "CHALK",
          "OXFORD", "BOND", "FLEET", "LOMBARD"
        ],
        groups: [
          { words: ["THAMES", "SEVERN", "TRENT", "CLYDE"], category: "Major regional river systems" },
          { words: ["GOLD", "SILVER", "BRONZE", "PLATINUM"], category: "Precious metals / podium medals" },
          { words: ["MARBLE", "GRANITE", "SLATE", "CHALK"], category: "Types of geological stone" },
          { words: ["OXFORD", "BOND", "FLEET", "LOMBARD"], category: "Famous historic thoroughfares" }
        ]
      }
    }
  }
};
