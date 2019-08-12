# antivirus-card-table-pagination



<!-- Auto Generated Below -->


## Properties

| Property            | Attribute       | Description | Type                                    | Default     |
| ------------------- | --------------- | ----------- | --------------------------------------- | ----------- |
| `changeCountOnPage` | --              |             | `(event: number) => void`               | `undefined` |
| `clickPagination`   | --              |             | `(event: "next" \| "previous") => void` | `undefined` |
| `countOnPage`       | `count-on-page` |             | `number`                                | `undefined` |
| `currentPage`       | `current-page`  |             | `number`                                | `undefined` |
| `disable`           | `disable`       |             | `boolean`                               | `undefined` |
| `disabled`          | `disabled`      |             | `boolean`                               | `undefined` |
| `pageCount`         | `page-count`    |             | `number`                                | `undefined` |


## Dependencies

### Used by

 - [antivirus-card-history](../history)
 - [antivirus-card-infected-files](../infected-files)

### Depends on

- [antivirus-card-select](../select)
- [antivirus-card-select-option](../select-option)

### Graph
```mermaid
graph TD;
  antivirus-card-table-pagination --> antivirus-card-select
  antivirus-card-table-pagination --> antivirus-card-select-option
  antivirus-card-history --> antivirus-card-table-pagination
  antivirus-card-infected-files --> antivirus-card-table-pagination
  style antivirus-card-table-pagination fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
