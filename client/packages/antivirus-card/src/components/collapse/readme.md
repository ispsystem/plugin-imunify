# antivirus-card-collapse



<!-- Auto Generated Below -->


## Properties

| Property            | Attribute | Description            | Type                               | Default     |
| ------------------- | --------- | ---------------------- | ---------------------------------- | ----------- |
| `isOpen`            | `is-open` | Flag for open collapse | `boolean`                          | `false`     |
| `text` _(required)_ | --        | Text for input title   | `{ open: string; close: string; }` | `undefined` |


## Methods

### `toggle(value?: boolean) => Promise<void>`

Method for toggle collapse state

#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [antivirus-card-scan-settings](../scan-settings)

### Graph
```mermaid
graph TD;
  antivirus-card-scan-settings --> antivirus-card-collapse
  style antivirus-card-collapse fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
