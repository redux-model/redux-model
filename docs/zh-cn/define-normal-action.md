# 定义Normal Action
Action的作用是直接变更reducer的值。框架对Action做了诸多的改良，精简代码并增强代码的可阅读性。

```typescript
import { Model } from '@redux-model/web';

interface Data {
  counter: number;
}

class FirstModel extends Model<Data> {
    // Action
    increase = this.action((state) => {
        state.counter += 1;
    });
    
    // Action
    plusStep = this.action((state, step: number) => {
        state.counter += step;
    });
    
    // Action
    reduceStep = this.action((state, payload: { step: number }) => {
        state.counter -= payload.step;
    });

    protected initReducer(): Data {
        return {
            counter: 0,
        };
    }
}

export const firstModel = new FirstModel();
```
一个模型可以定义无数个Action，只要你愿意。

Action的回调函数中，最多只能带两个参数。第一个参数是reducer的state，我们可以变更state的值，从而变更reducer。第二个参数是Action的真正的参数，它可以是任何类型的值，但我们一般使用对象，这样能接收到更多的数据

```typescript
console.log(firstModel.data.counter); // counter === 0
            
firstModel.reduceStep({ step: 2 }); // counter === -2

firstModel.increase(); // counter === -1

firstModel.plusStep(1); // counter === 0
```
!> 调用模型的Action，不需要使用`dispatch()`函数包裹，框架会自动处理。
