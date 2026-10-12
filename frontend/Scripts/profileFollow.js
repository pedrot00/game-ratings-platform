// Seguir/deixar de seguir no perfil + listas de seguindo/seguidores.
// Carregado sob demanda por profilePage.js: se falhar, o perfil continua funcionando.
import { getPublicUser } from "./userStore.js";
import { getFollowerIds, getFollowingIds } from "./followStore.js";
import { createFollowButton } from "./followButton.js";
import { createPersonRow } from "./activityCards.js";

const make = (tag, className = "", content = "") => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = content;
  return element;
};

export function mountProfileFollow({ user, isOwner, onSaved }) {
  const slot = document.getElementById("profile-follow-slot");
  const tabsHost = document.getElementById("profile-people-tabs");
  const list = document.getElementById("profile-people-list");
  const empty = document.getElementById("profile-people-empty");
  const followingCount = document.getElementById("profile-following-count");
  const followersCount = document.getElementById("profile-followers-count");
  if (!slot || !tabsHost || !list || !empty || !followingCount || !followersCount) return;

  const tabDefs = [{ id: "following", label: "Following" }, { id: "followers", label: "Followers" }];
  let tab = "following";
  const tabs = new Map();
  for (const def of tabDefs) {
    const button = make("button", "filter", def.label);
    button.type = "button";
    button.addEventListener("click", () => { tab = def.id; render(); });
    tabs.set(def.id, { button, label: def.label });
    tabsHost.append(button);
  }

  document.querySelectorAll("[data-people-tab]").forEach(link => {
    link.addEventListener("click", () => {
      tab = link.dataset.peopleTab;
      render();
      document.getElementById("profile-people")?.scrollIntoView({ block: "start" });
    });
  });

  function notify(person) {
    return (following, persisted) => {
      onSaved?.(`${following ? `You are now following ${person.displayName}.` : `You unfollowed ${person.displayName}.`} ` +
        (persisted ? "Saved in this browser, not on a server." : "Browser storage is unavailable, so this only lasts for this session."));
      render();
    };
  }

  // O dono do perfil nao segue a si mesmo: so os outros perfis mostram o botao.
  slot.hidden = isOwner;
  if (!isOwner) slot.append(createFollowButton({ targetId: user.id, onChange: notify(user) }));

  function render() {
    const following = getFollowingIds(user.id);
    const followers = getFollowerIds(user.id);
    followingCount.textContent = String(following.length);
    followersCount.textContent = String(followers.length);
    for (const [id, entry] of tabs) {
      const total = id === "following" ? following.length : followers.length;
      entry.button.textContent = `${entry.label} (${total})`;
      entry.button.classList.toggle("is-active", id === tab);
      entry.button.setAttribute("aria-pressed", String(id === tab));
    }
    const people = (tab === "following" ? following : followers).map(getPublicUser).filter(Boolean);
    list.replaceChildren(...people.map(person => createPersonRow(person, { onChange: notify(person) })));
    empty.hidden = people.length > 0;
    empty.textContent = tab === "following"
      ? "Not following anyone yet."
      : "No followers yet.";
  }
  render();
}
