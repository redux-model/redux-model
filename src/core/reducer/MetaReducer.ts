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

  private static usedNames: Set<string> = new Set();
  private static stash: Record<string, object> = {};
  private static RESTORE = 'lazy meta restore - ' + Math.round(Math.random() * 100) + Math.round(Math.random() * 100);

  public static record(name: string) {
    if (MetaReducer.stash[name]) {
      console.log('----------------------restore ' + name);
      getStore().dispatch({
        type: MetaReducer.RESTORE,
        payload: {
          name,
          data: MetaReducer.stash[name],
        },
      });
      console.log(MetaReducer.getData(name));
      delete MetaReducer.stash[name];
    }

    MetaReducer.usedNames.add(name);
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
          return {};
        }

        if (action.type === MetaReducer.RESTORE) {
          return {
            ...state,
            [action.payload.name]: action.payload.data,
          };
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

        if (MetaReducer.usedNames.has(name)) {
          return { ...state, [name]: meta };
        }

        MetaReducer.stash[name] = meta;
        return state;
      case false:
        return state;
      default:
        const singleMeta: Meta = {
          actionType: action.type,
          loading: isLoading,
          message: action.message,
          httpStatus: action.httpStatus,
          businessCode: action.businessCode,
        };

        if (MetaReducer.usedNames.has(name)) {
          return {
            ...state,
            [name]: {
              ...state[name],
              [action.metaKey]: singleMeta,
              ...METAS_PICK_METHOD,
            } as Metas,
          };
        }

        MetaReducer.stash[name] = MetaReducer.stash[name] || { ...METAS_PICK_METHOD };
        MetaReducer.stash[name][action.metaKey] = singleMeta;
        return state;
    }
  }
}

// Register metas automatically
appendReducers(MetaReducer.createData());
