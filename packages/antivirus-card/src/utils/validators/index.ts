/** Interface for custom validator */
export interface Validator<T> {
  validate: (x: T) => boolean;
  errorMessage?: string;
}

/** Default validator */
export const defaultValidator: Validator<any> = {
  validate: () => true
}

/** 
 * Method for return a validator with merged input validators 
 * @param validatorList - list of validators
 */
export function getValidator<T>(validatorList: Array<Validator<T>>): Validator<T> {
  return (validatorList || []).reduce(combineValidators, defaultValidator);
}

/**
 * Method of combine two validators
 * @param v1 validator one
 * @param v2 validator two
 */
export function combineValidators<T>(v1: Validator<T>, v2: Validator<T>): Validator<T> {
  let combined: Validator<T>;
  combined = {
      validate: (x: T) => {
          const res1: boolean = v1.validate(x);
          const res2: boolean = v2.validate(x);
          if (!res1) {
              combined.errorMessage = v1.errorMessage;
          } else if (!res2) {
              combined.errorMessage = v2.errorMessage;
          }
          return res1 && res2;
      },
  }
  return combined;
}

