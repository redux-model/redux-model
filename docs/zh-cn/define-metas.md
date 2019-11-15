# 定义Metas
Metas是Meta的集合。假设一个Request Action需要同时执行多次，并且业务上需要根据传入Action的参数获取不同的meta信息。如果我们仍然用Meta存储，因为请求是异步的，meta的数据也会覆盖，最终导致数据出错。

此时，我们可以在`metas`中传入值解决这个问题。

```typescript
import { Model } from '@redux-model/web';
import { $api } from './ApiService';

interface Response {
    id: number;
    name: string;
}

type Data = Partial<{
    [key: string]: Response;
}>;

class ThirdModel extends Model<Data> {
    getProfile = $api.action((userId: number) => {
        return this
            .get('...')
            .metas(userId);
    });

    protected initReducer(): Data {
        return {};
    }
}

export const thirdModel = new ThirdModel();
```

当 `metas(...)` 传入非布尔值时，metas就会被启用。

```typescript
const userId = 3;

thirdModel.getProfile(userId);

const meta = thirdModel.getProfile.metas.pick(userId);
```

### 使用Loadings
同样地，Metas也配置了快捷获取loading的方法
```typescript
const loadings = thirdModel.getProfile.loadings;

const userId = 3;
const loading = thirdModel.getProfile.loadings.pick(userId);
```

### 在Hooks中使用
在React的hooks组件中，我们需要使用`use`前缀去获取metas
```typescript
const userId = 3;

const myMetas = thirdModel.getProfile.useMetas();

const myMeta = myMetas.pick(userId);
const myMeta = thirdModel.getProfile.useMetas(userId);

// 性能 A+
const myCode = thirdModel.getProfile.useMetas(userId, 'businessCode');
// 性能 B+
const myCode = thirdModel.getProfile.useMetas(userId).businessCode;
// 性能 C+
const myCode = thirdModel.getProfile.useMetas().pick(userId).businessCode;



const loadings = thirdModel.getProfile.useLoadings();

const loading = loadings.pick(userId);
const loading = thirdModel.getProfile.useLoadings(userId);
```
