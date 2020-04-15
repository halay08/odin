import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { Col, Layout, Row } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ActivityFeed from '../../../../../core/records/components/ActivityFeed';
import DetailPanelLeft from '../../../../../core/records/components/DetailPanelLeft';
import RecordProperties from '../../../../../core/records/components/DetailView/RecordProperties';
import NoteForm from '../../../../../core/records/components/Note/NoteForm';
import { IRecordReducer } from '../../../../../core/records/store/reducer';
import AssociationDataTable from '../../../../../core/recordsAssociations/components/AssociationDataTable/DataTable';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import CardWithTabs from '../../../../../shared/components/CardWithTabs';
import {
  getAllSchemaAssociationSchemas,
  getRecordFromShortListById,
} from '../../../../../shared/utilities/recordHelpers';
import { getSchemaFromShortListBySchemaId } from '../../../../../shared/utilities/schemaHelpers';

type PathParams = {
  url: string,
  recordId: string
}

type PropsType = RouteComponentProps<PathParams> & {
  schemaReducer: SchemaReducerState,
  recordReducer: IRecordReducer,
  match: any
}

const { NOTE } = SchemaModuleEntityTypeEnums;

class FileDetailView extends React.Component<PropsType> {


  render() {
    const { recordReducer, schemaReducer, match } = this.props;
    const record = getRecordFromShortListById(recordReducer.shortList, match.params.recordId);
    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record?.schemaId);
    const relatedSchemas = getAllSchemaAssociationSchemas(schema?.associations, [ NOTE ]);

    return (<Layout className='record-detail-view'>
      <Row gutter={{ xs: 8, sm: 14, md: 14, lg: 14 }}>
        <Col xs={24} sm={24} md={24} lg={6}>
          <div className="record-detail-left-panel">
            <DetailPanelLeft record={record}>
              <RecordProperties columns={2} columnLayout="vertical" record={record}/>
            </DetailPanelLeft>
          </div>
        </Col>

        <Col xs={24} sm={24} md={24} lg={12}>
          <div className="record-detail-left-panel">
            <CardWithTabs
              title="Options"
              defaultTabKey="File"
              tabList={[
                {
                  key: 'File',
                  tab: 'File',
                },
                {
                  key: 'Related',
                  tab: 'Related',
                },
              ]}
              contentList={{
                File: <img style={{
                  width: 1000,
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: '50% 50%',
                }}
                           src={getProperty(record, 'Url')}/>,
                Related:
                  <div>
                    {relatedSchemas.map((schema: SchemaEntity) => (
                      <AssociationDataTable
                        title={schema.entityName}
                        record={record}
                        moduleName={schema.moduleName}
                        entityName={schema.entityName}/>
                    ))}
                  </div>,
              }}
            />
          </div>
        </Col>

        <Col xs={24} sm={24} md={24} lg={6}>
          <div className="record-detail-right-panel">
            <CardWithTabs
              title="Updates"
              defaultTabKey="Notes"
              tabList={[
                {
                  key: 'Notes',
                  tab: 'Notes',
                },
                {
                  key: 'Activity',
                  tab: 'Activity',
                },
              ]}
              contentList={{
                Notes: <NoteForm record={record}/>,
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
  recordReducer: state.recordReducer,
  schemaReducer: state.schemaReducer,
});


export default withRouter(connect(mapState)(FileDetailView));
