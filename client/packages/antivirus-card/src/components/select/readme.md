# antivirus-card-select



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute     | Description                           | Type                  | Default     |
| --------------- | ------------- | ------------------------------------- | --------------------- | ----------- |
| `borderless`    | `borderless`  | Flag for disable border around select | `boolean`             | `undefined` |
| `disabled`      | `disabled`    | Disabled key for select field         | `boolean`             | `undefined` |
| `marginTop`     | `margin-top`  | Margin top value for select panel     | `number`              | `undefined` |
| `placeholder`   | `placeholder` | Placeholder for select field          | `string`              | `undefined` |
| `selectedValue` | --            | Selected value                        | `SelectedOption<any>` | `undefined` |
| `width`         | `width`       | Width for select block                | `number`              | `280`       |


## Events

| Event     | Description                      | Type               |
| --------- | -------------------------------- | ------------------ |
| `changed` | Handle for change selected value | `CustomEvent<any>` |


## Dependencies

### Used by

 - [antivirus-card-scan-settings](../scan-settings)
 - [antivirus-card-table-pagination](../table-pagination)

### Graph
```mermaid
graph TD;
  antivirus-card-scan-settings --> antivirus-card-select
  antivirus-card-table-pagination --> antivirus-card-select
  style antivirus-card-select fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
