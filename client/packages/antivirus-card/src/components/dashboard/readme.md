# antivirus-card-dashboard



<!-- Auto Generated Below -->


## Events

| Event              | Description               | Type               |
| ------------------ | ------------------------- | ------------------ |
| `openBuyModal`     | open ImunifyAV+ buy modal | `CustomEvent<any>` |
| `openNewScanModal` |                           | `CustomEvent<any>` |


## Dependencies

### Used by

 - [antivirus-card](..)

### Depends on

- [antivirus-card-preview](../preview)

### Graph
```mermaid
graph TD;
  antivirus-card-dashboard --> antivirus-card-preview
  antivirus-card-preview --> antivirus-card-dropdown
  antivirus-card-preview --> antivirus-card-spinner-round
  antivirus-card --> antivirus-card-dashboard
  style antivirus-card-dashboard fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
