import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { Col, Layout, Row } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import CardWithTabs from '../../../../shared/components/CardWithTabs';
import AssociationDataTable from '../../../recordsAssociations/components/AssociationDataTable/DataTable';
import ActivityFeed from '../ActivityFeed';
import DetailPanelLeft from '../DetailPanelLeft';
import NoteForm from '../Note/NoteForm';
import Pipeline from '../Pipeline/Pipeline';
import RecordProperties from './RecordProperties';

interface Props {
  record: DbRecordEntityTransform,
  schema?: SchemaEntity,
  relatedSchemas: SchemaEntity[],
  hasColumnMappings?: boolean,
  disableClone?: boolean,
  disableEdit?: boolean,
  disableDelete?: boolean,
  visibleProperties?: string[]
}

class RecordMainContent extends React.Component<Props> {

  renderDynamicAssociations() {
    const { record, relatedSchemas } = this.props;

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
    const { record, hasColumnMappings, relatedSchemas, visibleProperties } = this.props;

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

        <Col xs={24} sm={24} md={24} lg={12}>
          <div className="record-detail-left-panel">
            {record?.stage &&
            <Pipeline className="record-pipeline" record={record}/>
            }

            <CardWithTabs
              title="Options"
              defaultTabKey=""
              tabList={[
                ...relatedSchemas.map(elem => ({
                  key: elem.entityName,
                  tab: elem.entityName,
                })),
              ]}
              contentList={{
                ...this.renderDynamicAssociations(),
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
  schemaReducer: state.schemaReducer,
});


export default connect(mapState)(RecordMainContent);
