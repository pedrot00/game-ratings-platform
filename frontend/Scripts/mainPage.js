import { getGameById } from "../Mocks/games.js";
import { createCarouselCard, createSpotlightCard } from "./gameCards.js";

// Somente a ordem e a selecao dos cards pertencem a pagina.
// Todos os seus atributos sao obtidos do catalogo compartilhado.
const featuredIds = ["hogwarts", "jedi", "ff16", "rdr2", "tlou1", "outerwilds", "cyberpunk"];
const browseIds = ["elden", "gow", "witcher3", "rdr2", "horizon", "bg3", "cyberpunk", "zelda"];

function selectGames(ids) {
  return ids.map(getGameById).filter(Boolean);
}

document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector(".carousel-track");
  const grid = document.querySelector(".browse .game-grid");
  const carouselGames = selectGames(featuredIds);
  const browseGames = selectGames(browseIds);

  if (track) track.replaceChildren(...carouselGames.map(createCarouselCard));

  const carousel = document.querySelector(".carousel");
  const previous = carousel?.querySelector(".carousel-arrow--prev");
  const next = carousel?.querySelector(".carousel-arrow--next");

  next?.addEventListener("click", () => {
    if (track?.firstElementChild) track.append(track.firstElementChild);
  });
  previous?.addEventListener("click", () => {
    if (track?.lastElementChild) track.prepend(track.lastElementChild);
  });

  const filters = [...document.querySelectorAll(".browse-header .filters button.filter")];
  function renderBrowse(genre = "All") {
    if (!grid) return;
    const results = genre === "All"
      ? browseGames
      : browseGames.filter(game => game.genres.includes(genre));
    grid.replaceChildren(...results.map(createSpotlightCard));
    if (!results.length) {
      const item = document.createElement("li");
      item.textContent = "No games found for this genre.";
      grid.append(item);
    }
  }

  renderBrowse();
  filters.forEach(button => {
    button.addEventListener("click", () => {
      filters.forEach(filter => {
        const active = filter === button;
        filter.classList.toggle("is-active", active);
        filter.setAttribute("aria-pressed", String(active));
      });
      renderBrowse(button.textContent.trim());
    });
  });

  document.querySelectorAll('a[href="#"]').forEach(link => {
    link.addEventListener("click", event => event.preventDefault());
  });
});