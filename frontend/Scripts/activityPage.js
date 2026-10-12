import { DEMO_USER_ID, users } from "../Mocks/users.js";
import { getGameById } from "../Mocks/games.js";
import { getPublicUser } from "./userStore.js";
import { getFollowingIds } from "./followStore.js";
import { getReviewsByUser } from "./reviewStore.js";
import { ACTIVITY_TYPES, getFeedForUser, getPopularGames } from "./activityStore.js";
import { createActivityCard, createPersonRow, formatDayLabel } from "./activityCards.js";

const PAGE_SIZE = 12;
const SUGGESTION_LIMIT = 4;

const make = (tag, className = "", content = "") => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = content;
  return element;
};
const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;
const byId = id => document.getElementById(id);

function createPopularItem(stat) {
  const game = getGameById(stat.gameId);
  const item = make("li", "popular-item");
  if (!game) return item;
  const cover = make("a", "popular-cover");
  cover.href = `gamePage.html?game=${encodeURIComponent(game.id)}`;
  cover.setAttribute("aria-label", `View ${game.title}`);
  const image = document.createElement("img");
  image.src = game.images.coverUrl;
  image.alt = "";
  image.loading = "lazy";
  image.addEventListener("error", () => cover.classList.add("has-no-image"));
  cover.append(image);
  const text = make("div", "popular-text");
  const title = make("a", "popular-title", game.title);
  title.href = cover.href;
  const meta = stat.average === null
    ? plural(stat.players, "player")
    : `${plural(stat.players, "player")} · ★ ${stat.average.toFixed(1)}`;
  text.append(title, make("span", "popular-meta", meta));
  item.append(cover, text);
  return item;
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  let type = ACTIVITY_TYPES.some(item => item.id === params.get("type")) ? params.get("type") : "all";
  let shown = PAGE_SIZE;

  const filters = byId("activity-filters");
  const groups = byId("activity-groups");
  const count = byId("activity-count");
  const empty = byId("activity-empty");
  const emptyTitle = byId("activity-empty-title");
  const emptyText = byId("activity-empty-text");
  const more = byId("activity-more");
  const feedback = byId("activity-feedback");

  const tabs = new Map();
  for (const tab of ACTIVITY_TYPES) {
    const button = make("button", "filter", tab.label);
    button.type = "button";
    button.addEventListener("click", () => { type = tab.id; shown = PAGE_SIZE; render(); });
    tabs.set(tab.id, { button, label: tab.label });
    filters.append(button);
  }
  more.addEventListener("click", () => { shown += PAGE_SIZE; render(); });

  function onFollowChange(person) {
    return (following, persisted) => {
      feedback.textContent = `${following ? `You are now following ${person.displayName}.` : `You unfollowed ${person.displayName}.`} ` +
        (persisted ? "Saved in this browser, not on a server." : "Browser storage is unavailable, so this only lasts for this session.");
      feedback.hidden = false;
      render();
    };
  }

  function renderFeed() {
    const followingIds = getFollowingIds(DEMO_USER_ID);
    for (const [id, tab] of tabs) {
      const total = getFeedForUser(DEMO_USER_ID, { type: id }).length;
      tab.button.textContent = `${tab.label} (${total})`;
      tab.button.classList.toggle("is-active", id === type);
      tab.button.setAttribute("aria-pressed", String(id === type));
    }
    const items = getFeedForUser(DEMO_USER_ID, { type });
    const visible = items.slice(0, shown);

    const sections = [];
    let currentLabel = null;
    let currentList = null;
    for (const activity of visible) {
      const label = formatDayLabel(activity.at);
      if (label !== currentLabel) {
        currentLabel = label;
        const section = make("section", "activity-day");
        const heading = make("h3", "activity-day-title", label);
        currentList = make("ul", "activity-list");
        currentList.setAttribute("aria-label", `Activity from ${label}`);
        section.append(heading, currentList);
        sections.push(section);
      }
      currentList.append(createActivityCard(activity));
    }
    groups.replaceChildren(...sections);
    count.textContent = items.length ? plural(items.length, "update") : "";

    empty.hidden = items.length > 0;
    if (!items.length) {
      if (!followingIds.length) {
        emptyTitle.textContent = "You're not following anyone yet";
        emptyText.textContent = "Follow a few players from the suggestions on this page and their reviews, ratings and game log updates will show up here.";
      } else {
        emptyTitle.textContent = "Nothing here yet";
        emptyText.textContent = type === "all"
          ? "The players you follow haven't posted anything yet."
          : "None of the players you follow have posted this kind of update yet.";
      }
    }
    const remaining = items.length - visible.length;
    more.hidden = remaining <= 0;
    more.textContent = `Load more (${remaining} left)`;
  }

  function renderPeople() {
    const followingIds = getFollowingIds(DEMO_USER_ID);
    const following = followingIds.map(getPublicUser).filter(Boolean);
    byId("activity-following-count").textContent = String(following.length);
    byId("activity-following").replaceChildren(
      ...following.map(person => createPersonRow(person, { onChange: onFollowChange(person) }))
    );
    byId("activity-following-empty").hidden = following.length > 0;

    const suggested = users
      .filter(user => user.id !== DEMO_USER_ID && !followingIds.includes(user.id))
      .map(user => ({ user: getPublicUser(user.id), reviews: getReviewsByUser(user.id).length }))
      .filter(entry => entry.user)
      .sort((a, b) => b.reviews - a.reviews || a.user.displayName.localeCompare(b.user.displayName))
      .slice(0, SUGGESTION_LIMIT);
    byId("activity-suggested").replaceChildren(
      ...suggested.map(({ user, reviews }) => createPersonRow(user, { note: plural(reviews, "review"), onChange: onFollowChange(user) }))
    );
    byId("activity-suggested-panel").hidden = suggested.length === 0;

    const popular = getPopularGames(DEMO_USER_ID);
    byId("activity-popular").replaceChildren(...popular.map(createPopularItem));
    byId("activity-popular-panel").hidden = popular.length === 0;
  }

  function render() {
    renderFeed();
    renderPeople();
  }
  render();

  document.querySelectorAll('a[href="#"]').forEach(link => {
    link.addEventListener("click", event => event.preventDefault());
  });
});
