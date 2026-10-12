// frontend/Mocks/likes.js
// Curtidas ficticias em reviews (demonstracao). reviewId foi curtida por userId.
// Em producao, o Phoenix guarda um par unico (review_id, user_id) e devolve as
// contagens junto com cada review. Ninguem curte a propria review.
const like = (reviewId, userId, moment) => ({
  reviewId, userId, liked: true, updatedAt: `2026-${moment}:00.000Z`
});

export const likes = [
  // rv-001 (Aria, RDR2)
  like("rv-001", "u-leo", "09-19T10:12"), like("rv-001", "u-maya", "09-20T18:40"),
  like("rv-001", "u-jon", "09-21T21:05"), like("rv-001", "demo-player", "09-22T09:30"),
  // rv-002 (Leo, RDR2)
  like("rv-002", "u-aria", "09-25T08:15"), like("rv-002", "demo-player", "09-26T20:00"),
  // rv-003 (Demo, RDR2)
  like("rv-003", "u-aria", "10-02T11:20"), like("rv-003", "u-leo", "10-02T22:45"), like("rv-003", "u-maya", "10-05T07:50"),
  // rv-004 (Maya, Elden Ring)
  like("rv-004", "u-aria", "09-23T13:10"), like("rv-004", "u-jon", "09-24T19:30"), like("rv-004", "u-leo", "09-25T16:00"),
  // rv-005 (Jon, Elden Ring)
  like("rv-005", "u-maya", "10-04T12:35"),
  // rv-006 (Aria, Witcher 3)
  like("rv-006", "u-leo", "08-31T09:00"), like("rv-006", "u-maya", "09-01T17:25"),
  like("rv-006", "u-jon", "09-02T14:10"), like("rv-006", "demo-player", "09-03T21:40"),
  // rv-007 (Leo, God of War)
  like("rv-007", "u-aria", "09-28T15:55"), like("rv-007", "u-jon", "09-29T10:20"), like("rv-007", "demo-player", "10-07T18:05"),
  // rv-008 (Maya, Horizon)
  like("rv-008", "u-aria", "09-08T11:45"),
  // rv-009 (Jon, Baldur's Gate 3)
  like("rv-009", "u-maya", "09-30T09:15"), like("rv-009", "u-leo", "10-01T20:30"),
  like("rv-009", "u-aria", "10-02T13:50"), like("rv-009", "demo-player", "10-08T22:10"),
  // rv-010 (Leo, Cyberpunk)
  like("rv-010", "u-jon", "10-03T08:40"),
  // rv-011 (Maya, Zelda)
  like("rv-011", "u-aria", "09-13T12:00"), like("rv-011", "u-leo", "09-14T19:15"), like("rv-011", "u-jon", "09-15T10:50"),
  // rv-012 (Aria, Outer Wilds)
  like("rv-012", "u-maya", "10-07T08:25"), like("rv-012", "u-leo", "10-07T17:40"),
  like("rv-012", "u-jon", "10-08T21:15"), like("rv-012", "demo-player", "10-09T10:05"),
  // rv-013 (Jon, Minecraft)
  like("rv-013", "u-maya", "09-15T16:30"),
  // rv-014 (Maya, Hogwarts Legacy)
  like("rv-014", "u-jon", "10-06T14:20"),
  // rv-016 (Jon, FFXVI)
  like("rv-016", "u-aria", "09-18T09:35"), like("rv-016", "u-leo", "09-19T23:00"),
  // rv-017 (Aria, The Last of Us)
  like("rv-017", "u-maya", "09-27T11:10"), like("rv-017", "u-leo", "09-28T20:45"), like("rv-017", "u-jon", "09-29T15:25"),
  // rv-018 (Demo, Elden Ring)
  like("rv-018", "u-aria", "10-05T09:50"), like("rv-018", "u-maya", "10-06T18:20"), like("rv-018", "u-jon", "10-07T12:40"),
  // rv-019 (Demo, Baldur's Gate 3)
  like("rv-019", "u-jon", "10-07T21:30"), like("rv-019", "u-leo", "10-08T08:55"),
  // rv-020 (Demo, Cyberpunk)
  like("rv-020", "u-aria", "10-09T19:10")
];
