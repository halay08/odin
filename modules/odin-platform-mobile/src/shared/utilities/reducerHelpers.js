/**
 *
 * @param oldObject
 * @param newValues
 * @returns {any}
 */
export function updateObject(oldObject, newValues) {
    // Encapsulate the idea of passing a new object as the first parameter
    // to Object.assign to ensure we correctly copy data instead of mutating
    return Object.assign({}, oldObject, newValues);
}

/**
 *
 * @param array
 * @param itemId
 * @param updateItemCallback
 * @returns {*}
 */
export function updateStringItemInArray(array, itemId, updateItemCallback) {
    const updatedItems = array.map(item => {
        if (item !== itemId) {
            // Since we only want to update one item, preserve all others as they are now
            return item;
        }
        // Use the provided callback to create an updated item
        const updatedItem = updateItemCallback(item);
        return updatedItem;
    });

    return updatedItems;
}

/**
 *
 * @param array
 * @param itemId
 * @param updateItemCallback
 * @returns {*}
 */
export function updateItemWithIdInArray(array, itemId, updateItemCallback) {
    const updatedItems = array.map(item => {
        if (item.id !== itemId) {
            // Since we only want to update one item, preserve all others as they are now
            return item;
        }
        // Use the provided callback to create an updated item
        const updatedItem = updateItemCallback(item);
        return updatedItem;
    });

    return updatedItems;
}

/**
 *
 * @param array
 * @param itemId
 * @param updateItemCallback
 * @returns {*}
 */
export function updateDbRecordCreatePropertiesInArray(array, itemId, updateItemCallback) {
    const updatedItems = array.map(item => {
        if (item.schemaId !== itemId) {
            // Since we only want to update one item, preserve all others as they are now
            return item;
        }
        // Use the provided callback to create an updated item
        const updatedItem = updateItemCallback(item);
        return updatedItem;
    });
    return updatedItems;
}

/**
 *
 * @param array
 * @param itemId
 * @param updateItemCallback
 * @returns {*}
 */
export function updateAssociationRecordInShortList(array, itemId, updateItemCallback) {
    const updatedItems = array.map(item => {
        if (item.schema.id !== itemId) {
            // Since we only want to update one item, preserve all others as they are now
            return item;
        }
        // Use the provided callback to create an updated item
        const updatedItem = updateItemCallback(item);
        return updatedItem;
    });
    return updatedItems;
}

