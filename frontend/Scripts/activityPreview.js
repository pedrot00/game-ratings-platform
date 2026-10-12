// Previa do feed na pagina inicial. Modulo separado de mainPage.js:
// se falhar, o restante da home continua funcionando.
import { DEMO_USER_ID } from "../Mocks/users.js";
import { getFollowingIds } from "./followStore.js";
import { getFeedForUser } from "./activityStore.js";
import { createActivityCard } from "./activityCards.js";

const PREVIEW_LIMIT = 6;

document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("activity-preview-list");
  const empty = document.getElementById("activity-preview-empty");
  const emptyText = document.getElementById("activity-preview-empty-text");
  if (!list || !empty || !emptyText) return;

  const following = getFollowingIds(DEMO_USER_ID);
  const items = getFeedForUser(DEMO_USER_ID, { limit: PREVIEW_LIMIT });
  list.replaceChildren(...items.map(item => createActivityCard(item, { compact: true })));
  empty.hidden = items.length > 0;
  if (!items.length) {
    emptyText.textContent = following.length
      ? "The players you follow haven't posted anything yet."
      : "Follow other players to see their reviews, ratings and game log updates here.";
  }
});
