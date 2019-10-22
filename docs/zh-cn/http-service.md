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
