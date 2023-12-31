import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import {
  Engine,
  Scene,
  MeshBuilder,
  Vector3,
  StandardMaterial,
} from "@babylonjs/core";
import { SpinnyLoadScreen, defDamp, defSens } from "./load";

class App {
  constructor() {
    // create the canvas html element and attach it to the webpage
    const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

    // initialize babylon engine
    const engine = new Engine(canvas, true);

    //create a load screen
    const loadScene = new Scene(engine);

    //yeah lets go its responsive!
    const resizeObserver = new ResizeObserver(() => {
      engine.resize();
      if (loadScene.activeCamera /* needed for rendering */) {
        // render to prevent flickering on resize
        loadScene.render();
      }
    });

    resizeObserver.observe(canvas);

    const myMaterial = new StandardMaterial("neatMaterial", loadScene);
    myMaterial.wireframe = true;

    const shape = [];
    const rand = () => Math.random() * 2 - 1;
    const times = Math.random() * 3 + 3;
    for (let i = 0; i < times; ++i)
      shape.push(new Vector3(rand(), rand(), rand()));
    const lathe = MeshBuilder.CreateLathe(
      "loadShape",
      { shape: shape, tessellation: 10 },
      loadScene,
    );
    lathe.material = myMaterial;

    const loadScreen = new SpinnyLoadScreen(
      lathe, //mesh
      { x: 0.3, y: 0.3 }, //base velocity
      5, //light dist
      10, //cam dist
      (15 / 180) * Math.PI, // camera angle
      defSens.bind(null, [0.03]), //sensitivity
      defDamp.bind(null, [10]),
    );

    loadScreen.init();
    const renderLoadScreen = () => loadScene.render();

    engine.runRenderLoop(renderLoadScreen);
  }
}

new App();
