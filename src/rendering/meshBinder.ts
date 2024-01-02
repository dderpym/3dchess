import { Mesh, Scene, SceneLoader } from "@babylonjs/core";

/* binds a mesh to a thing */
export class MeshBinder<T> {
  private object: T;
  private mesh: Mesh;

  constructor(object: T, mesh: Mesh) {
    this.object = object;
    this.mesh = mesh;
  }

  getMesh(): Mesh {
    return this.mesh;
  }

  getObject(): T {
    return this.object;
  }
}

export async function loadMesh(
  directory: string,
  fileName: string,
  scene: Scene,
  runOnMesh: (mesh: Mesh) => void = () => {},
) {
  let mesh: Mesh;

  mesh = await SceneLoader.ImportMeshAsync("", directory, fileName, scene).then(
    (result) => {
      return result.meshes[0] as Mesh;
    },
  );

  runOnMesh(mesh);

  return mesh;
}
