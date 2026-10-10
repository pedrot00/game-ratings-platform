<<<<<<< HEAD
import { getGameById } from "../Mocks/games.js";
import { DEMO_USER_ID } from "../Mocks/users.js";
import { getReviewForUser, getReviewsByGame, saveDemoReview } from "./reviewStore.js";
import { createReviewCard } from "./reviewCards.js";
import { mountReviewModal } from "./reviewModal.js";

document.addEventListener("DOMContentLoaded", () => {
  const gameId = new URLSearchParams(window.location.search).get("game");
  const game = getGameById(gameId);

  if (!game) {
    document.querySelector(".game-content").hidden = true;
    document.getElementById("game-hero").hidden = true;
    document.getElementById("game-reviews").hidden = true;
    document.getElementById("game-not-found").hidden = false;
    document.title = "Game not found — GameAval.io";
    return;
  }

  const setText = (id, value) => {
    document.getElementById(id).textContent = value;
  };

  setText("game-title", game.title);
  setText("game-desc", game.description || "Description coming soon.");
  setText("game-dev", game.developer || "Developer unavailable");
  setText("game-rating", `${game.ratingAverage.toFixed(1)}/5${game.ratingCount !== null ? ` (${game.ratingCount.toLocaleString("en-US")} Reviews)` : ""}`);
  setText("game-date", game.releaseDate
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${game.releaseDate}T00:00:00Z`))
    : "Release date unavailable");

  const cover = document.getElementById("game-cover-img");
  cover.src = game.images.coverUrl;
  cover.alt = `Cover art for ${game.title}`;
  cover.addEventListener("error", () => {
    document.getElementById("game-cover-figure").classList.add("has-no-image");
  });

  const hero = document.getElementById("game-hero");
  const backgroundUrl = game.images.backgroundUrl || game.images.coverUrl;
  hero.style.backgroundImage = `linear-gradient(180deg, rgba(9, 12, 18, 0.4) 0%, var(--color-bg) 100%), url("${backgroundUrl}")`;

  const tags = document.getElementById("game-tags");
  const labels = [...new Set([...game.genres, ...game.themes])];
  tags.replaceChildren(...labels.map((label, index) => {
    const span = document.createElement("span");
    span.className = index === 0 ? "filter is-active" : "filter";
    span.textContent = label;
    return span;
  }));

  const purchase = document.getElementById("game-purchase");
  if (game.price) {
    setText("game-price", new Intl.NumberFormat("en-US", { style: "currency", currency: game.price.currency }).format(game.price.amount));
    purchase.hidden = false;
  }

  // O formulario de reviews e independente da origem: Perfil e Detalhes
  // vao reutilizar o mesmo modal e a mesma estrutura de dados.
  const list = document.getElementById("reviews-list");
  const count = document.getElementById("reviews-count");
  const empty = document.getElementById("reviews-empty");
  const button = document.getElementById("review-create");
  const feedback = document.getElementById("review-feedback");

  function renderReviews() {
    const items = getReviewsByGame(game.id);
    list.replaceChildren(...items.map(review => createReviewCard(review, { currentUserId: DEMO_USER_ID })));
    count.textContent = `${items.length} community review${items.length === 1 ? "" : "s"}`;
    empty.hidden = items.length !== 0;
    button.textContent = getReviewForUser(game.id, DEMO_USER_ID)
      ? "Edit your review" : "Write a review";
  }

  const modal = mountReviewModal({
    onSave: ({ gameId, rating, title, body }) => {
      const result = saveDemoReview({ gameId, userId: DEMO_USER_ID, rating, title, body });
      renderReviews();
      feedback.textContent = result.persisted
        ? "Your demo review was saved in this browser. It has not been sent to a server."
        : "Your demo review is visible for this session. Browser storage was unavailable.";
      feedback.hidden = false;
    }
  });

  button.addEventListener("click", () => {
    modal.open({ gameId: game.id, review: getReviewForUser(game.id, DEMO_USER_ID) });
  });
  renderReviews();

  document.title = `${game.title} — GameAval.io`;
});
=======
// game-ratings-platform/frontend/Scripts/gamePage.js
document.addEventListener("DOMContentLoaded", () => {
  const gamesDatabase = {
    rdr2: {
      title: "Red Dead Redemption II",
      price: "$59.99",
      rating: "4.9/5 (25K Reviews)",
      developer: "Rockstar Games",
      releaseDate: "Oct 26, 2018",
      tags: ["Action", "Adventure", "Open World"],
      desc: "Winner of over 175 Game of the Year Awards and recipient of over 250 perfect scores, Red Dead Redemption 2 is an epic tale of honor and loyalty at the dawn of the modern age. Arthur Morgan and the Van der Linde gang are outlaws on the run. With federal agents and the best bounty hunters in the nation massing on their heels, the gang must rob, steal and fight their way across the rugged heartland of America in order to survive.",
      bgImage: "../assets/images/red-dead-redemption-2.jpg",
      coverImage: "../assets/images/red-dead-redemption-2.jpg",
      coverClass: "cover--4"
    },
    elden: {
      title: "Elden Ring",
      price: "$39.99",
      rating: "4.8/5 (40K Reviews)",
      developer: "FromSoftware",
      releaseDate: "Feb 25, 2022",
      tags: ["Action", "RPG", "Dark Fantasy"],
      desc: "A vast world filled with mysteries and dangers. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between. Explore breathtaking landscapes and complex dungeons seamlessly connected in the largest FromSoftware game to date.",
      bgImage: "../assets/images/elden-ring.jpg",
      coverImage: "../assets/images/elden-ring.jpg",
      coverClass: "cover--elden"
    },
    witcher3: {
      title: "The Witcher 3: Wild Hunt",
      price: "$29.99",
      rating: "4.9/5 (50K Reviews)",
      developer: "CD PROJEKT RED",
      releaseDate: "May 18, 2015",
      tags: ["RPG", "Open World", "Story Rich"],
      desc: "You are Geralt of Rivia, mercenary monster slayer. Before you stands a war-torn, monster-infested continent you can explore at will. Your current contract? Tracking down Ciri — the Child of Prophecy, a living weapon that can alter the shape of the world.",
      bgImage: "../assets/images/the-witcher-3-wild-hunt.jpg",
      coverImage: "../assets/images/the-witcher-3-wild-hunt.jpg",
      coverClass: "cover--witcher"
    }
  };

  const urlParams = new URLSearchParams(window.location.search);
  let gameId = urlParams.get('game');

  if (!gameId || !gamesDatabase[gameId]) {
    gameId = 'rdr2'; 
  }

  const gameInfo = gamesDatabase[gameId];

  document.getElementById("game-title").innerText = gameInfo.title;
  document.getElementById("game-price").innerText = gameInfo.price;
  document.getElementById("game-desc").innerText = gameInfo.desc;
  document.getElementById("game-rating").innerText = gameInfo.rating;
  document.getElementById("game-dev").innerText = gameInfo.developer;
  document.getElementById("game-date").innerText = gameInfo.releaseDate;
  
  document.getElementById("game-hero").style.backgroundImage = `linear-gradient(180deg, rgba(9, 12, 18, 0.4) 0%, var(--color-bg) 100%), url('${gameInfo.bgImage}')`;
  document.getElementById("game-cover-img").src = gameInfo.coverImage;
  document.getElementById("game-cover-figure").className = `game-cover ${gameInfo.coverClass}`;

  const tagsContainer = document.getElementById("game-tags");
  tagsContainer.innerHTML = "";
  gameInfo.tags.forEach((tag, index) => {
    const span = document.createElement("span");
    span.className = index === 0 ? "filter is-active" : "filter";
    span.innerText = tag;
    tagsContainer.appendChild(span);
  });
  
  document.title = `${gameInfo.title} — GameAval.io`;
});
>>>>>>> a8d3c0b (add: pagina template dos jogos; fix: roleta e cards mainPage)
