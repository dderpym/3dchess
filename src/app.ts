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
  Color4,
} from "@babylonjs/core";
import "@babylonjs/loaders/OBJ/objFileLoader";
import { SpinnyLoadScreen, defDamp, defSens } from "./rendering/load";
import { Color } from "./game/pieces/piece";
import { toBitmappedInt } from "./game/board/bitmapper";
import { Board } from "./game/board/board";

const boardSize = [10, 7, 10];
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
const FORCED_LOAD_TIME = 500;

class App {
  constructor() {
    // create the canvas html element and attach it to the webpage
    const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

    // initialize babylon engine
    const engine = new Engine(canvas, true);

    //yeah lets go responsive design!
    const resizeObserver = new ResizeObserver(() => {
      engine.resize();
    });

    resizeObserver.observe(canvas);

    const [loadScreen, renderLoadScreen] = createLoadScreen(engine);

    mainGameRunner(engine, loadScreen, renderLoadScreen);
  }
}

async function mainGameRunner(
  engine: Engine,
  loadScreen: SpinnyLoadScreen,
  renderLoadScreen: () => void,
) {
  //scene
  const scene = new Scene(engine);

  const camera = new UniversalCamera("cam", new Vector3(0, 5, -10), scene);
  scene.addCamera(camera);

  //materials
  const boundingBoxrenderer = scene.getBoundingBoxRenderer();
  boundingBoxrenderer.frontColor = new Color3(0.5, 0.5, 0.5);
  boundingBoxrenderer.showBackLines = false;

  const transparent = new StandardMaterial("transparent", scene);
  transparent.alpha = 0;

  const opp = new StandardMaterial("attacked", scene);
  opp.alpha = 0.5;
  opp.emissiveColor = new Color3(1, 0, 0);

  const frend = new StandardMaterial("movable", scene);
  frend.alpha = 0.5;
  frend.emissiveColor = new Color3(0, 0.4, 0.6);

  const blackPieceMat = new StandardMaterial("black", scene);
  blackPieceMat.alpha = 1;
  blackPieceMat.emissiveColor = new Color3(0.1, 0.1, 0.1);
  const col4black = new Color4(0, 0, 0, 1);

  const whitePieceMat = new StandardMaterial("white", scene);
  whitePieceMat.alpha = 1;
  whitePieceMat.emissiveColor = new Color3(0.9, 0.9, 0.9);
  const col4white = new Color4(1, 1, 1, 1);

  const setup_material = {
    [Color.WHITE]: (mesh: Mesh) => {
      mesh.enableEdgesRendering();
      mesh.edgesWidth = 1;
      mesh.edgesColor = col4black;

      mesh.material = whitePieceMat;
    },
    [Color.BLACK]: (mesh: Mesh) => {
      mesh.enableEdgesRendering();
      mesh.edgesWidth = 5;
      mesh.edgesColor = col4white;

      mesh.material = blackPieceMat;
    },
  };

  const board = new Board(boardSize);

  const vectorGrid = createGrid([3, 3, 3], board, scene, (box) => {
    box.material = transparent;
    box.showBoundingBox = true;
  });
  const bitmappedGrid = [];
  for (let i = 0; i < vectorGrid.length; i++) {
    for (let j = 0; j < vectorGrid[i].length; j++) {
      for (let k = 0; k < vectorGrid[i][j].length; k++) {
        //this could probably be a simple push statement but lets play it safe
        bitmappedGrid[toBitmappedInt([i, j, k], boardSize)] =
          vectorGrid[i][j][k];
      }
    }
  }

  setupPieces(vectorGrid, boardSize, setup_material);

  await sleep(FORCED_LOAD_TIME);
  scene.debugLayer.show();

  camera.attachControl();
  keyboardCameraControls(camera);

  loadScreen.disconnect();
  engine.stopRenderLoop(renderLoadScreen);
  engine.runRenderLoop(() => {
    scene.render();
  });

  while (true) {
    break;
  }
}

function setupPieces(
  vectorGrid: Mesh[][][],
  boardSize: number[],
  setupMaterial,
) {}

function keyboardCameraControls(camera: UniversalCamera) {
  camera.keysUpward.push(69); //increase elevation
  camera.keysDownward.push(81); //decrease elevation
  camera.keysUp.push(87); //forwards
  camera.keysDown.push(83); //backwards
  camera.keysLeft.push(65);
  camera.keysRight.push(68);
}

function createGrid(
  boxDims: number[],
  board: Board,
  scene: Scene,
  runOnEachBox: (box: Mesh) => void,
) {
  const boxes = [];
  const boardSize = board.getSize();

  for (let x = 0; x < boardSize[0]; ++x) {
    boxes[x] = [];
    for (let y = 0; y < boardSize[1]; ++y) {
      boxes[x][y] = [];
      for (let z = 0; z < boardSize[2]; ++z) {
        if (board.getAtVect([x, y, z]).rendered) {
          const box = MeshBuilder.CreateBox(
            "box" + x + "," + y + "," + z,
            { width: boxDims[0], height: boxDims[1], depth: boxDims[2] },
            scene,
          );
          box.position = new Vector3(
            x * boxDims[0],
            y * boxDims[1],
            z * boxDims[2],
          );
          boxes[x][y][z] = box;
          runOnEachBox(box);
        }
      }
    }
  }

  return boxes;
}

function createLoadScreen(engine: Engine): [SpinnyLoadScreen, () => void] {
  const loadScene = new Scene(engine);

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

  return [loadScreen, renderLoadScreen];
}

new App();
