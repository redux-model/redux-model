### 第一个Action

您可能无法相信，创建一个action能有多么简单：

```typescript
import { Model } from '@redux-model/react';

interface Data {
    counter: number;
}

class NormalModel extends Model<Data> {
    // ---开始
    increase = this.action((state, step: number = 1) => {
        state.counter += step;
    });
    // ---结束

    protected initialState(): Data {
        return {
            counter: 0,
        };
    }
}

export const normalModel = new NormalModel();
```
瞧，我们增加了一个名为`increase`的action，虽然只有两行，但是它将完成`dispatch -> action + type -> reducer`的全套操作。

是时候执行这个action了，没有任何多余的操作：
```typescript
nomalModel.increase(1);
```
怎样？简单到爆了吧？下面有个可操作的demo，点击按钮改变数字，打开控制台可以看到日志：

<iframe src="https://redux-model.github.io/docs-runtime/normal-action.html" height="250"></iframe>

!> action最多只能提供两个形参，第一个为固定参数state用于变更reducer，第二个为可选的任意类型的payload，当您调用action时，TS仅提示payload的类型。

### 多几个Action

您想对一个模型里的数据做各种各样的操作吗？那就多建几个action吧：

```typescript
import { Model } from '@redux-model/react';

interface Data {
    counter: number;
}

class NormalModel extends Model<Data> {
    increase = this.action((state, step: number = 1) => {
        state.counter += step;
    });

    double = this.action((state) => {
      state.counter = state.counter * 2;
    });

    decrease = this.action((state, step: number = 1) => {
        state.counter -= step;
    });

    protected initialState(): Data {
        return {
            counter: 0,
        };
    }
}

export const normalModel = new NormalModel();
```
新建了两个action `double`和`decrease`，而且只要您乐意，加多少个都可以。



### 对比原生

相对于传统的reducer操作，数据是不可变的，意味着当您想改变数据时，必须返回新的对象或数组才能被redux检测到数据有变更：
```typescript
// 原生 Redux
const initState = {
    counter: 0,
    foo: {
        counter: 0,
        bar: {
            baz: '',
        }
    },
};

const myReducer = (state = initState, action) => {
    switch (action.type) {
        case 'expected':
            return {
                ...state,
                counter: state.counter + action.payload.step,
                foo: {
                    ...foo,
                    counter: state.counter + action.payload.step,
                },
            };
        default:
            return state;
    }
};
```
看看，各种解构操作！当case不断变多、对象越来越变复杂的时候，您需要做更多恐怖的操作，这极大地增加了心智负担，而且出错率直线上升。没有人愿意去维护这种代码。

而使用模型，您可以随(早)心(点)所(下)欲(班)地改变数据，而且不用担心出错，因为您已经通过`Model<Data>`注入了数据类型，参数`state`被类型自动推导为Data：
```typescript
// 模型
class NormalModel extends Model {
    increase = this.action((state, step: number) => {
        state.counter += step;
        state.foo.counter += step;
    });
}
```
