import { Drawer } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import RecordPreview from '../../../../containers/DefaultViews/RecordPreview';
import {getAllSchemaAssociationSchemas, getRecordFromShortListById} from '../../../../shared/utilities/recordHelpers';
import { setDbRecordState } from '../../store/actions';
import { IRecordReducer } from '../../store/reducer';
import {getSchemaFromShortListBySchemaId} from "../../../../shared/utilities/schemaHelpers";
import {SchemaModuleEntityTypeEnums} from "@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types";
import {SchemaReducerState} from "../../../schemas/store/reducer";

interface Props {
  recordReducer: IRecordReducer,
  modifyState: any,
  schemaReducer: SchemaReducerState,
  excludeRelations?: string[],
}

const { NOTE } = SchemaModuleEntityTypeEnums;

class RecordQuickView extends React.Component<Props> {
  state = { visible: false };

  onClose = () => {
    const { modifyState } = this.props;
    modifyState({ showPreview: false, currentRecordId: '' });
  };

  render() {
    const { schemaReducer, recordReducer, excludeRelations } = this.props;

    const record = getRecordFromShortListById(recordReducer.shortList, recordReducer.currentRecordId);
    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record?.schemaId);
    const relatedSchemas = getAllSchemaAssociationSchemas(
      schema?.associations,
      excludeRelations ? [ NOTE, ...excludeRelations ] : [ NOTE ],
    );

    return (
      <>
        <Drawer
          width={900}
          onClose={this.onClose}
          visible={recordReducer.showPreview}
          bodyStyle={{ paddingBottom: 80, paddingLeft: 0, paddingRight: 0, paddingTop: 8, background: '#f1f3f7' }}
        >
          <RecordPreview
            relatedSchemas={relatedSchemas}
            schema={schema}
            record={record}
          />
        </Drawer>
      </>
    );
  }
}


const mapState = (state: any) => ({
  recordReducer: state.recordReducer,
});

const mapDispatch = (dispatch: any) => ({
  modifyState: (params: any) => dispatch(setDbRecordState(params)),
});

export default connect(mapState, mapDispatch)(RecordQuickView);
