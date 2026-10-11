// frontend/Mocks/gameLog.js
// Registro de jogos ficticio (demonstracao). status: "played" | "playing" | "planned".
// Em producao, estes dados vem do endpoint do Phoenix.
const entry = (userId, gameId, status, day) => ({ userId, gameId, status, updatedAt: `2026-${day}T18:00:00.000Z` });

export const gameLog = [
  entry("demo-player", "rdr2", "played", "06-20"),
  entry("demo-player", "elden", "played", "06-22"),
  entry("demo-player", "bg3", "played", "07-02"),
  entry("demo-player", "cyberpunk", "played", "07-10"),
  entry("demo-player", "outerwilds", "playing", "09-14"),
  entry("demo-player", "zelda", "planned", "09-20"),
  entry("demo-player", "witcher3", "planned", "09-21"),
  entry("u-aria", "tlou1", "played", "08-03"),
  entry("u-aria", "zelda", "played", "08-19"),
  entry("u-aria", "horizon", "playing", "09-30"),
  entry("u-leo", "gow", "played", "07-27"),
  entry("u-leo", "rdr2", "played", "08-11"),
  entry("u-leo", "jedi", "planned", "09-05"),
  entry("u-maya", "outerwilds", "played", "08-28"),
  entry("u-maya", "minecraft", "playing", "10-01"),
  entry("u-jon", "witcher3", "played", "08-08"),
  entry("u-jon", "bg3", "playing", "09-25"),
  entry("u-jon", "ff16", "planned", "10-03")
];
