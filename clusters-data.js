/**
 * ============================================================================
 * 11TH FLOOR CLUSTERS - DAILY PUZZLE DATA (clusters-data.js)
 * ============================================================================
 * Rules: 12-tile pools with distractors (Floors 1-4), scaling up to 16-tile walls.
 * ============================================================================
 */

window.CLUSTERS_DATA = {
  "2026-09-26": {
    date: "2026-09-26",
    title: "Puzzle #01: Global Alignment",
    floors: {
      // Floors 01–04: 12 Tiles total (2 correct groups of 3 = 6 correct, 6 distractors)
      1: {
        type: "distractor-12",
        tiles: ["LITRE", "KILOGRAM", "METRE", "SECOND", "KELVIN", "AMPERE", "ALPHA", "BETA", "GAMMA", "DELTA", "OMEGA", "SIGMA"],
        groups: [
          { words: ["LITRE", "KILOGRAM", "METRE"], category: "Common metric base units" },
          { words: ["SECOND", "KELVIN", "AMPERE"], category: "Other international SI base units" }
        ]
      },
      2: {
        type: "distractor-12",
        tiles: ["COPPER", "SILVER", "GOLD", "OXYGEN", "NITROGEN", "HELIUM", "IRON", "ZINC", "TIN", "LEAD", "NICKEL", "CARBON"],
        groups: [
          { words: ["COPPER", "SILVER", "GOLD"], category: "Precious or historical metals" },
          { words: ["OXYGEN", "NITROGEN", "HELIUM"], category: "Gaseous chemical elements" }
        ]
      },
      3: {
        type: "distractor-12",
        tiles: ["MARS", "VENUS", "EARTH", "SIRIUS", "VEGA", "RIGEL", "JUPITER", "SATURN", "URANUS", "POLARIS", "BETELGEUSE", "DENEB"],
        groups: [
          { words: ["MARS", "VENUS", "EARTH"], category: "Inner rocky planets" },
          { words: ["SIRIUS", "VEGA", "RIGEL"], category: "Bright visible stars" }
        ]
      },
      4: {
        type: "distractor-12",
        tiles: ["NILE", "AMAZON", "YANGTZE", "EVEREST", "K2", "KILIMANJARO", "DANUBE", "VOLGA", "MEKONG", "DENALI", "FUJI", "ELBRUS"],
        groups: [
          { words: ["NILE", "AMAZON", "YANGTZE"], category: "Major global rivers" },
          { words: ["EVEREST", "K2", "KILIMANJARO"], category: "Iconic mountain peaks" }
        ]
      },

      // Floors 05–09: 12 Tiles total (3 groups of 3 = 9 correct, 3 distractors)
      5: {
        type: "distractor-12-three",
        tiles: ["LION", "TIGER", "LEOPARD", "EAGLE", "HAWK", "FALCON", "PYTHON", "VIPER", "COBRA", "WOLF", "BEAR", "FOX"],
        groups: [
          { words: ["LION", "TIGER", "LEOPARD"], category: "Large wild cats" },
          { words: ["EAGLE", "HAWK", "FALCON"], category: "Birds of prey" },
          { words: ["PYTHON", "VIPER", "COBRA"], category: "Notable predatory snakes" }
        ]
      },
      6: {
        type: "distractor-12-three",
        tiles: ["BACH", "MOZART", "BEETHOVEN", "PLATO", "ARISTOTLE", "SOCRATES", "MARS", "VENUS", "MERCURY", "CHOPIN", "VIVALDI", "LISZT"],
        groups: [
          { words: ["BACH", "MOZART", "BEETHOVEN"], category: "Classical composers" },
          { words: ["PLATO", "ARISTOTLE", "SOCRATES"], category: "Ancient Greek philosophers" },
          { words: ["MARS", "VENUS", "MERCURY"], category: "Inner solar system planets" }
        ]
      },
      7: {
        type: "distractor-12-three",
        tiles: ["TOKYO", "LONDON", "PARIS", "DIAMOND", "RUBY", "EMERALD", "COPPER", "IRON", "TIN", "BERLIN", "MADRID", "ROME"],
        groups: [
          { words: ["TOKYO", "LONDON", "PARIS"], category: "Major global capital cities" },
          { words: ["DIAMOND", "RUBY", "EMERALD"], category: "Precious gemstones" },
          { words: ["COPPER", "IRON", "TIN"], category: "Common industrial base metals" }
        ]
      },
      8: {
        type: "distractor-12-three",
        tiles: ["APOLLO", "HERMES", "ATHENA", "SQUARE", "CIRCLE", "TRIANGLE", "PIANO", "GUITAR", "VIOLIN", "ZEUS", "HESERA", "ARES"],
        groups: [
          { words: ["APOLLO", "HERMES", "ATHENA"], category: "Greek mythological figures" },
          { words: ["SQUARE", "CIRCLE", "TRIANGLE"], category: "Basic geometric shapes" },
          { words: ["PIANO", "GUITAR", "VIOLIN"], category: "Standard musical instruments" }
        ]
      },
      9: {
        type: "distractor-12-three",
        tiles: ["WHIST", "BRIDGE", "EUCHRE", "TUDOR", "STUART", "WINDSOR", "RAIN", "SNOW", "WIND", "POKER", "CHECKERS", "CHESS"],
        groups: [
          { words: ["WHIST", "BRIDGE", "EUCHRE"], category: "Traditional card games" },
          { words: ["TUDOR", "STUART", "WINDSOR"], category: "Royal dynasties / houses" },
          { words: ["RAIN", "SNOW", "WIND"], category: "Common meteorological weather types" }
        ]
      },

      // Floor 10: Final 16-Tile Wall (4 groups of 4)
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
