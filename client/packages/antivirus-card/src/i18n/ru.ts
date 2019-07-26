export type Lang = typeof lang;

const lang = {
  TITLE: 'Антивирус ImunifyAV',
  MENU_ITEMS: {
    PREVIEW: 'Обзор',
    INFECTED_FILES: 'Заражённые файлы',
    HISTORY: 'История сканирований'
  },
  CHECK_TYPE: {
    FULL: 'полная'
  },
  BUY_MODAL: {
    TITLE: 'Подписка Imunify Pro',
    LABEL_1: 'Ежедневное сканирование сайта',
    LABEL_2: 'Обновление вирусных баз',
    LABEL_3: 'Поиск сайта в черных списках',
    LABEL_PRO_1: 'Лечение заражённых файлов',
    LABEL_PRO_2: 'Сканирование по расписанию',
    LABEL_PRO_3: 'Оповещения об угрозах на почту'
  },
  NOT_NOW: 'Нет, не сейчас',
  SUBSCRIBE_FOR: 'Оформить подписку за',
  PRO_PERIODS: {
    MONTH: {
      SHORT: 'мес',
      LONG: 'Месячная'
    },
    YEAR: {
      SHORT: 'год',
      LONG: 'Годовая',
      DESCRIPTION: 'при оплате за год'
    }
  },
  TABLE: {
    ON_PAGE_LABEL: 'На странице'
  },
  PREVIEW: {
    HELP:
      'Сайт найден в чёрных списках Роскомнадзора, Яндекса и Google. Причиной могла стать хакерская атака на сайт, некачественное или запрещённое содержимое сайта.',
    HELP_RECOMMENDATION: 'Рекомендуем вылечить вирусы, и переиндексировать сайт. Индексация сайта может занять от 3 до 72 часов.',
    WAIT_CHECK: 'Идёт проверка сайта, ещё примерно 10 минут',
    LAST_CHECK: 'Последняя проверка',
    NEXT_CHECK: 'Следующая проверка: 04.06.2019 Ежедневно',
    INFECTED_FILES_WORD_1: 'Заражен |||| Заражено |||| Заражено',
    INFECTED_FILES_WORD_2: 'файл |||| файла |||| файлов',
    CURE: 'Лечить',
    DETAIL: 'Подробнее',
    NOT_INFECTED_FILES: 'Вирусов не обнаружили',
    IN_BLACK_LISTS: 'Сайт находится в чёных списках',
    HOW_TO_FIX: 'Как исправить',
    NOT_IN_BLACK_LISTS: 'Сайта в чёрных списках нет'
  },
  INFECTED_FILES: {
    NOT_FOUND:
      'Сейчас всё хорошо, заражённых файлов нет. В случае появления вирусов, информация о них будет храниться в этой вкладке. Для лечения вирусов вам понадобится Imunify Pro. Оформить подписку можно сейчас.',
    SUBSCRIBE_TO_PRO: 'Оформить подписку на Imunify Pro',
    TABLE_HEADER: {
      CELL_1: 'Имя файла',
      CELL_2: 'Название угрозы',
      CELL_3: 'Обнаружен',
      CELL_4: 'Расположение файла'
    }
  },
  DATETIME_CREATED: 'создан %{date} в %{time}',
  DATETIME_CHANGED: 'изменён %{date} в %{time}',
  HISTORY_TAB: {
    TABLE_HEADER: {
      CELL_1: 'Дата проверки',
      CELL_2: 'Тип',
      CELL_3: 'Найдено угроз'
    }
  },
  NEW_SCAN_BTN: 'Новое сканирование'
};

export default lang;
