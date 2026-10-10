import { games } from "../Mocks/games.js";
import { createCatalogCard } from "./gameCards.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("catalog-form");
  const grid = document.getElementById("catalog-grid");
  const count = document.getElementById("catalog-count");
  const empty = document.getElementById("catalog-empty");
  const clear = document.getElementById("catalog-clear");
  const fields = ["q", "genre", "platform", "year", "rating", "sort"];

  function field(name) {
    return form.elements.namedItem(name);
  }

  function restoreFromUrl() {
    const params = new URLSearchParams(window.location.search);
    fields.forEach(name => {
      const control = field(name);
      const value = params.get(name);
      if (value === null) return;
      if (control.tagName === "INPUT" || [...control.options].some(option => option.value === value)) {
        control.value = value;
      }
    });
  }

  function normalize(value) {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function getCriteria() {
    return {
      q: field("q").value.trim(),
      genre: field("genre").value,
      platform: field("platform").value,
      year: Number(field("year").value) || 0,
      rating: Number(field("rating").value) || 0,
      sort: field("sort").value
    };
  }

  function updateUrl(criteria) {
    const params = new URLSearchParams();
    if (criteria.q) params.set("q", criteria.q);
    if (criteria.genre) params.set("genre", criteria.genre);
    if (criteria.platform) params.set("platform", criteria.platform);
    if (criteria.year) params.set("year", String(criteria.year));
    if (criteria.rating) params.set("rating", String(criteria.rating));
    if (criteria.sort !== "rating") params.set("sort", criteria.sort);
    const query = params.toString();
    history.replaceState(null, "", `${location.pathname}${query ? `?${query}` : ""}`);
  }

  function render(updateAddress = false) {
    const criteria = getCriteria();
    const search = normalize(criteria.q);
    const results = games.filter(game =>
      normalize(game.title).includes(search) &&
      (!criteria.genre || game.genres.includes(criteria.genre)) &&
      (!criteria.platform || game.platforms.includes(criteria.platform)) &&
      (!criteria.year || (game.releaseDate && Number(game.releaseDate.slice(0, 4)) >= criteria.year)) &&
      game.ratingAverage >= criteria.rating
    );

    results.sort((a, b) => {
      if (criteria.sort === "newest") return (b.releaseDate || "").localeCompare(a.releaseDate || "");
      if (criteria.sort === "title") return a.title.localeCompare(b.title, "en");
      return b.ratingAverage - a.ratingAverage || a.title.localeCompare(b.title, "en");
    });

    grid.replaceChildren(...results.map(createCatalogCard));
    count.textContent = `${results.length} game${results.length === 1 ? "" : "s"} found`;
    empty.hidden = results.length !== 0;
    if (updateAddress) updateUrl(criteria);
  }

  restoreFromUrl();
  render();
  form.addEventListener("submit", event => {
    event.preventDefault();
    render(true);
  });
  form.querySelectorAll("select").forEach(select => {
    select.addEventListener("change", () => render(true));
  });
  clear.addEventListener("click", () => {
    form.reset();
    render(true);
    field("q").focus();
  });
  document.getElementById("catalog-empty-clear").addEventListener("click", () => clear.click());
});
