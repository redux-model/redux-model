import { counterModel } from './normal/CounterModel';
import { npmInfoModel } from './request/NpmInfoModel';
import { summaryModel } from './normal/SummaryModel';

export const reducers = {
  ...counterModel.hookRegister(),
  ...npmInfoModel.hookRegister(true, true),
  ...summaryModel.hookRegister(),
};
