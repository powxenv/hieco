# Schedule Commands

## `schedule <id>`

Get scheduled transaction.

```bash
bunx @hiecom/mirror-cli schedule 0.0.456
```

| Output           | Description                   |
| ---------------- | ----------------------------- |
| Schedule ID      | Schedule identifier           |
| Creator          | Creator account ID            |
| Payer Account    | Payer account ID              |
| Transaction Body | Scheduled transaction body    |
| Executed         | Whether schedule was executed |
| Deleted          | Schedule deletion status      |
| Expired          | Whether schedule has expired  |

## `schedules:list`

List all scheduled transactions.

```bash
bunx @hiecom/mirror-cli schedules:list --limit 100 --order desc
```

| Option          | Description     |
| --------------- | --------------- | ---------- |
| `--limit <num>` | Maximum results |
| `--order <asc   | desc>`          | Sort order |

| Output      | Description         |
| ----------- | ------------------- |
| Schedule ID | Schedule identifier |
| Creator     | Creator account     |
| Executed    | Execution status    |
| Deleted     | Deletion status     |
| Expired     | Expiration status   |

## Schedule States

| State    | Description                        |
| -------- | ---------------------------------- |
| Executed | Schedule was successfully executed |
| Deleted  | Schedule was deleted               |
| Expired  | Schedule expired without execution |
| Pending  | Schedule is pending execution      |
