import { counterModel } from './CounterModel';
import { npmInfoModel } from './NpmInfoModel';
import { summaryModel } from './SummaryModel';

export const reducers = {
  ...counterModel.register(),
  ...npmInfoModel.register(),
  ...summaryModel.register(),
};
