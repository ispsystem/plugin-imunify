export type Lang = typeof lang;

const lang = {
  WIDGET:  {
    ANTIVIRUS: 'Антивирус',
    STATUS_MSG: {
      SAFELY: 'угроз не обнаружено',
      IN_PROCESS: 'проверяем сайт на вирусы'
    },
    DESC_MSG: {
      HISTORY: 'последняя проверка: сегодня',
      WAIT: 'ешё примерно 10 минут'
    },
    ACTION_MSG: {
      AGAIN: 'Проверить ещё раз',
      REPORT: 'Отчёт'
    }
  }
};

export default lang;
