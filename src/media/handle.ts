interface Callback {
  drag(pos: number): any;
  dragstart(): any;
  dragend(): any;
}

export default function handle(node: HTMLElement, cb: Callback) {
  const onDown = getOnDown(node, cb);

  node.addEventListener("touchstart", onDown);
  node.addEventListener("mousedown", onDown);
  return {
    destroy() {
      node.removeEventListener("touchstart", onDown);
      node.removeEventListener("mousedown", onDown);
    },
  };
}

function getOnDown(node: HTMLElement, cb: Callback) {
  const onMove = getOnMove(node, cb);

  return function (e: MouseEvent | TouchEvent) {
    e.preventDefault();
    cb.dragstart();

    const moveevent = "touches" in e ? "touchmove" : "mousemove";
    const upevent = "touches" in e ? "touchend" : "mouseup";

    document.addEventListener(moveevent, onMove);
    document.addEventListener(upevent, onUp);

    function onUp(e: MouseEvent | TouchEvent) {
      e.stopPropagation();

      document.removeEventListener(moveevent, onMove);
      document.removeEventListener(upevent, onUp);

      cb.dragend();
    }
  };
}

function getOnMove(node: HTMLElement, cb: Callback) {
  const track = node.parentNode as HTMLElement;

  return function (e: MouseEvent | TouchEvent) {
    const { left, width } = track.getBoundingClientRect();
    const clickOffset = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clickPos = Math.min(Math.max((clickOffset - left) / width, 0), 1) || 0;
    cb.drag(clickPos);
  };
}
