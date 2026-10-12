import { getGameById } from "../Mocks/games.js";
import { DEMO_USER_ID } from "../Mocks/users.js";
import { getPublicUser } from "./userStore.js";
import { createFollowButton } from "./followButton.js";
import { createLikeButton } from "./likeButton.js";

const make = (tag, className = "", content = "") => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = content;
  return element;
};

const DAY = 86_400_000;
const dateFormat = options => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...options });

// "5m ago", "3h ago", "2d ago"; depois de uma semana, a data completa.
export function formatRelative(iso, now = Date.now()) {
  const diff = now - Date.parse(iso);
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}d ago`;
  return dateFormat({ month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
}

// Titulo do grupo por dia (UTC, como o resto do site): Today, Yesterday ou a data.
export function formatDayLabel(iso, now = Date.now()) {
  const day = value => Math.floor(Date.parse(value) / DAY);
  const gap = Math.floor(now / DAY) - day(iso);
  if (gap === 0) return "Today";
  if (gap === 1) return "Yesterday";
  return dateFormat({ weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date(iso));
}

const STATUS_COPY = {
  played: { verb: "played", pill: "Played" },
  playing: { verb: "is playing", pill: "Playing" },
  planned: { verb: "plans to play", pill: "Plan to play" }
};

function createCover(game) {
  const link = make("a", "activity-cover");
  link.href = `gamePage.html?game=${encodeURIComponent(game.id)}`;
  link.setAttribute("aria-label", `View ${game.title}`);
  const image = document.createElement("img");
  image.src = game.images.coverUrl;
  image.alt = "";
  image.loading = "lazy";
  image.addEventListener("error", () => link.classList.add("has-no-image"));
  link.append(image, make("span", "activity-cover-fallback", game.title));
  return link;
}

export function createActivityCard(activity, { compact = false, viewerId = DEMO_USER_ID } = {}) {
  const user = getPublicUser(activity.userId);
  const game = getGameById(activity.gameId);
  const item = make("li", "activity-item");
  if (!user || !game) return item;

  const card = make("article", `activity-card activity-card--${activity.type}`);
  if (compact) card.classList.add("activity-card--compact");

  const main = make("div", "activity-main");
  const line = make("p", "activity-line");
  const author = make("a", "activity-user", user.displayName);
  author.href = `profilePage.html?user=${encodeURIComponent(user.id)}`;
  const gameLink = make("a", "activity-game", game.title);
  gameLink.href = `gamePage.html?game=${encodeURIComponent(game.id)}`;
  const verb = activity.type === "review" ? "reviewed" : STATUS_COPY[activity.status]?.verb ?? "logged";
  line.append(author, ` ${verb} `, gameLink);
  main.append(line);

  if (activity.type === "review") {
    const stars = make("div", "activity-rating", "★".repeat(activity.rating) + "☆".repeat(5 - activity.rating));
    stars.setAttribute("role", "img");
    stars.setAttribute("aria-label", `${activity.rating} out of 5 stars`);
    main.append(stars, make("h3", "activity-title", activity.title), make("p", "activity-body", activity.body));
  } else {
    main.append(make("span", "activity-status", STATUS_COPY[activity.status]?.pill ?? ""));
  }

  const meta = make("p", "activity-meta");
  const time = make("time", "", formatRelative(activity.at));
  time.dateTime = activity.at;
  meta.append(time);
  if (activity.edited) meta.append(" · Edited");
  if (activity.type === "review" && activity.reviewId) {
    // Reviews podem ser curtidas direto do feed.
    const footer = make("div", "activity-footer");
    footer.append(meta, createLikeButton({
      reviewId: activity.reviewId, authorId: activity.userId, authorName: user.displayName, viewerId
    }));
    main.append(footer);
  } else {
    main.append(meta);
  }

  card.append(createCover(game), main);
  item.append(card);
  return item;
}

// Linha de pessoa (avatar, nome, @handle e botao Follow), usada em listas.
export function createPersonRow(user, { viewerId = DEMO_USER_ID, note, onChange } = {}) {
  const row = make("li", "person-row");
  const avatar = make("span", "review-avatar", user.displayName.slice(0, 1).toUpperCase());
  avatar.setAttribute("aria-hidden", "true");
  const text = make("div", "person-text");
  const name = make("a", "person-name", user.displayName);
  name.href = `profilePage.html?user=${encodeURIComponent(user.id)}`;
  text.append(name, make("span", "person-handle", note ? `@${user.username} · ${note}` : `@${user.username}`));
  row.append(avatar, text);
  if (user.id !== viewerId) row.append(createFollowButton({ targetId: user.id, viewerId, small: true, onChange }));
  return row;
}
