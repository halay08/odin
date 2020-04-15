import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { Button, Col, Form, Popconfirm, Row, Select, Spin } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
  createRecordsRequest,
  deleteRecordByIdRequest,
  ISearchRecords,
  searchRecordsRequest,
} from '../../../../../../core/records/store/actions';
import { IRecordReducer } from '../../../../../../core/records/store/reducer';
import {
  getRecordAssociationsRequest,
  ICreateOrUpdateRecordAssociation,
  IGetRecordAssociations,
  updateOrCreateRecordAssociations,
} from '../../../../../../core/recordsAssociations/store/actions';
import { IRecordAssociationsReducer } from '../../../../../../core/recordsAssociations/store/reducer';
import {
  getSchemaByModuleAndEntityRequest,
  ISchemaByModuleAndEntity,
} from '../../../../../../core/schemas/store/actions';
import { SchemaReducerState } from '../../../../../../core/schemas/store/reducer';
import { httpGet } from '../../../../../../shared/http/requests';
import {
  getSchemaFromShortListByModuleAndEntity,
  getSchemaFromShortListBySchemaId,
} from '../../../../../../shared/utilities/schemaHelpers';

const { Option } = Select;

type PathParams = {
  url: string,
  recordId: string
}

type PropsType = RouteComponentProps<PathParams> & {

  record: DbRecordEntityTransform,
  recordReducer: IRecordReducer,
  schemaReducer: SchemaReducerState,
  recordAssociationReducer: IRecordAssociationsReducer,
  searchRecords: (params: any) => void,
  getSchema: (params: any, cb: any) => void,
  getAssociations: (params: IGetRecordAssociations, cb: any) => void,
  createAssociation: (params: ICreateOrUpdateRecordAssociation, cb: any) => void,
  createRecord: (params: any, cb: any) => void,
  deleteRecord: (params: any, cb: any) => void

}


interface State {

  isLoading: boolean,
  cables: any[],
  configurations: any[],

}


class ClosureCableConfigurator extends React.Component<PropsType, State> {

  constructor(props: PropsType) {
    super(props);

    this.state = {

      isLoading: false,
      cables: [],
      configurations: [],

    }

  }

  componentDidMount() {

    this.fetchData();

  }


  componentDidUpdate(prevProps: Readonly<PropsType>, prevState: Readonly<State>, snapshot?: any) {

    if(prevProps.record !== this.props.record) {

      this.fetchData();

    }

  }

  fetchData() {

    this.fetchPorts();
    this.fetchConnections();
    this.fetchCables();
    this.fetchModels();

  }

  fetchConnections() {

    const { record, schemaReducer, getAssociations } = this.props;

    const moduleName = 'ProjectModule';
    const entityName = 'FeatureConnection';
    const schemaType = 'CABLE';

    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

    if(schema && record) {

      getAssociations({
        recordId: record?.id,
        key: `${entityName}_${schemaType}`,
        schema,
        entities: [ entityName ],
        filters: [ `SchemaType:${schemaType}` ],
      }, () => {

        this.initializePorts()

      });

    }
  }


  initializePorts() {

    const { record } = this.props;

    const configurations = [];

    const connections = this.getRelatedListData(record?.id, 'FeatureConnection', 'CABLE');

    if(connections) {
      for(const connection of connections) {

        configurations.push(
          {
            rowId: uuidv4(),
            connectionId: connection.id,
            portId: getProperty(connection, 'PortId'),
            sealModelId: getProperty(connection, 'SealModelId'),
            sealId: getProperty(connection, 'SealId'),
            cableId: getProperty(connection, 'CableId'),
            direction: getProperty(connection, 'Direction'),
            isLoop: getProperty(connection, 'IsLoop'),
            modified: false,
          });
      }
    }

    this.setState({
      configurations,
    })
  }

  fetchPorts() {

    const { record, schemaReducer, getAssociations } = this.props;

    const moduleName = 'ProjectModule';
    const entityName = 'FeatureComponent';
    const schemaType = 'CLOSURE_PORT';

    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

    if(schema && record) {

      getAssociations({
        recordId: record?.id,
        key: `${entityName}_${schemaType}`,
        schema,
        entities: [ entityName ],
        filters: [ `SchemaType:${schemaType}` ],
      }, () => {

        this.initializePorts()

      });

    }

  }

  fetchRelatedRecords(recordId: string, moduleName: string, entityName: string, schemaType: string) {

    const { schemaReducer, getAssociations } = this.props;

    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

    if(schema && moduleName && entityName && schemaType) {

      getAssociations({
        recordId: recordId,
        key: `${entityName}_${schemaType}`,
        schema,
        entities: [ entityName ],
        filters: [ `SchemaType:${schemaType}` ],
      }, () => {
        // this.initializePorts()
      });

    }

  }


  fetchPortSealComponent(recordId: string) {

    const { schemaReducer, getAssociations } = this.props;

    const moduleName = 'ProjectModule';
    const entityName = 'FeatureComponent';
    const schemaType = 'PORT_SEAL';

    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

    if(schema) {

      getAssociations({
        recordId: recordId,
        key: `${entityName}_${schemaType}`,
        schema,
        entities: [ entityName ],
        filters: [ `SchemaType:${schemaType}` ],
      }, () => {
        // this.initializePorts()
      });

    }

  }

  fetchModels() {
    const { record, schemaReducer, searchRecords, getSchema } = this.props;

    const moduleName = 'ProjectModule';
    const entityName = 'FeatureModel';
    const schemaType = 'SEAL';

    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

    if(schema && record) {

      searchRecords({
        listKey: `${record?.id}_${entityName}_${schemaType}`,
        schema: schema,
        searchQuery: {
          terms: 'SEAL',
          fields: [ 'type' ],
          schemas: schema.id,
          sort: [],
          boolean: [],
        },
      });

    } else {

      getSchema({ moduleName, entityName }, (result: SchemaEntity) => {
        searchRecords({
          listKey: `${record?.id}_${entityName}_${schemaType}`,
          schema: schema,
          searchQuery: {
            terms: 'SEAL',
            fields: [ 'type' ],
            schemas: result.id,
            sort: [],
            boolean: [],
          },
        });
      });

    }
  }

  async fetchCables() {

    const { record } = this.props;

    if(record) {

      await httpGet(
        `ProjectModule/v1.0/ftth/closures/cables/${getProperty(record, 'ExternalRef')}`,
      ).then(res => {
          this.setState({ cables: res.data.data, isLoading: false })
        },
      ).catch(err => {
        console.error('Error while fetching: ', err);
        this.setState({ isLoading: false });
      });

    }
  }

  cableInUse(key: string, value: any) {

    const { configurations } = this.state;

    return !configurations.find(elem => elem[key] === value);

  }


  getRelatedListData(recordId: string, entityName: string, schemaType: string) {

    const { recordAssociationReducer } = this.props;

    const associationKey = `${recordId}_${entityName}_${schemaType}`;
    const associationObj: any = recordAssociationReducer.shortList[associationKey];

    if(associationObj && associationObj[entityName] && associationObj[entityName].dbRecords) {

      return associationObj[entityName].dbRecords;

    } else {

      return []

    }
  }


  getRecordListData(recordId: string, entityName: string, schemaType: string) {

    const { recordReducer } = this.props;

    const listKey = `${recordId}_${entityName}_${schemaType}`;
    const data: any = recordReducer.list[listKey];

    if(data) {

      return data;

    } else {

      return []

    }
  }

  addRow() {
    const emptyRow = {
      rowId: uuidv4(),
      connectionId: null,
      portId: null,
      sealModelId: null,
      sealId: null,
      cableId: null,
      direction: null,
      isLoop: false,
      modified: false,
    }

    this.setState({
      configurations: [ emptyRow, ...this.state.configurations ],
    })
  }

  removeRow(rowId: string) {

    this.setState((prevState) => ({
      configurations: prevState.configurations.filter(row => row.rowId !== rowId),
    }))

  }

  deleteConnection(connectionId: string) {

    const { deleteRecord, schemaReducer } = this.props;

    const moduleName = 'ProjectModule';
    const entityName = 'FeatureConnection';

    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

    if(connectionId) {

      deleteRecord({
        schema: schema,
        recordId: connectionId,
      }, () => {

        const modified = this.state.configurations.filter(row => row.connectionId !== connectionId);

        this.setState({
          configurations: modified,
        })

      });

    } else {

      const modified = this.state.configurations.filter(row => row.connectionId !== connectionId);

      this.setState({
        configurations: modified,
      })

    }

  }

  handleInputChange(evt: any) {

    const rowId = evt.id.split('_')[0];
    const key = evt.id.split('_')[1];
    const value = evt.value;

    console.log('key', key)

    if(key === 'sealModelId') {
      // if sealModelId we want to create an association between the port and seal model
      const row = this.state.configurations.find(elem => elem.rowId === rowId);
      console.log('row', row);
      this.createAssociation(row.portId, value);

    }

    const modified = this.state.configurations.map(row => {

      if(row.rowId === rowId) {

        return Object.assign({}, row, { [key]: value, modified: true })

      } else {

        return row;

      }

    });

    this.setState({
      configurations: modified,
    })

  }


  createAssociation(owningRecordId: string, sourceRecordId: string) {

    const { schemaReducer, createAssociation } = this.props;

    const moduleName = 'ProjectModule';
    const entityName = 'FeatureComponent';

    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

    console.log('schema', schema)

    const modelAssociation = schema?.associations?.find(elem => elem?.childSchema?.entityName === 'FeatureModel');

    console.log('CREATE_ASSOCITATION', schema?.id, modelAssociation?.id)

    if(schema && modelAssociation) {

      createAssociation({
        recordId: owningRecordId,
        schema: schema,
        schemaAssociation: modelAssociation,
        createUpdate: [
          {
            recordId: sourceRecordId,
          },
        ],
      }, () => {

      })

    }
  }

  saveConfiguration() {

    const { record, createRecord, getSchema } = this.props;
    const { configurations } = this.state;
    // create a connection
    // unique on closureid and portid
    // add  all associations

    const moduleName = 'ProjectModule'
    const entityName = 'FeatureConnection'

    const modified = configurations.filter(config => config.modified);

    const creates: DbRecordCreateUpdateDto[] = [];

    for(const row of modified) {

      const create = {
        entity: `${moduleName}:${entityName}`,
        type: 'CABLE',
        properties: {
          Direction: row.direction,
          IsLoop: row.isLoop,
          ClosureId: record?.id,
          PortId: row.portId,
          SealModelId: row.sealModelId,
          SealId: row.sealId,
          CableId: row.cableId,
        },
        associations: [
          {
            recordId: record?.id,
          },
          {
            recordId: row.portId,
          },
          {
            recordId: row.sealModelId,
          },
          {
            recordId: row.sealId,
          },
          {
            recordId: row.cableId,
          },
        ],
      }

      creates.push(create);

    }

    if(creates.length > 0) {
      // create records

      console.log('creates', creates);

      getSchema({ moduleName, entityName }, (result: SchemaEntity) => {
        createRecord({
          schema: result,
          createUpdate: creates,
        }, (res: DbRecordEntityTransform) => {
          // reload data

          this.fetchData();
          console.log('created records')

        });
      });
    }

  }


  renderRow(config: any) {

    const { record, recordAssociationReducer } = this.props;
    const { cables } = this.state;

    return (
      <Row wrap={false}>
        <Col span={3}>
          <Form.Item
            className="cable-form-select"
            key={config.rowId}
            name={'portId'}
            label={'Port'}
            labelCol={{ span: 24 }}
            initialValue={config.portId}
            rules={[ { required: true } ]}
          >
            <Select
              disabled={config.connectionId}
              className="cable-form-select"
              onChange={(val) => this.handleInputChange({
                id: `${config.rowId}_portId`,
                value: val,
              })}
            >
              <Option value="">Select Port</Option>

              {this.getRelatedListData(
                record?.id,
                'FeatureComponent',
                'CLOSURE_PORT',
              ).map((elem: DbRecordEntityTransform) => (
                <Option value={elem.id}>{getProperty(elem, 'PortNumber')}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={3}>
          <Form.Item
            className="cable-form-select"
            key={config.rowId}
            name={'sealModelId'}
            label={'Seal Model'}
            labelCol={{ span: 24 }}
            initialValue={config.sealModelId}
            rules={[ { required: true } ]}
          >
            <Select
              disabled={config.connectionId}
              loading={recordAssociationReducer.isRequesting}
              className="cable-form-select"
              onChange={(val) => this.handleInputChange({
                id: `${config.rowId}_sealModelId`,
                value: val,
              })}
            >
              <Option value="">Select Seal Model</Option>
              {this.getRecordListData(record?.id, 'FeatureModel', 'SEAL').map((elem: DbRecordEntityTransform) => (
                <Option value={elem.id}>{elem.title}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={3}>
          <Form.Item
            className="cable-form-select"
            key={config.rowId}
            name={'sealId'}
            label={'Port Seal'}
            labelCol={{ span: 24 }}
            initialValue={config.sealId}
            rules={[ { required: true } ]}
          >
            <Select
              className="cable-form-select"
              disabled={config.connectionId}
              loading={recordAssociationReducer.isRequesting}
              onChange={(val) => this.handleInputChange({
                id: `${config.rowId}_sealId`,
                value: val,
              })}
              onClick={() => this.fetchPortSealComponent(config.portId)}
            >
              <Option value="">Select Port Seal</Option>
              {this.getRelatedListData(
                config.portId,
                'FeatureComponent',
                'PORT_SEAL',
              ).map((elem: DbRecordEntityTransform) => (
                <Option value={elem.id}>{getProperty(elem, 'InterfaceNumber')}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={3}>
          <Form.Item
            className="cable-form-select"
            key={config.rowId}
            name={'cableId'}
            label={'Cable'}
            labelCol={{ span: 24 }}
            initialValue={config.cableId}
            rules={[ { required: true } ]}
          >
            <Select
              className="cable-form-select"
              disabled={config.connectionId}
              onChange={(val) => this.handleInputChange({
                id: `${config.rowId}_cableId`,
                value: val,
              })}
            >
              <Option value="">Select Cable</Option>
              {cables.map((elem: DbRecordEntityTransform) => (
                <Option disabled={!this.cableInUse('cableId', elem.id)} value={elem.id}>{getProperty(
                  elem,
                  'ExternalRef',
                )}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={3}>
          <Form.Item
            className="cable-form-select"
            key={config.rowId}
            name={'direction'}
            label={'Direction'}
            labelCol={{ span: 24 }}
            initialValue={config.direction}
            rules={[ { required: true } ]}
          >
            <Select
              className="cable-form-select"
              disabled={config.connectionId}
              onChange={(val) => this.handleInputChange({
                id: `${config.rowId}_direction`,
                value: val,
              })}
            >
              <Option value="">Select Direction</Option>
              <Option value="IN">In</Option>
              <Option value="OUT">Out</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={3}>
          <Form.Item
            className="cable-form-select"
            key={config.rowId}
            name={'isLoop'}
            label={'Is Loop'}
            labelCol={{ span: 24 }}
            initialValue={config.isLoop}
            rules={[ { required: true } ]}
          >
            <Select
              className="cable-form-select"
              disabled={config.connectionId}
              onChange={(val) => this.handleInputChange({
                id: `${config.rowId}_is_loop`,
                value: val,
              })}
            >
              <Option value="">Select Is Loop</Option>
              <Option value="true">True</Option>
              <Option value="false">False</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={1} offset={1}>
          <Form.Item
            className="cable-form-item"
            key={config.rowId}
            name={'action'}
            labelCol={{ span: 24 }}
            initialValue={''}
          >
            <div style={{ height: 30 }}></div>

            <Popconfirm
              title="Are you sure to delete this connection?"
              onConfirm={() => this.deleteConnection(config.connectionId)}
              onCancel={() => {
              }}
              okText="Yes"
              cancelText="No"
            >
              <MinusCircleOutlined
                className="row-delete-btn"
                disabled={!config.connectionId}/>
            </Popconfirm>
            {/*<Button*/}
            {/*  icon={<DeleteOutlined/>}*/}
            {/*  danger*/}
            {/*  onClick={() => this.deleteConnection(config.rowId)}/>*/}
          </Form.Item>
        </Col>
      </Row>
    )
  }

  render() {

    const {
      record,
      schemaReducer,
      recordReducer,
      recordAssociationReducer,
    } = this.props;

    const { configurations } = this.state;

    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record?.schemaId);

    console.log('configurations', configurations);

    return (
      <div className="cable-configurator">

        <div className="cable-btn-wrapper">
          <Form.Item>
            <Button icon={<PlusOutlined/>} type="dashed" className="cable-add-btn" onClick={() => this.addRow()} block>
              Add cable
            </Button>
          </Form.Item>
          <Form.Item>
            <Button type="primary" className="cable-save-btn" onClick={() => this.saveConfiguration()} block>
              Save Changes
            </Button>
          </Form.Item>
        </div>

        {recordReducer.isDeleting || recordReducer.isRequesting ?
          <Spin tip="Preparing configurator...">
            <div style={{ height: 500, width: '100%' }}/>
          </Spin>
          :
          configurations.map((field: any) => (
            <Form key={field.rowId}>
              {this.renderRow(field)}
            </Form>
          ))
        }
      </div>
    )
  }
}

const mapState = (state: any) => ({
  schemaReducer: state.schemaReducer,
  recordReducer: state.recordReducer,
  recordAssociationReducer: state.recordAssociationReducer,
});

const mapDispatch = (dispatch: any) => ({

  getSchema: (payload: ISchemaByModuleAndEntity, cb: any) => dispatch(getSchemaByModuleAndEntityRequest(payload, cb)),
  getAssociations: (params: IGetRecordAssociations, cb: any) => dispatch(getRecordAssociationsRequest(params, cb)),
  searchRecords: (params: ISearchRecords) => dispatch(searchRecordsRequest(params)),
  createAssociation: (params: ICreateOrUpdateRecordAssociation, cb: any) => dispatch(updateOrCreateRecordAssociations(
    params)),
  createRecord: (params: any, cb: any) => dispatch(createRecordsRequest(params, cb)),
  deleteRecord: (payload: any, cb: any) => dispatch(deleteRecordByIdRequest(payload, cb)),

});

export default withRouter(connect(mapState, mapDispatch)(ClosureCableConfigurator));
