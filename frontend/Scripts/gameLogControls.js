import { GAME_LOG_STATUSES, getLogEntry, setGameStatus, statusLabel } from "./gameLogStore.js";

// Botoes de status exibidos na pagina do jogo. Clicar no status ativo remove o jogo do registro.
export function mountGameLog({ gameId, userId, container, hint }) {
  const buttons = new Map();
  const current = () => getLogEntry(gameId, userId)?.status ?? null;

  function paint() {
    const active = current();
    for (const [id, button] of buttons) {
      button.setAttribute("aria-pressed", String(id === active));
      button.classList.toggle("is-active", id === active);
    }
  }

  for (const status of GAME_LOG_STATUSES) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "game-log-option";
    button.textContent = status.label;
    button.addEventListener("click", () => {
      const next = current() === status.id ? null : status.id;
      const { persisted } = setGameStatus({ gameId, userId, status: next });
      paint();
      hint.textContent = (next ? `Added to “${statusLabel(next)}”.` : "Removed from your game log.") +
        (persisted ? " Saved in this browser only." : " Browser storage is unavailable; this lasts for the session.");
    });
    buttons.set(status.id, button);
    container.append(button);
  }
  paint();
}
