import { BaseAction } from '../actions/BaseAction';

let actionCounter: number = 0;

export const resetActionCounter = (): void => {
  actionCounter = 0;
};

export const increaseActionCounter = (): number => {
  actionCounter += 1;

  return actionCounter;
};

export const setActionName = <T extends BaseAction<any>>(action: T): T => {
  const { model } = action;

  Object.keys(model).forEach((name) => {
    const customAction: BaseAction<any> = model[name];
    if (customAction && customAction.__isAction__) {
      customAction.setName(name);
    }
  });

  return action;
}
