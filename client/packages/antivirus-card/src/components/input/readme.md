# antivirus-card-input



<!-- Auto Generated Below -->


## Properties

<<<<<<< HEAD
| Property      | Attribute     | Description                  | Type                                       | Default     |
| ------------- | ------------- | ---------------------------- | ------------------------------------------ | ----------- |
| `disabled`    | `disabled`    | Flag for disable input field | `boolean`                                  | `undefined` |
| `placeholder` | `placeholder` | Value for input placeholder  | `string`                                   | `undefined` |
| `textPrefix`  | `text-prefix` | Text prefix                  | `string`                                   | `undefined` |
| `type`        | `type`        | Input type in HTML format    | `"number" \| "text"`                       | `'text'`    |
| `validator`   | --            | List of custom validators    | `Validator<string> \| Validator<string>[]` | `undefined` |
| `value`       | `value`       | Value for input field        | `string`                                   | `undefined` |
| `width`       | `width`       | Style width for input field  | `string`                                   | `'280px'`   |
=======
| Property      | Attribute      | Description                  | Type                                       | Default     |
| ------------- | -------------- | ---------------------------- | ------------------------------------------ | ----------- |
| `disabled`    | `disabled`     | Flag for disable input field | `boolean`                                  | `undefined` |
| `inlineBlock` | `inline-block` | Flag for display inline      | `boolean`                                  | `undefined` |
| `placeholder` | `placeholder`  | Value for input placeholder  | `string`                                   | `undefined` |
| `textPrefix`  | `text-prefix`  | Text prefix                  | `string`                                   | `undefined` |
| `validator`   | --             | List of custom validators    | `Validator<string> \| Validator<string>[]` | `undefined` |
| `value`       | `value`        | Value for input field        | `string`                                   | `undefined` |
| `width`       | `width`        | Style width for input field  | `string`                                   | `'280px'`   |
>>>>>>> master


## Events

| Event     | Description                   | Type                  |
| --------- | ----------------------------- | --------------------- |
| `changed` | Event for input value changed | `CustomEvent<string>` |


## Dependencies

### Used by

 - [antivirus-card-new-scan](../new-scan)
<<<<<<< HEAD
 - [antivirus-card-scan-settings](../scan-settings)
=======
 - [antivirus-card-zoom](../zoom)
>>>>>>> master

### Graph
```mermaid
graph TD;
  antivirus-card-new-scan --> antivirus-card-input
<<<<<<< HEAD
  antivirus-card-scan-settings --> antivirus-card-input
=======
  antivirus-card-zoom --> antivirus-card-input
>>>>>>> master
  style antivirus-card-input fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
