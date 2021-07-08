import { Parameters } from "@storybook/react";
import "fpsmeter";

var meter = new (window as any).FPSMeter(document.body, {
  interval: 100, // Update interval in milliseconds.
  smoothing: 10, // Spike smoothing strength. 1 means no smoothing.
  show: "fps", // Whether to show 'fps', or 'ms' = frame duration in milliseconds.
  toggleOn: "click", // Toggle between show 'fps' and 'ms' on this event.
  decimals: 1, // Number of decimals in FPS number. 1 = 59.9, 2 = 59.94, ...
  maxFps: 60, // Max expected FPS value.
  threshold: 100, // Minimal tick reporting interval in milliseconds.

  // Meter position
  position: "fixed", // Meter position.
  zIndex: 10, // Meter Z index.
  left: "auto", // Meter left offset.
  top: "auto", // Meter top offset.
  right: "5px", // Meter right offset.
  bottom: "5px", // Meter bottom offset.
  margin: "0 0 0 0", // Meter margin. Helps with centering the counter when left: 50%;

  // Theme
  theme: "dark", // Meter theme. Build in: 'dark', 'light', 'transparent', 'colorful'.
  heat: 0, // Allow themes to use coloring by FPS heat. 0 FPS = red, maxFps = green.

  // Graph
  graph: 1, // Whether to show history graph.
  history: 20, // How many history states to show in a graph.
});

function render() {
  meter.tick();
  requestAnimationFrame(render);
}

render();

export const parameters: Parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  layout: "padded",
  options: {
    storySort: (a, b) =>
      a[1].kind === b[1].kind
        ? 0
        : a[1].id.localeCompare(b[1].id, undefined, { numeric: true }),
  },
};
