import { ActionResponseHandle, Meta, Metas, Reducers, Types } from '../utils/types';
import { appendReducers, getStore } from '../utils/createReduxStore';
import { METAS_PICK_METHOD } from '../utils/meta';

interface MetaDict {
  [key: string]: string;
}

interface BigMetas {
  [key: string]: Metas | Meta;
}

export class MetaReducer {
  public static reducerName: string = '__metas__';

  private static isAppend = false;

  private static metaPrepare: MetaDict = {};
  private static metaSuccess: MetaDict = {};
  private static metaFail: MetaDict = {};

  private static usedMetaNames: Set<string> = new Set();
  private static stash: Record<string, object> = {};

  public static record(name: string) {
    if (MetaReducer.stash[name]) {
      getStore().getState()[MetaReducer.reducerName][name] = MetaReducer.stash[name];
      delete MetaReducer.stash[name];
    }

    MetaReducer.usedMetaNames.add(name);
  }

  public static addCase(name: string, types: Types) {
    MetaReducer.metaPrepare[types.prepare] = name;
    MetaReducer.metaSuccess[types.success] = name;
    MetaReducer.metaFail[types.fail] = name;
  }

  public static getData<T = any>(name: string): T | undefined {
    return getStore().getState()[MetaReducer.reducerName][name];
  }

  public static createData(): Reducers {
    if (MetaReducer.isAppend) {
      return {};
    }

    MetaReducer.isAppend = true;

    return {
      [MetaReducer.reducerName]: (state: BigMetas, action: ActionResponseHandle) => {
        if (state === undefined) {
          state = {};
        }

        let name: string;

        name = MetaReducer.metaPrepare[action.type];
        if (name) {
          return MetaReducer.modifyReducer(state, name, action, true);
        }

        name = MetaReducer.metaSuccess[action.type];
        if (name) {
          return MetaReducer.modifyReducer(state, name, action, false);
        }

        name = MetaReducer.metaFail[action.type];
        if (name) {
          return MetaReducer.modifyReducer(state, name, action, false);
        }

        return state;
      },
    };
  }

  protected static modifyReducer(state: BigMetas, name: string, action: ActionResponseHandle, isLoading: boolean): BigMetas {
    switch (action.metaKey) {
      case true:
        const meta: Meta = {
          actionType: action.type,
          loading: isLoading,
          message: action.message,
          httpStatus: action.httpStatus,
          businessCode: action.businessCode,
        };

        if (!MetaReducer.usedMetaNames.has(name)) {
          MetaReducer.stash[name] = meta;
          return state;
        }

        return { ...state, [name]: meta };
      case false:
        return state;
      default:
        const metas = {
          ...state[name],
          [action.metaKey]: {
            actionType: action.type,
            loading: isLoading,
            message: action.message,
            httpStatus: action.httpStatus,
            businessCode: action.businessCode,
          },
          ...METAS_PICK_METHOD,
        } as Metas;

        if (!MetaReducer.usedMetaNames.has(name)) {
          MetaReducer.stash[name] = metas;
          return state;
        }

        return { ...state, [name]: metas };
    }
  }
}

// Register metas automatically
appendReducers(MetaReducer.createData());
