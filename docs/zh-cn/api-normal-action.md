# Normal Action Api

### onSuccess
模型中监听其他模型被执行时的回调，与`effects`搭配使用
```typescript
protected effects(): Effects<Data> {
    return [
        xxxModel.someAction.onSuccess((state, action) => {
            //
        }),
    ];
}
```

### getSuccessType
获取Action的type字符串
