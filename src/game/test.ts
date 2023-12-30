import { fromBitmappedInt, toBitmappedInt } from "./board/bitmapper";
import { Board } from "./board/board";
import { Bishop3d } from "./pieces/bishop3d";
import { Knight3d } from "./pieces/knight3d";
import { Pawn3d } from "./pieces/pawn3d";
import { Color } from "./pieces/piece";
import { Queen3d } from "./pieces/queen3d";
import { Rook3d } from "./pieces/rook3d";

const size = [10, 10, 10];
const board = new Board(size);

const wPieceLocation = toBitmappedInt([5, 5, 5], size);
const wPiece = new Rook3d(Color.WHITE, board.getSize());
board.getAt(wPieceLocation).welcome(wPiece);

// const bPawnLocation = toBitmappedInt([5, 1, 4], size);
// const bPawn = new Pawn3d(Color.BLACK, board.getSize(), [0, 1, 0]);
// board.getAt(bPawnLocation).welcome(bPawn);

const canMoveTo = wPiece.canMoveTo(wPieceLocation, board);

for (let i = 0; i < size[0]; ++i) {
  console.log("layer " + i + ": ");
  for (let j = 0; j < size[1]; ++j) {
    let line = "";

    for (let k = 0; k < size[2]; ++k) {
      const spot = board.getAtVect([i, j, k]);
      if (canMoveTo.includes(toBitmappedInt([i, j, k], size))) line += "x";
      else line += spot.toString();
    }

    console.log(line);
  }
}
