export const isDebug = () => {
  return process.env.NODE_ENV !== 'production';
};

export const isProxyEnable = () => {
  return typeof Proxy === 'function';
};
