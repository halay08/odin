import { IGetSchemaById } from '@d19n/models/dist/rabbitmq/rabbitmq.interfaces';
import { Button, Checkbox, Col, Divider, Form, Input, Layout, Popconfirm, Row } from 'antd';
import { FormInstance } from 'antd/lib/form';
import React from 'react';
import { connect } from 'react-redux';
import { deleteSchemaById, getSchemaByIdRequest, updateSchemaRequest } from '../../../../../core/schemas/store/actions';
import { errorNotification } from '../../../../../shared/system/notifications/store/reducers';

interface Props {

  notifyError: any;
  updateSchema: any;
  data: any;
  deleteSchema: any;
  getSchema: any;

}


class SchemaSettingsDetailView extends React.Component<Props> {

  state = {
    name: '',
    description: '',
    moduleName: '',
    entityName: '',
    recordNumber: 0,
    recordNumberPrefix: '',
    recordDefaultOwnerId: '',
    searchUrl: '',
    getUrl: '',
    postUrl: '',
    putUrl: '',
    deleteUrl: '',
    upsertOnCreate: true,
    assignable: false,
    isSequential: false,
    isStatic: false,
    isHidden: false,
    hasTitle: false,
    position: 0,
    isTitleUnique: false,
    isTitleRequired: false,
    queryable: false,
    replicateable: false,
    retrievable: false,
    searchable: false,
    triggerable: false,
    undeletable: false,
    updateable: false,


  }

  constructor(props: Props) {
    super(props);

    this.setStateValue(this.props.data);

  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {

    if(prevProps.data !== this.props.data) {
      this.setStateValue(this.props.data);
    }
  }

  formRef = React.createRef<FormInstance>();

  saveChanges = async () => {

    const { notifyError, updateSchema, getSchema, data } = this.props;

    try {
      if(!!this.formRef.current) {
        await this.formRef.current.validateFields();
        const formErrors = this.formRef.current ? this.formRef.current.getFieldsError() : [];
        const hasErrors = formErrors.filter(({ errors }) => errors.length).length > 0;
        if(hasErrors) {
          return notifyError({
            message: 'form has errors, fix them and resubmit',
            validation: null,
            data: null,
          });
        } else {
          updateSchema({ data: this.state, schemaId: data.id }, (result: any) => {

            this.setStateValue(result)

          })
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  setStateValue(data: any) {

    if(data) {
      let initialData = data;
      delete initialData.columns;
      delete initialData.associations

      this.state = initialData;
    }
  };

  handleDeleteSchema() {
    const { deleteSchema, data } = this.props
    deleteSchema({ schemaId: data.id })
  }

  renderForm() {
    const { data } = this.props;
    return (
      <Form layout={'vertical'} style={{ width: 'calc(100% - 6px)', paddingBottom: '1rem' }} ref={this.formRef}
            initialValues={data}>

        <Col span={18} offset={4}>

          <Row gutter={12} style={{ marginTop: 24 }}>

            <Col span={20}>

              <div style={{ float: 'left' }}>
                <h2 title="5">Definition</h2>
              </div>

              <div style={{ float: 'right' }}>
                <Popconfirm
                  title="Are you sure you want to delete this schema?"
                  onConfirm={() => this.handleDeleteSchema()}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button key="2" danger>Delete</Button>
                </Popconfirm>

                <Button style={{ marginLeft: 12 }} key="1" type="primary"
                        onClick={() => this.saveChanges()}>Save</Button>
              </div>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={10}>
              <Form.Item className="form-item" label="Name" initialValue={data?.name}>
                <Input
                  placeholder="Name"
                  defaultValue={data?.name}
                  onChange={(e) => this.setState({ name: e.target.value })}/>
              </Form.Item>
              <Form.Item
                className="form-item"
                initialValue={data?.description}
                label="Description"
              >
                <Input
                  placeholder="Description"
                  defaultValue={data?.description}
                  onChange={(e) => this.setState({ description: e.target.value })}/>
              </Form.Item>
              <Form.Item
                className="form-item"
                initialValue={0}
                label="Position"
              >
                <Input placeholder="Position" defaultValue={data?.position} type='number'
                       onChange={(e) => this.setState({ position: parseInt(e.target.value) })}/>
              </Form.Item>
            </Col>

            <Col span={10}>
              <Form.Item
                className="form-item"
                initialValue={data?.moduleName}
                label="Module Name"
              >
                <Input
                  placeholder="Module Name"
                  defaultValue={data?.moduleName}
                  disabled={true}/>
              </Form.Item>
              <Form.Item
                className="form-item"
                initialValue={data?.entityName}
                label="Entity Name"
              >
                <Input placeholder="Entity Name" defaultValue={data?.entityName} disabled={true}/>
              </Form.Item>

            </Col>
          </Row>


          <Divider/>
          <h2 title="5">Record Numbers</h2>
          <Row gutter={12}>
            <Col span={10}>
              <Form.Item
                className="form-item"
                initialValue={data?.recordNumber}
                label="Starting Record Number"
              >
                <Input
                  placeholder="Starting Record Number"
                  defaultValue={data?.recordNumber}
                  type='number'
                  onChange={(e) => this.setState({ recordNumber: parseInt(e.target.value) })}
                />
              </Form.Item>

              <Form.Item
                className="form-item"
                initialValue={data?.recordNumberPrefix}
                label="Record Number Prefix"
              >
                <Input placeholder="Record Number Prefix" defaultValue={data?.recordNumberPrefix}
                       onChange={(e) => this.setState({ recordNumberPrefix: e.target.value })}/>
              </Form.Item>
            </Col>
            <Col span={10}>

              <Form.Item
                className="form-item"
                initialValue={data?.isSequential}
              >
                <Checkbox
                  checked={this.state.isSequential}
                  onChange={(e) => this.setState({ isSequential: e.target.checked })}>Auto-increment Record
                  Numbers</Checkbox>
              </Form.Item>

            </Col>
          </Row>

          <Divider/>
          <h2 title="5">API Routing</h2>
          <Row gutter={12} style={{ marginTop: 24 }}>

            <Col span={10}>
              <Form.Item
                className="form-item"
                initialValue={data?.getUrl}
                label="GET URL"
              >
                <Input placeholder="GET URL" defaultValue={data?.getUrl}
                       onChange={(e) => this.setState({ getUrl: e.target.value })}/>
              </Form.Item>
              <Form.Item
                className="form-item"
                initialValue={data?.postUrl}
                label="POST URL"
              >
                <Input placeholder="POST URL" defaultValue={data?.postUrl}
                       onChange={(e) => this.setState({ postUrl: e.target.value })}/>
              </Form.Item>
            </Col>

            <Col span={10}>

              <Form.Item
                className="form-item"
                initialValue={data?.putUrl}
                label="PUT URL"
              >
                <Input placeholder="PUT URL" defaultValue={data?.putUrl}
                       onChange={(e) => this.setState({ putUrl: e.target.value })}/>
              </Form.Item>
              <Form.Item
                className="form-item"
                initialValue={data?.deleteUrl}
                label="DELETE URL"
              >
                <Input placeholder="DELETE URL" defaultValue={data?.deleteUrl}
                       onChange={(e) => this.setState({ deleteUrl: e.target.value })}/>
              </Form.Item>


              <Form.Item
                className="form-item"
                initialValue={data?.searchUrl}
                label="SEARCH URL"
              >
                <Input placeholder="SEARCH URL" defaultValue={data?.searchUrl}
                       onChange={(e) => this.setState({ searchUrl: e.target.value })}/>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                className="form-item"
                initialValue={data?.upsertOnCreate}
              >
                <Checkbox
                  checked={this.state.upsertOnCreate}
                  onChange={(e) => {
                    this.setState({ upsertOnCreate: e.target.checked })
                  }}>Upsert on create</Checkbox>
              </Form.Item>
            </Col>

          </Row>

          <Divider/>
          <h2 title="5">Configuration</h2>

          <Row gutter={12}>
            <Col span={6}>
              <Form.Item
                className="form-item"
                initialValue={data?.isHidden}
              >
                <Checkbox
                  checked={this.state.isHidden}
                  onChange={(e) => this.setState({ isHidden: e.target.checked })}>Is Hidden</Checkbox>
              </Form.Item>
              <Form.Item
                className="form-item"
                initialValue={data?.isStatic}
              >
                <Checkbox
                  checked={this.state.isStatic}
                  onChange={(e) => {
                    this.setState({ isStatic: e.target.checked });
                    console.log('this.state: ', this.state)
                  }}>Is Static</Checkbox>
              </Form.Item>
              <Form.Item
                className="form-item"
                initialValue={data?.hasTitle}
              >
                <Checkbox
                  checked={this.state.hasTitle}
                  onChange={(e) => this.setState({ hasTitle: e.target.checked })}>Has Title</Checkbox>
              </Form.Item>

              <Form.Item
                className="form-item"
                initialValue={data?.isTitleUnique}
              >
                <Checkbox
                  checked={this.state.isTitleUnique}
                  onChange={(e) => this.setState({ isTitleUnique: e.target.checked })}>Is Title Unique</Checkbox>
              </Form.Item>
              <Form.Item
                className="form-item"
                initialValue={data?.assignable}
              >
                <Checkbox
                  checked={this.state.assignable}
                  onChange={(e) => this.setState({ assignable: e.target.checked })}>Assignable</Checkbox>
              </Form.Item>

            </Col>

            <Col span={6}>
              <Form.Item
                className="form-item"
                initialValue={data?.isTitleUnique}
              >
                <Checkbox
                  checked={this.state.isTitleRequired}
                  onChange={(e) => this.setState({ isTitleUnique: e.target.checked })}>Is Title Required</Checkbox>
              </Form.Item>
              <Form.Item
                className="form-item"
                initialValue={data?.queryable}
              >
                <Checkbox
                  checked={this.state.queryable}
                  onChange={(e) => this.setState({ queryable: e.target.checked })}>Queryable</Checkbox>
              </Form.Item>
              <Form.Item
                className="form-item"
                initialValue={data?.replicateable}
              >
                <Checkbox
                  checked={this.state.replicateable}
                  onChange={(e) => this.setState({ replicateable: e.target.checked })}>Replicateable</Checkbox>
              </Form.Item>
              <Form.Item
                className="form-item"
                initialValue={data?.retrievable}
              >
                <Checkbox
                  checked={this.state.retrievable}
                  onChange={(e) => this.setState({ retrievable: e.target.checked })}>Retrievable</Checkbox>
              </Form.Item>
              <Form.Item
                className="form-item"
                initialValue={data?.searchable}
              >
                <Checkbox
                  checked={this.state.searchable}
                  onChange={(e) => this.setState({ searchable: e.target.checked })}>Searchable</Checkbox>
              </Form.Item>
              <Form.Item
                className="form-item"
                initialValue={data?.triggerable}
              >
                <Checkbox
                  checked={this.state.triggerable}
                  onChange={(e) => this.setState({ triggerable: e.target.checked })}>Triggerable</Checkbox>
              </Form.Item>
              <Form.Item
                className="form-item"
                initialValue={data?.undeletable}
              >
                <Checkbox
                  checked={this.state.undeletable}
                  onChange={(e) => this.setState({ undeletable: e.target.checked })}>Undeletable</Checkbox>
              </Form.Item>
              <Form.Item
                className="form-item"
                initialValue={data?.updateable}
              >
                <Checkbox
                  checked={this.state.updateable}
                  onChange={(e) => {
                    this.setState({ updateable: e.target.checked })
                  }}>Updateable</Checkbox>
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Form>
    );
  }

  render() {

    return (
      <Layout className="record-detail-view">{this.renderForm()}</Layout>
    );
  }
}

const mapState = (state: any) => ({});

const mapDispatch = (dispatch: any) => ({
  updateSchema: (params: any, cb: any) => dispatch(updateSchemaRequest(params, cb)),
  getSchema: (payload: IGetSchemaById, cb: any) => dispatch(getSchemaByIdRequest(payload, cb)),
  deleteSchema: (params: any) => dispatch(deleteSchemaById(params)),
  notifyError: (params: any) => dispatch(errorNotification(params)),
});

export default connect(mapState, mapDispatch)(SchemaSettingsDetailView);
