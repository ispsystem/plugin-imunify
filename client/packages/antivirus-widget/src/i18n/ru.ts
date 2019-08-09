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
    CHECK_AGAIN: 'Проверить еще раз',
    CURE: 'Лечить',
    ACTION_MSG: {
      AGAIN: 'Проверить ещё раз',
      REPORT: 'Отчёт',
    },
    ACTION: {
      SCANNING: 'проверяем сайт на вирусы',
      CURE: 'лечим вирус',
    },
  },
};

export type Lang = typeof lang;
export default lang;
