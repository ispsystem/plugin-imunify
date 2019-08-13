# antivirus-card-modal



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute         | Description                | Type      | Default     |
| --------------- | ----------------- | -------------------------- | --------- | ----------- |
| `maxModalWidth` | `max-modal-width` | Modal max width            | `string`  | `undefined` |
| `modalWidth`    | `modal-width`     | Modal width                | `string`  | `undefined` |
| `visible`       | `visible`         | Flag for visible component | `boolean` | `undefined` |


## Methods

### `toggle(value?: boolean) => Promise<void>`

Method for change modal visible

#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [antivirus-card](..)
 - [antivirus-card-dashboard](../dashboard)
 - [antivirus-card-infected-files](../infected-files)

### Graph
```mermaid
graph TD;
  antivirus-card --> antivirus-card-modal
  antivirus-card-dashboard --> antivirus-card-modal
  antivirus-card-infected-files --> antivirus-card-modal
  style antivirus-card-modal fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
