// Wheel: U - N - D - E - R - S - T - A
const DAILY_PUZZLE = {
  letters: ['U', 'N', 'D', 'E', 'R', 'S', 'T', 'A']
};

const VALID_WORDS = new Set([
  // Floor 4
  "TURN", "SEND", "NEAR", "REST", "RENT", "SAND", "STAR", "DART", "TEND", "RUST",
  // Floor 5
  "UNDER", "STAND", "TRAIN", "START", "SOUND", "NURSE", "TRADE", "TREND", "STARE",
  // Floor 6
  "SUNDER", "STRAND", "RETURN", "NATURE", "SUDDEN", "TENDER", "STRAIN", "UNITED",
  // Floor 7
  "STUDENT", "RESTART", "SURROUND", "UNSEAT", "REDATE", "NATURES",
  // Floor 8
  "UNDERFED", "UNSEATED", "RETRAINED",
  // Floor 9
  "UNDERSTAND", "RETRAINED", "UNDERSTATE",
  // Floor 10 (Target Winner)
  "UNDERSTAND", "UNDERSTATES"
]);
