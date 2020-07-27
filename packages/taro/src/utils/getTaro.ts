import Taro from '@tarojs/taro';

const DynamicTaro = `${process.env.TARO_ENV}` === 'h5'
? require('@tarojs/taro-h5')
: require('@tarojs/taro');

export const getTaro = (): typeof Taro => {
  return DynamicTaro;
};
