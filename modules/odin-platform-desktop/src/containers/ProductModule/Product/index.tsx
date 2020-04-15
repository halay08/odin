import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { Col, Layout, Row } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ActivityFeed from '../../../core/records/components/ActivityFeed';
import DetailPanelLeft from '../../../core/records/components/DetailPanelLeft';
import RecordProperties from '../../../core/records/components/DetailView/RecordProperties';
import Pipeline from '../../../core/records/components/Pipeline/Pipeline';
import { IRecordReducer } from '../../../core/records/store/reducer';
import AssociationDataTable from '../../../core/recordsAssociations/components/AssociationDataTable/DataTable';
import { IRecordAssociationsReducer } from '../../../core/recordsAssociations/store/reducer';
import { SchemaReducerState } from '../../../core/schemas/store/reducer';
import CardWithTabs from '../../../shared/components/CardWithTabs';
import {
  getAllSchemaAssociationSchemas,
  getRecordFromShortListById,
  getRecordRelatedFromShortListById,
} from '../../../shared/utilities/recordHelpers';
import { getSchemaFromShortListBySchemaId } from '../../../shared/utilities/schemaHelpers';


type PathParams = {

  recordId: string

}

type PropsType = RouteComponentProps<PathParams> & {

  match: any
  recordReducer: IRecordReducer,
  schemaReducer: SchemaReducerState,
  recordAssociationReducer: IRecordAssociationsReducer,
  hasColumnMappings?: boolean
  excludeRelations?: string[]
  visibleProperties?: string[]

}

const { NOTE } = SchemaModuleEntityTypeEnums;

class ProductDetailView extends React.Component<PropsType> {

  renderDynamicAssociations(record: DbRecordEntityTransform, relatedSchemas: SchemaEntity[]) {
    const obj = {};
    for(const schema of relatedSchemas) {
      // @ts-ignore
      obj[schema.entityName] =
        <AssociationDataTable
          title={schema.entityName}
          record={record}
          moduleName={schema.moduleName}
          entityName={schema.entityName}/>;
    }

    return obj;
  }


  render() {

    const { recordAssociationReducer, schemaReducer, hasColumnMappings, recordReducer, match, visibleProperties, excludeRelations } = this.props;

    let record;

    if(hasColumnMappings) {
      record = getRecordRelatedFromShortListById(
        recordAssociationReducer.shortList,
        match.params.dbRecordAssociationId,
        match.params.recordId,
      );
    } else {
      record = getRecordFromShortListById(recordReducer.shortList, match.params.recordId);
    }

    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record?.schemaId);
    const relatedSchemas = getAllSchemaAssociationSchemas(
      schema?.associations,
      excludeRelations ? [ NOTE, ...excludeRelations ] : [ NOTE ],
    );

    console.log('record', record);

    return (<Layout className='record-detail-view'>
      <Row gutter={{ xs: 8, sm: 14, md: 14, lg: 14 }}>

        <Col xs={24} sm={24} md={24} lg={6}>
          <div className="record-detail-left-panel">
            <DetailPanelLeft
              hasColumnMappings={hasColumnMappings}
              visibleProperties={visibleProperties}
              record={record}>
              <RecordProperties columns={2} columnLayout="vertical" record={record}/>
            </DetailPanelLeft>
          </div>
        </Col>

        <Col xs={24} sm={24} md={24} lg={18}>
          <div className="record-detail-left-panel">
            {record?.stage &&
            <Pipeline className="record-pipeline" record={record}/>
            }

            <CardWithTabs
              title="Options"
              defaultTabKey=""
              tabList={[
                ...relatedSchemas.map((elem: SchemaEntity) => ({
                  key: elem.entityName,
                  tab: elem.entityName,
                })),
                {
                  key: 'Activity',
                  tab: 'Activity',
                },
              ]}
              contentList={{
                ...this.renderDynamicAssociations(record, relatedSchemas),
                Activity: <ActivityFeed/>,
              }}
            />
          </div>
        </Col>
      </Row>
    </Layout>)
  }
}

const mapState = (state: any) => ({
  schemaReducer: state.schemaReducer,
  recordReducer: state.recordReducer,
  recordAssociationReducer: state.recordAssociationReducer,
});


export default withRouter(connect(mapState)(ProductDetailView));
