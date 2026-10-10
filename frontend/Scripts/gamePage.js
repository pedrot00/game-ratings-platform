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