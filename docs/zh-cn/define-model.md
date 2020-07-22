模型的本质是一个reducer与多个action的组合：

### 定义

```typescript
import { Model } from '@redux-model/react';

interface Data {
    counter: number;
}

class FirstModel extends Model<Data> {
    protected initReducer(): Data {
        return {
            counter: 0,
        };
    }
}

export const firstModel = new FirstModel();
```

我们刚刚创建了一个模型，它继承自框架的基础模型`Model<T>`。**\<T>**即为泛型，因为每个模型都默认存在一个reducer，所以泛型约束了reducer的数据类型。接着，模型实现了抽象方法`initReducer()`，为模型提供一个初始state。

!> 定义的Data通过泛型注入后，所有的action都能享受数据的自动推导

### 使用数据
通过**connect**连接
```typescript
import React, { FC } from 'react';
import { connect } from 'react-redux';

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

通过**React Hooks**连接
```typescript
import React, { FC } from 'react';

const App: FC = () => {
    const counter = firstModel.useData((data) => data.counter);

    return null;
}

export default App;
```

通过**Vue**连接
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

!> 使用`useData()`时，可以不传过滤函数，这样就返回了整个state。

### 无数据
您不一定非要创建带state的模型，这符合常理。如果您只需要actions，那么欢迎您这么做：
```typescript
import MyModel extends Model {
    protected initReducer() {
        return null;
    }
}
```
由于`initReducer`是抽象方法，所以您必须重载，并返回null，代表您不需要state。
