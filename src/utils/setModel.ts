import { AnyModel } from '../models/BaseModel';

let currentModel: AnyModel;

export const setCurrentModel = (model: AnyModel) => {
  currentModel = model;
};

export const getCurrentModel = () => currentModel;
