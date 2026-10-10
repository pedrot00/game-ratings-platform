// frontend/Mocks/games.js
// Fonte unica de dados simulados. Os nomes/tipos representam o contrato esperado da API.
// Notas, contagens, precos e descricoes sao demonstrativos; nao sao dados verificados de uma loja.
// URLs de imagens sao relativas as paginas em frontend/Pages/.
export const games = [
  {
    "id": "rdr2",
    "title": "Red Dead Redemption II",
    "description": "Winner of over 175 Game of the Year Awards and recipient of over 250 perfect scores, Red Dead Redemption 2 is an epic tale of honor and loyalty at the dawn of the modern age. Arthur Morgan and the Van der Linde gang are outlaws on the run. With federal agents and the best bounty hunters in the nation massing on their heels, the gang must rob, steal and fight their way across the rugged heartland of America in order to survive.",
    "developer": "Rockstar Games",
    "publisher": "Rockstar Games",
    "releaseDate": "2018-10-26",
    "genres": [
      "Action",
      "Adventure"
    ],
    "platforms": [
      "PC",
      "PlayStation",
      "Xbox"
    ],
    "themes": [
      "Open World"
    ],
    "ratingAverage": 4.9,
    "ratingCount": 25000,
    "price": {
      "amount": 59.99,
      "currency": "USD"
    },
    "images": {
      "coverUrl": "../assets/images/red-dead-redemption-2.jpg",
      "backgroundUrl": "../assets/images/red-dead-redemption-2.jpg"
    }
  },
  {
    "id": "elden",
    "title": "Elden Ring",
    "description": "A vast world filled with mysteries and dangers. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between. Explore breathtaking landscapes and complex dungeons seamlessly connected in the largest FromSoftware game to date.",
    "developer": "FromSoftware",
    "publisher": "Bandai Namco Entertainment",
    "releaseDate": "2022-02-25",
    "genres": [
      "Action",
      "RPG"
    ],
    "platforms": [
      "PC",
      "PlayStation",
      "Xbox"
    ],
    "themes": [
      "Dark Fantasy"
    ],
    "ratingAverage": 4.8,
    "ratingCount": 40000,
    "price": {
      "amount": 39.99,
      "currency": "USD"
    },
    "images": {
      "coverUrl": "../assets/images/elden-ring.jpg",
      "backgroundUrl": "../assets/images/elden-ring.jpg"
    }
  },
  {
    "id": "witcher3",
    "title": "The Witcher 3: Wild Hunt",
    "description": "You are Geralt of Rivia, mercenary monster slayer. Before you stands a war-torn, monster-infested continent you can explore at will. Your current contract? Tracking down Ciri — the Child of Prophecy, a living weapon that can alter the shape of the world.",
    "developer": "CD PROJEKT RED",
    "publisher": "CD PROJEKT RED",
    "releaseDate": "2015-05-18",
    "genres": [
      "RPG",
      "Adventure"
    ],
    "platforms": [
      "PC",
      "PlayStation",
      "Xbox",
      "Nintendo Switch"
    ],
    "themes": [
      "Open World",
      "Story Rich"
    ],
    "ratingAverage": 4.9,
    "ratingCount": 50000,
    "price": {
      "amount": 29.99,
      "currency": "USD"
    },
    "images": {
      "coverUrl": "../assets/images/the-witcher-3-wild-hunt.jpg",
      "backgroundUrl": "../assets/images/the-witcher-3-wild-hunt.jpg"
    }
  },
  {
    "id": "gow",
    "title": "God of War Ragnarök",
    "description": "Embark on an epic and unflinching journey as Kratos and Atreus struggle with holding on and letting go in the Nine Realms.",
    "developer": "Santa Monica Studio",
    "publisher": "Sony Interactive Entertainment",
    "releaseDate": "2022-11-09",
    "genres": [
      "Action",
      "Adventure"
    ],
    "platforms": [
      "PC",
      "PlayStation"
    ],
    "themes": [],
    "ratingAverage": 4.7,
    "ratingCount": null,
    "price": null,
    "images": {
      "coverUrl": "../assets/images/god-of-war-ragnarok.jpg",
      "backgroundUrl": "../assets/images/god-of-war-ragnarok.jpg"
    }
  },
  {
    "id": "horizon",
    "title": "Horizon Forbidden West",
    "description": "Join Aloy as she braves the Forbidden West, a majestic but dangerous frontier that conceals mysterious new threats.",
    "developer": "Guerrilla Games",
    "publisher": "Sony Interactive Entertainment",
    "releaseDate": "2022-02-18",
    "genres": [
      "Action",
      "Adventure"
    ],
    "platforms": [
      "PC",
      "PlayStation"
    ],
    "themes": [],
    "ratingAverage": 4.6,
    "ratingCount": null,
    "price": null,
    "images": {
      "coverUrl": "../assets/images/horizon-forbidden-west.jpg",
      "backgroundUrl": "../assets/images/horizon-forbidden-west.jpg"
    }
  },
  {
    "id": "bg3",
    "title": "Baldur's Gate 3",
    "description": "Gather your party and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival.",
    "developer": "Larian Studios",
    "publisher": "Larian Studios",
    "releaseDate": "2023-08-03",
    "genres": [
      "RPG",
      "Strategy"
    ],
    "platforms": [
      "PC",
      "PlayStation",
      "Xbox"
    ],
    "themes": [],
    "ratingAverage": 4.8,
    "ratingCount": null,
    "price": null,
    "images": {
      "coverUrl": "../assets/images/baldurs-gate-3.jpg",
      "backgroundUrl": "../assets/images/baldurs-gate-3.jpg"
    }
  },
  {
    "id": "cyberpunk",
    "title": "Cyberpunk 2077",
    "description": "Explore Night City, a megalopolis obsessed with power, glamour, and body modification in this open-world action RPG.",
    "developer": "CD PROJEKT RED",
    "publisher": "CD PROJEKT",
    "releaseDate": "2020-12-10",
    "genres": [
      "Action",
      "RPG"
    ],
    "platforms": [
      "PC",
      "PlayStation",
      "Xbox"
    ],
    "themes": [
      "Open World"
    ],
    "ratingAverage": 4.4,
    "ratingCount": null,
    "price": null,
    "images": {
      "coverUrl": "../assets/images/cyberpunk-2077.jpg",
      "backgroundUrl": "../assets/images/cyberpunk-2077.jpg"
    }
  },
  {
    "id": "zelda",
    "title": "The Legend of Zelda: Tears of the Kingdom",
    "description": "An epic adventure across the land and skies of Hyrule awaits. Harness the power of Link's new abilities to craft, explore, and survive.",
    "developer": "Nintendo EPD",
    "publisher": "Nintendo",
    "releaseDate": "2023-05-12",
    "genres": [
      "Adventure"
    ],
    "platforms": [
      "Nintendo Switch"
    ],
    "themes": [],
    "ratingAverage": 4.8,
    "ratingCount": null,
    "price": null,
    "images": {
      "coverUrl": "../assets/images/zelda-tears-of-the-kingdom.jpg",
      "backgroundUrl": "../assets/images/zelda-tears-of-the-kingdom.jpg"
    }
  },
  {
    "id": "outerwilds",
    "title": "Outer Wilds",
    "description": "Explore a mysterious solar system trapped in a time loop, uncovering its secrets through curiosity and discovery.",
    "developer": "Mobius Digital",
    "publisher": "Annapurna Interactive",
    "releaseDate": "2019-05-28",
    "genres": [
      "Indie",
      "Adventure"
    ],
    "platforms": [
      "PC",
      "PlayStation",
      "Xbox",
      "Nintendo Switch"
    ],
    "themes": [],
    "ratingAverage": 4.8,
    "ratingCount": null,
    "price": null,
    "images": {
      "coverUrl": "../assets/images/outer-wilds.jpg",
      "backgroundUrl": "../assets/images/outer-wilds.jpg"
    }
  },
  {
    "id": "minecraft",
    "title": "Minecraft",
    "description": "Build, explore and survive in a sandbox world made of blocks.",
    "developer": "Mojang Studios",
    "publisher": "Mojang Studios",
    "releaseDate": "2011-11-18",
    "genres": [
      "Sandbox",
      "Adventure"
    ],
    "platforms": [
      "PC",
      "PlayStation",
      "Xbox",
      "Nintendo Switch"
    ],
    "themes": [],
    "ratingAverage": 4.7,
    "ratingCount": null,
    "price": null,
    "images": {
      "coverUrl": "../assets/images/minecraft.jpg",
      "backgroundUrl": "../assets/images/minecraft.jpg"
    }
  },
  {
    "id": "hogwarts",
    "title": "Hogwarts Legacy",
    "description": "Explore the wizarding world in an open-world action RPG set in the 1800s.",
    "developer": "Avalanche Software",
    "publisher": "Warner Bros. Games",
    "releaseDate": "2023-02-10",
    "genres": [
      "Action",
      "RPG"
    ],
    "platforms": [
      "PC",
      "PlayStation",
      "Xbox",
      "Nintendo Switch"
    ],
    "themes": [],
    "ratingAverage": 4.6,
    "ratingCount": null,
    "price": null,
    "images": {
      "coverUrl": "../assets/images/hogwarts-legacy.jpg",
      "backgroundUrl": "../assets/images/hogwarts-legacy.jpg"
    }
  },
  {
    "id": "jedi",
    "title": "Star Wars Jedi: Survivor",
    "description": "Continue Cal Kestis’s journey as a Jedi, facing new threats and exploring distant worlds.",
    "developer": "Respawn Entertainment",
    "publisher": "Electronic Arts",
    "releaseDate": "2023-04-28",
    "genres": [
      "Action",
      "Adventure"
    ],
    "platforms": [
      "PC",
      "PlayStation",
      "Xbox"
    ],
    "themes": [],
    "ratingAverage": 4.4,
    "ratingCount": null,
    "price": null,
    "images": {
      "coverUrl": "../assets/images/star-wars-jedi-survivor.jpg",
      "backgroundUrl": "../assets/images/star-wars-jedi-survivor.jpg"
    }
  },
  {
    "id": "ff16",
    "title": "Final Fantasy XVI",
    "description": "Follow Clive Rosfield through the world of Valisthea in a story of conflict and powerful Eikons.",
    "developer": "Square Enix",
    "publisher": "Square Enix",
    "releaseDate": "2023-06-22",
    "genres": [
      "Action",
      "RPG"
    ],
    "platforms": [
      "PC",
      "PlayStation"
    ],
    "themes": [],
    "ratingAverage": 4.7,
    "ratingCount": null,
    "price": null,
    "images": {
      "coverUrl": "../assets/images/final-fantasy-xvi.jpg",
      "backgroundUrl": "../assets/images/final-fantasy-xvi.jpg"
    }
  },
  {
    "id": "tlou1",
    "title": "The Last of Us Part I",
    "description": "Travel across a post-pandemic world with Joel and Ellie in a story of survival and connection.",
    "developer": "Naughty Dog",
    "publisher": "Sony Interactive Entertainment",
    "releaseDate": "2022-09-02",
    "genres": [
      "Action",
      "Adventure"
    ],
    "platforms": [
      "PC",
      "PlayStation"
    ],
    "themes": [],
    "ratingAverage": 4.9,
    "ratingCount": null,
    "price": null,
    "images": {
      "coverUrl": "../assets/images/the-last-of-us-part-1.jpg",
      "backgroundUrl": "../assets/images/the-last-of-us-part-1.jpg"
    }
  }
];

export function getGameById(id) {
  return games.find(game => game.id === id) ?? null;
}
