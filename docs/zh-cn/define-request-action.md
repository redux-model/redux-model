### 第一个Action

写业务肯定是要请求数据的，因此框架提供了`Http Service`，让您以最快的速度完成功能开发：

```typescript
import { Model } from '@redux-model/react';
import { $api } from './ApiService';

interface Response {
    _id: string;
    license: string;
    homepage: string;
}

interface Data {
    id: string;
    homepage: string;
}

class RequestModel extends Model<Data> {
    getInfo = $api.action((pkgName: string) => {
        return this
            .get<Response>(`/${pkgName}`)
            .onSuccess((state, action) => {
                state.id = action.response._id;
                state.homepage = action.response.homepage;
            });
    });

    protected initReducer(): Data {
        return {
            id: '-',
            homepage: '-',
        };
    }
}

export const requestAction = new RequestModel();
```
我们事先初实例化了service并命名为`$api`，并快速地定义了模型的action。匿名函数内部是一个链式的操作，配置了请求的行为方式。

`this.get<T>(url)`是为了告诉service请求的方式和请求地址，其中**泛型T**为请求成功后的数据类型约束。

`onSuccess((state, action) => {})`是为了告诉service请求成功后该怎么处理数据。其中state的类型约束来自**Model\<T>**，action.response的类型约束来自**this.get\<T>**

类似地，您可以像调用action一样执行它，因为它本来就是action：
```typescript
requestAction.getInfo('react');
```
简单吧？

下面有个可操作的demo，点击按钮请求来自npm的接口，打开控制台可以看到日志：

<iframe src="https://redux-model.github.io/docs-runtime/request-action.html" height="350"></iframe>

### 状态追踪

请求数据时，之所以您可以看到一闪而过的`Loading...`绿色文字，是因为action能正确追踪和记录请求的状态。而状态的获取方式已经暴露在了action句柄上了：
```typescript
import React, { FC } from 'react';

const App: FC = () => {
    const loading = requestModel.getInfo.useLoading();

    return null;
};
```

### 多重状态追踪
虽然每个action都能记录状态，但无法满足另一种场景：

某个页面上有一组列表，列表中每条数据上面都有一个`删除`的按钮，您希望点击某个按钮，该按钮就开始请求操作，然后该按钮显示为`删除中...`字样。

由于您执行的是同一个请求action，仅仅是传入的参数（比如id）变化了，所以您在组件中根本不知道哪个按钮正在处理请求。此时多重状态的意义就体现出来：
```typescript
interface Data {
    [key: string]: object;
}

class RequestModel extends Model<Data> {
    deleteItem = $api.action((id) => {
        return this
            .delete(`/${pkgName}`)
            // ---开始
            .metas(id)
            // ---结束
            .onSuccess((state, action) => {
                delete state[id];
            });
    });
}

const requestModel = new RequestModel();
```
通过链式执行`metas(value)`的形式，您顺利地让action记录不同value下的状态。我们看看在组件中如何使用：
```typescript
import React, { FC } from 'react';

const App: FC = () => {
    const loading1 = requestModel.deleteItem.useLoadings(1);
    const loading2 = requestModel.deleteItem.useLoadings().pick(2);
    const loading3 = requestModel.deleteItem.useLoadings(3);

    return <>
        <div onClick=(() => requestModel.deleteItem(1))>{loading1 ? '删除中...' : '删除'}</div>
        <div onClick=(() => requestModel.deleteItem(2))>{loading2 ? '删除中...' : '删除'}</div>
        <div onClick=(() => requestModel.deleteItem(3))>{loading3 ? '删除中...' : '删除'}</div>
    </>;
};
```
您在`metas(value)`填入什么数据，那么获取状态时，也填入相同的数据（包括数据类型，TS会强制您这么做），就能拿到对应的loading了。

!> **useLoadings().pick(value)** 适合在数组循环时使用。因为React hooks不能在条件中使用，而且最外层value不能确定，您必须提前把全部状态都取出来。<br><br>
注意：Vue暂时没有`pick`的用法，因为vue的hooks可以在条件中使用

### 创建Service
现在我们讲讲`$api`是怎么回事。网络请求返回接口数据的同时，往往可能出现很多异常情况，比如断网、服务器宕、请求参数错误、请求超时等问题。而每一个请求都要面临上述的问题，所以我们需要创建一个服务去统一处理。

```typescript
import { HttpService } from '@redux-model/react';

interface ErrorData {
    code: number;
    message: string;
}

export const $api = new HttpService<ErrorData>({
    baseUrl: 'http://example.com',
    headers: () => {
        return {};
    },
    onRespondError: (response, transform) => {
        if (response.message) {
            transform.businessCode = response.code;
            transform.message = response.message;
        }
    },
    onShowSuccess: (msg) => {
        alert(msg);
    },
    onShowError: (msg) => {
        alert(msg);
    },
});
```

### 克隆Service
您可以继续通过`new HttpService()`实例化更多的service，但有时候多个service之间可能有很多相似之处，也许只有`baseUrl`是不一样的。如果有需要，您可以使用克隆的形式，并传入配置覆盖与原来service不同之处即可
```typescript

export const $otherApi = $api.clone({
    baseUrl: 'http://other.com',
    // ...
});
```
