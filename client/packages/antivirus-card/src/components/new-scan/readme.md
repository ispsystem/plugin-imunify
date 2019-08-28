# antivirus-card-new-scan



<!-- Auto Generated Below -->


## Properties

| Property              | Attribute | Description                 | Type                  | Default          |
| --------------------- | --------- | --------------------------- | --------------------- | ---------------- |
| `closeModal`          | --        | Function on modal close     | `() => Promise<void>` | `async () => {}` |
| `preset` _(required)_ | --        | Model settings for new scan | `ScanOption`          | `undefined`      |


## Dependencies

### Used by

 - [antivirus-card-dashboard](../dashboard)

### Depends on

- [antivirus-card-input](../input)
- [antivirus-card-hint](../hint)
- [antivirus-card-switcher](../switcher)
- [antivirus-card-switcher-option](../switcher-option)
- [antivirus-card-preloader](../preloader)
- [antivirus-card-button](../button)
- [antivirus-card-checkbox](../checkbox)
- [antivirus-card-input](../input)

### Graph
```mermaid
graph TD;
  antivirus-card-new-scan --> antivirus-card-input
  antivirus-card-new-scan --> antivirus-card-hint
  antivirus-card-new-scan --> antivirus-card-switcher
  antivirus-card-new-scan --> antivirus-card-switcher-option
  antivirus-card-new-scan --> antivirus-card-preloader
  antivirus-card-new-scan --> antivirus-card-button
  antivirus-card-new-scan --> antivirus-card-checkbox
  antivirus-card-new-scan --> antivirus-card-input
  antivirus-card-hint --> antivirus-card-dropdown
  antivirus-card-preloader --> antivirus-card-spinner-round
  antivirus-card-dashboard --> antivirus-card-new-scan
  style antivirus-card-new-scan fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
