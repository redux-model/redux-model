在实际的业务场景中，您可能会有这些场景需要处理：
>* 先请求一个数据，再用数据中的部分内容请求另一个数据。
>* 同时请求多个数据，接着将所有数据的内容合并，再存进模型state。
>* 您想批量处理多条请求并启动loading进度条，当所有请求完成后，loading结束。

### 第一个Action

而我们已经知道，Service中的action，都是针对单个请求而设计的，面对多个请求，显得束手无策。所以针对上面这些业务场景，我们设计出一个`compose action`的接口：
```typescript
import { Model } from '@redux-model/react';
import { $api } from './ApiService';

interface Data {
  react: Partial<{
    id: string;
    homepage: string;
  }>;
  vue: Partial<{
    id: string;
    homepage: string;
  }>;
}

interface Response {
  _id: string;
  license: string;
  homepage: string;
}

class ComposeModel extends Model<Data> {
  getInfo = $api.action((pkgName: string) => {
    return this .get<Response>('/' + pkgName);
  });

  multipleFetch = this.compose(async () => {
    const reactResult = await this.getInfo('react');
    const vueResult = await this.getInfo('vue');

    this.changeReducer((state) => {
      state.react = {
        id: reactResult.response._id,
        homepage: reactResult.response.homepage,
      };
      state.vue = {
        id: vueResult.response._id,
        homepage: vueResult.response.homepage,
      };
    });
  });

  protected initReducer(): Data {
    return {
      react: {},
      vue: {},
    };
  }
}

export const composeModel = new ComposeModel();
```
通过创建自定义函数`multipleFetch`，您将两个请求组合在一起，并在最后使用`changeReducer`合并了数据。

现在让我们把demo运行起来。请您点击按钮尝试，打开控制台可以看到日志：
<iframe src="https://redux-model.github.io/docs-runtime/compose-action.html" height="300"></iframe>


!> **changeReducer**是一个内置的保护方法，作用是立即改变模型state，您可以在组合、普通方法或者`after`订阅事件中使用。

### 状态追踪
组合和普通的类方法的唯一区别，就是普通方法没有loading状态追踪。如果不用组合，您就必须在组件中通过使用`Promise.all()`来确保所有请求都已经结束，再手动设置loading为false。

与请求的Action一样，组合Action的句柄上也暴露了loading函数：
```typescript
import React, { FC } from 'react';

const App: FC = () => {
    const loading = composeModel.multipleFetch.useLoading();

    return null;
};
```
