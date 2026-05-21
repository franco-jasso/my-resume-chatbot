(function () {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealElements = document.querySelectorAll(".reveal");

  function setVisible(el, visible) {
    el.classList.toggle("is-visible", visible);
  }

  if (prefersReduced) {
    revealElements.forEach((el) => setVisible(el, true));
    return;
  }

  let lastScrollY = window.scrollY;
  let scrollDirection = "down";

  window.addEventListener(
    "scroll",
    () => {
      scrollDirection = window.scrollY > lastScrollY ? "down" : "up";
      lastScrollY = window.scrollY;
    },
    { passive: true }
  );

  function setTimelineDelay(item) {
    const timeline = item.closest(".timeline");
    if (!timeline) return;

    const items = [...timeline.querySelectorAll(".timeline__item.reveal")];
    const index = items.indexOf(item);
    const staggerIndex = scrollDirection === "down" ? index : items.length - 1 - index;

    item.style.transitionDelay = `${0.1 + staggerIndex * 0.22}s`;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target;

        if (el.classList.contains("timeline__item")) {
          if (entry.isIntersecting) {
            setTimelineDelay(el);
          } else {
            el.style.transitionDelay = "0s";
          }
        }

        setVisible(el, entry.isIntersecting);
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -5% 0px",
      threshold: 0.15,
    }
  );

  revealElements.forEach((el) => observer.observe(el));
})();
