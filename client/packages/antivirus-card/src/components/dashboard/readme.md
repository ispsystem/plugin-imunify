# antivirus-card-dashboard



<!-- Auto Generated Below -->


## Events

| Event          | Description               | Type               |
| -------------- | ------------------------- | ------------------ |
| `openBuyModal` | open ImunifyAV+ buy modal | `CustomEvent<any>` |


## Dependencies

### Used by

 - [antivirus-card](..)

### Depends on

- [antivirus-card-preview](../preview)
- [antivirus-card-modal](../modal)
- [antivirus-card-new-scan](../new-scan)

### Graph
```mermaid
graph TD;
  antivirus-card-dashboard --> antivirus-card-preview
  antivirus-card-dashboard --> antivirus-card-modal
  antivirus-card-dashboard --> antivirus-card-new-scan
  antivirus-card-preview --> antivirus-card-dropdown
  antivirus-card-preview --> antivirus-card-spinner-round
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
  antivirus-card --> antivirus-card-dashboard
  style antivirus-card-dashboard fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
