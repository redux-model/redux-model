import Taro from '@tarojs/taro';
import * as TaroRedux from '@tarojs/redux';

const taro: typeof Taro = require(`@tarojs/taro-${process.env.TARO_ENV}`);

export const getTaroRequest = () => {
  return taro.request;
};

const redux: typeof TaroRedux = process.env.TARO_ENV === 'h5'
  ? require('@tarojs/redux-h5')
  : require('@tarojs/redux');

export const getTaroRedux = () => {
  return redux;
};
