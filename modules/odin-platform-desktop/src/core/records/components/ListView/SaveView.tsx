import { SaveOutlined } from '@ant-design/icons';
import { Button, Collapse, Form, Input, Modal } from 'antd';
import { pascalCase } from 'change-case';
import React from 'react';
import { connect } from 'react-redux';
import { httpPost } from '../../../../shared/http/requests';
import { displayMessage } from '../../../../shared/system/messages/store/reducers';
import { getCurrentListView } from '../../../../shared/utilities/searchHelpers';
import { SchemaReducerState } from '../../../schemas/store/reducer';
import { IRecordReducer } from '../../store/reducer';
import { TableReducer } from '../DynamicTable/store/reducer';

const { Panel } = Collapse;


interface Props {
  moduleName: string | undefined,
  entityName: string | undefined,
  recordReducer: IRecordReducer,
  recordTableReducer: TableReducer,
  schemaReducer: SchemaReducerState,
  alertMessage: any,
}

interface State {
  isLoading: boolean
  visible: boolean
  title: string | undefined
  key: string | undefined,
  view: any | undefined
}

class SaveView extends React.Component<Props, State> {


  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      visible: false,
      title: undefined,
      key: undefined,
      view: undefined,
    }
  }

  componentDidMount() {
    this.setCurrentView();
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {

    if(prevProps.recordReducer.searchQuery !== this.props.recordReducer.searchQuery) {
      this.resetState();
      this.setCurrentView();
    }

  }

  setCurrentView() {
    const { schemaReducer, recordTableReducer, moduleName, entityName } = this.props;

    if(moduleName && entityName) {
      const listView = getCurrentListView(schemaReducer, recordTableReducer, moduleName, entityName);

      this.setState({
        view: listView,
        title: undefined,
        key: undefined,
      });

      return listView;
    }
  }

  handleOk = async () => {
    const { alertMessage, moduleName, entityName } = this.props;
    this.setState({
      isLoading: true,
    });

    if(!this.state.title) {
      this.setState({
        isLoading: false,
      });

      return alertMessage({ body: 'error saving your view please add a title longer than 8 characters', type: 'error' });
    }


    if(this.state.title && this.state.title.length < 8) {

      this.setState({
        isLoading: false,
      });

      return alertMessage({ body: 'error saving your view please add a title longer than 8 characters', type: 'error' });

    } else if(this.state.title) {

      await httpPost(
        `${moduleName}/v1.0/views`,
        {
          moduleName,
          entityName,
          title: this.state.title,
          key: pascalCase(this.state.title),
          view: this.state.view,
        },
      ).then(res => {
        console.log(res);
        alertMessage({ body: 'view successfully created', type: 'success' });

      }).catch(err => {

        const error = err.response ? err.response.data : undefined;
        alertMessage({ body: error && error.message || 'error saving your view', type: 'error' });
      });

      this.setState({
        isLoading: false,
        visible: false,
        title: undefined,
        key: undefined,
      });
    }

  };

  resetState = () => {
    this.setState({
      isLoading: false,
      visible: false,
      title: undefined,
      key: undefined,
    });
  };

  formatKey(val: string) {
    if(val) {
      return pascalCase(val);
    }
  }

  render() {

    return (
      <>

        <Button onClick={() => this.setState({ visible: true })} icon={<SaveOutlined/>}/>
        <Modal
          title="Save List"
          visible={this.state.visible}
          confirmLoading={this.state.isLoading}
          onOk={() => this.handleOk()}
          onCancel={() => this.resetState()}
        >
          <Form
            labelCol={{ span: 22 }}
            wrapperCol={{ span: 22 }}
            initialValues={{ remember: true }}
          >
            <Form.Item
              key='title'
              name='title'
              label='Name'
              labelCol={{ span: 24 }}
              initialValue={''}
              rules={[ { required: true } ]}
            >
              <Input
                type='title'
                defaultValue={''}
                placeholder='name your list'
                onChange={(e) => this.setState({ title: e.target.value })}/>
            </Form.Item>
          </Form>

          {/*<Collapse defaultActiveKey={[]} ghost>*/}
          {/*  <Panel header="Current Filter" key="1">*/}
          {/*    <code>*/}
          {/*      <pre style={{ overflow: 'auto', maxHeight: 400 }}>{JSON.stringify(this.state.view, null, 2)}</pre>*/}
          {/*    </code>*/}
          {/*  </Panel>*/}
          {/*</Collapse>*/}
        </Modal>
      </>
    )
  }
}

const mapState = (state: any) => ({
  schemaReducer: state.schemaReducer,
  recordReducer: state.recordReducer,
  recordTableReducer: state.recordTableReducer,
});

const mapDispatch = (dispatch: any) => ({
  alertMessage: (params: { body: string, type: string }) => dispatch(displayMessage(params)),
});

export default connect(mapState, mapDispatch)(SaveView);
