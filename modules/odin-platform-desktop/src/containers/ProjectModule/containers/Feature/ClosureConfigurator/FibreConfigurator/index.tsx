import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { Button, Col, Form, Layout, Popconfirm, Row, Select, Spin } from 'antd';
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
  hasColumnMappings?: boolean,
  visibleProperties?: string[],
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

class ClosureFibreConfigurator extends React.Component<PropsType, State> {

  constructor(props: PropsType) {
    super(props);

    this.state = {

      isLoading: false,
      cables: [],
      configurations: [],

    }

  }

  componentDidMount() {

    this.fetchCableConnections();
    this.fetchFibreConnections();
    this.fetchCables();
    this.fetchModels();
    this.fetchSlots();

  }

  initializeFibreConnections() {

    const { record } = this.props;

    const configurations = [];

    const connections = this.getRelatedListData(record?.id, 'FeatureConnection', 'FIBRE');

    console.log('connections', connections);

    if(connections) {
      for(const connection of connections) {

        console.log('connection', connection);

        configurations.push(
          {
            rowId: uuidv4(),
            connectionId: connection.id,
            slotId: getProperty(connection, 'SlotId'),
            trayModelId: getProperty(connection, 'TrayModelId'),
            trayId: getProperty(connection, 'TrayId'),
            trayInId: getProperty(connection, 'TrayInId'),
            trayOutId: getProperty(connection, 'TrayOutId'),
            traySpliceId: getProperty(connection, 'TraySpliceId'),
            traySplitterId: getProperty(connection, 'TraySplitterId'),
            cableInId: getProperty(connection, 'CableInId'),
            tubeInId: getProperty(connection, 'TubeInId'),
            fibreInId: getProperty(connection, 'FibreInId'),
            cableOutId: getProperty(connection, 'CableOutId'),
            tubeOutId: getProperty(connection, 'TubeOutId'),
            fibreOutId: getProperty(connection, 'FibreOutId'),
            modified: false,
          });
      }
    }

    this.setState({
      configurations,
    })
  }


  fetchCableConnections() {

    const { record, schemaReducer, getAssociations } = this.props;

    const moduleName = 'ProjectModule';
    const entityName = 'FeatureConnection';
    const schemaType = 'CABLE';

    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

    if(schema && record) {

      getAssociations({
        recordId: record.id,
        key: `${entityName}_${schemaType}`,
        schema,
        entities: [ entityName ],
        filters: [ `SchemaType:${schemaType}` ],
      }, () => {

      });

    }
  }

  fetchFibreConnections() {

    const { record, schemaReducer, getAssociations } = this.props;

    const moduleName = 'ProjectModule';
    const entityName = 'FeatureConnection';
    const schemaType = 'FIBRE';

    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

    if(schema && record) {

      getAssociations({
        recordId: record.id,
        key: `${entityName}_${schemaType}`,
        schema,
        entities: [ entityName ],
        filters: [ `SchemaType:${schemaType}` ],
      }, () => {

        this.initializeFibreConnections();

      });

    }
  }

  fetchSlotTrayComponent(recordId: string) {

    const { schemaReducer, getAssociations } = this.props;

    const moduleName = 'ProjectModule';
    const entityName = 'FeatureComponent';
    const schemaType = 'SLOT_TRAY';

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

  fetchSlotTraySpliceComponent(recordId: string) {

    const { schemaReducer, getAssociations } = this.props;

    const moduleName = 'ProjectModule';
    const entityName = 'FeatureComponent';
    const schemaType = 'TRAY_SPLICE';

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

  fetchSlotTraySplitterComponent(recordId: string) {

    const { schemaReducer, getAssociations } = this.props;

    const moduleName = 'ProjectModule';
    const entityName = 'FeatureComponent';
    const schemaType = 'TRAY_SPLITTER';

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

  fetchCableTubeComponent(recordId: string) {

    const { schemaReducer, getAssociations } = this.props;

    const moduleName = 'ProjectModule';
    const entityName = 'FeatureComponent';
    const schemaType = 'CABLE_TUBE';

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

  fetchTubeFibreComponent(recordId: string) {

    const { schemaReducer, getAssociations } = this.props;

    const moduleName = 'ProjectModule';
    const entityName = 'FeatureComponent';
    const schemaType = 'TUBE_FIBRE';

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
    const schemaType = 'TRAY';

    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

    if(schema && record) {

      searchRecords({
        listKey: `${record.id}_${entityName}_${schemaType}`,
        schema: schema,
        searchQuery: {
          terms: 'TRAY',
          fields: [ 'type' ],
          schemas: schema.id,
          sort: [],
          boolean: [],
        },
      });

    } else {

      getSchema({ moduleName, entityName }, (result: SchemaEntity) => {
        searchRecords({
          listKey: `${record.id}_${entityName}_${schemaType}`,
          schema: schema,
          searchQuery: {
            terms: 'TRAY',
            fields: [ 'type' ],
            schemas: result.id,
            sort: [],
            boolean: [],
          },
        });
      });

    }
  }

  fetchSlots() {

    const { record, schemaReducer, getAssociations } = this.props;

    const moduleName = 'ProjectModule';
    const entityName = 'FeatureComponent';
    const schemaType = 'CLOSURE_SLOT';

    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

    if(schema && record) {

      getAssociations({
        recordId: record.id,
        key: `${entityName}_${schemaType}`,
        schema,
        entities: [ entityName ],
        filters: [ `SchemaType:${schemaType}` ],
      }, () => {

      });

    }

  }


  async fetchCables() {

    const { record } = this.props;

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

  getInCables() {

    const { record } = this.props;
    const { cables } = this.state;

    const connections = this.getRelatedListData(record?.id, 'FeatureConnection', 'CABLE');

    console.log(cables);

    if(connections) {
      const inConnections = connections.filter((elem: DbRecordEntityTransform) => getProperty(
        elem,
        'Direction',
      ) === 'IN')

      const cableIds = inConnections.map((elem: DbRecordEntityTransform) => getProperty(elem, 'CableId'));
      return cables.filter(elem => cableIds.includes(elem.id));

    }
    return [];
  }

  getOutCables() {

    const { record } = this.props;
    const { cables } = this.state;

    const connections = this.getRelatedListData(record?.id, 'FeatureConnection', 'CABLE');

    if(connections) {
      const outConnections = connections.filter((elem: DbRecordEntityTransform) => getProperty(
        elem,
        'Direction',
      ) === 'OUT')

      const cableIds = outConnections.map((elem: DbRecordEntityTransform) => getProperty(elem, 'CableId'));
      return cables.filter(elem => cableIds.includes(elem.id));

    }

    return [];

  }


  // Helpers

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
      slotId: null,
      trayModelId: null,
      trayId: null,
      trayInId: null,
      trayOutId: null,
      traySpliceId: null,
      traySplitterId: null,
      cableInId: null,
      tubeInId: null,
      fibreInId: null,
      cableOutId: null,
      tubeOutId: null,
      fibreOutId: null,
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

    if(key === 'trayModelId') {
      // if sealModelId we want to create an association between the port and seal model
      const row = this.state.configurations.find(elem => elem.rowId === rowId);
      this.createAssociation(row.slotId, value);
    }

    console.log('rowId', rowId)
    console.log('key', key)
    console.log('value', value)
    console.log('this.state.configurations', this.state.configurations)

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

    const modelAssociation = schema?.associations?.find(elem => elem?.childSchema?.entityName === 'FeatureModel');

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
        type: 'FIBRE',
        properties: {
          SlotId: row.slotId,
          TrayModelId: row.trayModelId,
          TrayId: row.trayId,
          TrayInId: row.trayInId || row.trayId,
          TrayOutId: row.trayOutId || row.trayId,
          TraySpliceId: row.traySpliceId,
          TraySplitterId: row.traySplitterId,
          CableInId: row.cableInId,
          TubeInId: row.tubeInId,
          FibreInId: row.fibreInId,
          CableOutId: row.cableOutId,
          TubeOutId: row.tubeOutId,
          FibreOutId: row.fibreOutId,
        },
        associations: [
          {
            recordId: record?.id,
          },
          {
            recordId: row.slotId,
          },
          {
            recordId: row.trayModelId,
          },
          {
            recordId: row.trayId,
          },
          {
            recordId: row.trayInId,
          },
          {
            recordId: row.trayOutId,
          },
          {
            recordId: row.cableInId,
          },
          {
            recordId: row.tubeInId,
          },
          {
            recordId: row.fibreInId,
          },
          {
            recordId: row.cableOutId,
          },
          {
            recordId: row.tubeOutId,
          },
          {
            recordId: row.fibreOutId,
          },
          {
            recordId: row.traySplitterId,
          },
          {
            recordId: row.traySpliceId,
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

          console.log('created records')

        });
      });
    }
  }


  renderRow(config: any) {

    const { record, recordAssociationReducer } = this.props;

    return (
      <Row wrap={false}>
        <Col span={2}>
          <Form.Item
            className="fibre-form-select"
            key={config.rowId}
            name={'slotId'}
            label={'Slot'}
            labelCol={{ span: 24 }}
            initialValue={config.slotId}
            rules={[ { required: true } ]}
          >
            <Select
              disabled={config.connectionId}
              className="fibre-form-select"
              onChange={(val) => this.handleInputChange({
                id: `${config.rowId}_slotId`,
                value: val,
              })}
            >
              <Option value="">Select Slot</Option>

              {this.getRelatedListData(
                record.id,
                'FeatureComponent',
                'CLOSURE_SLOT',
              ).map((elem: DbRecordEntityTransform) => (
                <Option value={elem.id}>{getProperty(elem, 'SlotNumber')}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={2}>
          <Form.Item
            className="fibre-form-select"
            key={config.rowId}
            name={'trayModelId'}
            label={'Tray Model'}
            labelCol={{ span: 24 }}
            initialValue={config.trayModelId}
            rules={[ { required: true } ]}
          >
            <Select
              disabled={config.connectionId}
              loading={recordAssociationReducer.isRequesting}
              className="fibre-form-select"
              onChange={(val) => this.handleInputChange({
                id: `${config.rowId}_trayModelId`,
                value: val,
              })}
            >
              <Option value="">Select Tray Model</Option>
              {this.getRecordListData(record?.id, 'FeatureModel', 'TRAY').map((elem: DbRecordEntityTransform) => (
                <Option value={elem.id}>{elem.title}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={2}>
          <Form.Item
            className="fibre-form-select"
            key={config.rowId}
            name={'trayId'}
            label={'Slot Tray'}
            labelCol={{ span: 24 }}
            initialValue={config.trayId}
            rules={[ { required: true } ]}
          >
            <Select
              className="fibre-form-select"
              disabled={config.connectionId}
              loading={recordAssociationReducer.isRequesting}
              onChange={(val) => this.handleInputChange({
                id: `${config.rowId}_trayId`,
                value: val,
              })}
              onClick={() => this.fetchSlotTrayComponent(config.slotId)}
            >
              <Option value="">Select Tray</Option>
              {this.getRelatedListData(
                config.slotId,
                'FeatureComponent',
                'SLOT_TRAY',
              ).map((elem: DbRecordEntityTransform) => (
                <Option value={elem.id}>{getProperty(elem, 'TrayNumber')}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={2}>
          <Form.Item
            className="fibre-form-select"
            key={config.rowId}
            name={'cableInId'}
            label={'Cable In'}
            labelCol={{ span: 24 }}
            initialValue={config.cableInId}
            rules={[ { required: true } ]}
          >
            <Select
              className="fibre-form-select"
              disabled={config.connectionId}
              onChange={(val) => this.handleInputChange({
                id: `${config.rowId}_cableInId`,
                value: val,
              })}
            >
              <Option value="">Select Cable</Option>
              {this.getInCables().map((elem: DbRecordEntityTransform) => (
                <Option value={elem.id}>{getProperty(elem, 'ExternalRef')}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={2}>
          <Form.Item
            className="fibre-form-select"
            key={config.rowId}
            name={'tubeInId'}
            label={'Tube In'}
            labelCol={{ span: 24 }}
            initialValue={config.tubeInId}
            rules={[ { required: true } ]}
          >
            <Select
              className="fibre-form-select"
              disabled={config.connectionId}
              loading={recordAssociationReducer.isRequesting}
              onChange={(val) => this.handleInputChange({
                id: `${config.rowId}_tubeInId`,
                value: val,
              })}
              onClick={() => this.fetchCableTubeComponent(config.cableInId)}
            >
              <Option value="">Select Tube In</Option>
              {this.getRelatedListData(
                config.cableInId,
                'FeatureComponent',
                'CABLE_TUBE',
              ).map((elem: DbRecordEntityTransform) => (
                <Option value={elem.id}>{getProperty(elem, 'TubeNumber')}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={2}>
          <Form.Item
            className="fibre-form-select"
            key={config.rowId}
            name={'fibreInId'}
            label={'Fibre In'}
            labelCol={{ span: 24 }}
            initialValue={config.fibreInId}
            rules={[ { required: true } ]}
          >
            <Select
              className="fibre-form-select"
              disabled={config.connectionId}
              loading={recordAssociationReducer.isRequesting}
              onChange={(val) => this.handleInputChange({
                id: `${config.rowId}_fibreInId`,
                value: val,
              })}
              onClick={() => this.fetchTubeFibreComponent(config.tubeInId)}
            >
              <Option value="">Select Fibre In</Option>
              {this.getRelatedListData(
                config.tubeInId,
                'FeatureComponent',
                'TUBE_FIBRE',
              ).map((elem: DbRecordEntityTransform) => (
                <Option value={elem.id}>{getProperty(elem, 'FibreNumber')}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={2}>
          <Form.Item
            className="fibre-form-select"
            key={config.rowId}
            name={'traySpliceId'}
            label={'Tray Splice'}
            labelCol={{ span: 24 }}
            initialValue={config.traySpliceId}
            rules={[]}
          >
            <Select
              className="fibre-form-select"
              disabled={config.connectionId}
              loading={recordAssociationReducer.isRequesting}
              onChange={(val) => this.handleInputChange({
                id: `${config.rowId}_traySpliceId`,
                value: val,
              })}
              onClick={() => this.fetchSlotTraySpliceComponent(config.trayId)}
            >
              <Option value="">Select Splice</Option>
              {this.getRelatedListData(
                config.trayId,
                'FeatureComponent',
                'TRAY_SPLICE',
              ).map((elem: DbRecordEntityTransform) => (
                <Option value={elem.id}>{getProperty(elem, 'SpliceNumber')}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={2}>
          <Form.Item
            className="fibre-form-select"
            key={config.rowId}
            name={'traySplitterId'}
            label={'Tray Splitter'}
            labelCol={{ span: 24 }}
            initialValue={config.traySplitterId}
            rules={[]}
          >
            <Select
              className="fibre-form-select"
              disabled={config.connectionId}
              loading={recordAssociationReducer.isRequesting}
              onChange={(val) => this.handleInputChange({
                id: `${config.rowId}_traySplitterId`,
                value: val,
              })}
              onClick={() => this.fetchSlotTraySplitterComponent(config.trayId)}
            >
              <Option value="">Select splitter</Option>
              {this.getRelatedListData(
                config.trayId,
                'FeatureComponent',
                'TRAY_SPLITTER',
              ).map((elem: DbRecordEntityTransform) => (
                <Option value={elem.id}>{getProperty(elem, 'SplitterNumber')}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={2}>
          <Form.Item
            className="fibre-form-select"
            key={config.rowId}
            name={'cableOutId'}
            label={'Cable Out'}
            labelCol={{ span: 24 }}
            initialValue={config.cableOutId}
            rules={[ { required: true } ]}
          >
            <Select
              className="fibre-form-select"
              disabled={config.connectionId}
              onChange={(val) => this.handleInputChange({
                id: `${config.rowId}_cableOutId`,
                value: val,
              })}
            >
              <Option value="">Select Cable Out</Option>
              {this.getOutCables().map((elem: DbRecordEntityTransform) => (
                <Option value={elem.id}>{getProperty(
                  elem,
                  'ExternalRef',
                )}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={2}>
          <Form.Item
            className="fibre-form-select"
            key={config.rowId}
            name={'tubeOutId'}
            label={'Tube Out'}
            labelCol={{ span: 24 }}
            initialValue={config.tubeOutId}
            rules={[ { required: true } ]}
          >
            <Select
              className="fibre-form-select"
              disabled={config.connectionId}
              loading={recordAssociationReducer.isRequesting}
              onChange={(val) => this.handleInputChange({
                id: `${config.rowId}_tubeOutId`,
                value: val,
              })}
              onClick={() => this.fetchCableTubeComponent(config.cableOutId)}
            >
              <Option value="">Select Tube Out</Option>
              {this.getRelatedListData(
                config.cableOutId,
                'FeatureComponent',
                'CABLE_TUBE',
              ).map((elem: DbRecordEntityTransform) => (
                <Option value={elem.id}>{getProperty(elem, 'TubeNumber')}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={2}>
          <Form.Item
            className="fibre-form-select"
            key={config.rowId}
            name={'fibreOutId'}
            label={'Fibre Out'}
            labelCol={{ span: 24 }}
            initialValue={config.fibreOutId}
            rules={[ { required: true } ]}
          >
            <Option value="">Select Fibre</Option>
            <Select
              className="fibre-form-select"
              disabled={config.connectionId}
              loading={recordAssociationReducer.isRequesting}
              onChange={(val) => this.handleInputChange({
                id: `${config.rowId}_fibreOutId`,
                value: val,
              })}
              onClick={() => this.fetchTubeFibreComponent(config.tubeOutId)}
            >
              <Option value="">Select Fibre In</Option>
              {this.getRelatedListData(
                config.tubeOutId,
                'FeatureComponent',
                'TUBE_FIBRE',
              ).map((elem: DbRecordEntityTransform) => (
                <Option value={elem.id}>{getProperty(elem, 'FibreNumber')}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={3} offset={1}>
          <Form.Item
            className="fibre-form-item"
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
      recordReducer,
      schemaReducer,
    } = this.props;

    const { configurations } = this.state;

    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record?.schemaId);

    return (<Layout className='record-detail-view'>
      <Row>
        <div className="fibre-configurator">
          <div className="fibre-btn-wrapper">
            <Form.Item>
              <Button icon={<PlusOutlined/>} type="dashed" className="fibre-add-btn" onClick={() => this.addRow()}
                      block>
                Add connection
              </Button>
            </Form.Item>
            <Form.Item>
              <Button type="primary" className="fibre-save-btn" onClick={() => this.saveConfiguration()} block>
                Save Changes
              </Button>
            </Form.Item>
          </div>
        </div>
      </Row>
      <div className="fibre-configurator">
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
    </Layout>)
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

export default withRouter(connect(mapState, mapDispatch)(ClosureFibreConfigurator));
