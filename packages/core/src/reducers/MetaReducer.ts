import { BaseReducer } from './BaseReducer';
import { RequestSuccessAction, HttpTransform } from '../actions/BaseRequestAction';
import ACTION_TYPES from '../utils/actionType';
import { IActionPayload } from '../actions/BaseAction';
import { storeHelper } from '../stores/StoreHelper';

export interface IMetaAction {
  metaKey: string | number | symbol | boolean;
  actionName: string;
}

export type MetasLoading<M> = {
  pick: (value: M) => boolean;
};

export type Meta = Readonly<{
  actionType: string;
  loading: boolean;
} & HttpTransform>;

export type Metas<M = any> = Partial<{
  [key: string]: Meta;
}> & {
  pick: (value: M) => Meta;
};

export interface IMetaRestore extends IActionPayload<{
  key: string;
  value: Meta | Metas;
}> {}

export interface IMetaStash {
  [key: string]: Metas | Meta | 'meta-used';
}

export const USED_FLAG = 'meta-used';

export const DEFAULT_META: Meta = {
  actionType: '',
  loading: false,
};

export const METAS_PICK_METHOD: {
  pick: (value: any) => Meta;
} = {
  pick: function (payload) {
    return this[payload] || DEFAULT_META;
  },
};

// @ts-ignore
export const DEFAULT_METAS: Metas = {
  ...METAS_PICK_METHOD,
};

interface Data {
  [key: string]: Metas | Meta;
}

class MetaReducer extends BaseReducer<Data> {
  // All metas will be stored here before user need them.
  protected readonly stash: IMetaStash = {};

  constructor() {
    super('_metas_', {}, [], null);
    storeHelper.appendReducers(this.createReducer());
  }

  public/*protected*/ getMeta<T extends Meta | Metas>(name: string): T | undefined {
    const value = this.stash[name];
    let meta = storeHelper.getState()[this.name][name];

    if (!meta && value && value !== USED_FLAG) {
      storeHelper.dispatch<IMetaRestore>({
        type: ACTION_TYPES.metaRestore,
        payload: {
          key: name,
          value: value,
        },
      });

      meta = value;
    }

    if (value !== USED_FLAG) {
      this.stash[name] = USED_FLAG;
    }

    return meta as T;
  }

  protected isRestore(action: RequestSuccessAction | IMetaRestore): action is IMetaRestore {
    return action.type === ACTION_TYPES.metaRestore;
  }

  protected reducer(state: Data | undefined, action: RequestSuccessAction | IMetaRestore): Data {
    if (state === undefined) {
      return this.initData;
    }

    if (this.isRestore(action)) {
      return {
        ...state,
        [action.payload.key]: action.payload.value,
      };
    }

    const metaKey = action.metaKey;
    const actionName = action.actionName;

    if (!actionName || metaKey === undefined || metaKey === false) {
      return state;
    }

    const meta: Meta = {
      actionType: action.type,
      loading: action.loading,
      message: action.message,
      httpStatus: action.httpStatus,
      businessCode: action.businessCode,
    };
    const stash = this.stash;
    const used = stash[actionName] === USED_FLAG;

    if (metaKey === true) {
      if (used) {
        return { ...state, [actionName]: meta };
      }

      stash[actionName] = meta;
    } else {
      if (used) {
        return {
          ...state,
          [actionName]: {
            ...state[actionName],
            [metaKey]: meta,
            ...METAS_PICK_METHOD,
          } as Metas,
        };
      }

      // @ts-ignore
      stash[actionName] = stash[actionName] || { ...METAS_PICK_METHOD };
      stash[actionName][metaKey] = meta;
    }

    return state;
  }
}

export const metaReducer = new MetaReducer();
