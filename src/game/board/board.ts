import { Color, Piece, edgeBlocker } from "../pieces/piece";
import { fromBitmappedInt, toBitmappedInt } from "./bitmapper";
import { EdgeBarrier, Spot } from "./spot";

export class Board {
  private size: number[];
  private bitSize: number;
  public board: Spot[];

  constructor(size: number[]) {
    this.size = size;
    this.bitSize = toBitmappedInt(size, size);
    this.board = new Array<Spot>(this.bitSize);

    const edgeDimensions = [];
    for (let i = 0; i < this.size.length; ++i) {
      edgeDimensions[i] = this.size[i] - 1;
    }

    for (let i = 0; i < this.bitSize; ++i) {
      const vectPos = fromBitmappedInt(i, size);
      let isEdge = false;

      for (let j = 0; j < edgeDimensions.length; ++j) {
        if (edgeDimensions[j] == vectPos[j] || vectPos[j] == 0) {
          isEdge = true;
          break;
        }
      }

      this.board[i] = isEdge ? new EdgeBarrier(i) : new Spot(i);
    }
  }

  public getAt(bitNumber: number): Spot {
    return this.board[bitNumber];
  }
  public getSize(): number[] {
    return this.size;
  }
  public getBitSize(): number {
    return this.bitSize;
  }
  public getAtVect(location: number[]): Spot {
    return this.getAt(toBitmappedInt(location, this.size));
  }
  public inBounds(location: number): boolean {
    return location > 0 && location < this.bitSize;
  }
  public inBoundsVect(location: number[]): boolean {
    for (let i = 0; i < location.length; ++i)
      if (location[i] < 0 || location[i] >= this.size[i]) return false;
    return true;
  }
  public getAllSpotsWithColoredPiece(color: Color) {
    const spots: number[] = [];

    this.board.forEach((spot, index) => {
      const spotOccupier = spot.getOccupier();
      if (spotOccupier instanceof Piece && spotOccupier.getColor() == color) {
        spots.push(index);
      }
    });

    return spots;
  }
}
