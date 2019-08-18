import { ActionResponse, Reducers, Types } from '../utils/types';

interface MetaDict {
  [key: string]: {
    name: string;
    isMetas: boolean;
    metaKey: any;
  };
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

  public static addCase(name: string, types: Types, isMetas: boolean, metaKey: any) {
    MetaReducer.metaPrepare[types.prepare] = {
      name,
      isMetas,
      metaKey,
    };
    MetaReducer.metaSuccess[types.success] = {
      name,
      isMetas,
      metaKey,
    };
    MetaReducer.metaFail[types.fail] = {
      name,
      isMetas,
      metaKey,
    };
  }

  public static getData(name: string) {
    return MetaReducer.currentState[name];
  }

  public static createData(): Reducers {
    if (MetaReducer.isAppend) {
      return {};
    }

    MetaReducer.isAppend = true;

    return {
      [MetaReducer.getName()]: (state, action: ActionResponse) => {
        if (state === undefined) {
          state = {};
        }

        const prepareCase = MetaReducer.metaPrepare[action.type];

        if (prepareCase) {
          state = MetaReducer.modifyPrepare(state, prepareCase, action);
        } else {
          const successCase = MetaReducer.metaSuccess[action.type];

          if (successCase) {
            state = MetaReducer.modifySuccess(state, successCase, action);
          } else {
            const failCase = MetaReducer.metaFail[action.type];

            if (failCase) {
              state = MetaReducer.modifyFail(state, failCase, action);
            }
          }
        }

        MetaReducer.currentState = state;

        return state;
      },
    };
  }

  protected static modifyPrepare(state: object, prepareCase: MetaDict[string], action: ActionResponse) {
    if (prepareCase.isMetas) {
      return {
        ...state,
        [prepareCase.name]: {
          ...state[prepareCase.name],
          [action.payload[prepareCase.metaKey]]: {
            actionType: action.type,
            loading: true,
          },
        },
      };
    }

    return {
      ...state,
      [prepareCase.name]: {
        actionType: action.type,
        loading: true,
      },
    };
  }

  protected static modifySuccess(state: object, successCase: MetaDict[string], action: ActionResponse) {
    if (successCase.isMetas) {
      return {
        ...state,
        [successCase.name]: {
          ...state[successCase.name],
          [action.payload[successCase.metaKey]]: {
            actionType: action.type,
            loading: false,
          },
        },
      };
    }

    return {
      ...state,
      [successCase.name]: {
        actionType: action.type,
        loading: false,
      },
    };
  }

  protected static modifyFail(state: object, failCase: MetaDict[string], action: ActionResponse) {
    if (failCase.isMetas) {
      return {
        ...state,
        [failCase.name]: {
          ...state[failCase.name],
          [action.payload[failCase.metaKey]]: {
            actionType: action.type,
            loading: false,
            errorMessage: action.errorMessage,
            httpStatus: action.httpStatus,
            businessCode: action.businessCode,
          },
        },
      };
    }

    return {
      ...state,
      [failCase.name]: {
        actionType: action.type,
        loading: false,
        errorMessage: action.errorMessage,
        httpStatus: action.httpStatus,
        businessCode: action.businessCode,
      },
    };
  }
}
