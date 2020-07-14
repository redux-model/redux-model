import { BaseModel } from './BaseModel';
import { HttpTransform } from '../actions/BaseRequestAction';
import { IActionPayload } from '../actions/BaseAction';
import { MetaReducer, USED_FLAG, META_RESTORE } from '../reducers/MetaReducer';
import { IReducers } from '../reducers/BaseReducer';
import { storeHelper } from '../stores/StoreHelper';

export interface IMetaAction {
  metaKey: string | number | symbol | boolean;
  metaActionName: string;
}

export type MetasLoading<M> = {
  pick: (value: M) => boolean;
};

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

export type Meta = Readonly<{
  actionType: string;
  loading: boolean;
} & HttpTransform>;

export type Metas<M = any> = Partial<{
  [key: string]: Meta;
}> & {
  pick: (value: M) => Meta;
};

interface Data {
  [key: string]: Metas | Meta;
}

export interface IMetaRestore extends IActionPayload<{
  key: string;
  value: Meta | Metas;
}> {}

export interface IMetaStash {
  [key: string]: Metas | Meta | '@flus/used';
}

export class MetaModel extends BaseModel<Data> {
  // All metas will be stored here before user need them.
  protected readonly stash: IMetaStash = {};

  public getReducerName() {
    return '__metas__';
  }

  public register(): IReducers {
    const reducer = new MetaReducer(this.stash, this);
    return reducer.createReducer();
  }

  public/*protected*/ getMeta<T extends Meta | Metas>(name: string): T | undefined {
    const stash = this.stash[name];

    if (!this.data[name] && stash && stash !== USED_FLAG) {
      const action: IMetaRestore = {
        type: META_RESTORE,
        payload: {
          key: name,
          value: stash,
        },
      };
      storeHelper.dispatch<IMetaRestore>(action);
    }

    if (stash !== USED_FLAG) {
      this.stash[name] = USED_FLAG;
    }

    return this.data[name] as T;
  }

  public/*protected*/ initReducer(): Data {
    return {};
  }
}

export const metaModel = new MetaModel();
