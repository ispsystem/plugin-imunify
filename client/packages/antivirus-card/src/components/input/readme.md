# antivirus-card-input



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute     | Description                  | Type                                       | Default     |
| ------------- | ------------- | ---------------------------- | ------------------------------------------ | ----------- |
| `disabled`    | `disabled`    | Flag for disable input field | `boolean`                                  | `undefined` |
| `placeholder` | `placeholder` | Value for input placeholder  | `string`                                   | `undefined` |
| `textPrefix`  | `text-prefix` | Text prefix                  | `string`                                   | `undefined` |
| `validator`   | --            | List of custom validators    | `Validator<string> \| Validator<string>[]` | `undefined` |
| `value`       | `value`       | Value for input field        | `string`                                   | `undefined` |
| `width`       | `width`       | Style width for input field  | `string`                                   | `'280px'`   |


## Events

| Event     | Description                   | Type                  |
| --------- | ----------------------------- | --------------------- |
| `changed` | Event for input value changed | `CustomEvent<string>` |


## Dependencies

### Used by

 - [antivirus-card-new-scan](../new-scan)

### Graph
```mermaid
graph TD;
  antivirus-card-new-scan --> antivirus-card-input
  style antivirus-card-input fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
