import { toBitmappedInt } from "../board/bitmapper";
import { Board } from "../board/board";
import { Color, Piece } from "./piece";
import { slideInDirection } from "./slidingMoveGenerator";

const map1 = [1, 1, -1, -1];
const map2 = [1, -1, 1, -1];

/*
 * this queen can move in all directions
 * i don't think this works for more dimensions, but it could?
 */
export class Queen3d extends Piece {
  private bitmappedDir: number[];

  constructor(color: Color, boardSize: number[]) {
    super("bishop", color);
    const bitmappedDir = [];
    const dir = new Array(boardSize.length).fill(0);

    for (let i = 0; i < boardSize.length * 4; ++i) {
      //finds all diagonal directions
      const coord1 = i % boardSize.length;
      const coord2 = (i + 1) % boardSize.length;
      dir[coord1] = map1[i % map1.length];
      dir[coord2] = map2[i % map2.length];
      bitmappedDir.push(toBitmappedInt(dir, boardSize));
      dir[coord1] = 0;
      dir[coord2] = 0;
    }

    for (let i = 0; i < boardSize.length * 2; ++i) {
      dir[Math.trunc(i / 2)] = i % 2 == 0 ? 1 : -1;
      bitmappedDir.push(toBitmappedInt(dir, boardSize));
      dir[Math.trunc(i / 2)] = 0;
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
    return "Q";
  }
}
