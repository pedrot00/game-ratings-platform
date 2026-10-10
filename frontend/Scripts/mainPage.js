document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector(".carousel");
  const track = document.querySelector(".carousel-track");

  if (carousel && track) {
    const previous = carousel.querySelector(".carousel-arrow--prev");
    const next = carousel.querySelector(".carousel-arrow--next");

    next.addEventListener("click", () => {
      if (track.children.length > 0) {
        const firstCard = track.firstElementChild;
        track.appendChild(firstCard);
      }
    });

    previous.addEventListener("click", () => {
      if (track.children.length > 0) {
        const lastCard = track.lastElementChild;
        track.prepend(lastCard);
      }
    });
  }

  // Filtros da seção Browse
  document.querySelectorAll(".filter").forEach(filter => {
    filter.addEventListener("click", () => {
      document.querySelector(".filter.is-active")?.classList.remove("is-active");
      document.querySelector(".filter[aria-pressed='true']")?.setAttribute("aria-pressed", "false");

      filter.classList.add("is-active");
      filter.setAttribute("aria-pressed", "true");
    });
  });

  document.querySelectorAll("a[href='#']").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
    });
  });
});