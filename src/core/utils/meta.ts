import { Meta, Metas } from './types';

export const DEFAULT_META: Meta = {
  actionType: '',
  loading: false,
};

export const METAS_GET_ITEM: {
  getItem: Metas['getItem'];
} = {
  getItem: function (payload) {
    return this[payload] || DEFAULT_META;
  },
};

// @ts-ignore
export const DEFAULT_METAS: Metas = {
  ...METAS_GET_ITEM,
};
