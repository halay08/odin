import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { Card, Col, Empty, Layout, Row } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import RecordProperties from '../../core/records/components/DetailView/RecordProperties';
import NoteForm from '../../core/records/components/Note/NoteForm';
import RecordPageHeader from '../../core/records/components/PageHeader';
import Pipeline from '../../core/records/components/Pipeline/Pipeline';
import {addRecordToShortList, IAddRecordToShortList} from "../../core/records/store/actions";
import CardWithTabs from "../../shared/components/CardWithTabs";
import {SchemaEntity} from "@d19n/models/dist/schema-manager/schema/schema.entity";
import AssociationDataTable from "../../core/recordsAssociations/components/AssociationDataTable/DataTable";

interface Props {
  record: DbRecordEntityTransform | undefined,
  schema?: SchemaEntity,
  relatedSchemas: SchemaEntity[],
  shortListRecord: any,
}

class RecordPreview extends React.Component<Props> {

  renderImage() {
    const { record } = this.props;
    if(record) {
      return <img style={{
        width: 700,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '50% 50%',
      }} src={getProperty(record, 'Url')}/>;
    }
  }

  handleClose = () => {
    const { shortListRecord } = this.props;
    shortListRecord({ showPreview: false })
  }

  renderDynamicAssociations() {
    const { record, relatedSchemas } = this.props;

    const obj = {};
    if (record && relatedSchemas) {
      for(const schema of relatedSchemas) {
        // @ts-ignore
        obj[schema.entityName] =
          <AssociationDataTable
            title={schema.entityName}
            record={record}
            moduleName={schema.moduleName}
            entityName={schema.entityName}
          />;
      }
    }

    return obj;
  }

  render() {
    const { record, relatedSchemas } = this.props;

    return (
      record ?
        <Layout className='record-detail-view'>
          <div style={{ height: 35, paddingLeft: 8 }}>
            <Link
              to={`/${record.entity.split(':')[0]}/${record.entity.split(':')[1]}/${record.id}`}
              onClick={this.handleClose}
            >
              Full view
            </Link>
          </div>
          <RecordPageHeader record={record}/>
          <Card style={{ marginBottom: 10 }}>
            <RecordProperties columns={3} record={record}/>
          </Card>
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
          <Row gutter={8} className="record-main-content-row">
            {record?.entity?.split(':')[1] === 'File' &&
            <Col span={24}>
                <div style={{ marginBottom: 24 }}>
                  {this.renderImage()}
                </div>
            </Col>
            }
            <Col span={24}>
              <Card title="Notes">
                <NoteForm record={record}/>
              </Card>
            </Col>
          </Row>
        </Layout> : (<Empty/>))
  }
}

const mapState = (state: any) => ({
  recordReducer: state.recordReducer,
});

const mapDispatch = (dispatch: any) => ({
  shortListRecord: (params: IAddRecordToShortList) => dispatch(addRecordToShortList(params)),
});

export default connect(mapState, mapDispatch)(RecordPreview);
