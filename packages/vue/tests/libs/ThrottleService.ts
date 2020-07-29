import { $api } from './ApiService';

export const $throttleApi = $api.clone({
  beforeSend(action) {
    action.query.__rand = Math.random();
  },
  throttleTransfer(options) {
    delete options.query.__rand;
  }
});
