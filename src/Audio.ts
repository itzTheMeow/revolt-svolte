export const SvolteAudio = new AudioContext();

document.addEventListener("click", () => {
  if (SvolteAudio.state == "suspended") {
    SvolteAudio.resume();
  }
});
