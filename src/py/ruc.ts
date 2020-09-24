/**
 *
 * Paraguay RUC numbers
 *
 * RUC number (Registro Único de Contribuyentes, Paraguay tax number).
 *
 * The Registro Único del Contribuyente (RUC) is the unique taxpayer registry
 * that maintains identification numbers for all persons (national or foreign)
 * and legal entities in Paraguay.
 *
 * The RUC number for legal entities consists of 8 digits starting after
 * 80000000. Number for residents and foreigners are up to 9 digits. The last
 * digit is a check digit.
 *
 * Sources:
 *   https://www.ruc.com.py/
 *
 * BANK
 */

import * as exceptions from "../exceptions";
import { cleanUnicode, isdigits, splitAt } from "../util";
import { Validator, ValidateReturn } from "../types";

function clean(input: string): ReturnType<typeof cleanUnicode> {
  return cleanUnicode(input, " -");
}

class RucSingleton implements Validator {
  compact(input: string): string {
    const [value, err] = clean(input);

    if (err) {
      throw err;
    }

    return value;
  }

  format(input: string): string {
    const [value] = clean(input);

    return `${value.substr(0, value.length - 1)}-${value.substr(value.length - 1)}`;
  }

  /**
   * Check if the number is a valid Andorra NRT number.
   * This checks the length, formatting and other contraints. It does not check
   * for control letter.
   */
  validate(input: string): ValidateReturn {
    const [value, error] = clean(input);

    if (error) {
      return { isValid: false, error };
    }
    if (value.length < 5 || value.length > 9) {
      return { isValid: false, error: new exceptions.InvalidLength() };
    }
    if (!isdigits(value)) {
      return { isValid: false, error: new exceptions.InvalidComponent() };
    }

    const [front, check] = splitAt(value, value.length - 1);

    const sum = front
      .split("")
      .reverse()
      .map((x) => parseInt(x, 10))
      .reduce((acc, digit, idx) => acc + digit * (idx + 2), 0);

    const digit = String((11 - (sum % 11)) % 10);

    if (check !== digit) {
      return { isValid: false, error: new exceptions.InvalidChecksum() };
    }

    return {
      isValid: true,
      compact: value,
      isIndividual: parseInt(front, 10) < 80000000,
      isCompany: front.length === 8 && parseInt(front, 10) > 80000000,
    };
  }
}

export const Ruc = new RucSingleton();
export const validate = Ruc.validate;
export const format = Ruc.format;
export const compact = Ruc.compact;