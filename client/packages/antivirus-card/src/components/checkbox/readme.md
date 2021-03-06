# antivirus-card-checkbox



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description                         | Type      | Default     |
| ---------- | ---------- | ----------------------------------- | --------- | ----------- |
| `block`    | `block`    | Flag fore display type block        | `boolean` | `undefined` |
| `bold`     | `bold`     | Bold highlight active checkbox text | `boolean` | `undefined` |
| `checked`  | `checked`  | Value for checkbox                  | `boolean` | `undefined` |
| `readonly` | `readonly` | Make read only available            | `boolean` | `undefined` |
| `unwrap`   | `unwrap`   | Text wrapping around the checkbox   | `boolean` | `undefined` |


## Events

| Event     | Description                    | Type                   |
| --------- | ------------------------------ | ---------------------- |
| `changed` | Event by change checkbox value | `CustomEvent<boolean>` |


## Dependencies

### Used by

 - [antivirus-card-infected-files](../infected-files)
 - [antivirus-card-new-scan](../new-scan)
 - [antivirus-card-scan-settings](../scan-settings)

### Graph
```mermaid
graph TD;
  antivirus-card-infected-files --> antivirus-card-checkbox
  antivirus-card-new-scan --> antivirus-card-checkbox
  antivirus-card-scan-settings --> antivirus-card-checkbox
  style antivirus-card-checkbox fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
