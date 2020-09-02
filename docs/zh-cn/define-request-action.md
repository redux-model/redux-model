### 第一个Action

写业务肯定是要请求数据的，因此框架提供了[Http Service](/zh-cn/service.md)，让您以最快的速度完成功能开发：

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

    protected initialState(): Data {
        return {
            id: '-',
            homepage: '-',
        };
    }
}

export const requestAction = new RequestModel();
```
我们事先初实例化了service并命名为[$api](/zh-cn/service.md)，并快速地定义了模型的action。匿名函数内部是一个链式的操作，配置了请求的行为方式。

`this.get<T>(url)`是为了告诉service请求的方式和请求地址，其中**泛型T**为请求成功后的数据类型约束。请求方式也是各式各样的：**get**、**post**、**put**、**patch**、**delete**、**connect**。

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

### 节流
有那么一部分数据，它会在组件挂载的时候被请求。这是符合常理的。但是如果这个组件被频繁地卸载和挂载时，同一个数据也会被频繁地请求。通过您的分析，请求的数据基本不会变，那么多次请求就会变得毫无意义，因此您希望一段时间内只真正地请求一次。别担心，框架为您准备了节流的功能：
```typescript
import { Model } from '@redux-model/react';
import { $api } from './ApiService';

class RequestModel extends Model<Data> {
    getInfo = $api.action((pkgName: string) => {
        return this
            .get<Response>(`/${pkgName}`)
            // ----- 开始
            .throttle({
              duration: 300 * 1000,
            })
            // ----- 结束
            .onSuccess((state, action) => {
                state.id = action.response._id;
                state.homepage = action.response.homepage;
            });
    });
}

export const requestAction = new RequestModel();
```
通过`.throttle()`方法，您在**5分钟内**成功地拦截了接下来的请求，action已经缓存了第一次的响应数据，并直接触发`onSuccess`。

这里缓存的原理，是使用请求发送的链接、查询字符串、数据、报头 等信息生成的唯一的字符串作为key依据。一旦您有任何参数变化，缓存便不再命中。您也可以通过`transfer`属性改变缓存的key依据：
```typescript
this
  .get('/')
  .throttle({
    duration: 300 * 1000,
    // ----- 开始
    transfer: (options) => {
      delete options.body;
      return options;
    },
    // ----- 结束
  });
```
虽然您删除了`options.body`，但这并不会影响到请求中的body，因为这份数据是深度克隆的，您可以随意修改。

如果您想统一地处理缓存key，框架允许您在实例化http服务时传入属性`throttleTransfer`。下面例子中，我们为了阻止浏览器缓存或者服务端缓存，特意在查询字符串中加入了随机的字符串，这符合常理。但如果您不处理这个随机字符串，节流就等同于失效了。
```typescript
const $api = new HttpService({
  ...
  beforeSend: (action) => {
    action.query.__timestamp = Date.now();
  },
  // ----- 开始
  throttleTransfer: (options) => {
    delete options.query.__timestamp;
  },
  // ----- 结束
});
```

### 清除节流
正常情况下，节流已经很智能，即使您在报头中变更了token，也是相当于重新建立了节流缓存。

但如果您想手动清除节流缓存，可以执行方法：`model.action.clearThrottle()`
