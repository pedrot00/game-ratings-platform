import { DEMO_USER_ID, getUserById } from "../Mocks/users.js";
import { isFollowing, toggleFollow } from "./followStore.js";

const make = (tag, className = "", content = "") => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = content;
  return element;
};

// Botao Follow/Following reutilizado no perfil e no feed.
// onChange(following, persisted) deixa a pagina decidir o que re-renderizar.
export function createFollowButton({ targetId, viewerId = DEMO_USER_ID, small = false, onChange } = {}) {
  const target = getUserById(targetId);
  const button = make("button", "follow-btn");
  button.type = "button";
  if (small) button.classList.add("follow-btn--small");
  const idle = make("span", "follow-label follow-label--idle");
  const hover = make("span", "follow-label follow-label--hover");
  button.append(idle, hover);

  function paint() {
    const following = isFollowing(viewerId, targetId);
    button.classList.toggle("review-button-primary", !following);
    button.classList.toggle("review-button-secondary", following);
    button.classList.toggle("is-following", following);
    button.setAttribute("aria-pressed", String(following));
    button.setAttribute("aria-label", `${following ? "Unfollow" : "Follow"} ${target?.displayName ?? "this player"}`);
    idle.textContent = following ? "Following" : "Follow";
    hover.textContent = following ? "Unfollow" : "";
  }

  button.addEventListener("click", () => {
    const result = toggleFollow({ followerId: viewerId, followeeId: targetId });
    paint();
    onChange?.(result.following, result.persisted);
  });
  paint();
  return button;
}
