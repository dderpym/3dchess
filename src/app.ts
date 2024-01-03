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
  Material,
  ActionManager,
  ExecuteCodeAction,
  Action,
  KeyboardEventTypes,
} from "@babylonjs/core";
import "@babylonjs/loaders/OBJ/objFileLoader";
import { SpinnyLoadScreen, defDamp, defSens } from "./rendering/load";
import { Color, Piece } from "./game/pieces/piece";
import { Board } from "./game/board/board";
import { Pieces, createPieceWithModel } from "./piecefactory";
import { GameBoard } from "./game/gameboard";
import { toBitmappedInt } from "./game/board/bitmapper";
import { King3d } from "./game/pieces/king3d";

const boardSize = [10, 7, 10];
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
const FORCED_LOAD_TIME = 0;

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
      mesh.edgesWidth = 1;
      mesh.edgesColor = col4white;

      mesh.material = blackPieceMat;
    },
  };

  const gameboard = new GameBoard({
    board: new Board(boardSize),
    scene: scene,
    boxSize: 3,
    runOnEachBox: (box: Mesh) => {
      box.material = transparent;
      box.showBoundingBox = true;
      box.actionManager = new ActionManager(scene);
      box.isPickable = false;
    },
  });

  await setupPieces(gameboard, scene, setup_material);

  await sleep(FORCED_LOAD_TIME);

  camera.attachControl();
  keyboardCameraControls(camera);

  loadScreen.disconnect();
  engine.stopRenderLoop(renderLoadScreen);
  engine.runRenderLoop(() => {
    scene.render();
  });

  const turnCycle = [Color.WHITE, Color.BLACK];

  let turn = 0;
  let affectedLocs = [];

  const completeTurn = (from: number, to: number, beginnings: () => void) => {
    clearAffected(affectedLocs, gameboard, transparent);
    turn++;

    const piece = gameboard.getPieceMeshbinder(to);
    gameboard.movePiece(from, to);

    if (piece && piece.getObject() instanceof King3d) alert("ez claps");
    else beginnings();
  };

  const pickMove = (from: number, beginnings: () => void) => {
    clearAffected(affectedLocs, gameboard, transparent);

    affectedLocs = moveSelectionPhase(
      gameboard,
      from,
      frend,
      opp,
      (to: number) => {
        completeTurn(from, to, beginnings);
      },
    );
  };

  const pickPieces = (beginnings: () => void = pickPieces) => {
    const activeColor = turnCycle[turn % turnCycle.length];
    clearAffected(affectedLocs, gameboard, transparent);

    affectedLocs = pieceSelectionPhase(
      gameboard,
      activeColor,
      frend,
      (from: number) => {
        pickMove(from, beginnings);
      },
    );
  };

  scene.onKeyboardObservable.add((kbinfo) => {
    switch (kbinfo.event.code) {
      case "Escape":
        if (kbinfo.type == KeyboardEventTypes.KEYUP) pickPieces();
    }
  });

  pickPieces();
}

async function setupPieces(
  gameboard: GameBoard,
  scene: Scene,
  setupMaterial, //typesig later
) {
  const locations: {
    location: number[];
    piece: Pieces;
    color: Color;
    orientation?: number[];
  }[] = [
    { location: [1, 3, 1], piece: Pieces.ROOK, color: Color.WHITE },
    { location: [1, 3, 2], piece: Pieces.KNIGHT, color: Color.WHITE },
    { location: [1, 3, 3], piece: Pieces.BISHOP, color: Color.WHITE },
    { location: [1, 3, 4], piece: Pieces.KING, color: Color.WHITE },
    { location: [1, 3, 5], piece: Pieces.QUEEN, color: Color.WHITE },
    { location: [1, 3, 6], piece: Pieces.BISHOP, color: Color.WHITE },
    { location: [1, 3, 7], piece: Pieces.KNIGHT, color: Color.WHITE },
    { location: [1, 3, 8], piece: Pieces.ROOK, color: Color.WHITE },
  ]; // major pieces
  const maxX = gameboard.getBoardSize()[0] - 1;
  const majorPieces = locations.length;
  for (let i = 0; i < majorPieces; ++i) {
    //mirror black by "fliping" x coords
    const lol = locations[i];
    const lorn = Array.from(locations[i].location, (v, k) =>
      k == 0 ? maxX - v : v,
    );
    locations.push({ location: lorn, piece: lol.piece, color: Color.BLACK });
  }

  //pawns
  for (let i = 1; i < 9; ++i) {
    locations.push({
      location: [2, 3, i],
      piece: Pieces.PAWN,
      color: Color.WHITE,
      orientation: [1, 0, 0],
    });
  }

  for (let i = 1; i < 9; ++i) {
    locations.push({
      location: [maxX - 2, 3, i],
      piece: Pieces.PAWN,
      color: Color.BLACK,
      orientation: [-1, 0, 0],
    });
  }

  const boardSize = gameboard.getBoardSize();

  for (let i = 0; i < locations.length; ++i) {
    const stuff = locations[i];
    const meshboundPiece = await createPieceWithModel(
      stuff.piece,
      stuff.color,
      boardSize,
      scene,
      stuff.orientation,
      setupMaterial[stuff.color],
    );
    gameboard.addPiece(
      meshboundPiece,
      toBitmappedInt(stuff.location, boardSize),
    );
  }
}

function clearAffected(
  affectedLocs: any[],
  gameboard: GameBoard,
  emptyMaterial: Material,
) {
  //fix up type sig later
  affectedLocs.forEach((stuff) => {
    gameboard.applyTo(stuff.location, (box: Mesh) => {
      box.material = emptyMaterial;
      box.actionManager.unregisterAction(stuff.action);
      box.isPickable = false;
    });
  });
  affectedLocs = [];
}

function pieceSelectionPhase(
  gameboard: GameBoard,
  activeColor: Color,
  frendMaterial: Material,
  triggerNext: (locationSelected: number) => void,
): { location: number; action: Action }[] {
  const affectedLocations = [];

  gameboard.getAllOfColor(activeColor).forEach((location: number) => {
    gameboard.applyTo(location, (box: Mesh) => {
      box.material = frendMaterial;

      box.isPickable = true;
      const action = createAction(() => triggerNext(location));
      box.actionManager.registerAction(action);

      affectedLocations.push({ location: location, action: action });
    });
  });

  return affectedLocations;
}

function moveSelectionPhase(
  gameboard: GameBoard,
  locationSelected: number,
  movableMaterial: Material,
  captureMaterial: Material,
  triggerNext: (location: number) => void,
) {
  const affectedLocations = [];

  gameboard.getAllMoveFrom(locationSelected).forEach((location: number) => {
    gameboard.applyTo(location, (box: Mesh) => {
      const occupier = gameboard.getAt(location).getOccupier();
      if (occupier instanceof Piece) box.material = captureMaterial;
      else box.material = movableMaterial;

      box.isPickable = true;
      const action = createAction(() => triggerNext(location));
      box.actionManager.registerAction(action);

      affectedLocations.push({ location: location, action: action });
    });
  });

  return affectedLocations;
}

function createAction(whenClicked: () => void) {
  return new ExecuteCodeAction(ActionManager.OnLeftPickTrigger, () =>
    whenClicked(),
  );
}

function keyboardCameraControls(camera: UniversalCamera) {
  camera.keysUpward.push(69); //increase elevation
  camera.keysDownward.push(81); //decrease elevation
  camera.keysUp.push(87); //forwards
  camera.keysDown.push(83); //backwards
  camera.keysLeft.push(65);
  camera.keysRight.push(68);
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
