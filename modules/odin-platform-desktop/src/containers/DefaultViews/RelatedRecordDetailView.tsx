import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import RecordMainContent from '../../core/records/components/DetailView/RecordMainContent';
import { IRecordAssociationsReducer } from '../../core/recordsAssociations/store/reducer';
import { SchemaReducerState } from '../../core/schemas/store/reducer';
import {
  getAllSchemaAssociationSchemas,
  getRecordRelatedFromShortListById,
} from '../../shared/utilities/recordHelpers';
import { getSchemaFromShortListBySchemaId } from '../../shared/utilities/schemaHelpers';


type PathParams = {
  url: string,
  recordId: string
}

type PropsType = RouteComponentProps<PathParams> & {
  recordAssociationReducer: IRecordAssociationsReducer,
  schemaReducer: SchemaReducerState,
  match: any
  excludeRelations: string[],
  visibleProperties?: string[]
}

const { NOTE } = SchemaModuleEntityTypeEnums;

class RelatedRecordDetailView extends React.Component<PropsType> {
  render() {
    const { schemaReducer, recordAssociationReducer, match, excludeRelations, visibleProperties } = this.props;
    const record = getRecordRelatedFromShortListById(
      recordAssociationReducer.shortList,
      match.params.dbRecordAssociationId,
      match.params.recordId,
    );
    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record?.schemaId);
    const relatedSchemas = getAllSchemaAssociationSchemas(schema?.associations, [ NOTE, ...excludeRelations ]);

    return (
      <RecordMainContent
        hasColumnMappings
        visibleProperties={visibleProperties}
        disableDelete
        disableClone
        record={record}
        schema={schema}
        relatedSchemas={relatedSchemas}
      />)
  }
}

const mapState = (state: any) => ({
  schemaReducer: state.schemaReducer,
  recordAssociationReducer: state.recordAssociationReducer,
});


export default withRouter(connect(mapState)(RelatedRecordDetailView));
