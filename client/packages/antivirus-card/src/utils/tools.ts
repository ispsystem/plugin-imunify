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

/**
 * Return nested object or undefined
 *
 * @param object - root object
 * @param pathArr - path to nested object as string array
 */
export function getNestedObject(object: object, pathArr: string[]) {
  return pathArr.reduce((obj, key) => (obj && obj[key] !== 'undefined' ? obj[key] : undefined), object);
}

/**
 * Создание уникального идентификатора
 * https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 */
export function uuidv4() {
  const hash: any = ([1e7] as any) + -1e3 + -4e3 + -8e3 + -1e11;
  // https://stackoverflow.com/questions/44042816/what-is-wrong-with-crypto-getrandomvalues-in-internet-explorer-11
  const crypto = window.crypto || window['msCrypto']; // for IE 11
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return hash.replace(/[018]/g, c => (c ^ (crypto.getRandomValues(new Uint8Array(1))![0] & (15 >> (c / 4)))).toString(16));
}

/**
 * Add leading zeroes to date
 *
 * @param n - day or time number
 */
export function pad(n: number) {
  return n < 10 ? '0' + n : n;
}

/**
 * Method for reduce and filter array
 *
 * @param arr - input array
 * @param filter - filter function
 * @param preFun - functions to be performed before filtering
 */
export function reduceFilter<T>(arr: T[], filter: (e: T) => boolean, ...preFun: ((e: T) => T)[]): T[] {
  return arr.reduce((res: T[], e) => {
    if (preFun) {
      e = preFun.reduce((_, f) => {
        return f(e);
      }, e);
    }

    return filter(e) ? res.push(e) && res : res;
  }, []);
}

/**
 * Filter array by empty string
 *
 * @param arr input array
 */
export const filterEmptyString = (arr: string[]): string[] => reduceFilter(arr, (e: string) => e !== '', (e: string) => e.trim());
