import { Validator } from ".";

/**
 * Validation for time in hh:mm format
 */
export const timeValidator: Validator<string> = {
  validate: (value: string) => {
    return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(value);
  },
  // @TODO add error message key
}