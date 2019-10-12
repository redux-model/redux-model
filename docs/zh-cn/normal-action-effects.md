# Normal Action监听
在实际使用场景中，经常会出现调用一个Action方法，需要更改多个reducer的情况。在框架中也有相关的解决方案。

```typescript
// SecondModel.ts
import { Model, Effects } from '@redux-model/web';
import { firstModel } from './FirstModel';

interface Data {
  online: boolean;
}

class SecondModel extends Model<Data> {
    // 监听其他模型的Action
    protected effects(): Effects<Data> {
        return [
            firstModel.increase.onSuccess((state) => {
                state.online = !state.online;
            }),
            // 更多effect可以继续添加
        ];
    }

    protected initReducer(): Data {
        return {
            online: false,
        };
    }
}

export const secondModel = new SecondModel();
```
我们使用`effects()`方法监听其他模型的Action的调用，并同步更改当前模型的reducer数据。

```typescript
console.log(secondModel.data.online) // online === false

firstModel.increase(); // online === true
firstModel.increase(); // online === false
firstModel.increase(); // online === true
```
