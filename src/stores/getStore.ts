import { Store } from 'redux';
import { storeHelper } from './StoreHelper';

export const getStore = (): Store => storeHelper.store;
