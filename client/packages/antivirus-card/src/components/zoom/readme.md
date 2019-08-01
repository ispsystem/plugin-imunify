# antivirus-card-zoom



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute       | Description                                 | Type       | Default |
| ------------- | --------------- | ------------------------------------------- | ---------- | ------- |
| `notDelCount` | `not-del-count` | The number of fields that cannot be deleted | `number`   | `0`     |
| `values`      | --              | Values for initial fields                   | `string[]` | `['']`  |


## Events

| Event     | Description         | Type                    |
| --------- | ------------------- | ----------------------- |
| `changed` | Change values event | `CustomEvent<string[]>` |


## Dependencies

### Depends on

- [antivirus-card-input](../input)

### Graph
```mermaid
graph TD;
  antivirus-card-zoom --> antivirus-card-input
  style antivirus-card-zoom fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
