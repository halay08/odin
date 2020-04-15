import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import RecordMainContent from '../../core/records/components/DetailView/RecordMainContent';
import { IRecordReducer } from '../../core/records/store/reducer';
import { SchemaReducerState } from '../../core/schemas/store/reducer';
import { getAllSchemaAssociationSchemas, getRecordFromShortListById } from '../../shared/utilities/recordHelpers';
import { getSchemaFromShortListBySchemaId } from '../../shared/utilities/schemaHelpers';

type PathParams = {
  url: string,
  recordId: string
}

type PropsType = RouteComponentProps<PathParams> & {
  match?: any,
  recordReducer: IRecordReducer,
  schemaReducer: SchemaReducerState,
  disableClone?: boolean,
  disableEdit?: boolean,
  disableDelete?: boolean,
  excludeRelations?: string[],
}

const { NOTE } = SchemaModuleEntityTypeEnums;

class DefaultRecordDetail extends React.Component<PropsType> {
  render() {
    const { schemaReducer, recordReducer, match, excludeRelations, disableClone, disableEdit, disableDelete } = this.props;
    const record = getRecordFromShortListById(recordReducer.shortList, match?.params?.recordId);
    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record?.schemaId);
    const relatedSchemas = getAllSchemaAssociationSchemas(
      schema?.associations,
      excludeRelations ? [ NOTE, ...excludeRelations ] : [ NOTE ],
    );

    return (<RecordMainContent
      disableClone={disableClone}
      disableEdit={disableEdit}
      disableDelete={disableDelete}
      record={record}
      schema={schema}
      relatedSchemas={relatedSchemas}/>)
  }
}

const mapState = (state: any) => ({
  schemaReducer: state.schemaReducer,
  recordReducer: state.recordReducer,
});

const mapDispatch = (dispatch: any) => ({});

export default withRouter(connect(mapState, mapDispatch)(DefaultRecordDetail));
