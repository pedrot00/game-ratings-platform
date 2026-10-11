// Registro de jogos no perfil. Carregado sob demanda por profilePage.js:
// se este modulo falhar, o restante do perfil continua funcionando.
import { getGameById } from "../Mocks/games.js";
import { GAME_LOG_STATUSES, getLogByUser, setGameStatus, statusLabel } from "./gameLogStore.js";
import { DEMO_USER_ID } from "../Mocks/users.js";

const make = (tag, className = "", content = "") => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = content;
  return element;
};

function createTile(entry, { isOwner, onChange }) {
  const game = getGameById(entry.gameId);
  const li = make("li", "profile-game-tile");
  if (!game) return li;
  const link = make("a", "profile-game-cover");
  link.href = `gamePage.html?game=${encodeURIComponent(game.id)}`;
  link.setAttribute("aria-label", `View ${game.title}`);
  const image = document.createElement("img");
  image.src = game.images.coverUrl;
  image.alt = "";
  image.loading = "lazy";
  image.addEventListener("error", () => link.classList.add("has-no-image"));
  link.append(image, make("span", "profile-game-fallback", game.title));
  const name = make("a", "profile-game-name", game.title);
  name.href = link.href;
  const info = make("div", "profile-game-info");
  info.append(name);
  if (isOwner) {
    const select = make("select", "log-select");
    select.setAttribute("aria-label", `Change status of ${game.title}`);
    for (const status of GAME_LOG_STATUSES) select.append(new Option(status.label, status.id, false, status.id === entry.status));
    select.append(new Option("Remove from log", ""));
    select.addEventListener("change", () => onChange(entry.gameId, select.value));
    info.append(select);
  } else {
    info.append(make("span", "log-badge", statusLabel(entry.status)));
  }
  li.append(link, info);
  return li;
}

export function mountProfileLog({ user, isOwner, onSaved }) {
  const tabsHost = document.getElementById("profile-log-tabs");
  const grid = document.getElementById("profile-log-grid");
  const empty = document.getElementById("profile-log-empty");
  if (!tabsHost || !grid || !empty) return;

  let filter = "all";
  const tabs = new Map();
  for (const tab of [{ id: "all", label: "All" }, ...GAME_LOG_STATUSES]) {
    const button = make("button", "filter", tab.label);
    button.type = "button";
    button.addEventListener("click", () => { filter = tab.id; render(); });
    tabs.set(tab.id, { button, label: tab.label });
    tabsHost.append(button);
  }

  function change(gameId, status) {
    const saved = setGameStatus({ gameId, userId: DEMO_USER_ID, status: status || null });
    render();
    onSaved?.(saved.persisted
      ? "Your game log was saved in this browser, not on a server."
      : "Your game log was updated in this session. Browser storage is unavailable.");
  }

  function render() {
    const entries = getLogByUser(user.id);
    for (const [id, tab] of tabs) {
      const count = id === "all" ? entries.length : entries.filter(entry => entry.status === id).length;
      tab.button.textContent = `${tab.label} (${count})`;
      tab.button.classList.toggle("is-active", id === filter);
      tab.button.setAttribute("aria-pressed", String(id === filter));
    }
    const visible = filter === "all" ? entries : entries.filter(entry => entry.status === filter);
    grid.replaceChildren(...visible.map(entry => createTile(entry, { isOwner, onChange: change })));
    empty.hidden = visible.length > 0;
  }
  render();
}
