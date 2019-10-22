# 创建Service
网络请求返回接口数据的同时，往往可能出现很多异常情况，比如断网、服务器宕、请求参数错误、请求超时等问题。而每一个请求都要面临上述的问题，所以我们需要创建一个服务去统一处理。

```typescript
import { HttpService, HttpError, HttpTransform } from '@redux-model/web';

class ApiService extends HttpService {
    protected baseUrl(): string {
        return 'http://example.com';
    }
    
    protected headers(): object {
        return {};
    }
    
    // 接口请求失败时，收集错误信息到reducer
    protected onRespondError(error: HttpError<{ error: string }>, transform: HttpTransform): void {
        transform.message = error.response.data.error;
    }

    // 渲染错误信息
    protected onShowError(msg: string): void {
        alert(msg);
    }
    
    // 渲染成功信息
    protected onShowSuccess(msg: string): void {
        alert(msg);
    }
}

export const $api = new ApiService();
```
