# antivirus-card



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute | Description | Type                                                                          | Default     |
| ------------------ | --------- | ----------- | ----------------------------------------------------------------------------- | ----------- |
| `notifier`         | --        |             | `INotifier`                                                                   | `undefined` |
| `translateService` | --        |             | `{ currentLang: string; onLangChange: Observable<{ lang: "ru" \| "en"; }>; }` | `undefined` |


## Dependencies

### Depends on

- [antivirus-card-preview](preview)
- [antivirus-card-infected-files](infected-files)
- [antivirus-card-history](history)
- [antivirus-card-navigation](navigation)
- [antivirus-card-modal](modal)
- [antivirus-card-switcher](switcher)
- [antivirus-card-switcher-option](switcher-option)
- [antivirus-card-button](button)

### Graph
```mermaid
graph TD;
  antivirus-card --> antivirus-card-preview
  antivirus-card --> antivirus-card-infected-files
  antivirus-card --> antivirus-card-history
  antivirus-card --> antivirus-card-navigation
  antivirus-card --> antivirus-card-modal
  antivirus-card --> antivirus-card-switcher
  antivirus-card --> antivirus-card-switcher-option
  antivirus-card --> antivirus-card-button
  antivirus-card-preview --> antivirus-card-spinner-round
  antivirus-card-infected-files --> antivirus-card-table
  antivirus-card-infected-files --> antivirus-card-table-row
  antivirus-card-infected-files --> antivirus-card-table-cell
  antivirus-card-infected-files --> antivirus-card-button
  antivirus-card-history --> antivirus-card-table
  antivirus-card-history --> antivirus-card-table-row
  antivirus-card-history --> antivirus-card-table-cell
  style antivirus-card fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
