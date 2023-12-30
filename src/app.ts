import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, MeshBuilder } from "@babylonjs/core";
import { SpinnyLoadScreen } from "./load";

class App {
  constructor() {
    // create the canvas html element and attach it to the webpage
    var canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

    // initialize babylon scene and engine
    var engine = new Engine(canvas, true);
    var scene = new Scene(engine);

    const resizeObserver = new ResizeObserver(() => {
      engine.resize();
      if (scene.activeCamera /* needed for rendering */) {
        // render to prevent flickering on resize
        scene.render();
      }
    });

    resizeObserver.observe(canvas);

    //create a load screen
    const loadScreen = new SpinnyLoadScreen(
      MeshBuilder.CreateBox("box", { size: 3.3 }, scene),
      { x: 0.1, y: 0.1 },
      5,
      10,
      (15 / 180) * Math.PI,
    );

    loadScreen.init();

    engine.runRenderLoop(() => {
      scene.render();
    });
  }
}
new App();
