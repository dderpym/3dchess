import { toBitmappedInt } from "../board/bitmapper";
import { Board } from "../board/board";
import { Spot } from "../board/spot";
import { Color, Orientable, Piece } from "./piece";

/*
 * A pawn, extended to the third dimension.
 * Technically the code allows for all dimensions, but for now we'll play it safe with where to use it
 */
export class Pawn3d extends Piece implements Orientable {
  private orientation: number[];
  private bitmapOrientation: number;
  private captureOrientations: number[];

  /* orientation must be a unit vector along a dimension */
  constructor(color: Color, boardSize: number[], orientation: number[]) {
    super("pawn", color);
    this.orientation = orientation;
    this.bitmapOrientation = toBitmappedInt(orientation, boardSize);

    const captureOrientations = [];
    for (let i = 0; i < orientation.length; ++i) {
      if (orientation[i] == 0) {
        captureOrientations.push(
          toBitmappedInt(
            Array.from(orientation, (v, k) => (k == i ? 1 : v)),
            boardSize,
          ),
        );
        captureOrientations.push(
          toBitmappedInt(
            Array.from(orientation, (v, k) => (k == i ? -1 : v)),
            boardSize,
          ),
        );
      }
    }

    this.captureOrientations = captureOrientations;
  }

  getOrientation(): number[] {
    return this.orientation;
  }

  getBitOrientation(): number {
    return this.bitmapOrientation;
  }

  /*
   * implement en passant and double first move later
   */
  canMoveTo(bitLocation: number, board: Board): number[] {
    const canMove = [];

    const moveUpNum = bitLocation + this.bitmapOrientation;
    if (board.inBounds(moveUpNum)) {
      const target = board.getAt(moveUpNum).getOccupier();
      if (!(target && target.blocks(this))) canMove.push(moveUpNum);
    }

    for (let i = 0; i < this.captureOrientations.length; ++i) {
      const targNum = bitLocation + this.captureOrientations[i];

      if (board.inBounds(targNum)) {
        const target = board.getAt(targNum).getOccupier();
        if (target && target.isCapturableBy(this)) canMove.push(targNum);
      }
    }

    return canMove;
  }

  toString() {
    return "p";
  }
}
