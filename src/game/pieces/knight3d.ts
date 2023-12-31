import { fromBitmappedInt, toBitmappedInt } from "../board/bitmapper";
import { Board } from "../board/board";
import { Color, Piece } from "./piece";

const quad1Moves = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 1, 0],
  [2, 0, 1],
];

const moves = [];

const direction = [
  [1, 1, 1],
  [1, -1, 1],
  [1, 1, -1],
  [1, -1, -1],
  [-1, 1, 1],
  [-1, 1, -1],
  [-1, -1, 1],
  [-1, -1, -1],
];

for (let i = 0; i < direction.length; ++i) {
  for (let j = 0; j < quad1Moves.length; ++j) {
    let repeat = false;
    for (let k = 0; k < direction[0].length; ++k) {
      if (direction[i][k] == -1 && quad1Moves[j][k] == 0) {
        repeat = true;
        break;
      }
    }
    if (!repeat) {
      moves.push(
        Array.from(
          quad1Moves[j],
          (coord, index) => coord * direction[i][index],
        ),
      );
    }
  }
}

/*
 * A knight, extended to the third dimension.
 * The code does NOT allow this to be used for all dimensions, and it assumes the first 3 dimensions are used
 */
export class Knight3d extends Piece {
  private bitmappedMoves: number[];

  constructor(color: Color, boardSize: number[]) {
    super("knight", color);
    const bitmappedMoves = [];
    for (let i = 0; i < moves.length; ++i) {
      bitmappedMoves.push(toBitmappedInt(moves[i], boardSize));
    }

    this.bitmappedMoves = bitmappedMoves;
  }

  canMoveTo(bitLocation: number, board: Board): number[] {
    const canMove = [];
    const size = board.getSize();

    this.bitmappedMoves.forEach((moveDelta) => {
      const targetBit = bitLocation + moveDelta;
      if (board.inBoundsVect(fromBitmappedInt(targetBit, size))) {
        const occ = board.getAt(targetBit).getOccupier();
        if (occ) {
          if (occ.isCapturableBy(this)) canMove.push(targetBit);
        } else canMove.push(targetBit);
      }
    });

    return canMove;
  }

  toString() {
    return "k";
  }
}
