/**
 * ============================================================================
 * 11TH FLOOR CLUSTERS - DAILY PUZZLE DATA (clusters-data.js)
 * ============================================================================
 * Standard: Airtight global logic, clean categorical separation, zero overlap.
 * ============================================================================
 */

window.CLUSTERS_DATA = {
  "2026-09-26": {
    date: "2026-09-26",
    title: "Puzzle #01: Global Alignment",
    floors: {
      // Floor 01: 12 Tiles (2 groups of 3 + 6 clean distractors)
      1: {
        type: "distractor-12",
        tiles: ["LONDON", "PARIS", "TOKYO", "NILE", "AMAZON", "YANGTZE", "PIANO", "GUITAR", "VIOLIN", "DRUM", "FLUTE", "TRUMPET"],
        groups: [
          { words: ["LONDON", "PARIS", "TOKYO"], category: "Major global capital cities" },
          { words: ["NILE", "AMAZON", "YANGTZE"], category: "Major world rivers" }
        ]
      },
      // Floor 02: 12 Tiles (2 groups of 3 + 6 clean distractors)
      2: {
        type: "distractor-12",
        tiles: ["GOLD", "SILVER", "BRONZE", "DIAMOND", "RUBY", "EMERALD", "SQUARE", "CIRCLE", "TRIANGLE", "RECTANGLE", "OVAL", "PENTAGON"],
        groups: [
          { words: ["GOLD", "SILVER", "BRONZE"], category: "Precious metals / podium medals" },
          { words: ["DIAMOND", "RUBY", "EMERALD"], category: "Precious gemstones" }
        ]
      },
      // Floor 03: 12 Tiles (2 groups of 3 + 6 clean distractors)
      3: {
        type: "distractor-12",
        tiles: ["MARS", "VENUS", "JUPITER", "LION", "TIGER", "LEOPARD", "EAGLE", "HAWK", "FALCON", "OWL", "CROW", "SWAN"],
        groups: [
          { words: ["MARS", "VENUS", "JUPITER"], category: "Planets of the solar system" },
          { words: ["LION", "TIGER", "LEOPARD"], category: "Large wild cats" }
        ]
      },
      // Floor 04: 12 Tiles (2 groups of 3 + 6 clean distractors)
      4: {
        type: "distractor-12",
        tiles: ["RED", "BLUE", "GREEN", "OAK", "PINE", "MAPLE", "APPLE", "BANANA", "ORANGE", "GRAPE", "MANGO", "PEACH"],
        groups: [
          { words: ["RED", "BLUE", "GREEN"], category: "Primary and standard colors" },
          { words: ["OAK", "PINE", "MAPLE"], category: "Common tree species" }
        ]
      },

      // Floors 05–09: 12 Tiles (3 groups of 3 = 9 correct, 3 distractors)
      5: {
        type: "distractor-12-three",
        tiles: ["FOOTBALL", "TENNIS", "CRICKET", "CHESS", "POKER", "BRIDGE", "VIOLIN", "CELLO", "FLUTE", "PYTHON", "VIPER", "COBRA"],
        groups: [
          { words: ["FOOTBALL", "TENNIS", "CRICKET"], category: "Popular global ball sports" },
          { words: ["CHESS", "POKER", "BRIDGE"], category: "Strategic tabletop / card games" },
          { words: ["VIOLIN", "CELLO", "FLUTE"], category: "Orchestral instruments" }
        ]
      },
      6: {
        type: "distractor-12-three",
        tiles: ["IRON", "COPPER", "TIN", "WHEAT", "RICE", "MAIZE", "MILK", "WATER", "JUICE", "SOFA", "TABLE", "CHAIR"],
        groups: [
          { words: ["IRON", "COPPER", "TIN"], category: "Industrial base metals" },
          { words: ["WHEAT", "RICE", "MAIZE"], category: "Major global staple grains" },
          { words: ["MILK", "WATER", "JUICE"], category: "Common daily beverages" }
        ]
      },
      7: {
        type: "distractor-12-three",
        tiles: ["PLATO", "ARISTOTLE", "SOCRATES", "BACH", "MOZART", "BEETHOVEN", "NEWTON", "EINSTEIN", "DARWIN", "SHAKESPEARE", "DANTE", "HOMER"],
        groups: [
          { words: ["PLATO", "ARISTOTLE", "SOCRATES"], category: "Ancient Greek philosophers" },
          { words: ["BACH", "MOZART", "BEETHOVEN"], category: "Classical composers" },
          { words: ["NEWTON", "EINSTEIN", "DARWIN"], category: "Revolutionary scientists" }
        ]
      },
      8: {
        type: "distractor-12-three",
        tiles: ["PACIFIC", "ATLANTIC", "INDIAN", "EVEREST", "K2", "KILIMANJARO", "SAHARA", "GOBI", "KALAHARI", "LYON", "MARSEILLE", "NICE"],
        groups: [
          { words: ["PACIFIC", "ATLANTIC", "INDIAN"], category: "Major world oceans" },
          { words: ["EVEREST", "K2", "KILIMANJARO"], category: "Highest mountain peaks" },
          { words: ["SAHARA", "GOBI", "KALAHARI"], category: "Major global deserts" }
        ]
      },
      9: {
        type: "distractor-12-three",
        tiles: ["TUDOR", "STUART", "WINDSOR", "SPRING", "SUMMER", "AUTUMN", "NORTH", "SOUTH", "EAST", "RAIN", "SNOW", "WIND"],
        groups: [
          { words: ["TUDOR", "STUART", "WINDSOR"], category: "Historic royal houses / dynasties" },
          { words: ["SPRING", "SUMMER", "AUTUMN"], category: "Temperate calendar seasons" },
          { words: ["NORTH", "SOUTH", "EAST"], category: "Primary cardinal directions" }
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
