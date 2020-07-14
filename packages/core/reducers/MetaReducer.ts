import { BaseReducer } from './BaseReducer';
import { InternalSuccessAction } from '../actions/BaseRequestAction';
import { IMetaRestore, Meta, METAS_PICK_METHOD, Metas, IMetaStash } from '../models/MetaModel';
import { BaseModel } from '../models/BaseModel';

export const META_RESTORE = '@flus/meta/restore';
export const USED_FLAG = '@flus/used';

export class MetaReducer<Data = any> extends BaseReducer<Data> {
  protected readonly stash: IMetaStash = {};

  constructor(stash: IMetaStash, model: BaseModel<Data>) {
    super(model);
    this.stash = stash;
  }

  protected isRestore(action: InternalSuccessAction | IMetaRestore): action is IMetaRestore {
    return action.type === META_RESTORE;
  }

  protected reducer(state: Data | undefined, action: InternalSuccessAction | IMetaRestore): Data {
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
    const actionName = action.metaActionName;

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
    const used = this.stash[actionName] === USED_FLAG;

    if (metaKey === true) {
      if (used) {
        return { ...state, [actionName]: meta };
      }

      this.stash[actionName] = meta;
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

      this.stash[actionName] = this.stash[actionName] || { ...METAS_PICK_METHOD };
      this.stash[actionName][metaKey] = meta;
    }

    return state;
  }
}
