export const SvolteAudio = new AudioContext();

const audio = new Audio();
audio.srcObject = SvolteAudio.createMediaStreamDestination().stream;

document.addEventListener("click", () => {
  if (audio.paused) {
    audio.play();
  }
});
