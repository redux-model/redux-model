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

        let name = MetaReducer.metaPrepare[action.type];

        if (name) {
          state = MetaReducer.modifyReducer(state, name, action, true);
        } else {
          name = MetaReducer.metaSuccess[action.type];

          if (name) {
            state = MetaReducer.modifyReducer(state, name, action, false);
          } else {
            name = MetaReducer.metaFail[action.type];

            if (name) {
              state = MetaReducer.modifyReducer(state, name, action, false);
            }
          }
        }

        return state;
      },
    };
  }

  protected static modifyReducer(state: BigMetas, name: string, action: ActionResponseHandle, isLoading: boolean): BigMetas {
    let meta: Meta;

    switch (action.metaKey) {
      case true:
        meta = {
          actionType: action.type,
          loading: isLoading,
          message: action.message,
          httpStatus: action.httpStatus,
          businessCode: action.businessCode,
        };

        return { ...state, [name]: meta };
      case false:
        return state;
      default:
        meta = {
          actionType: action.type,
          loading: isLoading,
          message: action.message,
          httpStatus: action.httpStatus,
          businessCode: action.businessCode,
        };

        return {
          ...state,
          [name]: {
            ...state[name],
            [action.metaKey]: meta,
            ...METAS_PICK_METHOD,
          } as Metas,
        };
    }
  }
}

// Register metas automatically
appendReducers(MetaReducer.createData());
