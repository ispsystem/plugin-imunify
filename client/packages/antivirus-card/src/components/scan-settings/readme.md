# antivirus-card-scan-settings



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute | Description                  | Type         | Default    |
| ------------ | --------- | ---------------------------- | ------------ | ---------- |
| `closeModal` | --        | Method for click close modal | `() => void` | `() => {}` |


## Methods

### `setPreset(preset: ScanOption) => Promise<void>`

Method for set preset in modal

#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [antivirus-card-dashboard](../dashboard)

### Depends on

- [antivirus-card-checkbox](../checkbox)
- [antivirus-card-collapse](../collapse)
- [antivirus-card-select](../select)
- [antivirus-card-select-option](../select-option)
- [antivirus-card-hint](../hint)
- [antivirus-card-preloader](../preloader)
- [antivirus-card-button](../button)

### Graph
```mermaid
graph TD;
  antivirus-card-scan-settings --> antivirus-card-checkbox
  antivirus-card-scan-settings --> antivirus-card-collapse
  antivirus-card-scan-settings --> antivirus-card-select
  antivirus-card-scan-settings --> antivirus-card-select-option
  antivirus-card-scan-settings --> antivirus-card-hint
  antivirus-card-scan-settings --> antivirus-card-preloader
  antivirus-card-scan-settings --> antivirus-card-button
  antivirus-card-hint --> antivirus-card-dropdown
  antivirus-card-preloader --> antivirus-card-spinner-round
  antivirus-card-dashboard --> antivirus-card-scan-settings
  style antivirus-card-scan-settings fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
