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
  },
};

export type Lang = typeof lang;
export default lang;
