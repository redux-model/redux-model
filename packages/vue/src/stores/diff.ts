import * as diff from 'deep-diff';
import cloneDeep from 'clone';

enum PATCH_KIND {
  array = 'A',
  new = 'N',
  trash = 'D',
  edit = 'E',
}

const getDeepState = (observer: any, paths: Array<string | number>, popLastPath: boolean)  => {
  if (popLastPath) {
    paths = paths.slice(0, paths.length - 1);
  }

  return  paths.reduce((carry, value) => {
    return carry[value];
  }, observer);
};

const getLastPath = (paths: Array<string | number>): string | number => {
  return paths.slice(paths.length - 1)[0];
};

export const applyPatch = (originalState: object, currentState: object, ovserver: object) => {
  const patches = diff.diff(originalState, currentState);

  if (patches === undefined) {
    return;
  }

  for (let i = 0, len = patches.length; i < len; ++i) {
    const patch = patches[i];
    const patchPath: Array<string | number> = patch.path!;

    switch (patch.kind) {
      case PATCH_KIND.array:
        if (patch.item.kind !== PATCH_KIND.new) {
          throw new TypeError(`Unknown diff kind '${patch.item.kind}' in array`);
        }

        getDeepState(ovserver, patchPath, false)[patch.index] = cloneDeep(patch.item.rhs, false);
        break;
      case PATCH_KIND.trash:
        delete getDeepState(ovserver, patchPath, true)[getLastPath(patchPath)];
        break;
      case PATCH_KIND.edit:
      case PATCH_KIND.new:
        getDeepState(ovserver, patchPath, true)[getLastPath(patchPath)] = cloneDeep(patch.rhs, false);
        break;
      default:
        throw new TypeError('Unknown diff kind: ' + patch.kind);
    }
  }
};
