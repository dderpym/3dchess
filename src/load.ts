import {
  HemisphericLight,
  Mesh,
  Space,
  UniversalCamera,
  Vector3,
} from "@babylonjs/core";

export const defSens = (sens: number, x: number) =>
  Math.sign(x) * Math.log(sens * Math.abs(x) + 1);
export const defDamp = (
  dampening: number,
  vel: number,
  minAbs: number,
  secondsPassed: number,
) =>
  (vel - Math.sign(vel) * minAbs) *
    Math.pow(Math.E, -Math.pow(dampening * secondsPassed, 2)) +
  Math.sign(vel) * minAbs;

/**
 * Makes a loading screen with a little spinny thing
 * I'll clean this up later, for now it's quick and dirty.
 */
export class SpinnyLoadScreen {
  mesh: Mesh;
  baseVel: { x: number; y: number };
  lightDist: number;
  camDist: number;
  relXAxis: number;
  relYAxis: number;
  lastPointerPos: { x: number; y: number };
  rotVel: { x: number; y: number };
  sens: (x: number) => number;
  damp: (x: number, minAbs: number, secondsPassed: number) => number;
  drag: boolean;
  time: number;

  /**
   * @param meshToSpin - the mesh that will be spun while loading
   * @param baseVel - the initial and minimum rotational velocity (passed to maxDelta on most things)
   * @param sensitivity - a function that returns number yes
   * @param dampening - a function that returns number yes
   */
  constructor(
    meshToSpin: Mesh,
    baseVel: { x: number; y: number },
    lightDist: number,
    camDist: number,
    camAngle: number,
    sensitivity = defSens.bind(null, [0.05]),
    dampening = defDamp.bind(null, [1]),
  ) {
    this.mesh = meshToSpin;

    this.baseVel = baseVel;
    this.rotVel = Object.assign({}, baseVel);

    this.lightDist = lightDist;
    this.camDist = camDist;
    this.relXAxis = Math.sin(camAngle);
    this.relYAxis = Math.cos(camAngle);

    this.sens = sensitivity;
    this.damp = dampening;
    this.drag = false;
  }

  private onPointerDown(evt: PointerEvent) {
    this.lastPointerPos = { x: evt.clientX, y: evt.clientY };
    this.drag = true;
  }
  private onPointerUp() {
    this.drag = false;
  }
  private onMouseMove(evt: PointerEvent) {
    if (!this.drag) return;
    this.rotVel.x += this.sens(evt.y - this.lastPointerPos.y); //spin along perpendicular axis
    this.rotVel.y += this.sens(evt.x - this.lastPointerPos.x);
    this.lastPointerPos = { x: evt.x, y: evt.y };
  }
  private update() {
    const now = performance.now();
    const deltaTSeconds = (now - this.time) / 1000;
    const rotVel = this.rotVel;
    const mesh = this.mesh;
    this.time = now;

    mesh.rotate(Vector3.Right(), rotVel.x * deltaTSeconds, Space.WORLD);
    mesh.rotate(Vector3.Down(), rotVel.y * deltaTSeconds, Space.WORLD);
    rotVel.x = this.damp(
      rotVel.x,
      this.drag ? 0 : this.baseVel.x,
      deltaTSeconds,
    );
    rotVel.y = this.damp(
      rotVel.y,
      this.drag ? 0 : this.baseVel.y,
      deltaTSeconds,
    );
  }

  public init() {
    const mesh = this.mesh;
    const scene = mesh.getScene();
    const canvas = scene.getEngine().getRenderingCanvas();
    const camDist = this.camDist;

    var camera = new UniversalCamera(
      "loadcam",
      new Vector3(0, this.relXAxis * camDist, this.relYAxis * camDist),
      scene,
    );
    camera.setTarget(this.mesh.position);

    var light1: HemisphericLight = new HemisphericLight(
      "loadlight",
      new Vector3(0, this.lightDist, 0),
      scene,
    );

    this.time = performance.now();
    scene.registerBeforeRender(this.update.bind(this));

    canvas.addEventListener("pointerdown", this.onPointerDown.bind(this));
    canvas.addEventListener("pointerup", this.onPointerUp.bind(this));
    canvas.addEventListener("pointermove", this.onMouseMove.bind(this));
  }
}
