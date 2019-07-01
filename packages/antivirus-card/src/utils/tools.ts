/**
 * Combination of async function + await + setTimeout
 *
 * @param m - milliseconds
 */
export const sleep = (m: number) => new Promise(r => setTimeout(r, m));

/**
 * Выбор слова в соответствующем падеже для опеределенного числа
 *
 * @param num число для которого необходимо подобрать склонение
 * @param listMsgs список возможных слов для числа, состоит из 3-х элементов: (для единиц, для пар, для других чисел)
 */
export function declOfNum(num: number, listMsgs: string[]): string {
  if (num === 1) {
    return listMsgs[0];
  } else if (num % 100 > 4 && num % 100 < 20) {
    return listMsgs[2];
  } else {
    switch (num % 10) {
      case 1:
        return listMsgs[listMsgs.length > 3 ? 3 : 0];
      case 2:
      case 3:
      case 4:
        return listMsgs[1];
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
      case 0:
        return listMsgs[2];
    }
  }
}
