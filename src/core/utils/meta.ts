import { Meta, Metas } from './types';

export const DEFAULT_META: Meta = {
  actionType: '',
  loading: false,
};

export const METAS_PICK_METHOD: {
  pick: Metas['pick'];
} = {
  pick: function (payload) {
    return this[payload] || DEFAULT_META;
  },
};

// @ts-ignore
export const DEFAULT_METAS: Metas = {
  ...METAS_PICK_METHOD,
};
