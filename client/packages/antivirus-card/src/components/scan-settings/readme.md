# antivirus-card-scan-settings



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute | Description | Type         | Default    |
| ------------ | --------- | ----------- | ------------ | ---------- |
| `closeModal` | --        |             | `() => void` | `() => {}` |


## Methods

### `setPreset(preset: ScanOption) => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [antivirus-card-dashboard](../dashboard)

### Depends on

- [antivirus-card-switcher](../switcher)
- [antivirus-card-switcher-option](../switcher-option)
- [antivirus-card-hint](../hint)
- [antivirus-card-input](../input)
- [antivirus-card-checkbox](../checkbox)
- [antivirus-card-collapse](../collapse)
- [antivirus-card-select](../select)
- [antivirus-card-select-option](../select-option)
- [antivirus-card-preloader](../preloader)
- [antivirus-card-button](../button)
- [antivirus-card-checkbox](../checkbox)
- [antivirus-card-input](../input)

### Graph
```mermaid
graph TD;
  antivirus-card-scan-settings --> antivirus-card-switcher
  antivirus-card-scan-settings --> antivirus-card-switcher-option
  antivirus-card-scan-settings --> antivirus-card-hint
  antivirus-card-scan-settings --> antivirus-card-input
  antivirus-card-scan-settings --> antivirus-card-checkbox
  antivirus-card-scan-settings --> antivirus-card-collapse
  antivirus-card-scan-settings --> antivirus-card-select
  antivirus-card-scan-settings --> antivirus-card-select-option
  antivirus-card-scan-settings --> antivirus-card-preloader
  antivirus-card-scan-settings --> antivirus-card-button
  antivirus-card-scan-settings --> antivirus-card-checkbox
  antivirus-card-scan-settings --> antivirus-card-input
  antivirus-card-hint --> antivirus-card-dropdown
  antivirus-card-preloader --> antivirus-card-spinner-round
  antivirus-card-dashboard --> antivirus-card-scan-settings
  style antivirus-card-scan-settings fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
