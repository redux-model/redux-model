import { ActionResponse, Meta, Metas, Reducers, Types } from '../utils/types';
import { appendReducers } from '../utils/createReduxStore';
import { METAS_PICK_METHOD } from '../utils/meta';

interface MetaDict {
  [key: string]: string;
}

interface BigMetas {
  [key: string]: Metas | Meta;
}

export class MetaReducer {
  private static isAppend = false;

  private static metaPrepare: MetaDict = {};

  private static metaSuccess: MetaDict = {};

  private static metaFail: MetaDict = {};

  private static currentState: object;

  public static getName() {
    return '__metas__';
  }

  public static addCase(name: string, types: Types) {
    MetaReducer.metaPrepare[types.prepare] = name;
    MetaReducer.metaSuccess[types.success] = name;
    MetaReducer.metaFail[types.fail] = name;
  }

  public static getData<T = any>(name: string): T | undefined {
    return MetaReducer.currentState[name];
  }

  public static createData(): Reducers {
    if (MetaReducer.isAppend) {
      return {};
    }

    MetaReducer.isAppend = true;

    return {
      [MetaReducer.getName()]: (state: BigMetas, action: ActionResponse) => {
        if (state === undefined) {
          state = {};
        }

        let name = MetaReducer.metaPrepare[action.type];

        if (name) {
          state = MetaReducer.modifyPrepare(state, name, action);
        } else {
          name = MetaReducer.metaSuccess[action.type];

          if (name) {
            state = MetaReducer.modifySuccess(state, name, action);
          } else {
            name = MetaReducer.metaFail[action.type];

            if (name) {
              state = MetaReducer.modifyFail(state, name, action);
            }
          }
        }

        MetaReducer.currentState = state;

        return state;
      },
    };
  }

  protected static modifyPrepare(state: BigMetas, name: string, action: ActionResponse): BigMetas {
    switch (action.metaKey) {
      case true:
        return {
          ...state,
          [name]: {
            actionType: action.type,
            loading: true,
          },
        };
      case false:
        return state;
      default:
        return {
          ...state,
          [name]: {
            ...state[name],
            [action.payload[action.metaKey]]: {
              actionType: action.type,
              loading: true,
            },
            ...METAS_PICK_METHOD,
          } as Metas,
        };
    }
  }

  protected static modifySuccess(state: BigMetas, name: string, action: ActionResponse): BigMetas {
    switch (action.metaKey) {
      case true:
        return {
          ...state,
          [name]: {
            actionType: action.type,
            loading: false,
          },
        };
      case false:
        return state;
      default:
        return {
          ...state,
          [name]: {
            ...state[name],
            [action.payload[action.metaKey]]: {
              actionType: action.type,
              loading: false,
            },
            ...METAS_PICK_METHOD,
          } as Metas,
        };
    }
  }

  protected static modifyFail(state: BigMetas, name: string, action: ActionResponse): BigMetas {
    switch (action.metaKey) {
      case true:
        return {
          ...state,
          [name]: {
            actionType: action.type,
            loading: false,
            errorMessage: action.errorMessage,
            httpStatus: action.httpStatus,
            businessCode: action.businessCode,
          },
        };
      case false:
        return state;
      default:
        return {
          ...state,
          [name]: {
            ...state[name],
            [action.payload[action.metaKey]]: {
              actionType: action.type,
              loading: false,
              errorMessage: action.errorMessage,
              httpStatus: action.httpStatus,
              businessCode: action.businessCode,
            },
            ...METAS_PICK_METHOD,
          } as Metas,
        };
    }
  }
}

// Register metas automatically
appendReducers(MetaReducer.createData());
