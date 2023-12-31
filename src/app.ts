import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import {
  Engine,
  Scene,
  MeshBuilder,
  Vector3,
  StandardMaterial,
  Mesh,
  UniversalCamera,
  Color3,
} from "@babylonjs/core";
import "@babylonjs/loaders/OBJ/objFileLoader";
import { SpinnyLoadScreen, defDamp, defSens } from "./load";

const boardSize = [10, 10, 10];
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

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

    const loadMaterial = new StandardMaterial("wireframe", loadScene);
    loadMaterial.wireframe = true;

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
    lathe.material = loadMaterial;

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

    mainGameRunner(engine, loadScreen, renderLoadScreen);
  }
}

async function mainGameRunner(
  engine: Engine,
  loadScreen: SpinnyLoadScreen,
  renderLoadScreen: () => void,
) {
  const scene = new Scene(engine);
  const transparent = new StandardMaterial("wireframe", scene);
  transparent.alpha = 0;

  const camera = new UniversalCamera("cam", new Vector3(0, 5, -10), scene);
  scene.addCamera(camera);

  const grid = createGrid(
    boardSize[0],
    boardSize[1],
    boardSize[2],
    3,
    3,
    3,
    scene,
    (box) => {
      box.material = transparent;
      box.showBoundingBox = true;
    },
  );

  const boundingBoxrenderer = scene.getBoundingBoxRenderer();
  boundingBoxrenderer.frontColor = new Color3(0.5, 0.5, 0.5);
  boundingBoxrenderer.showBackLines = true;

  await sleep(3000);
  scene.debugLayer.show();
  camera.keysUpward.push(69); //increase elevation
  camera.keysDownward.push(81); //decrease elevation
  camera.keysUp.push(87); //forwards
  camera.keysDown.push(83); //backwards
  camera.keysLeft.push(65);
  camera.keysRight.push(68);

  camera.attachControl();
  loadScreen.disconnect();
  engine.stopRenderLoop(renderLoadScreen);
  engine.runRenderLoop(() => {
    scene.render();
  });
}

function createGrid(
  xL: number,
  yL: number,
  zL: number,
  boxX: number,
  boxY: number,
  boxZ: number,
  scene: Scene,
  runOnEachBox: (box: Mesh) => void,
) {
  const boxes = [];

  for (let x = 0; x < xL; ++x) {
    boxes[x] = [];
    for (let y = 0; y < yL; ++y) {
      boxes[x][y] = [];
      for (let z = 0; z < zL; ++z) {
        const box = MeshBuilder.CreateBox(
          "box" + x + "," + y + "," + z,
          { width: boxX, height: boxY, depth: boxZ },
          scene,
        );
        box.position = new Vector3(x * boxX, y * boxY, z * boxZ);
        boxes[x][y][z] = box;
        runOnEachBox(box);
      }
    }
  }

  return boxes;
}

new App();
