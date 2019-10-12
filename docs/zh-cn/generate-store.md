# 创建Store
在使用框架的任何功能之前，您需要创建一个React项目，并使用函数`createReduxStore`生成一个Redux的store对象。

```typescript
// index.tsx
import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { createReduxStore } from '@redux-model/web';

// 创建Store
const store = createReduxStore({});

ReactDom.render(
    <Provider store={store}>
        <div>app</div>
    </Provider>,
    document.getElementById('root')
);

// 开发热更新
if (module.hot) {
    module.hot.accept();
}
```
