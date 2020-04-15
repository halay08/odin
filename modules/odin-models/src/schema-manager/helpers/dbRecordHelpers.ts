import { DbRecordCreateUpdateDto } from '../db/record/dto/db.record.create.update.dto';
import { DbRecordEntityTransform } from '../db/record/transform/db.record.entity.transform';


/**
 *  gets the related records from DbRecordEntityTransform object
 * @param dbRecord
 * @param entity
 */
export const getAllRelations = (
  dbRecord: DbRecordEntityTransform,
  entity: string,
): DbRecordEntityTransform[] | undefined => {

  return dbRecord[entity].dbRecords ? dbRecord[entity].dbRecords : undefined;

}

/**
 *  gets the related records from DbRecordEntityTransform object
 * @param dbRecord
 * @param entity
 */
export const getFirstRelation = (
  dbRecord: DbRecordEntityTransform,
  entity: string,
): DbRecordEntityTransform | undefined => {

  return dbRecord[entity].dbRecords ? dbRecord[entity].dbRecords[0] : undefined;

}

/**
 *  DEPRECATION NOTICE: 2021-03-17
 *  !!!NOTE: will be deprecated in future releasese in favor of
 *  getFirstRelation or getAllRelations above()
 *
 *  gets the related records from DbRecordEntityTransform object
 * @param dbRecord
 * @param entity
 * @param getFirst
 */
export const getRelation = (
  dbRecord: DbRecordEntityTransform,
  entity: string,
  getFirst?: boolean,
): DbRecordEntityTransform[] | DbRecordEntityTransform | undefined => {

  if(getFirst) {

    return dbRecord[entity].dbRecords ? dbRecord[entity].dbRecords[0] : undefined;

  } else {

    return dbRecord[entity].dbRecords ? dbRecord[entity].dbRecords : undefined;

  }

}

/**
 * Returns the newest dbRecord from the array of related records
 *
 * @param dbRecords
 * @private
 */
export const getNewestRelation = (
  dbRecord: DbRecordEntityTransform,
  entity: string,
): DbRecordEntityTransform | undefined => {

  const dbRecords = dbRecord[entity].dbRecords ? dbRecord[entity].dbRecords : undefined;

  if(dbRecords) {

    const newestToOldest = dbRecords.sort((
      elemA: DbRecordEntityTransform,
      elemB: DbRecordEntityTransform,
    ) => {
      // @ts-ignore
      return elemA && elemB && new Date(elemB.createdAt || '') - new Date(elemA.createdAt || '')
    });

    return newestToOldest[0];
  }

  return undefined;
}

/**
 * Returns the oldest dbRecord from the array of related records
 *
 * @param dbRecords
 * @private
 */
export const getOldestRelation = (
  dbRecord: DbRecordEntityTransform,
  entity: string,
): DbRecordEntityTransform | undefined => {

  const dbRecords = dbRecord[entity].dbRecords ? dbRecord[entity].dbRecords : undefined;

  if(dbRecords) {

    const oldestToNewest = dbRecords.sort((
      elemA: DbRecordEntityTransform,
      elemB: DbRecordEntityTransform,
    ) => {
      // @ts-ignore
      return elemA && elemB && new Date(elemA.createdAt || '') - new Date(elemB.createdAt || '')
    });

    return oldestToNewest[0];
  }

  return undefined;
}


/**
 * Get the property from a single record
 * @param dbRecord
 * @param propKey
 */
export const getProperty = (dbRecord: DbRecordEntityTransform, propKey: string): any => {

  return dbRecord && dbRecord.properties ? dbRecord.properties[propKey] : undefined;

};

/**
 * retrieve property from record association
 * @param dbRecord
 * @param entityName
 * @param propKey
 * @param match
 */
export const getPropertyFromRelation = (
  dbRecord: DbRecordEntityTransform,
  entityName: string,
  propKey: string,
  match?: { [key: string]: any },
) => {
  // check that the entity exists in the record
  if(dbRecord && dbRecord[entityName]) {
    if(dbRecord[entityName].dbRecords && dbRecord[entityName].dbRecords.length > 1) {
      // more than 1 record and has a match statement
      if(match) {
        // find the record with matching properties
        const record = dbRecord[entityName].dbRecords.find((elem: DbRecordEntityTransform) => {

          const matchPropKeys = Object.keys(match);
          let matchedCount = 0;

          for(const matchKey of matchPropKeys) {
            // get the values
            const matchValue = match[matchKey];
            const existingValue = elem.properties[matchKey];
            // check the values
            if(matchValue === existingValue) {
              matchedCount = matchedCount + 1;
            }
          }
          // if the total matches = matchPropKeys return the record property
          if(matchedCount === matchPropKeys.length) {
            return true;
          }
        });

        // return the property from the matching record
        return getProperty(record, propKey);

      } else {
        // No match statement, get the properties from the first record with the property
        const record = dbRecord[entityName].dbRecords.find((elem: DbRecordEntityTransform) => getProperty(
          elem,
          propKey,
        ));
        return getProperty(record, propKey);
      }
    } else if(dbRecord[entityName].dbRecords && dbRecord[entityName].dbRecords.length > 0) {
      // Only one record, get the properties
      const record = dbRecord[entityName].dbRecords[0];
      return getProperty(record, propKey);
    }
  }
};


// helper property to check if the record is triggerable
export const shouldTriggerUpdateEvent = (body: DbRecordCreateUpdateDto) => {

  if(body && body.options && body.options.skipUpdateEvent) {
    return false;
  }

  return true;
}

export const shouldTriggerCreateEvent = (body: DbRecordCreateUpdateDto) => {

  if(body && body.options && body.options.skipCreateEvent) {
    return false;
  }

  return true;
}

export const shouldTriggerDeleteEvent = (body: DbRecordCreateUpdateDto) => {

  if(body && body.options && body.options.skipDeleteEvent) {
    return false;
  }

  return true;
}

// helper property to check if the record is notifiable
export const isNotifiable = (body: DbRecordCreateUpdateDto) => {

  if(body && body.options && body.options.skipNotificationEvent) {
    return false;
  }

  return true;
}

/**
 *
 * @param entity
 */
export const splitEntityToModuleAndEntity = (entity: string) => {

  const split = entity.split(':');
  const moduleName = split[0];
  const entityName = split[1];

  return { moduleName, entityName };
}



