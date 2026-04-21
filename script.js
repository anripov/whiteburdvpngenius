// WHITEBURD — subtle motion choreography
(() => {
  const nav = document.querySelector(".nav");
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 16);
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // reveal on scroll
  const targets = document.querySelectorAll(
    ".section .display, .section__index, .manifest__grid, .craft__item, .network__grid li, .access__frame, .footer__mark, .footer__grid"
  );
  targets.forEach((el) => el.classList.add("reveal"));

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    targets.forEach((el) => io.observe(el));
  } else {
    targets.forEach((el) => el.classList.add("is-in"));
  }

  // gentle parallax of the hero visual
  const stage = document.querySelector(".hero__svg");
  const halo = document.querySelector(".hero__halo");
  const hero = document.querySelector(".hero");
  if (stage && hero && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let rx = 0, ry = 0, tx = 0, ty = 0;
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      rx = px * 6;
      ry = -py * 6;
    });
    hero.addEventListener("mouseleave", () => { rx = 0; ry = 0; });

    const tick = () => {
      tx += (rx - tx) * 0.06;
      ty += (ry - ty) * 0.06;
      stage.style.transform = `translate3d(${tx * 1.2}px, ${ty * 1.2}px, 0) rotateX(${-ty * 0.35}deg) rotateY(${tx * 0.35}deg)`;
      if (halo) halo.style.transform = `translate(calc(-50% + ${tx * 0.6}px), calc(-50% + ${ty * 0.6}px))`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
})();
