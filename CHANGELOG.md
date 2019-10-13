# 5.11.0 (2019.10.13)

### Breaking Changes
Rename property from `meta` to `metaKey` when creating request action

```typescript
class Test extends Model {
    fetch = this.actionRequest({
        action: ...,
        metaKey: true,
    });
}
```
