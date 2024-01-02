import { Material, Mesh, MeshBuilder, Scene, Vector3 } from "@babylonjs/core";
import { MeshBinder } from "../rendering/meshBinder";
import { Board } from "./board/board";
import { fromBitmappedInt, toBitmappedInt } from "./board/bitmapper";
import { Color, Occupier, Piece } from "./pieces/piece";

export interface GameBoardConstructorArgs {
  board: Board;
  scene: Scene;
  runOnEachBox: (box: Mesh) => void;
  boxSize?: number;
  boxX?: number;
  boxY?: number;
  boxZ?: number;
}

export class GameBoard {
  private board: Board;
  private pieces; //not sure how to type sig this
  private bitGrid: Mesh[];
  private boxDims: number[];

  constructor(args: GameBoardConstructorArgs) {
    this.board = args.board;
    this.pieces = {};

    if (args.boxSize) {
      args.boxX = args.boxSize;
      args.boxY = args.boxSize;
      args.boxZ = args.boxSize;
    }

    this.boxDims = [args.boxX, args.boxY, args.boxZ];

    const vectorGrid = createGrid(
      this.boxDims,
      args.board,
      args.scene,
      args.runOnEachBox,
    );

    const bitGrid = [];
    for (let i = 0; i < vectorGrid.length; i++) {
      for (let j = 0; j < vectorGrid[i].length; j++) {
        for (let k = 0; k < vectorGrid[i][j].length; k++) {
          //this could probably be a simple push statement but lets play it safe
          bitGrid[toBitmappedInt([i, j, k], args.board.getSize())] =
            vectorGrid[i][j][k];
        }
      }
    }

    this.bitGrid = bitGrid;
  }

  public addPiece(meshBoundPiece: MeshBinder<Piece>, location: number) {
    this.pieces[location] = meshBoundPiece;
    this.board.getAt(location).welcome(meshBoundPiece.getObject());
    meshBoundPiece.getMesh().position = posToVect3(
      fromBitmappedInt(location, this.getBoardSize()),
      this.boxDims,
    );
  }

  public getPieceMeshbinder(location: number): MeshBinder<Piece> {
    return this.pieces[location];
  }

  public movePiece(from: number, to: number): Occupier {
    const piece = this.board.getAt(from).evict();
    const toOcc = this.board.getAt(to).evict();
    if (this.getPieceMeshbinder(to))
      this.getPieceMeshbinder(to).getMesh().dispose();

    const mesh = this.pieces[from].getMesh();
    mesh.position = posToVect3(
      fromBitmappedInt(to, this.board.getSize()),
      this.boxDims,
    );
    this.board.getAt(to).welcome(piece);

    this.pieces[to] = this.pieces[from];
    this.pieces[from] = null;

    return toOcc;
  }

  public getAt(location: number) {
    return this.board.getAt(location);
  }

  public getAllMoveFrom(fromSpot: number): number[] {
    const piece = this.board.getAt(fromSpot).getOccupier();
    if (piece instanceof Piece) return piece.canMoveTo(fromSpot, this.board);
    else return [];
  }
  public getBoardSize(): number[] {
    return this.board.getSize();
  }

  public getAllOfColor(color: Color): number[] {
    return this.board.getAllSpotsWithColoredPiece(color);
  }

  public applyToAll(spots: number[], toDo: (box: Mesh) => void): void {
    const boxes = this.bitGrid;
    for (let i = 0; i < spots.length; ++i) toDo(boxes[spots[i]]);
  }

  public applyTo(spot: number, toDo: (box: Mesh) => void): void {
    toDo(this.bitGrid[spot]);
  }
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
          box.position = posToVect3([x, y, z], boxDims);
          boxes[x][y][z] = box;
          runOnEachBox(box);
        }
      }
    }
  }

  return boxes;
}

function posToVect3(pos: number[], boxDims: number[]): Vector3 {
  return Vector3.FromArray(pos.map((num, index) => num * boxDims[index]));
}
