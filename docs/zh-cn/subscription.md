
### 同步订阅其它模型
在原生Redux中，dispatch下发action后，您可以通过判断`action.type`改变多个reducer的数据。模型中可以使用订阅的方式来实现：

```typescript
import { Model, Subscriptions } from '@redux-model/react';

class NormalModel extends Model {
    increase = this.action((state, payload: { step: number; }) => {});
    double = this.action((state) => {});
}

class RequestModel extends Model {
    getInfo = $api.action((id: number) => {
        return this
            .get('/api/users/' + id)
            .payload({
              id,
            });
    });
}

class ComposeModel extends Model {
  multipleFetch = this.compose(async () => {
    await requestModel.getInfo(20);
    normal.double();
    // ...
  });
}

const normalModel = new NormalModel();
const requestModel = new RequestModel();
const composeModel = new ComposeModel();

// --------------------------------- //
// --------------------------------- //

interface Data {
    name: string;
    step?: number;
}

class EffectModel extends Model<Data> {
    protected subscriptions(): Subscriptions<Data> {
        return [
            normalModel.increase.onSuccess((state, action) => {
                state.name = 'increase';
                state.step = action.payload.step;
            }),

            requestModel.getInfo.onPrepare((state, action) => {}),
            requestModel.getInfo.onSuccess((state, action) => {}),
            requestModel.getInfo.onFail((state, action) => {}),

            composeModel.multipleFetch.onPrepare((state, action) => {}),
            composeModel.multipleFetch.onSuccess((state, action) => {}),
            composeModel.multipleFetch.onFail((state, action) => {}),
        ];
    }

    protected initialState(): Data {
        return {
            name: '-',
        };
    }
}

export const effectModel = new EffectModel();
```
通过重载`subscriptions()`方法，您可以订阅任意其它模型的action调用，以及执行该action时传入的payload，并更改当前模型下的数据。

* 普通Action可以订阅的事件：`onSuccess`
* 请求Action可以订阅的事件：`onPrepare`, `onSuccess`, `onFail`
* 组合Action可以订阅的事件：`onPrepare`, `onSuccess`, `onFail`

### 异步订阅其它模型
根据Redux的规则，在dispatch期间，您不允许在变更reducer期间执行dispatch函数。模型作为语法糖也继承了这个规则，但您可以通过订阅的方式来实现：
```typescript
class EffectModel extends Model<Data> {
    myAction1 = this.action((state) => {});
    myAction2 = this.action((state) => {});

    protected subscriptions(): Subscriptions<Data> {
        return [
            normalModel.increase.afterSuccess((action) => {
                // ...
                this.myAction1();
                this.myAction2();
                // ...
            }),
        ];
    }
}
```
当您执行完`normalModel.increase()`后，通过`afterSuccess`订阅的事件将被触发执行。

* 普通Action可以订阅的事件：`afterSuccess`
* 请求Action可以订阅的事件：`afterPrepare`, `afterSuccess`, `afterFail`
* 组合Action可以订阅的事件：`afterPrepare`, `afterSuccess`, `afterFail`


!> on开头的订阅为同步触发，且只能变更模型state；<br>
after开头的订阅为异步触发，可以执行子action，或者再次调用**changeState**来改变模型state。

### 普通Action自身异步订阅
上面所提到的订阅，皆是订阅其它模型的action，我们也偶尔有对当前模型的action做订阅的需求。请求Action因为链式的结构，能够十分方便地做自订阅处理，而普通Action过于简洁，似乎是找不到订阅的入口的。经过不断地思索，最终给出了如下的解决方案：
```typescript
class TestModel extends Model {
  increase = this.action((state, payload: object) => {
    // ...
  }, {
    // ---- 开始
    afterSuccess: (action) => {
      console.log(action.payload);
    },
    /* duration: 1000 */
    // ---- 结束
  });
}
```

### 请求Action自身异步订阅
请求本身就是异步的，在链式操作中，集成订阅是轻而易举地事情：
```typescript
class TestModel extends Model {
  fetchUser = $api.action((id) => {
    return this
      .get<Response>('/api/fetch')
      .query({
        id,
      })
      .onSuccess((state, action) => {
        state[id] = action.response;
      })
      // ---- 开始
      .afterSuccess((action) => {
        this.otherAction();
        otherModel.otherAction();
      })
      .afterPrepare((action) => {})
      .afterFail((action) => {}/* , 1000 */)
      // ---- 结束
  });
}
```
