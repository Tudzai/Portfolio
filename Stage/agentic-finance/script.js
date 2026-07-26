const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector("#primary-navigation");
const navigationLinks = [...document.querySelectorAll("#primary-navigation a")];
const currentYear = document.querySelector("#current-year");
const revealElements = [...document.querySelectorAll("[data-reveal]")];
const caseVideos = [...document.querySelectorAll(".case-video")];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function closeMenu() {
  menuButton?.setAttribute("aria-expanded", "false");
  navigation?.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

menuButton?.addEventListener("click", () => {
  const willOpen = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(willOpen));
  navigation?.classList.toggle("is-open", willOpen);
  document.body.classList.toggle("menu-open", willOpen);
});

navigationLinks.forEach((link) => link.addEventListener("click", closeMenu));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton?.getAttribute("aria-expanded") === "true") {
    closeMenu();
    menuButton.focus();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 760) {
    closeMenu();
  }
});

if (!reducedMotion.matches && "IntersectionObserver" in window) {
  document.documentElement.classList.add("js-motion");

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );

  revealElements.forEach((element) => revealObserver.observe(element));

  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    { threshold: 0.35 },
  );

  caseVideos.forEach((video) => videoObserver.observe(video));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

reducedMotion.addEventListener("change", (event) => {
  if (event.matches) {
    document.documentElement.classList.remove("js-motion");
    caseVideos.forEach((video) => video.pause());
  }
});

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}
