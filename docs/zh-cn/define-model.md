# 定义Model

当你想用这个框架时，您必须先定义一个模型类。每个模型都是独立的单元，它可以包含一个`reducer`和无数个`action`

```typescript
// FirstModel.ts
import { Model } from '@redux-model/web';

interface Data {
  counter: number;
}

class FirstModel extends Model<Data> {
    // Action
    increase = this.action((state) => {
        state.counter += 1;
    });
    
    // Reducer的初始值
    protected initReducer(): Data {
        return {
            counter: 0,
        };
    }
}

export const firstModel = new FirstModel();
```

上面定义了一个完整的redux流程，如果您已经在项目的入口文件中执行了`createReduxStore({})`函数，那么每个模型中的Reducer都将自动注入到store中。

利用接口`.data`属性，我们可以轻松地拿到reducer的数据。现在，我们可以快速地执行模型中的Action方法：
```typescript
console.log(firstModel.data.counter); // counter === 0

firstModel.increase(); // counter === 1
```
通过执行Action，我们轻而易举地改变了reducer的值，高效，快速，代码十分简洁。

你可能会疑惑，reducer中的state是不可变的，直接变更state，React组件能正常re-render吗？不用担心，框架使用了`mvvm`的特性，一旦发现state变更，就会返回新的对象，React组件能正常渲染。

!> 调用模型的Action，不需要使用`dispatch()`函数包裹，框架会自动处理。


## 不带Reducer的Model
TODO
