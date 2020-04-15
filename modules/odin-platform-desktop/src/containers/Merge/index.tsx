import { LeftSquareTwoTone, SwapOutlined } from '@ant-design/icons';
import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { Alert, Button, Card, Checkbox, Col, Descriptions, Layout, Modal, PageHeader, Row, Typography } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { TableReducer } from '../../core/records/components/DynamicTable/store/reducer';
import {
  getRecordByIdRequest,
  IGetRecordById,
  IMergeDbRecords,
  mergeDbRecordsRequest,
} from '../../core/records/store/actions';
import { IRecordReducer } from '../../core/records/store/reducer';
import AssociationTabListWithCheckBoxes
  from '../../core/recordsAssociations/components/AssociationTabListWithCheckBoxes';
import { IRecordAssociationsReducer } from '../../core/recordsAssociations/store/reducer';
import { getSchemaByModuleAndEntityRequest, ISchemaByModuleAndEntity } from '../../core/schemas/store/actions';
import { SchemaReducerState } from '../../core/schemas/store/reducer';
import StepView from '../../shared/components/StepView';
import { setStepValidationArray } from '../../shared/components/StepView/store/actions';
import history from '../../shared/utilities/browserHisory';
import { getBrowserPath, getRecordFromShortListById } from '../../shared/utilities/recordHelpers';
import { getSchemaFromShortListByModuleAndEntity } from '../../shared/utilities/schemaHelpers';

const { Content } = Layout;

type PathParams = {
  url: string,
  recordId: string
}

type PropsType = RouteComponentProps<PathParams> & {
  schemaReducer: SchemaReducerState,
  recordTableReducer: TableReducer,
  recordReducer: IRecordReducer,
  recordAssociationReducer: IRecordAssociationsReducer,
  getRecord: (payload: IGetRecordById) => {},
  getSchema: any,
  mergeDbRecords: any,
  match: any,
  setValidationData: any,
  stepViewReducer: any,
}

interface State {
  showConfirm?: boolean
  masterRecordId?: string | undefined,
  masterRecord?: DbRecordEntityTransform | undefined,
  mergeRecordId?: string | undefined,
  mergeRecord?: DbRecordEntityTransform | undefined,
  associations?: DbRecordAssociationCreateUpdateDto[],
  properties?: { [key: string]: any },
}

class MergeRecords extends React.Component<PropsType, State> {

  constructor(props: PropsType) {
    super(props);

    this.state = {
      showConfirm: false,
      masterRecordId: undefined,
      masterRecord: undefined,
      mergeRecordId: undefined,
      mergeRecord: undefined,
      associations: [],
    }
  }

  componentDidMount() {
    this.setRecordIds();
    this.setStepViewState();
  }

  componentDidUpdate(prevProps: Readonly<PropsType>, prevState: Readonly<State>, snapshot?: any) {

    if(prevState.masterRecordId !== this.state.masterRecordId) {
      this.fetchData();
    }
  }

  setStepViewState() {
    const { setValidationData } = this.props;
    setValidationData([
      { isNextDisabled: false },
      { isNextDisabled: false },
    ]);
  }

  fetchData() {

    const { recordTableReducer, schemaReducer, match, getRecord } = this.props;

    const moduleName = match.params.moduleName;
    const entityName = match.params.entityName;
    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

    if(schema) {
      for(const id of recordTableReducer.selectedItems) {
        getRecord({ recordId: id, schema });
      }
    }
  }

  private setRecordIds() {
    const { recordTableReducer } = this.props;

    if(recordTableReducer.selectedItems) {
      this.setState({
        masterRecordId: recordTableReducer.selectedItems[0],
        mergeRecordId: recordTableReducer.selectedItems[1],
      });
    }
  }

  private setMasterPropertyColor(key: string) {
    return this.state.properties && key in this.state.properties ? false : true;
  }

  private setMergePropertyColor(key: string) {
    return this.state.properties && key in this.state.properties ? true : false;
  }

  private renderMasterRecord() {

    const { recordReducer } = this.props;
    const { masterRecordId } = this.state;

    const record = getRecordFromShortListById(recordReducer.shortList, masterRecordId);

    return <Card title={`Master Record ${record?.recordNumber}`}
                 extra={<Button icon={<SwapOutlined/>} type="primary" onClick={() => this.switchRecords()}>switch
                   record</Button>}>
      <Typography.Title level={5}>{record?.title}</Typography.Title>
      {this.renderMasterRecordProperties(record?.properties)}
    </Card>
  }

  private renderMasterRecordProperties(props: { [kay: string]: any }) {
    if(props) {
      const keys = Object.keys(props);
      return <div>
        {keys.map(key => (
          <div style={{ display: 'flex' }}>
            <Checkbox checked={!this.setMasterPropertyColor(key)}
                      onChange={() => this.addRemoveProperty(key, props[key])}>
              <Typography.Text style={{ marginRight: 10 }} strong
                               delete={this.setMasterPropertyColor(key)}
                               disabled={this.setMasterPropertyColor(key)}>{key}: </Typography.Text>
              <Typography.Text delete={this.setMasterPropertyColor(key)}
                               disabled={this.setMasterPropertyColor(key)}>{props[key]}</Typography.Text>
            </Checkbox>
          </div>
        ))}
      </div>

    }
  }

  private addRemoveProperty(key: string, value: any) {

    if(this.state.properties && key in this.state.properties) {
      // remove the property
      const newState = this.state.properties;
      delete newState[key];
      this.setState({
        properties: newState,
      });

    } else {
      // add the property
      this.setState({
        properties: Object.assign({}, this.state.properties, { [key]: value }),
      });
    }
  }


  private renderMergeRecord() {

    const { recordReducer } = this.props;
    const { mergeRecordId } = this.state;

    const record = getRecordFromShortListById(recordReducer.shortList, mergeRecordId);

    return <Card title={`Merge Record ${record?.recordNumber}`}>
      <Typography.Title level={5}>{record?.title}</Typography.Title>
      {this.renderMergeRecordProperties(record?.properties)}
    </Card>
  }

  private renderMergeRecordProperties(props: { [kay: string]: any }) {
    if(props) {
      const keys = Object.keys(props);
      return <div>{keys.map(key => (
        <div style={{ display: 'flex' }}>
          <div>
            <Typography.Text style={{ marginRight: 10 }} strong
                             delete={this.setMergePropertyColor(key)}
                             disabled={this.setMergePropertyColor(key)}>{key}:</Typography.Text>
            <Typography.Text delete={this.setMergePropertyColor(key)}
                             disabled={this.setMergePropertyColor(key)}>{props[key]}</Typography.Text>
          </div>
        </div>))}
      </div>
    }
  }

  private switchRecords() {
    this.setState({
      masterRecordId: this.state.mergeRecordId,
      mergeRecordId: this.state.masterRecordId,
      properties: undefined,
      associations: undefined,
    })
  }

  private handleSubmit() {
    const { recordAssociationReducer, schemaReducer, recordReducer, mergeDbRecords, match } = this.props;
    const moduleName = match.params.moduleName;
    const entityName = match.params.entityName;
    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

    const payload = {
      schema,
      masterRecordId: this.state.masterRecordId,
      mergeRecordId: this.state.mergeRecordId,
      properties: this.state.properties,
      associations: recordAssociationReducer.selectedItems ? recordAssociationReducer.selectedItems.map(id => ({
        recordId: id,
      })) : undefined,
    }
    // merge records
    mergeDbRecords(payload)
  }


  render() {

    const { recordReducer } = this.props;
    const { mergeRecordId } = this.state;

    return (
      <Layout>

        <Modal
          title="Modal"
          visible={this.state.showConfirm}
          confirmLoading={recordReducer.isRequesting}
          onOk={() => this.handleSubmit()}
          onCancel={() => this.setState({ showConfirm: false })}
          okText="Merge"
          cancelText="Cancel"
        >
          {recordReducer.isMergeSuccess ?
            <Link
              to={getBrowserPath(getRecordFromShortListById(recordReducer.shortList, this.state.masterRecordId))}
              component={Typography.Link}> View Merged Record</Link>
            :
            <div>
              <p>Confirm that you would like to merge</p>
              <Descriptions size="small" layout="horizontal" column={1}>
                <Descriptions.Item label="Merging this">{getRecordFromShortListById(
                  recordReducer.shortList,
                  this.state.mergeRecordId,
                )?.title}</Descriptions.Item>
                <Descriptions.Item label="Into this">{getRecordFromShortListById(
                  recordReducer.shortList,
                  this.state.masterRecordId,
                )?.title}</Descriptions.Item>
              </Descriptions>

              <div>
                {this.state.properties ?
                  <div>
                    <p>These properties will remain the same:</p>
                    <Descriptions size="small" layout="horizontal" column={1}>
                      {Object.keys(this.state.properties).map(key => (
                        <Descriptions.Item
                          label={key}>{this.state.properties ? this.state.properties[key] : ''}</Descriptions.Item>
                      ))}
                    </Descriptions>
                  </div>
                  : <div/>}
              </div>
            </div>}

        </Modal>

        <Content style={{ padding: '0 50px' }}>
          <div style={{ paddingBottom: 12, paddingTop: 12 }}>
            <PageHeader
              className="page-header"
              onBack={() => history.goBack()}
              title="Merge Records"
            />
          </div>

          <StepView
            onSubmit={() => this.setState({ showConfirm: true })}
            steps={[
              {
                name: 'Merge Properties',
                content: <Row gutter={16}>
                  <Col sm={12}>
                    <Alert
                      message="Master Record"
                      description="Check properties that you don't want to have replaced by the Merge record"
                      type="info"
                    />
                    {this.renderMasterRecord()}
                  </Col>
                  <Col sm={12}>
                    <div style={{ display: 'flex', alignItems: 'center', paddingBottom: 50 }}>
                      <LeftSquareTwoTone style={{ height: 60, width: 60, fontSize: 30 }}/>
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div style={{ flex: 1, marginBottom: 16 }}>
                          <Alert
                            message="Merge Record"
                            description="All of these properties will be merged into the Master record."
                            type="warning"
                          />
                          {this.renderMergeRecord()}
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>,
              },
              {
                name: 'Merge Associations',
                content: <div style={{ flex: 1 }}>
                  <Card title="Merge Record Associations">
                    <Alert
                      message="Merging Associations"
                      description="Check all the associations that you want merged into the Master Record."
                      type="warning"
                    />
                    <AssociationTabListWithCheckBoxes
                      record={getRecordFromShortListById(recordReducer.shortList, mergeRecordId)}/>
                  </Card>
                </div>,
              },
            ]}
          />
        </Content>
      </Layout>
    )
  }
}


const mapState = (state: any) => ({
  stepViewReducer: state.stepViewReducer,
  userReducer: state.userReducer,
  recordReducer: state.recordReducer,
  recordTableReducer: state.recordTableReducer,
  recordAssociationReducer: state.recordAssociationReducer,
  schemaReducer: state.schemaReducer,
});

const mapDispatch = (dispatch: any) => ({
  getSchema: (payload: ISchemaByModuleAndEntity, cb: any) => dispatch(getSchemaByModuleAndEntityRequest(payload, cb)),
  getRecord: (payload: IGetRecordById) => dispatch(getRecordByIdRequest(payload)),
  mergeDbRecords: (payload: IMergeDbRecords, cb: any) => dispatch(mergeDbRecordsRequest(payload), cb),
  setValidationData: (params: any) => dispatch(setStepValidationArray(params)),
});

export default withRouter(connect(mapState, mapDispatch)(MergeRecords));
