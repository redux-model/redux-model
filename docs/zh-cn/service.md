网络请求返回接口数据的同时，往往可能出现很多异常情况，比如断网、服务器宕、请求参数错误、请求超时等问题。而每一个请求都要面临上述的问题，所以我们需要创建一个服务去统一处理。

### 创建

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
  onRespondError: (httpResponse, meta) => {
    if (httpResponse.message) {
      meta.businessCode = httpResponse.code;
      meta.message = httpResponse.message;
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

### 克隆
您可以继续通过`new HttpService()`实例化更多的service，但有时候多个service之间可能有很多相似之处，也许只有`baseUrl`是不一样的。如果有需要，您可以使用克隆的形式，并传入配置覆盖与原来service不同之处即可
```typescript

export const $otherApi = $api.clone({
  baseUrl: 'http://other.com',
  // ...
});
```

### 独立请求
Service不仅为模型提供了action，还提供了单独请求的能力。如果您想在组件中请求数据而不依赖action，也是完全可行的（但不建议）。
```typescript
interface Profile {
  id: number;
  name: string;
}

const profileResult = await $api.getAsync<Profile>({
  uri: '/api/profile',
  query: {
    id: 10,
  },
});
```
!> 独立请求的主要场景是在[组合Action](/zh-cn/define-compose-action.md)中配合`changeState()`使用。

### 简化结构
如果您的请求数据总是会有一个通用的前缀比如：`{ data: { ... } }`，那么您肯定是想要把这个通用的`data`字符串给剔除了。
```typescript
const $api = new HttpService({
  onRespondSuccess(httpResponse) {
    if (httpResponse.data && httpResponse.data.data) {
      httpResponse.data = httpResponse.data.data;
    }
  }
});
```

### 非标准接口
对于标准的接口，我们总是传递`http status`状态码代表请求的状态，框架也能快速地识别请求是否成功。但是有一部分用户的请求状态码总是返回`200`，真正的状态码反而隐藏在数据中
```typescript
// http status: 200
{
  code: 400
  msg: '缺少参数',
  data: null,
}
```
对于这种接口，框架无法正常判断，需要用户自行处理
```typescript
const $api = new HttpService({
  // 判断成功还是失败
  isSuccess(httpResponse) {
    const status = httpResponse.data && httpResponse.data.code;

    return status >= 200 && status < 300;
  },
  // 收集错误信息阶段
  onRespondError(httpResponse, meta) {
    // 收集状态码。如果您需要在业务中使用到状态码，就请在此收集，否则可以删除这段。
    if (httpResponse.data && httpResponse.data.code) {
      meta.httpStatus = httpResponse.data.code;
    }
  }
});
```

!> 收集到的信息可以在[状态追踪](/zh-cn/meta.md)meta里获取
