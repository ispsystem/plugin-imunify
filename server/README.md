# Imunify plugin API

- ### GET: `/site/{sid}/files/{type}` - Список зараженных файлов
  Позволяет получить список зараженных файлов на определенном сайте

  | Params | Type | Description |
  | ------------- |:------------- | :----- |
  | **sid** | integer | Идентификатор сайта |
  | **type** | string, enum | Тип запрашиваемых файлов (infected, cured, excepted) |
  
- ### GET: `/site/{sid}/presets` - Список активных пресетов сайта
  Возвращает минимум один пресет типа FULL. Если пресетов нет - возвращает дефолтный.
  
  | Params | Type | Description |
  | ------------- |:-------------| :-----|
  | **sid** | integer | Идентификатор сайта |

- ### GET: `/site/{sid}/presets/default` - Дефолтный пресет
  Позволяет получить дефолтный пресет с заранее установленным docroot'ом

  | Params | Type | Description |
  | ------------- |:-------------| :-----|
  | **sid** | integer | Идентификатор сайта |

- ### GET: `/site/{sid}/scan/history` - История сканирования
  Позволяет получить список всех проверок определенного сайта

  | Params | Type | Description |
  | ------------- |:-------------| :-----|
  | **sid** | integer | Идентификатор сайта |

- ### GET: `/scan/result?task_id={task_id}&started={started}` - Результаты сканирования
  Позволяет получить результат сканирования по идентификатору задачи и временной метке.
  Пример запроса: `/scan/result?task_id=17648264&started=1529835469`

  | Params | Type | Description |
  | ------------- |:-------------| :-----|
  | **task_id** | integer | Идентификатор задачи на сканирование |
  | **started** | integer | Временная метка начала сканирования |

- ### POST: `/site/{sid}/preset` - Создание нового пресета сканирвания
  Позволяет создать новый пресет для последующего сканирования

  | Params | Type | Description |
  | ------------- |:-------------| :-----|
  | **sid** | integer | Идентификатор сайта |

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
    "preset_id": 1,
}
```

- ### POST: `/site/{sid}/status` - Активация/деактивация пресета

  | Params | Type | Description |
  | ------------- |:-------------| :-----|
  | **sid** | integer | Идентификатор сайта |


  Пример запроса:

```json
{
	"is_active": true
}
```

- ### POST: `/site/{sid}/scan` - Запрос на сканирование
  Позволяет производить сканирование на определенном сайте

  | Params | Type | Description |
  | ------------- |:-------------| :-----|
  | **sid** | integer | Идентификатор сайта |

  POST-параметры:
  
  | Params | Type | Description |
  | ------------- |:-------------| :-----|
  | **scan_path** | string | Директория для сканирования |

  Пример запроса:

```json
{
	"scan_path": "/home"
}