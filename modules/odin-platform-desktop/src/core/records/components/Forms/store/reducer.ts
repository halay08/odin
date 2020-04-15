import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { SchemaAssociationEntity } from '@d19n/models/dist/schema-manager/schema/association/schema.association.entity';
import { SchemaColumnEntity } from '@d19n/models/dist/schema-manager/schema/column/schema.column.entity';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { updateDbRecordCreatePropertiesInArray, updateObject } from '../../../../../shared/utilities/reducerHelpers';
import { arrayHasValues, itemExistsInArrayOfObjects } from '../../../../../shared/utilities/validateDataTypes';
import {
  ADD_ASSOCIATION_TO_FORM_SECTION,
  CLOSE_FORM_MODAL,
  INITIALIZE_FORM,
  UPDATE_FORM_INPUT,
  UPDATE_FORM_STATE,
} from './constants';

export class FormSectionEntity {
  public id?: string | null;
  public organization?: OrganizationEntity;
  public schema?: SchemaEntity;
  public schemaColumns?: SchemaColumnEntity[];
  public name?: string;
  public description?: string;
  public position?: number;
  public columns?: number;
}


export interface FormReducer {
  formUUID: string,
  isRequesting: boolean,
  showInitializing: boolean,
  showFormModal: boolean,
  hasColumnMappings: boolean,
  isCreating: boolean,
  isUpdating: boolean,
  isCreateReq: boolean,
  isUpdateReq: boolean,
  upsert: boolean,
  title: string,
  recordType?: string,
  schema: SchemaEntity | null,
  nextStageId: string | null,
  schemaAssociation: SchemaAssociationEntity | null,
  list: any[],
  selected: DbRecordEntityTransform | null,
  sections: FormSectionEntity[],
  payload: DbRecordCreateUpdateDto[],
  modified: DbRecordCreateUpdateDto[],
  disabledFields?: string[],
  visibleFieldOverride?: string[]
}

export const initialState: FormReducer = {
  formUUID: '',
  isRequesting: false,
  showInitializing: false,
  showFormModal: false,
  hasColumnMappings: false,
  isCreating: false,
  isUpdating: false,
  isCreateReq: false,
  isUpdateReq: false,
  upsert: false,
  title: 'Form',
  schema: null,
  recordType: undefined,
  nextStageId: null,
  schemaAssociation: null,
  list: [],
  selected: null,
  sections: [],
  payload: [],
  modified: [],
  disabledFields: [],
  visibleFieldOverride: [],
};


function reducer(state = initialState, action: any) {
  switch (action.type) {
    case INITIALIZE_FORM: {
      return {
        ...initialState,
        ...action.params,
      }
    }

    case UPDATE_FORM_STATE: {
      return {
        ...state,
        ...action.params,
      }
    }

    case CLOSE_FORM_MODAL: {
      return {
        ...initialState,
      }
    }

    case UPDATE_FORM_INPUT: {
      const targetIdSplit = action.params.targetId.split('_');
      const targetSchemaId = targetIdSplit[0];
      const targetProperty = targetIdSplit[1];
      const targetValue = action.params.targetValue;
      const targetEntity = action.params.entity;
      const targetRecord = action.params.record;
      const association = action.params.association;


      let recordType = state.recordType;
      let newModified = state.modified;

      if(targetProperty === 'recordType') {
        recordType = targetValue;
      }

      if(arrayHasValues(state.modified)) {
        if(!itemExistsInArrayOfObjects(state.modified, targetSchemaId, 'schemaId')) {
          // Add the item to the array of existing modified values
          return {
            ...state,
            recordType,
            modified: [
              ...state.modified, ...[
                {
                  entity: targetEntity,
                  schemaId: targetSchemaId,
                  [targetProperty]: targetValue,
                  title: targetProperty === 'title' ? targetValue : targetRecord ? targetRecord.title : undefined,
                  ownerId: targetProperty === 'ownerId' ? targetValue : undefined,
                  type: targetProperty === 'recordType' ? targetValue : undefined,
                  stageId: targetProperty === 'stage' ? targetValue : undefined,
                  properties: targetEntity !== 'Record' ? { [targetProperty]: targetValue } : {},
                  associations: association ? [ association ] : [],
                },
              ],
            ],
          }
        } else {
          // update the existing item in the array of modified values
          newModified = updateDbRecordCreatePropertiesInArray(state.modified, targetSchemaId, (item: any) => {
            return updateObject(item, {
              title: targetProperty === 'title' ? targetValue : item.title,
              ownerId: targetProperty === 'ownerId' ? targetValue : item.ownerId,
              stageId: targetProperty === 'stage' ? targetValue : item.stageId,
              type: targetProperty === 'recordType' ? targetValue : item.type,
              properties: targetEntity !== 'Record' ? updateObject(
                item.properties,
                { [targetProperty]: targetValue },
              ) : item.properties,
              associations: item.associations ? [
                ...item.associations,
                ...association ? [ association ] : [],
              ] : [],
            });
          });
        }
      } else {
        // No modified values exist, add the first item
        return {
          ...state,
          recordType,
          modified: [
            {
              entity: targetEntity,
              schemaId: targetSchemaId,
              type: targetProperty === 'type' ? targetValue : undefined,
              title: targetProperty === 'title' ? targetValue : targetRecord ? targetRecord.title : undefined,
              ownerId: targetProperty === 'ownerId' ? targetValue : undefined,
              stageId: targetProperty === 'stage' ? targetValue : undefined,
              properties: targetEntity !== 'Record' ? { [targetProperty]: targetValue } : {},
              associations: association ? [ association ] : [],
            },
          ],
        }
      }

      return {
        ...state,
        recordType,
        modified: newModified,
      }
    }

    case ADD_ASSOCIATION_TO_FORM_SECTION: {
      const targetIdSplit = action.params.targetId.split('_');
      const targetSchemaId = targetIdSplit[0];
      const targetProperty = targetIdSplit[1];
      const association = action.params.association;


      if(arrayHasValues(state.modified)) {
        // Add the item to the array of existing modified values
        return {
          ...state,
          modified: [
            ...state.modified, ...[
              {
                associations: itemExistsInArrayOfObjects(
                  state.modified,
                  targetSchemaId,
                  targetProperty,
                ) ? updateDbRecordCreatePropertiesInArray(
                  state.modified,
                  targetSchemaId,
                  (item: any) => {
                    console.log('item', item);
                    return updateObject(item, {
                      associations: [ ...item.associations, association ],
                    })
                  },
                ) : [ association ],
              },
            ],
          ],
        }
      } else {
        // No modified values exist, add the first item
        return {
          ...state,
          modified: [
            {
              schemaId: targetSchemaId,
              associations: [ association ],
            },
          ],
        }
      }

      return {
        ...state,
      }
    }

    default:
      return state;
  }
}

export default reducer;

