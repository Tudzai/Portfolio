(() => {
  const video = document.querySelector("#reporting-pipeline-video");
  const cover = document.querySelector(".automation-video-cover");
  const figure = cover?.closest(".simple-demo-hook");

  if (!video || !cover || !figure) return;

  cover.addEventListener("click", async () => {
    figure.classList.add("is-playing");
    video.preload = "metadata";

    try {
      await video.play();
    } catch {
      video.focus();
    }
  });

  video.addEventListener("error", () => {
    figure.classList.remove("is-playing");
  });
})();
