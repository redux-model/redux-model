模型的本质是一个reducer与多个action的组合：

### 定义

```typescript
import { Model } from '@redux-model/react';

interface Data {
    counter: number;
}

class FirstModel extends Model<Data> {
    protected initialState(): Data {
        return {
            counter: 0,
        };
    }
}

export const firstModel = new FirstModel();
```

我们刚刚创建了一个模型，它继承自框架的基础模型`Model<T>`。**\<T>** 即为泛型，因为每个模型都默认存在一个reducer，所以泛型约束了reducer的数据类型。接着，模型实现了抽象方法`initialState()`，为模型提供一个初始state。

!> 定义的Data通过泛型注入后，所有的action都能享受数据的自动推导

### 使用数据
<!-- tabs:start -->

#### ** Redux Connect **
```typescript
import React, { FC } from 'react';
import { connect } from '@redux-model/react';

type Props = ReturnType<typeof mapStateToProps>;

const App: FC<Props> = (props) => {
    const { counter } = props;

    return null;
};

const mapStateToProps = () => {
    return {
        counter: firstModel.data.counter,
    };
};

export default connect(mapStateToProps)(App);
```

#### ** React Hooks **

```typescript
import React, { FC } from 'react';

const App: FC = () => {
    const counter = firstModel.useData((data) => data.counter);

    return null;
}

export default App;
```

#### ** Vue Hooks **

```typescript
<template>
  <div>{counter}</div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
    setup() {
        const counter = firstModel.useData((data) => data.counter);

        return {
            counter,
        };
    }
});
</scirpt>
```

<!-- tabs:end -->

使用`useData()`时，可以不传选择器函数，这样就返回了整个state。虽然很方便，但缺点也很明显，就是一旦内部有数据变化，组件就会重渲染。正常情况下每一个组件可能只需要使用其中一部分数据，选择最小的数据集合，才能保证组件按需重渲染。
```typescript
// 按需，最小数据
// useData(selector: Function)
const user1 = model.useData((data) => data[0]);

// 按需，组合最小数据，产生了新的复合数据 （Vue不支持）
// useData(selector: Function, shallowEqual: boolean)
const { user1, user2 } = model.useData((data) => {
  return {
    user1: data[0],
    user2: data[1],
  };
}, true);
```

!> 当您在选择器中返回了新的复合数据，必须启用`shallowEqual`，否则对于组件来说，您每次都是返回新数据，导致重渲染

### 无数据
您不一定非要创建带state的模型，这符合常理。如果您只需要actions，那么欢迎您这么做：
```typescript
import MyModel extends Model {
    protected initialState() {
        return null;
    }
}
```
由于`initialState`是抽象方法，所以您必须重载，并返回null，代表您不需要state。

### 自动注册
模型默认就是在实例化的时候自动注册到store的，~~您无需像使用其他redux库一样把各个reducer集中到一起然后执行combineReducer~~，Redux-Model足够细心，它已经帮您处理好这一段既无聊又容易忘记去做的代码，所以您实例化(**new XxxModel()**)完模型就可以直接导出使用。

### 代码分离
基于自动注册的机制，只要您的组件是动态引入的，那么配套使用的模型也会跟随动态引入，并且在动态引入后能够立即注册。可以说您无需关注模型是否需要分离。

### 延迟注册
这个功能大部分场景用不上，但是假设您在实例化的时候传入了参数，并且想用这些参数作为初始化数据的一部分，那么延迟注册就显得很有必要。通过`init`，您可以自由地定制初始数据。
```typescript
import { Model } from '@redux-model/react';

interface Data {
  count: number;
}

class TestModel extends Model<Data> {
  protected readonly initialCount = 0;

  constructor(count: number = 0) {
    // 父类执行自动注册，并确定初始数据（被拦截）
    super();
    // 属性赋值
    // ...
    // ...
    // 定制业务
    this.initialCount = count;
    // 所有数据初始化完之后，自动注册
  }

  protected initialState(): Data {
    return {
      count: this.initialCount,
    };
  }
}

// 拦截自动注册
export const testModel = TestModel.init(100);
```
