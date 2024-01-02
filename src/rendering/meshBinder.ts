import { Mesh, Scene, SceneLoader } from "@babylonjs/core";

/* binds a mesh to a thing */
export class MeshBinder {
  private object: any;
  private mesh: Mesh;

  constructor(object: any, mesh: Mesh) {
    this.object = object;
    this.mesh = mesh;
  }

  getMesh(): Mesh {
    return this.mesh;
  }

  getObject(): any {
    return this.object;
  }
}

export function loadMesh(
  directory: string,
  fileName: string,
  scene: Scene,
  runOnMesh: (mesh: Mesh) => void = () => {},
) {
  let mesh: Mesh;
  SceneLoader.ImportMesh("", directory, fileName, scene, (meshes: Mesh[]) => {
    mesh = meshes[0];
    runOnMesh(mesh);
  });
  return mesh;
}
