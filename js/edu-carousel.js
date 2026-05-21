(function () {
  const track = document.getElementById("eduTrack");
  const prevBtn = document.getElementById("eduPrev");
  const nextBtn = document.getElementById("eduNext");
  const dotsContainer = document.getElementById("eduDots");

  if (!track || !prevBtn || !nextBtn) return;

  const slides = track.querySelectorAll(".edu-slide");
  const total = slides.length;
  let index = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "edu-carousel__dot" + (i === 0 ? " edu-carousel__dot--active" : "");
    dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll(".edu-carousel__dot");
  const viewport = track.parentElement;

  function updateUI() {
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const slideWidth = slides[0].offsetWidth;
    const step = slideWidth + gap;
    const viewportWidth = viewport.offsetWidth;
    const centerOffset = (viewportWidth - slideWidth) / 2;

    let offset = index * step - centerOffset;
    const maxOffset = Math.max(0, (total - 1) * step + slideWidth - viewportWidth);
    offset = Math.max(-centerOffset, Math.min(maxOffset, offset));

    track.style.transform = `translateX(${-offset}px)`;
    slides.forEach((slide, i) => slide.classList.toggle("edu-slide--active", i === index));
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === total - 1;
    prevBtn.classList.toggle("edu-carousel__btn--active", index > 0);
    nextBtn.classList.toggle("edu-carousel__btn--active", index < total - 1);
    dots.forEach((d, i) => d.classList.toggle("edu-carousel__dot--active", i === index));
  }

  function goTo(i) {
    index = Math.max(0, Math.min(total - 1, i));
    updateUI();
  }

  prevBtn.addEventListener("click", () => goTo(index - 1));
  nextBtn.addEventListener("click", () => goTo(index + 1));

  let touchStartX = 0;
  track.parentElement.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );
  track.parentElement.addEventListener(
    "touchend",
    (e) => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goTo(index + 1);
        else goTo(index - 1);
      }
    },
    { passive: true }
  );

  window.addEventListener("resize", updateUI);
  updateUI();
})();
