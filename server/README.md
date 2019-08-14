# server/imunify-plugin

- ### GET: `/site/{site_id}/files/{type}` - Список зараженных файлов
  Позволяет получить список зараженных файлов на определенном сайте

  | Params | Type | Description |
  | ------------- |:------------- | :----- |
  | **site_id** | integer | Идентификатор сайта |
  | **type** | string, enum | Тип запрашиваемых файлов (infected, cured, excepted) |
  
- ### GET: `/site/{site_id}/presets` - Список активных пресетов сайта
  Возвращает минимум один пресет типа FULL. Если пресетов нет - возвращает дефолтный.
  
  | Params | Type | Description |
  | ------------- |:-------------| :-----|
  | **site_id** | integer | Идентификатор сайта |

- ### GET: `/site/{site_id}/presets/default` - Дефолтный пресет
  Позволяет получить дефолтный пресет с заранее установленным docroot'ом

  | Params | Type | Description |
  | ------------- |:-------------| :-----|
  | **site_id** | integer | Идентификатор сайта |

- ### GET: `/site/{site_id}/scan/history` - История сканирования
  Позволяет получить список всех проверок определенного сайта

  | Params | Type | Description |
  | ------------- |:-------------| :-----|
  | **site_id** | integer | Идентификатор сайта |

- ### GET: `/scan/result?task_id={task_id}&started={started}` - Результаты сканирования
  Позволяет получить результат сканирования по идентификатору задачи и временной метке.
  Пример запроса: `/scan/result?task_id=17648264&started=1529835469`

  | Params | Type | Description |
  | ------------- |:-------------| :-----|
  | **task_id** | integer | Идентификатор задачи на сканирование |
  | **started** | integer | Временная метка начала сканирования |

- ### POST: `/site/{site_id}/preset` - Создание нового пресета сканирвания
  Позволяет создать новый пресет для последующего сканирования

  | Params | Type | Description |
  | ------------- |:-------------| :-----|
  | **site_id** | integer | Идентификатор сайта |

  POST-параметры:

  | Params | Type | Description |
  | ------------- |:-------------| :-----|
  | **scan_type** | string, enum | Тип пресета: FULL или PARTIAL |
  | **preset** | object | Пресет |

  Пример запроса:

```json
{
    "scan_type": "FULL",
    "preset": {
        "path": ["/wp-content"],
        "checkMask": ["*"],
        "excludeMask": ["*.html"],
        "intensity": "low",
        "scheduleTime": {
            "single": {
                "date": 1
            }
        },
        "checkFileTypes": "critical",
        "saveCopyFilesDay": 31,
        "cureFoundFiles": true,
        "removeInfectedFileContent": true,
        "checkDomainReputation": false,
        "parallelChecks": 1,
        "ramForCheck": 1024,
        "fullLogDetails": true,
        "maxScanTime": 1,
        "autoUpdate": true
    }
}
```
Пример ответа:
```json
{
    "preset_id": 1
}
```

- ### POST: `/site/{site_id}/status` - Активация/деактивация пресета

  | Params | Type | Description |
  | ------------- |:-------------| :-----|
  | **site_id** | integer | Идентификатор сайта |


  Пример запроса:

```json
{
	"is_active": true
}
```

- ### POST: `/site/{site_id}/files` - Операции с файлами
  Позволяет выполнять операции с файлами

  | Params | Type | Description |
  | ------------- |:-------------| :-----|
  | **site_id** | integer | Идентификатор сайта |

  POST-параметры:
 
  | Params | Type | Description |
  | ------------- |:-------------| :-----|
  | **files** | int array | Массив идентификаторов файлов для удаления |
  | **action** | string, enum | Тип операции (cure, restore) |

  Пример запроса:

```json
{
	"files": [7],
	"action": "cure"
}
```

- ### POST: `/site/{site_id}/scan` - Запрос на сканирование
  Позволяет производить сканирование на определенном сайте

  | Params | Type | Description |
  | ------------- |:-------------| :-----|
  | **site_id** | integer | Идентификатор сайта |

  POST-параметры:
  
  | Params | Type | Description |
  | ------------- |:-------------| :-----|
  | **scan_path** | string | Директория для сканирования |

  Пример запроса:

```json
{
	"scan_path": "/home"
}
```

- ### DELETE: `/site/{site_id}/files` - Запрос на удаление файлов
  Позволяет удалить зараженные файлы

  | Params | Type | Description |
  | ------------- |:-------------| :-----|
  | **site_id** | integer | Идентификатор сайта |

  Параметры:
 
  | Params | Type | Description |
  | ------------- |:-------------| :-----|
  | **files** | int array | Массив идентификаторов файлов для удаления |

  Пример запроса:

```json
{
	"files": [7, 3, 5]
}
```
