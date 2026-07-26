const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector("#primary-navigation");
const navigationLinks = [...document.querySelectorAll("#primary-navigation a")];
const currentYear = document.querySelector("#current-year");
const revealElements = [...document.querySelectorAll("[data-reveal]")];
const caseVideos = [...document.querySelectorAll(".case-video")];
const videoToggles = [...document.querySelectorAll("[data-video-toggle]")];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const saveDataEnabled = Boolean(navigator.connection?.saveData);

function getVideoRate(video) {
  const requestedRate = Number.parseFloat(video.dataset.playbackRate ?? "");
  return Number.isFinite(requestedRate) && requestedRate > 0 ? requestedRate : 1;
}

function applyVideoRate(video) {
  const rate = getVideoRate(video);
  video.defaultPlaybackRate = rate;
  video.playbackRate = rate;
}

function updateVideoUi(video) {
  const isPlaying = !video.paused && !video.ended;
  const media = video.closest(".case-media-video");
  const stateText = media?.querySelector(".video-state-text");
  const toggle = videoToggles.find((button) => button.dataset.videoToggle === video.id);

  media?.classList.toggle("is-playing", isPlaying);

  if (stateText) {
    stateText.textContent = isPlaying ? "Running" : "Ready";
  }

  if (toggle) {
    const icon = toggle.querySelector(".video-toggle-icon");
    const text = toggle.querySelector(".video-toggle-text");

    toggle.setAttribute("aria-pressed", String(isPlaying));
    toggle.setAttribute("aria-label", isPlaying ? "Pause automation demo" : "Play automation demo");

    if (icon) {
      icon.textContent = isPlaying ? "Ⅱ" : "▶";
    }

    if (text) {
      text.textContent = isPlaying ? "Pause" : "Play";
    }
  }
}

function canAutoplayVideo(video) {
  return (
    video.dataset.inView === "true" &&
    video.dataset.userPaused !== "true" &&
    !document.hidden &&
    !reducedMotion.matches &&
    !saveDataEnabled
  );
}

function syncVideoPlayback(video) {
  applyVideoRate(video);

  if (canAutoplayVideo(video)) {
    video.play().catch(() => updateVideoUi(video));
  } else {
    video.pause();
  }
}

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
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

caseVideos.forEach((video) => {
  video.dataset.inView = "false";

  if (saveDataEnabled) {
    video.preload = "none";
  }

  applyVideoRate(video);
  updateVideoUi(video);

  video.addEventListener("loadedmetadata", () => applyVideoRate(video));
  video.addEventListener("play", () => {
    applyVideoRate(video);
    updateVideoUi(video);
  });
  video.addEventListener("pause", () => updateVideoUi(video));
});

videoToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const video = document.getElementById(toggle.dataset.videoToggle);
    if (!(video instanceof HTMLVideoElement)) {
      return;
    }

    if (video.paused) {
      video.dataset.userPaused = "false";
      applyVideoRate(video);
      video.play().catch(() => updateVideoUi(video));
    } else {
      video.dataset.userPaused = "true";
      video.pause();
    }
  });
});

if ("IntersectionObserver" in window) {
  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        const isInView = entry.isIntersecting && entry.intersectionRatio >= 0.35;
        video.dataset.inView = String(isInView);

        if (isInView) {
          syncVideoPlayback(video);
        } else {
          video.pause();
        }
      });
    },
    { threshold: [0, 0.35, 0.7] },
  );

  caseVideos.forEach((video) => videoObserver.observe(video));
}

document.addEventListener("visibilitychange", () => {
  caseVideos.forEach((video) => {
    if (document.hidden) {
      video.pause();
    } else {
      syncVideoPlayback(video);
    }
  });
});

reducedMotion.addEventListener("change", (event) => {
  if (event.matches) {
    document.documentElement.classList.remove("js-motion");
    caseVideos.forEach((video) => video.pause());
  } else {
    caseVideos.forEach(syncVideoPlayback);
  }
});

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}
