import { Mesh, Scene, Vector3 } from "@babylonjs/core";
import { King3d } from "./game/pieces/king3d";
import { Knight3d } from "./game/pieces/knight3d";
import { Color, Piece } from "./game/pieces/piece";
import { Queen3d } from "./game/pieces/queen3d";
import { Rook3d } from "./game/pieces/rook3d";
import { MeshBinder, loadMesh } from "./rendering/meshBinder";
import { Pawn3d } from "./game/pieces/pawn3d";
import { Bishop3d } from "./game/pieces/bishop3d";

const modelDirectory = "/models/";

export enum Pieces {
  KING = "k",
  QUEEN = "q",
  ROOK = "r",
  BISHOP = "b",
  KNIGHT = "n",
  PAWN = "p",
}

const pieces = {
  [Pieces.KING]: "king.obj",
  [Pieces.QUEEN]: "queen.obj",
  [Pieces.ROOK]: "rook.obj",
  [Pieces.BISHOP]: "bishop.obj",
  [Pieces.KNIGHT]: "knight.obj",
  [Pieces.PAWN]: "pawn.obj",
};

export async function createPieceWithModel(
  piece: Pieces,
  color: Color,
  boardSize: number[],
  scene: Scene,
  orientation: number[] = [1, 0, 0],
  runOnModel?: (mesh: Mesh) => void,
): Promise<MeshBinder<Piece>> {
  const model: Mesh = await loadMesh(
    modelDirectory,
    pieces[piece],
    scene,
    runOnModel,
  );

  let obj: Piece;

  switch (piece) {
    case Pieces.KING:
      obj = new King3d(color, boardSize);
      break;
    case Pieces.QUEEN:
      obj = new Queen3d(color, boardSize);
      break;
    case Pieces.ROOK:
      obj = new Rook3d(color, boardSize);
      break;
    case Pieces.BISHOP:
      obj = new Bishop3d(color, boardSize);
      break;
    case Pieces.KNIGHT:
      obj = new Knight3d(color, boardSize);
      if (color == Color.WHITE) model.rotation = new Vector3(0, Math.PI, 0);
      break;
    case Pieces.PAWN:
      obj = new Pawn3d(color, boardSize, orientation);
  }

  return new MeshBinder(obj, model);
}
