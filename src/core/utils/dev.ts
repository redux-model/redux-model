import { isDebug } from '../../libs/dev';

export const useProxy = (): boolean => {
  return isDebug() && typeof Proxy === 'function';
};
