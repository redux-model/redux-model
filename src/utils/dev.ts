export const isDebug = () => {
  return typeof module === 'object' && module.hot;
};

export const isProxyEnable = () => {
  return typeof Proxy === 'function';
};
