// frontend/Mocks/follows.js
// Relacoes de "seguir" ficticias (demonstracao). followerId segue followeeId.
// Em producao, estes dados vem do endpoint do Phoenix (par unico follower/followee).
const edge = (followerId, followeeId, day) => ({
  followerId, followeeId, following: true, updatedAt: `2026-${day}T12:00:00.000Z`
});

export const follows = [
  // O perfil demo segue tres pessoas e NAO segue o Jon (para demonstrar o botao "Follow").
  edge("demo-player", "u-aria", "07-01"),
  edge("demo-player", "u-leo", "07-05"),
  edge("demo-player", "u-maya", "08-12"),
  edge("u-aria", "demo-player", "07-03"),
  edge("u-jon", "demo-player", "09-02"),
  edge("u-aria", "u-maya", "06-20"),
  edge("u-leo", "u-aria", "06-25"),
  edge("u-maya", "u-aria", "07-14"),
  edge("u-jon", "u-aria", "08-01"),
  edge("u-jon", "u-leo", "08-09")
];
