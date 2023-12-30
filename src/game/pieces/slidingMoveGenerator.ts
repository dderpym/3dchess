import { Board } from "../board/board";
import { Piece } from "./piece";

export function slideInDirection(
  slider: Piece,
  location: number,
  direction: number,
  maxDistance: number,
  board: Board,
) {
  const possibleLocations = [];

  for (let i = 0; i < maxDistance; i++) {
    location += direction;

    const occupier = board.getAt(location).getOccupier();

    if (!board.inBounds(location)) break;

    if (occupier && occupier.blocks(slider)) {
      if (occupier.isCapturableBy(slider)) possibleLocations.push(location);

      break;
    }

    possibleLocations.push(location);
  }

  return possibleLocations;
}
