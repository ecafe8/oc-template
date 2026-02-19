---
applyTo: 'apps/server-*/**/lib/db'
description: Instructions for updating the usage of pgTable in the database layer.
---


# pgTable API Update

## The third parameter of pgTable is changing and will only accept an array instead of an object

@example
```ts
// Deprecated version:
export const users = pgTable("users", {
    id: integer(),
}, (t) => ({
    idx: index('custom_name').on(t.id)
}));
```

```ts
// New API:
export const users = pgTable("users", {
    id: integer(),
}, (t) => [
    index('custom_name').on(t.id)
]);
```
