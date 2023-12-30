import { toBitmappedInt } from "../board/bitmapper";
import { Board } from "../board/board";
import { Color, Piece } from "./piece";
import { slideInDirection } from "./slidingMoveGenerator";

/*
 * Technically, the rook is optimized to work in all directions.
 */
export class Rook3d extends Piece {
  private bitmappedDir: number[];

  constructor(color: Color, boardSize: number[]) {
    super("rook", color);
    const direction = new Array(boardSize.length).fill(0);

    const bitmappedDir = [];

    for (let i = 0; i < boardSize.length * 2; ++i) {
      direction[Math.trunc(i / 2)] = i % 2 == 0 ? 1 : -1;
      bitmappedDir.push(toBitmappedInt(direction, boardSize));
      direction[Math.trunc(i / 2)] = 0;
    }

    this.bitmappedDir = bitmappedDir;
  }

  canMoveTo(bitLocation: number, board: Board): number[] {
    const canMove = [];
    const directions = this.bitmappedDir;

    for (let i = 0; i < directions.length; i++) {
      const dir = directions[i];
      slideInDirection(this, bitLocation, dir, Infinity, board).forEach(
        (moveDirection) => canMove.push(moveDirection),
      );
    }

    return canMove;
  }

  toString() {
    return "r";
  }
}
