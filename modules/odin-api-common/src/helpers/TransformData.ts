import { camelCase, pascalCase, snakeCase } from 'change-case';

/**
 * transforms and objects keys from camelCase to snake_ase
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
 * transformes an objects keys from snake_case to camelCase
 * @param data
 */
export function changeKeysSnakeCaseToCamelCase<T>(data: object): T {
    let parsed;
    for(const key in data) {
        parsed = Object.assign({}, parsed, { [camelCase(key)]: data[key] })
    }

    return parsed;
}

/**
 * transformes an objects keys from snake_case to PascalCase
 * @param data
 */
export function changeKeysSnakeCaseToPascalCase<T>(data: object): T {
    let parsed;
    for(const key in data) {
        parsed = Object.assign({}, parsed, { [pascalCase(key)]: data[key] })
    }

    return parsed;
}
