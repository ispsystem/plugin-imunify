# my-component



<!-- Auto Generated Below -->


## Properties

| Property            | Attribute | Description                      | Type                                                                          | Default     |
| ------------------- | --------- | -------------------------------- | ----------------------------------------------------------------------------- | ----------- |
| `iconsOnly$`        | --        | Observable of icons only menu    | `Observable<boolean>`                                                         | `undefined` |
| `routerChangeEvent` | --        | Observable of application router | `Observable<any>`                                                             | `undefined` |
| `translateService`  | --        | Observable of translate service  | `{ currentLang: string; onLangChange: Observable<{ lang: "ru" \| "en"; }>; }` | `undefined` |
| `url`               | `url`     | Antivirus card plugin url        | `string`                                                                      | `undefined` |


## Dependencies

### Depends on

- [antivirus-menu-vmenu-item](../vmenu-item)

### Graph
```mermaid
graph TD;
  antivirus-menu --> antivirus-menu-vmenu-item
  style antivirus-menu fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
