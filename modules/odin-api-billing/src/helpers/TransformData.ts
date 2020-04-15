import { camelCase, snakeCase } from 'change-case';

/**
 *
 * @param data
 */
export function changeKeysCamelCaseToSnakeCase<T>(data: object): T {
    let parsed;
    for(const key in data) {
        parsed = Object.assign({}, parsed, { [snakeCase(key)]: data[key] })
    }

    return parsed;
}

/**
 *
 * @param data
 */
export function changeKeysSnakeCaseToCamelCase<T>(data: object): T {

    let parsed;

    for(const key in data) {

        parsed = Object.assign({}, parsed, { [camelCase(key)]: data[key] })
    }

    return parsed;
}
