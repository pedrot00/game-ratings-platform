document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector(".carousel");
  const track = document.querySelector(".carousel-track");

  if (carousel && track) {
    const previous = carousel.querySelector(".carousel-arrow--prev");
    const next = carousel.querySelector(".carousel-arrow--next");

    const updateButtons = () => {
      const start = track.scrollLeft <= 1;
      const end = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;

      previous.disabled = start;
      next.disabled = end;
    };

    const scrollCarousel = direction => {
      const card = track.querySelector(".game-card");
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      const amount = card.offsetWidth + gap;

      track.scrollBy({
        left: direction * amount,
        behavior: "smooth"
      });
    };

    previous.addEventListener("click", () => scrollCarousel(-1));
    next.addEventListener("click", () => scrollCarousel(1));

    track.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);

    updateButtons();
  }

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