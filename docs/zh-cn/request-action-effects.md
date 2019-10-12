# Request Action监听
在Request Action中，有3个事件可以被其它模型监听`onPrepare`, `onSuccess`, `onFail`。

```typescript
// ForthModel.ts
import { Model, Effects } from '@redux-model/web';
import { thirdModel } from './ThirdModel';

interface Data {
  status: string;
}

class ForthModel extends Model<Data> {
    // 监听其他模型的Action
    protected effects(): Effects<Data> {
        return [
            thirdModel.increase.onPrepare((state) => {
                state.status = 'prepare';
            }),

            thirdModel.increase.onSuccess((state) => {
                state.status = 'success';
            }),
            
            thirdModel.increase.onFail((state) => {
                state.status = 'fail';
            }),

        ];
    }

    protected initReducer(): Data {
        return {
            status: '',
        };
    }
}

export const forthModel = new ForthModel();
```
我们使用`effects()`方法监听其他模型的Action的调用，并同步更改当前模型的reducer数据。

```typescript
console.log(forthModel.data.status) // status === ''

const promise = thirdModel.getProfile(2);
console.log(forthModel.data.status) // status === 'prepare'

promise
    .then(() => {
        console.log(forthModel.data.status) // status === 'success'
    })
    .catch(() => {
        console.log(forthModel.data.status) // status === 'fail'
    });
```
