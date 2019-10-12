# 独立请求
有时候Request Action并不能满足你的需求，你需要同时请求多个接口，并最终合并这些接口返回的数据，最后存储到reducer中。

利用service的特性，你可以轻松地处理这些需求

```typescript
import { Model } from '@redux-model/web';
import { $api } from './ApiService';

interface Profile {
    id: number;
    name: string;
}

interface Email {
  email: string;
}

type Data = Profile & Email;

class FiveModel extends Model<Data> {
    async makeSense() {
        const profileResult = await $api.getAsync<Profile>({
            uri: '/api/service',
        });

        const emailResult = await $api.getAsync<Email>({
            uri: '/api/email',
        });

        // 数据汇总，变更reducer
        this.changeReducer((state) => {
            return {
                ...profileResult.response,
                ...emailResult.response,
            };
        });
    }

    protected initReducer(): Data {
        return {
            id: 0,
            name: '',
            email: '',
        };
    }
}

export const fiveModel = new FiveModel();
```

得到想要的数据后，通过受保护的内置方法`changeReducer()`，你可以快速地变更reducer。当然，你也可以选择定义Normal Action。
