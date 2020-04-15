export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Accepts an array
 * chunk([1, 2, 3, 4, 5], 2)
 * and returns 3 chunks of 2 items
 * [[1,2],[3,4],[5]]
 * @param arr
 * @param size
 */
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';

export const chunkArray = (arr: any[], size: number) => {

    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
        arr.slice(i * size, i * size + size));

}

/**
 *
 * @param dbRecords
 * @private
 */
export const sortDbRecordsByCreatedAtNewestFirst = (dbRecords: DbRecordEntityTransform[]) => {

    if(dbRecords) {
        const sorted = dbRecords.sort((
            elemA: DbRecordEntityTransform,
            elemB: DbRecordEntityTransform,
        ) => {
            // @ts-ignore
            return elemA && elemB && new Date(elemB.createdAt || '') - new Date(elemA.createdAt || '')
        });
        return sorted;
    }
    return [];
}


/**
 * A helper function that groups data by a unique value in a data set
 * and if any of the groups are too large it will break it into chunks
 * specified by the chunkSize.
 *
 * data returned:
 * [ [1,2], [3,4], [5] ]
 *
 * Note: Data set must be sorted by the "property" (asc or desc) for this
 * function to work properly
 *
 * @param data
 * @param property
 */
export const groupAndChunkDataSet = (data: object[], property: string, chunkSize: number): any[][] => {

    let previousGroupKey = null;

    const chunkedArray = [];
    // used to temporarily hold data
    let processingSet = [];

    // get total unique items by grouping property
    let uniqueGroups = [ ...new Set(data.map(elem => elem[property])) ];
    // count each group iteration
    let processedGroups = 1;

    console.log('uniqueGroups', uniqueGroups);

    // parse and add to final set
    function addGroupToFinalSet(nextGroupItem: any) {
        // if the size of the processing set is larger then the chunk size
        // break it into chunks
        if(processingSet.length > chunkSize) {

            const chunkedTempArray = chunkArray(processingSet, chunkSize);

            chunkedArray.push(...chunkedTempArray);
            processingSet = [];
            processingSet.push(nextGroupItem);

        } else {
            chunkedArray.push(processingSet);
            processingSet = [];
            processingSet.push(nextGroupItem);

        }
    }

    // loop over each of the elements in the data set
    for(const element of data) {

        if(previousGroupKey !== null && previousGroupKey !== element[property]) {

            // increment processedGroup count
            processedGroups += 1;

            addGroupToFinalSet(element)

        } else if(uniqueGroups.length < 2) {

            // data is only for one group

            if(processingSet.length < data.length) {

                processingSet.push(element);

            } else {

                processingSet.push(element);
                addGroupToFinalSet(element)
            }

        } else if(processedGroups === uniqueGroups.length) {

            // handle the final group count
            // add element from current group being processed
            // if there is only 1 record in the group we need to add it

            processingSet.push(element);

            addGroupToFinalSet(element)
        }

        // add element from current group being processed
        processingSet.push(element);

        // set the previous group key
        previousGroupKey = element[property];

    }

    return chunkedArray;

}

