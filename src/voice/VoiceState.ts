import VoiceClient from "@revkit/voice/browser";
import { client } from "Client";
import { writable } from "svelte/store";

export const voiceStateReference = new VoiceClient(client, (type, track) => {
  if (type == "audio") {
    const mediaStream = new MediaStream([track]);
    const audio = new Audio();

    audio.onplaying = () => playbtn?.remove();
    const playbtn = document.createElement("div");
    playbtn.innerText = "Click to play audio.";
    playbtn.className = "btn btn-primary absolute";
    playbtn.style.top = "30%";
    playbtn.style.left = "0px";
    document.body.appendChild(playbtn);
    playbtn.onclick = () => {
      playbtn.classList.add("loading");
      audio.play();
    };

    audio.srcObject = mediaStream;
    audio.load();
    audio.play();
    return () => audio.pause();
  }
  return () => null;
});
export const voiceState = writable(voiceStateReference);
const sync = () => voiceState.set(voiceStateReference);
voiceStateReference.on("close", sync);
voiceStateReference.on("connected", sync);
voiceStateReference.on("selfDeafenUpdate", sync);
voiceStateReference.on("startProduce", sync);
voiceStateReference.on("status", sync);
voiceStateReference.on("stopProduce", sync);
voiceStateReference.on("userJoined", sync);
voiceStateReference.on("userLeft", sync);
voiceStateReference.on("userStartProduce", sync);
voiceStateReference.on("userStopProduce", sync);
