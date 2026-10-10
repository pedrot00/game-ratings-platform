// Componentes DOM compartilhados entre Feed e Busca.
// As classes abaixo sao detalhes visuais, nao campos da API de jogos.
const coverClasses = {
  hogwarts: "cover--1",
  jedi: "cover--2",
  ff16: "cover--3",
  rdr2: "cover--4",
  tlou1: "cover--5",
  outerwilds: "cover--6",
  cyberpunk: "cover--7",
  elden: "cover--elden",
  gow: "cover--gow",
  witcher3: "cover--witcher",
  horizon: "cover--horizon",
  bg3: "cover--bg3",
  zelda: "cover--zelda",
  minecraft: "cover--minecraft"
};

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function svgIcon(name, className = "") {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  if (className) svg.setAttribute("class", className);
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", `#icon-${name}`);
  svg.append(use);
  return svg;
}

function createCover(game) {
  const figure = element("figure", `game-cover ${coverClasses[game.id] ?? ""}`.trim());
  const image = element("img");
  image.src = game.images.coverUrl;
  image.alt = `Cover art for ${game.title}`;
  image.loading = "lazy";
  image.addEventListener("error", () => figure.classList.add("has-no-image"));
  const fallback = element("span", "game-cover__fallback", game.title);
  fallback.setAttribute("aria-hidden", "true");
  figure.append(image, fallback);
  return figure;
}

function createRating(game, badge = false) {
  const wrapper = element("span", badge ? "rating-badge" : "rating");
  const label = `Rated ${game.ratingAverage.toFixed(1)} out of 5`;
  wrapper.setAttribute("aria-label", label);
  wrapper.append(
    svgIcon("star", "icon-star"),
    element("span", "rating-value", `${game.ratingAverage.toFixed(1)}${badge ? "" : "/5"}`)
  );
  return wrapper;
}

function gameUrl(game) {
  return `gamePage.html?game=${encodeURIComponent(game.id)}`;
}

function createLink(game, className = "", text = "Visit Game Page") {
  const link = element("a", className);
  link.href = gameUrl(game);
  link.setAttribute("aria-label", `View details for ${game.title}`);
  link.append(svgIcon("external"), document.createTextNode(text));
  return link;
}

function createListItem(game) {
  const item = element("li", "game-card");
  item.dataset.gameId = game.id;
  const article = element("article");
  item.append(article);
  return { item, article };
}

export function createCarouselCard(game) {
  const { item, article } = createListItem(game);
  const meta = element("div", "game-meta");
  meta.append(
    element("span", "game-title", game.title),
    createRating(game),
    createLink(game, "btn btn-visit")
  );
  article.append(createCover(game), meta);
  return item;
}

export function createSpotlightCard(game) {
  const { item, article } = createListItem(game);
  const figure = createCover(game);
  const caption = element("figcaption", "spotlight-panel");
  caption.append(
    element("h3", "", game.title),
    element("p", "", game.description || "Description coming soon."),
    createLink(game, "btn btn-visit")
  );
  figure.append(createRating(game, true), caption);
  article.append(figure);
  return item;
}

export function createCatalogCard(game) {
  const { item, article } = createListItem(game);
  const cover = createCover(game);
  cover.append(createRating(game, true));

  const coverLink = element("a", "catalog-cover-link");
  coverLink.href = gameUrl(game);
  coverLink.setAttribute("aria-label", `View details for ${game.title}`);
  coverLink.append(cover);

  const titleLink = element("a", "", game.title);
  titleLink.href = gameUrl(game);
  const heading = element("h3", "game-title");
  heading.append(titleLink);

  const year = game.releaseDate ? game.releaseDate.slice(0, 4) : "Date unavailable";
  const facts = element(
    "p", "catalog-card-facts",
    [year, game.genres[0], game.platforms.join(", ")].filter(Boolean).join(" · ")
  );
  const details = element("div", "catalog-card-details");
  details.append(heading, facts);
  article.append(coverLink, details);
  return item;
}
