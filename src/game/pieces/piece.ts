import { Board } from "../board/board";
import { Spot } from "../board/spot";

export abstract class Piece implements Occupier, Movable {
  private color: Color;
  private name: string;

  constructor(name: string, color: Color) {
    this.name = name;
    this.color = color;
  }

  public moveTo(spot: Spot) {
    spot.evict();
    spot.welcome(this);
  }

  //write setters and getters
  public getColor(): Color {
    return this.color;
  }

  public getName(): string {
    return this.name;
  }

  public blocks() {
    return true;
  }

  public isCapturableBy(piece: Piece) {
    return this.getColor() != piece.getColor();
  }

  public canMoveTo(bitLocation: number, board: Board): number[] {
    //i have no idea why i need to implement these in an abstract class ill figure it out later
    return [];
  }
}

export class BlockingPiece extends Piece implements Occupier {
  blocks() {
    return true;
  }

  isCapturableBy(piece: Piece) {
    return piece.getColor() != this.getColor(); //if they're not the same piece, you can capture
  }
}

class EdgeBlocker implements Occupier, Renderable {
  constructor() {}

  blocks() {
    return true;
  }
  isCapturableBy() {
    return false;
  }

  toString() {
    return "-";
  }
}
export const edgeBlocker = new EdgeBlocker();

export enum Color {
  BLACK = "black",
  WHITE = "white",
}

/*
 * An occupier is an object that can block a piece from moving and takes up a space.
 */
export interface Occupier {
  /*
   * Check if the occupier can block the piece
   */
  blocks(piece: Piece): boolean;
  isCapturableBy(piece: Piece): boolean;
}
export const isOccupier = (object): object is Occupier => !!object?.blocks;

export interface Renderable {
  toString(): string;
}
export const isRenderable = (object): object is Renderable =>
  !!object?.toString;

export interface Movable extends Occupier {
  moveTo(spot: Spot): void;
  /*
   * returns all the spots that can be moved to by this thing
   */
  canMoveTo(bitLocation: number, board: Board): number[];
}

export interface Orientable extends Movable {
  /*
   * returns the unit vector of the piece's orientation
   */
  getOrientation(): number[];
  /*
   * returns the bitmapped vector of the piece's orientation
   */
  getBitOrientation(size: number[]): number;
}
