const currentYear = document.querySelector("#current-year");
const backToTop = document.querySelector(".back-to-top");
const revealElements = [...document.querySelectorAll("[data-reveal]")];
const caseVideos = [...document.querySelectorAll(".case-video")];
const videoToggles = [...document.querySelectorAll("[data-video-toggle]")];
const scoreRows = [...document.querySelectorAll(".score-row")];
const demoHookVideo = document.querySelector(".demo-hook-video");
const demoPlayCover = document.querySelector("[data-demo-play-cover]");
const demoPlayButton = document.querySelector("[data-demo-play]");
const demoPlayLabel = document.querySelector("[data-demo-play-label]");
const captionButtons = [...document.querySelectorAll("[data-caption-language]")];
const captionOverlay = document.querySelector("[data-caption-overlay]");
const heroDemoEntry = document.querySelector(".hero-demo-entry");
const demoSection = document.querySelector("#demo");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const saveDataEnabled = Boolean(navigator.connection?.saveData);

if (heroDemoEntry && demoSection) {
  heroDemoEntry.addEventListener("click", (event) => {
    event.preventDefault();
    window.history.pushState(null, "", "#demo");
    window.scrollTo({
      top: demoSection.offsetTop,
      behavior: reducedMotion.matches ? "auto" : "smooth",
    });
  });
}

function setDemoPlaybackState(state) {
  if (!(demoHookVideo instanceof HTMLVideoElement) || !demoPlayCover || !demoPlayButton) {
    return;
  }

  const isPlaying = state === "playing";
  const labels = {
    ready: "Play demo",
    paused: "Resume demo",
    ended: "Replay demo",
  };

  demoHookVideo.dataset.playbackState = state;
  demoPlayCover.hidden = isPlaying;
  demoPlayButton.setAttribute("aria-label", labels[state] || "Play demo");

  if (demoPlayLabel) {
    demoPlayLabel.textContent = labels[state] || "Play demo";
  }
}

if (demoHookVideo && demoPlayButton) {
  demoPlayButton.addEventListener("click", async () => {
    if (demoHookVideo.ended) {
      demoHookVideo.currentTime = 0;
    }

    try {
      await demoHookVideo.play();
    } catch {
      setDemoPlaybackState("ready");
    }
  });

  demoHookVideo.addEventListener("play", () => setDemoPlaybackState("playing"));
  demoHookVideo.addEventListener("pause", () => {
    if (!demoHookVideo.ended) {
      setDemoPlaybackState(demoHookVideo.currentTime > 0 ? "paused" : "ready");
    }
  });
  demoHookVideo.addEventListener("ended", () => {
    demoHookVideo.currentTime = 0;
    setDemoPlaybackState("ended");
  });

  demoHookVideo.pause();
  demoHookVideo.currentTime = 0;
  setDemoPlaybackState("ready");
}

function renderActiveCaption(track) {
  if (!captionOverlay || !track) {
    return;
  }

  let activeCues = [...(track.activeCues ?? [])];
  if (activeCues.length === 0 && track.cues && demoHookVideo) {
    const currentTime = demoHookVideo.currentTime + 0.01;
    const matchingCue = [...track.cues].find(
      (cue) => cue.startTime <= currentTime && cue.endTime > currentTime,
    );
    activeCues = matchingCue ? [matchingCue] : [];
  }

  const activeText = activeCues
    .map((cue) => cue.text.trim())
    .filter(Boolean)
    .join(" ");

  captionOverlay.textContent = activeText;
}

function setCaptionLanguage(language) {
  if (!(demoHookVideo instanceof HTMLVideoElement)) {
    return;
  }

  const tracks = [...demoHookVideo.textTracks];
  let selectedTrack = null;

  tracks.forEach((track) => {
    const isSelected = track.kind === "captions" && track.language === language;
    track.mode = isSelected ? "hidden" : "disabled";
    if (isSelected) {
      selectedTrack = track;
    }
  });

  captionButtons.forEach((button) => {
    const isSelected = button.dataset.captionLanguage === language;
    button.classList.toggle("is-active", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

  if (captionOverlay) {
    captionOverlay.lang = language;
  }
  demoHookVideo.dataset.activeCaptionLanguage = language;
  renderActiveCaption(selectedTrack);
}

if (demoHookVideo && captionButtons.length > 0) {
  [...demoHookVideo.textTracks].forEach((track) => {
    track.addEventListener("cuechange", () => {
      if (track.language === demoHookVideo.dataset.activeCaptionLanguage) {
        renderActiveCaption(track);
      }
    });
  });

  demoHookVideo.querySelectorAll("track").forEach((trackElement) => {
    trackElement.addEventListener("load", () => {
      setCaptionLanguage(demoHookVideo.dataset.activeCaptionLanguage || "en");
    });
  });

  captionButtons.forEach((button) => {
    button.addEventListener("click", () => setCaptionLanguage(button.dataset.captionLanguage));
  });

  setCaptionLanguage("en");
}

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
  const toggle = videoToggles.find((button) => button.dataset.videoToggle === video.id);

  if (toggle) {
    const icon = toggle.querySelector(".video-toggle-icon");
    const text = toggle.querySelector(".video-toggle-text");

    toggle.setAttribute("aria-pressed", String(isPlaying));
    toggle.setAttribute("aria-label", isPlaying ? "Pause automation demo" : "Play automation demo");

    if (icon) {
      icon.textContent = isPlaying ? "Ⅱ" : "▶";
    }

    if (text) {
      text.textContent = "Watch";
    }
  }
}

function canAutoplayVideo(video) {
  return (
    video.dataset.autoplay !== "false" &&
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

const SCORE_MOTION = Object.freeze({
  enter: 0.22,
  stagger: 0.04,
  reveal: 0.18,
  exitScale: 1.012,
  labelScale: 1.07,
  travel: -42,
});

function initScoreMotion() {
  const gsapRuntime = window.gsap;

  if (!gsapRuntime || scoreRows.length === 0) {
    return null;
  }

  const media = gsapRuntime.matchMedia();

  media.add(
    {
      desktop: "(min-width: 761px) and (hover: hover) and (pointer: fine)",
      reduceMotion: "(prefers-reduced-motion: reduce)",
    },
    (context) => {
      const { desktop, reduceMotion } = context.conditions;
      const motionEnabled = desktop && !reduceMotion;
      document.documentElement.classList.toggle("gsap-score-motion", motionEnabled);

      if (!motionEnabled) {
        return undefined;
      }

      const cleanups = scoreRows.map((row) => {
        const skill = row.querySelector(".score-skill");
        const links = [...row.querySelectorAll(".score-evidence-link")];
        const labels = [...row.querySelectorAll(".score-evidence-label")];
        const destinations = [...row.querySelectorAll(".score-destination")];

        gsapRuntime.set(skill, { scale: 1, transformOrigin: "left center" });
        gsapRuntime.set(links, { x: 0 });
        gsapRuntime.set(labels, { scale: 1, transformOrigin: "left center" });
        gsapRuntime.set(destinations, {
          x: 12,
          scaleX: 0.55,
          autoAlpha: 0,
          transformOrigin: "right center",
        });

        const timeline = gsapRuntime
          .timeline({ paused: true, defaults: { overwrite: "auto" } })
          .addLabel("activate", 0)
          .to(
            skill,
            {
              scale: SCORE_MOTION.exitScale,
              duration: SCORE_MOTION.enter,
              ease: "power3.out",
            },
            "activate",
          )
          .to(
            links,
            {
              x: SCORE_MOTION.travel,
              duration: SCORE_MOTION.enter,
              ease: "power3.out",
              stagger: SCORE_MOTION.stagger,
            },
            "activate",
          )
          .to(
            labels,
            {
              scale: SCORE_MOTION.labelScale,
              duration: SCORE_MOTION.enter,
              ease: "power3.out",
              stagger: SCORE_MOTION.stagger,
            },
            "activate+=0.02",
          )
          .to(
            destinations,
            {
              x: 0,
              scaleX: 1,
              autoAlpha: 1,
              duration: SCORE_MOTION.reveal,
              ease: "power3.out",
              stagger: SCORE_MOTION.stagger,
            },
            "activate+=0.08",
          );

        const play = () => timeline.play();
        const reverse = () => {
          if (!row.contains(document.activeElement)) {
            timeline.reverse();
          }
        };
        const handleFocusOut = () => requestAnimationFrame(reverse);

        row.addEventListener("pointerenter", play);
        row.addEventListener("pointerleave", reverse);
        row.addEventListener("focusin", play);
        row.addEventListener("focusout", handleFocusOut);

        return () => {
          row.removeEventListener("pointerenter", play);
          row.removeEventListener("pointerleave", reverse);
          row.removeEventListener("focusin", play);
          row.removeEventListener("focusout", handleFocusOut);
          timeline.kill();
          gsapRuntime.set([skill, ...links, ...labels, ...destinations], {
            clearProps: "transform,opacity,visibility",
          });
        };
      });

      return () => {
        document.documentElement.classList.remove("gsap-score-motion");
        cleanups.forEach((cleanup) => cleanup());
      };
    },
  );

  return media;
}

const scoreMotionMedia = initScoreMotion();

window.addEventListener(
  "pagehide",
  () => {
    scoreMotionMedia?.revert();
  },
  { once: true },
);

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

if (backToTop) {
  let scrollFrame;

  const updateBackToTop = () => {
    const shouldShow = window.scrollY > Math.max(360, window.innerHeight * 0.7);
    backToTop.classList.toggle("is-visible", shouldShow);
    backToTop.tabIndex = shouldShow ? 0 : -1;
    scrollFrame = undefined;
  };

  const requestBackToTopUpdate = () => {
    if (scrollFrame !== undefined) {
      return;
    }

    scrollFrame = window.requestAnimationFrame(updateBackToTop);
  };

  updateBackToTop();
  window.addEventListener("scroll", requestBackToTopUpdate, { passive: true });
  window.addEventListener("resize", requestBackToTopUpdate);
}
