/* Audio controls and status UI */
(() => {
  const audio = document.getElementById("alert-audio");
  const toggle = document.getElementById("audio-toggle");
  const status = document.getElementById("audio-status");
  if (!audio || !toggle || !status) return;

  const setState = (playing) => {
    toggle.textContent = playing ? "Pause Audio" : "Play Audio";
    status.textContent = playing ? "Status: Playing" : "Status: Paused";
  };

  toggle.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  });

  audio.addEventListener("play", () => setState(true));
  audio.addEventListener("pause", () => setState(false));

  setState(false);
})();
