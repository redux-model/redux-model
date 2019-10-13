# Request Action Api

### meta
记录Action中的请求信息，包括当前type，loading状态，http状态、错误信息、业务代号等。定义Action时，设置了metaKey = true 则为开启meta，未设置metaKey时也默认是开启的

```typescript
const meta = xxxModel.xxAction.meta;
```

### useMeta
在hooks中使用meta，以保证meta信息变化时能重新渲染组件
```typescript
const meta = xxxModel.xxAction.useMeta()
```

### metas
meta的合集，根据payload的不同参数分别记录请求信息。定义Action时，设置了metaKey为payload对象的key时，视为开启metas

```typescript
const meta = xxxModel.xxAction.metas.pick(id);
```

### useMetas
在hooks中使用meta，以保证metas信息变化时能重新渲染组件
```typescript
const meta = xxxModel.xxAction.useMetas(id);
const meta = xxxModel.xxAction.useMetas().pick(id);
```

### loading
存储于meta中的一个属性，记录Action是否正在请求。因为经常用到，所以增加了快捷操作。

```typescript
const loading = xxxModel.xxAction.loading;
```

### useLoading
在hooks中使用loading，以保证loading信息变化时能重新渲染组件


```typescript
const loading = xxxModel.xxAction.useLoading();
```

### loadings
存储于metas中的一个属性，记录Action是否正在请求。因为经常用到，所以增加了快捷操作。

```typescript
const loading = xxxModel.xxAction.loadings.pick(id);
```

### useLoadings
在hooks中使用loading，以保证loading信息变化时能重新渲染组件


```typescript
const loading = xxxModel.xxAction.useLoadings(id);
const loading = xxxModel.xxAction.useLoadings().pick(id);
```

### onPrepare | onSuccess | onFail
模型中监听其他模型被执行时的回调，与`effects`搭配使用
```typescript
protected effects(): Effects<Data> {
    return [
        xxxModel.someAction.onPrepare((state, action) => {}),
        xxxModel.someAction.onSuccess((state, action) => {}),
        xxxModel.someAction.onFail((state, action) => {}),
    ];
}
```

### getPrepareType
获取Action准备请求时的type字符串


### getSuccessType
获取Action请求成功时的type字符串


### getFailType
获取Action请求失败时的type字符串
