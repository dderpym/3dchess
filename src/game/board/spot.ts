import { Occupier, edgeBlocker, isRenderable } from "../pieces/piece";

/**
 * Represents a spot on the board
 */
export class Spot {
  private location: number;
  protected occupier: null | Occupier;
  public rendered: boolean;

  /**
   * @param location - the location of the spot
   * @param piece - the piece on the spot
   */
  constructor(
    location: number,
    piece: Occupier = null,
    rendered: boolean = true,
  ) {
    this.location = location;
    this.occupier = piece;
    this.rendered = rendered;
  }

  /**
   * @returns the thing occupying the spot
   */
  public getOccupier(): Occupier | null {
    return this.occupier;
  }
  /**
   * @returns the location of the spot
   */
  public getLocation(): number {
    return this.location;
  }

  /**
   * removes the occupier from the spot
   */
  public evict() {
    this.occupier = null;
  }

  public welcome(occupier: Occupier) {
    this.occupier = occupier;
  }

  public toString(): string {
    const occ = this.getOccupier();
    if (isRenderable(occ)) return occ.toString();
    return " ";
  }
}

export class EdgeBarrier extends Spot {
  constructor(location: number) {
    super(location, edgeBlocker, false);
  }

  public evict() {}
  public welcome() {
    throw new Error("YO THIS IS AN EDGE BARRIER SPOT NO MOVING HERE");
  }
}
