const lang = {
  WIDGET: {
    ANTIVIRUS: 'Антивирус',
    STATUS: {
      SUCCESS: 'угроз не обнаружено',
      ACCENT: 'нашли %{smart_count} вирус |||| нашли %{smart_count} вируса |||| нашли %{smart_count} вирусов',
    },
    LAST_CHECK: 'последняя проверка: %{value}',
    DESC_MSG: {
      HISTORY: 'последняя проверка: сегодня',
      WAIT: 'ешё примерно 10 минут',
    },
    CHECK_AGAIN: 'Проверить ещё раз',
    CHECK_SITE: 'Проверить сайт',
    CURE: 'Лечить',
    ACTION: {
      SCANNING: 'проверяем сайт на вирусы',
      CURE: 'лечим вирус',
    },
    VIRUS_DETECTED: 'Обнаружен вирус',
    SCAN_SUCCESS: 'Проверка сайта закончилась',
    CURE_COUNT_FILES: 'Вылечен ${smart_count} файл |||| Вылечено ${smart_count} файла |||| Вылечено ${smart_count} файлов',
    MORE_DETAILS: 'Подробнее',
    TODAY: 'сегодня',
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
  },
};

export type Lang = typeof lang;
export default lang;
