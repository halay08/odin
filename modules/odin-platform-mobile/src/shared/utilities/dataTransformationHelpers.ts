import { capitalCase, pascalCase } from 'change-case';


/**
 *
 * @param value
 */
export function changeToCapitalCase(value: string | undefined) {
  if(value) {
    return capitalCase(value);
  }
}

/**
 * @param value string
 */
export function changeToPascalCase(value: string | undefined) {
  if(value) {
    return pascalCase(value);
  }
}

/**
 * Accepts an array
 * chunk([1, 2, 3, 4, 5], 2)
 * and returns 3 chunks of 2 items
 * [[1,2],[3,4],[5]]
 * @param arr
 * @param size
 */
export const chunkArray = (arr: any[], size: number) => {

  return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size));

}

