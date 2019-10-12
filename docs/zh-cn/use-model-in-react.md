# 在React中使用

### Connect()
利用react-redux的`connect`函数，我们能轻易地把redux数据注入到react的props中
```typescript
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { firstModel } from './FirstModel';

type Props = ReturnType<typeof mapStateToProps>;

class App extends PureComponent<Props> {
    render() {
        const { counter } = this.props;

        return <div>{counter}</div>;
    }
}

const mapStateToProps = () => {
    return {
        // 在这里注入
        counter: firstModel.data.counter,
    };
};

export default connect(mapStateToProps)(App);
```


## Hooks

!> 如果你想使用react的hooks特性，请确保react的版本在`16.8.3+`以及react-redux的版本在`7.1.0+`

利用最新的hooks特性，你可以再次精简业务代码。如果你的项目允许使用hooks，那么我推荐你这么做。

```typescript
import React, { FC } from 'react';
import { firstModel } from './FirstModel';

const App: FC = () => {
    // 在这里注入
    const counter = firstModel.useData().counter;
   
    return <div>{counter}</div>;
}

export default App;
```

在hooks中，我们使用`useData()`获取reducer数据。它使用`===`的形式对比数据的变化，当数据有变更时，会自动触发组件重新渲染。

你也可以传入回调函数获取更深层的数据，这样可以提高React的渲染性能
```typescript
// 仅当Reducer中counter这个属性有变更时，才会re-render
const counter = firstModel.useData((item) => item.counter);
```

通过`.data`虽然也能拿到数据，但是它不能让组件`re-render`。
