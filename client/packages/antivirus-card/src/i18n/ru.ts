const lang = {
  TITLE: {
    FREE: 'Антивирус ImunifyAV',
    PRO: 'Антивирус ImunifyAV+',
  },
  NOTIFY: {
    SCAN_SUCCESS: 'Проверка сайта закончилась',
    MORE_DETAILS: 'Подробнее',
    DESCRIPTION: {
      NO_VIRUSES: 'Вирусов не обнаружено',
      VIRUSES_CURED: 'Обнаружен %{smart_count} вирус |||| Обнаружено %{smart_count} вируса |||| Обнаружено %{smart_count} вирусов',
    },
  },
  MENU_ITEMS: {
    DASHBOARD: 'Обзор',
    INFECTED_FILES: 'Заражённые файлы',
    HISTORY: 'История сканирований',
  },
  DASHBOARD: {
    TITLE: 'Купить ImunifyAV+ за %{cost} %{currency}/%{period} для лечения файлов',
    TEXT: 'для лечения файлов, проверки репутации, настройки расписания и уведомлений о вирусах на почту.',
  },
  CHECK_TYPE: {
    FULL: 'полная',
  },
  BUY_MODAL: {
    TITLE: 'Подписка ImunifyAV+',
    LABEL_1: 'Сканирование сайта',
    LABEL_2: 'Обновление вирусных баз',
    LABEL_PRO_1: 'Лечение заражённых файлов',
  },
  PAYMENT_FAILED_MODAL: {
    TITLE: 'Ошибка при оплате ImunifyAV+',
    DESCRIPTION_1: 'При оплате возникла проблема.',
    DESCRIPTION_2: 'Попробуйте повторить платёж через 1 минуту.',
    TRY_AGAIN_BUTTON: 'Попробовать ещё раз',
  },
  NOT_NOW: 'Нет, не сейчас',
  SUBSCRIBE_FOR: 'Оформить подписку за %{cost} %{currency}',
  PRO_PERIODS: {
    MONTH: {
      SHORT: 'мес',
      LONG: 'Месячная',
    },
    YEAR: {
      SHORT: 'год',
      LONG: 'Годовая',
      DESCRIPTION: 'при оплате за год',
    },
  },
  TABLE: {
    ON_PAGE_LABEL: 'На странице',
    OF: 'из',
    RECORD_COUNT: '%{smart_count} запись |||| %{smart_count} записи |||| %{smart_count} записей',
    FILE_COUNT: '%{smart_count} файл |||| %{smart_count} файла |||| %{smart_count} файлов',
    SELECTED_COUNT: 'Выбрано %{count}',
  },
  PREVIEW: {
    FIRST_SCAN: {
      BUTTON: 'Проверить сайт',
      TEXT_1: 'Антивирус проверяет сайт на наличие вирусов.',
      TEXT_2: 'Запустите первую проверку, чтобы убедиться, что сайт не заражён.',
    },
    HELP:
      'Сайт найден в чёрных списках Роскомнадзора, Яндекса и Google. Причиной могла стать хакерская атака на сайт, некачественное или запрещённое содержимое сайта.',
    HELP_RECOMMENDATION: 'Рекомендуем вылечить вирусы, и переиндексировать сайт. Индексация сайта может занять от 3 до 72 часов.',
    WAIT_CHECK: {
      FULL: 'Идёт проверка сайта',
      PARTIAL: 'Идёт проверка',
    },
    LAST_CHECK: {
      FULL: 'Полная проверка ',
      PARTIAL: 'Проверка /%{directory} ',
    },
    NEXT_CHECK: 'Следующая проверка: 04.06.2019 Ежедневно',
    INFECTED_FILES_WORD_1: 'Заражен |||| Заражено |||| Заражено',
    INFECTED_FILES_WORD_2: 'файл |||| файла |||| файлов',
    CURE: 'Лечить',
    DETAIL: 'Подробнее',
    NOT_INFECTED_FILES: 'Вирусов не обнаружили',
    HEALING: 'Лечим вирусы',
    IN_BLACK_LISTS: 'Сайт находится в чёрных списках',
    HOW_TO_FIX: 'Как исправить',
    NOT_IN_BLACK_LISTS: 'Сайта в чёрных списках нет',
  },
  INFECTED_FILES: {
    NOT_FOUND:
      'Сейчас всё хорошо, заражённых файлов нет. В случае появления вирусов, информация о них будет храниться в этой вкладке. Для лечения вирусов вам понадобится Imunify Pro. Оформить подписку можно сейчас.',
    NOT_FOUND_PRO: 'Сейчас всё хорошо, заражённых файлов нет. В случае появления вирусов, информация о них будет храниться в этой вкладке.',
    SUBSCRIBE_TO_PRO: 'Оформить подписку на Imunify Pro',
    TABLE_HEADER: {
      CELL_1: 'Имя файла',
      CELL_2: 'Название угрозы',
      CELL_3: 'Обнаружен',
      CELL_4: 'Расположение файла',
    },
    STATUS: {
      INFECTED: 'заражён',
      CURED: 'вылечен',
      EXCEPTED: 'добавлен в исключения',
      HEALING: 'лечим',
      DELETED: 'удаляется',
    },
    ACTIONS: {
      HEAL: 'Лечить',
      EXCLUDE: 'Добавить в исключения',
      OPEN_FOLDER: 'Показать в папке',
      DELETE: 'Удалить',
    },
    MODAL: {
      /**
       * There's no question mark in the title because it's specified in the template
       * so I can cut only the filename without touching the question mark
       */
      TITLE: 'Удалить файл %{filename}',
      GROUP_TITLE: 'Удалить %{smart_count} файл |||| Удалить %{smart_count} файлов |||| Удалить %{smart_count} файлов',
      DELETE_BUTTON: 'Удалить',
      CANCEL_BUTTON: 'Отменить',
    },
  },
  DATETIME_CREATED: 'создан %{date} в %{time}',
  DATETIME_CHANGED: 'изменён %{date} в %{time}',
  HISTORY_TAB: {
    TABLE_HEADER: {
      CELL_1: 'Дата проверки',
      CELL_2: 'Тип',
      CELL_3: 'Найдено угроз',
    },
    CHECK_TYPE: {
      FULL: 'полная',
      PARTIAL: 'выборочная',
    },
    ACTION: {
      RETRY: 'Повторить',
    },
    CURED_COUNT: 'Вылечено %{count}',
  },
  NEW_SCAN_BTN: 'Новое сканирование',
  SCAN_SETTINGS: {
    NEW_SCAN: 'Новое сканирование',
    CHECK_FOLDER: 'Папка или файл для проверки',
    USE_MASK_FOR_CHECK_FILES: 'Использовать маску имён файлов для проверки',
    USE_MASK_FOR_IGNORE_FILES: 'Использовать маску для игнорирования файлов',
    CHECK_MASK_HINT: 'Используйте символ "?" для замены одного символа и "*" для замены любой последовательности символов.',
    INSPECTION_INTENSITY: {
      LOW: 'Низкая',
      MEDIUM: 'Средняя',
      HIGH: 'Высокая',
      TEXT: 'Интенсивность проверки',
      HINT_TEXT: 'Интенсивность определяет приоритет и ресурсы, которые будут использоваться для сканирования',
    },
    CHECK_FILE_TYPE: {
      critical: 'Критических типов',
      all: 'Всех типов',
      except_media: 'Всех, кроме медиа-файлов',
      TEXT: 'Проверять файлы',
      HINT_TEXT:
        'Файлы с типами ph*, htm*, js, txt, tpl и пр. чаще заражаются вирусами. Медиа-файлы, такие как изображения, редко содержат вирусы, и их исключение из проверки значительно сокращает время проверки и нагрузку на сервер.',
    },
    BUTTON_SCAN: 'Сканировать',
    BUTTON_SAVE: 'Сохранить',
    BUTTON_CANCEL: 'Отмена',
    CONFIGURE_SCAN: 'Настроить сканирование',
    SAVE_COPY_FILES: 'Хранить копии вылеченных файлов',
    AUTO_HEAL_MALWARE: 'Найденные вирусы лечить автоматически',
    DELETE_ONLY_CONTENT: 'Удалять содержимое заражённого файла, а не сам файл',
    EMAIL_NOTIFY: 'Оповещать о вирусах по e-mail',
    ADVANCED_SETTINGS: 'Расширенные настройки',
    HIDE_ADVANCED_SETTINGS: 'Скрыть расширенные настройки',
    CPU_THREAD_COUNT: {
      TEXT: 'Количество потоков сканирования',
      HINT_TEXT:
        'Оптимальное значение: половина от свободных ядер сервера. Например, если на сервере 4 ядра, то рекомендуемое значение - 2.',
    },
    RAM_COUNT: 'Оперативной памяти на проверку',
    DETAIL_LOG: {
      TEXT: 'Степень детализации лога антивируса',
      FULL: 'Полная',
      COMMON: 'Обычная',
    },
    MAX_SCAN_TIME: {
      ITEM_1: '1 час',
      ITEM_3: '3 часа',
      ITEM_6: '6 часов',
      ITEM_12: '12 часов',
      ITEM_24: '24 часа',
      ITEM_0: 'без ограничений',
      TEXT: 'Максимальное время сканирования',
    },
    AUTO_UPDATE_DB: 'Автоматически обновлять базу антивируса',
    DAY_COUNT: 'день |||| дня |||| дней',
  },
  BTN_SCAN: 'Проверить',
  CONFIGURE: 'Настроить',
  MEGABYTE_SHORT: 'MB',
  VIRUS_DETECTED: 'Обнаружен вирус',
  VIRUS_GROUP_DETECTED: 'Обнаружен %{smart_count} вирус |||| Обнаружено %{smart_count} вируса |||| Обнаружено %{smart_count} вирусов',
  PRICE_PERIOD: {
    DAY: 'день',
    MONTH: 'месяц',
    YEAR: 'год',
    // LIFETIME: 'вечная',
    // TRIAL: 'триальная',
  },
  VIRUS_DELETE: {
    DONE: 'Заражённый файл удалён',
    FAIL: 'Ошибка при удалении файла',
    GROUP: {
      DONE_1: 'Удалён |||| Удалено |||| Удалено',
      DONE_2: 'заражённый файл |||| заражённых файла |||| заражённых файлов',
      FAIL_1: 'Не удалось удалить',
      FAIL_2: 'файл |||| файла |||| файлов',
    },
    ERROR_404: '%{filename} - файл уже был удалён ранее',
  },
  VIRUS_CURE: {
    DONE: 'Заражённый файл вылечен',
    FAIL: 'Ошибка при лечении файла',
    GROUP: {
      DONE_1: 'Вылечен |||| Вылечено |||| Вылечено',
      DONE_2: 'заражённый файл |||| заражённых файла |||| заражённых файлов',
      FAIL_1: 'Не удалось вылечить',
      FAIL_2: 'файл |||| файла |||| файлов',
    },
    ERROR_404: '%{filename} - данного файла нет на сервере',
  },
  LAST_CHECK_IN: '%{date} в %{time}',
  COMMON_DATE: {
    TODAY: 'Сегодня',
    YESTERDAY: 'Вчера',
  },
  PURCHASE: {
    PREVIEW: {
      TITLE: 'Подписка на ImunifyAV оплачивается',
      MSG: 'Обычно это занимает до 30 минут',
    },
  },
};

export type Lang = typeof lang;
export default lang;
