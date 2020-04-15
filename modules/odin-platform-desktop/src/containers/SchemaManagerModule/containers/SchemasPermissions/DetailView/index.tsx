import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { Button, Col, Layout, Row, Space, Table } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import {
  batchCreatePermissionsBySchemaId,
  batchDeletePermissionsBySchemaId,
} from '../../../../../core/schemas/store/actions';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';

interface Props {

  schema: SchemaEntity | undefined;
  schemaReducer: SchemaReducerState;
  batchCreate: any,
  batchDelete: any

}

interface State {

}

class SchemasPermissions extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
  }

  batchCreatePermissions = () => {
    const { batchCreate, schema } = this.props;

    if(schema) {
      batchCreate({ schemaId: schema.id }, (result: any) => {
        // Fetch new schema from API
      })
    }

  }

  batchDeletePermissions = () => {
    const { batchDelete, schema } = this.props;
    if(schema) {
      batchDelete({ schemaId: schema.id }, (result: any) => {
        // Fetch new schema from API
      })
    }
  }

  render() {

    const { schema, schemaReducer } = this.props;

    const formsTableColumns = [
      { title: 'Name', dataIndex: 'name' },
      { title: 'Description', dataIndex: 'description' },
    ];

    return (
      <Layout className="record-detail-view">
        <Row>
          <Space>
            <h2>Schema Permissions</h2>
          </Space>
          {
            schema?.permissions?.length === 0 ?
              <Button
                key="1"
                style={{ marginLeft: 'auto' }}
                type="primary"
                onClick={() => this.batchCreatePermissions()}
                loading={schemaReducer.isRequesting}
              >
                Enable access control
              </Button> :
              <Button
                key="1"
                style={{ marginLeft: 'auto' }}
                type="primary"
                onClick={() => this.batchDeletePermissions()}
                loading={schemaReducer.isRequesting}>
                Disable access control
              </Button>
          }

          <Col span={24}>
            <Table
              size="small"
              loading={schemaReducer.isRequesting}
              dataSource={schema?.permissions}
              columns={formsTableColumns}
            />
          </Col>
        </Row>
      </Layout>
    );
  }
}

const mapState = (state: any) => ({

  schemaReducer: state.schemaReducer,
});

const mapDispatch = (dispatch: any) => ({
  batchCreate: (params: any, cb: any) => dispatch(batchCreatePermissionsBySchemaId(params, cb)),
  batchDelete: (params: any, cb: any) => dispatch(batchDeletePermissionsBySchemaId(params, cb)),
});

export default connect(mapState, mapDispatch)(SchemasPermissions);
