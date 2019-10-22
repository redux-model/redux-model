# 创建Service
网络请求返回接口数据的同时，往往可能出现很多异常情况，比如断网、服务器宕、请求参数错误、请求超时等问题。而每一个请求都要面临上述的问题，所以我们需要创建一个服务去统一处理。

```typescript
import { HttpService } from '@redux-model/web';

export const $api = new HttpService({
    baseUrl: 'http://example.com',
    headers: () => {
        return {};
    },
    onRespondError: (response, transform) => {
        if (response.data.error) {
            transform.message = response.data.error;
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

# 克隆
你可以继续通过`new HttpService()`实例化更多的service，但有时候多个service之间可能有很多相似之处，也许只有`baseUrl`是不一样的。如果有需要，你可以使用克隆的形式，并传入配置覆盖与原来service不同之处即可
```typescript
export const $otherApi = $api.clone({
    baseUrl: 'http://other.com',
    ...
});
```
