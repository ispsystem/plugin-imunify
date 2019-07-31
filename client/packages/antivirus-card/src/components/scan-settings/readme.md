# antivirus-card-scan-settings



<!-- Auto Generated Below -->


## Properties

| Property              | Attribute | Description                 | Type         | Default     |
| --------------------- | --------- | --------------------------- | ------------ | ----------- |
| `closeModal`          | --        |                             | `() => void` | `() => {}`  |
| `preset` _(required)_ | --        | Model settings for new scan | `ScanOption` | `undefined` |


## Dependencies

### Depends on

- [antivirus-card-switcher](../switcher)
- [antivirus-card-switcher-option](../switcher-option)
- [antivirus-card-preloader](../preloader)
- [antivirus-card-button](../button)

### Graph
```mermaid
graph TD;
  antivirus-card-scan-settings --> antivirus-card-switcher
  antivirus-card-scan-settings --> antivirus-card-switcher-option
  antivirus-card-scan-settings --> antivirus-card-preloader
  antivirus-card-scan-settings --> antivirus-card-button
  antivirus-card-preloader --> antivirus-card-spinner-round
  style antivirus-card-scan-settings fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
