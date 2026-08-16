(function () {
  "use strict";

  const stage = document.querySelector(".models-decision-visual");
  const cockpit = stage?.querySelector(".decision-cockpit");
  if (!stage || !cockpit) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const buttons = Array.from(cockpit.querySelectorAll("[data-cockpit-scenario]"));
  const metric = cockpit.querySelector("[data-cockpit-ebitda]");
  const variance = cockpit.querySelector("[data-cockpit-variance]");
  const line = cockpit.querySelector("[data-cockpit-line]");
  const area = cockpit.querySelector("[data-cockpit-area]");
  const points = Array.from(cockpit.querySelectorAll("[data-cockpit-points] circle"));
  const drivers = Array.from(cockpit.querySelectorAll("[data-cockpit-drivers] > div"));

  const scenarios = {
    base: {
      metric: 12.7,
      variance: "+$1.8m",
      line: "M22 140 C78 136,110 124,166 116 S263 88,316 80 S402 45,458 28",
      area: "M22 140 C78 136,110 124,166 116 S263 88,316 80 S402 45,458 28 L458 160 L22 160 Z",
      points: [[22, 140], [166, 116], [316, 80], [458, 28]],
      drivers: [["+$2.4m", "88%", "positive"], ["+$1.1m", "58%", "positive"], ["−$0.8m", "42%", "negative"]]
    },
    upside: {
      metric: 14.3,
      variance: "+$3.4m",
      line: "M22 141 C76 129,111 111,166 99 S263 62,316 52 S402 25,458 14",
      area: "M22 141 C76 129,111 111,166 99 S263 62,316 52 S402 25,458 14 L458 160 L22 160 Z",
      points: [[22, 141], [166, 99], [316, 52], [458, 14]],
      drivers: [["+$3.1m", "100%", "positive"], ["+$1.7m", "74%", "positive"], ["−$0.5m", "28%", "negative"]]
    },
    downside: {
      metric: 9.8,
      variance: "−$1.1m",
      line: "M22 137 C78 140,110 138,166 130 S263 122,316 118 S402 111,458 103",
      area: "M22 137 C78 140,110 138,166 130 S263 122,316 118 S402 111,458 103 L458 160 L22 160 Z",
      points: [[22, 137], [166, 130], [316, 118], [458, 103]],
      drivers: [["+$0.8m", "36%", "positive"], ["+$0.4m", "22%", "positive"], ["−$2.3m", "92%", "negative"]]
    }
  };

  let activeKey = "base";
  let numberFrame = 0;
  let pointerPaused = false;
  let focusPaused = false;
  let stageVisible = true;

  function animateMetric(target) {
    if (!metric) return;
    cancelAnimationFrame(numberFrame);
    const startValue = Number.parseFloat(metric.textContent) || target;
    if (reducedMotion.matches) {
      metric.textContent = target.toFixed(1);
      return;
    }

    const startTime = performance.now();
    const duration = 620;
    const frame = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      metric.textContent = (startValue + (target - startValue) * eased).toFixed(1);
      if (progress < 1) numberFrame = requestAnimationFrame(frame);
    };
    numberFrame = requestAnimationFrame(frame);
  }

  function drawForecast() {
    if (!line || reducedMotion.matches) return;
    const length = line.getTotalLength();
    line.style.transition = "none";
    line.style.strokeDasharray = String(length);
    line.style.strokeDashoffset = String(length);
    line.getBoundingClientRect();
    line.style.transition = "stroke-dashoffset 820ms cubic-bezier(.22,.8,.26,1), filter 280ms ease";
    line.style.strokeDashoffset = "0";
  }

  function applyScenario(key, animate) {
    const scenario = scenarios[key] || scenarios.base;
    activeKey = key in scenarios ? key : "base";
    cockpit.dataset.activeScenario = activeKey;

    buttons.forEach((button) => {
      const selected = button.dataset.cockpitScenario === activeKey;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });

    animateMetric(scenario.metric);
    if (variance) {
      variance.textContent = scenario.variance;
      variance.classList.toggle("negative", activeKey === "downside");
    }

    line?.setAttribute("d", scenario.line);
    area?.setAttribute("d", scenario.area);
    points.forEach((point, index) => {
      point.setAttribute("cx", String(scenario.points[index][0]));
      point.setAttribute("cy", String(scenario.points[index][1]));
    });

    drivers.forEach((driver, index) => {
      const data = scenario.drivers[index];
      const value = driver.querySelector("strong");
      const bar = driver.querySelector("i");
      if (value) value.textContent = data[0];
      if (bar) {
        bar.className = data[2];
        bar.style.setProperty("--impact", data[1]);
      }
    });

    if (animate && !reducedMotion.matches) {
      drawForecast();
      area?.animate([{ opacity: 0.15 }, { opacity: 1 }], { duration: 620, easing: "ease-out" });
      cockpit.animate([{ transform: "scale(.992)" }, { transform: "scale(1)" }], { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" });
    }
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => applyScenario(button.dataset.cockpitScenario, true));
  });

  stage.addEventListener("mouseenter", () => { pointerPaused = true; });
  stage.addEventListener("mouseleave", () => { pointerPaused = false; });
  stage.addEventListener("focusin", () => { focusPaused = true; });
  stage.addEventListener("focusout", () => {
    requestAnimationFrame(() => { focusPaused = stage.contains(document.activeElement); });
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      stageVisible = entries[0]?.isIntersecting !== false;
    }, { threshold: 0.25 }).observe(stage);
  }

  stage.classList.add("is-ready");
  applyScenario("base", true);

  if (!reducedMotion.matches) {
    window.setInterval(() => {
      if (pointerPaused || focusPaused || !stageVisible || document.hidden) return;
      const keys = ["base", "upside", "downside"];
      applyScenario(keys[(keys.indexOf(activeKey) + 1) % keys.length], true);
    }, 5200);
  }
})();
