import { IGetSchemaById } from '@d19n/models/dist/rabbitmq/rabbitmq.interfaces';
import { Breadcrumb, Layout, PageHeader, Tabs, Typography } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { getSchemaByIdRequest } from '../../../../../core/schemas/store/actions';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import { getSchemaFromShortListBySchemaId } from '../../../../../shared/utilities/schemaHelpers';
import SchemaAssociationsListView from '../../Associations/DetailView';
import SchemaColumnListView from '../../Columns/ListView';
import SchemaPipelineDetailView from '../../Pipeline/DetailView';
import SchemasPermissions from '../../SchemasPermissions/DetailView';
import SchemaSettingsDetailView from '../../Settings/DetailView';
import SchemaTypesList from '../../Types/ListView';

type PathParams = {
  schemaId: string,
}

type PropsType = RouteComponentProps<PathParams> & {
  match: any;
  schemaReducer: SchemaReducerState;
  getSchema: any;
}

interface State {

  activeTab: string

}

const { TabPane } = Tabs;

class SchemasDetailView extends React.Component<PropsType, State> {

  constructor(props: PropsType) {
    super(props);

    this.state = {
      activeTab: '1',
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {

    const { getSchema, match } = this.props;
    const schemaId = match.params.schemaId;

    if(schemaId) {
      getSchema({ schemaId: schemaId });
    }

  }

  render() {

    const { schemaReducer, match } = this.props;
    const schemaId = match.params.schemaId;
    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, schemaId);

    return (
      <Layout>

        <PageHeader
          className="page-header"
          style={{ marginTop: 14 }}
          ghost={false}
          breadcrumbRender={() => <Breadcrumb separator=">">
            <Breadcrumb.Item>
              <Link to="/SchemaModule/Schema" component={Typography.Link}>Schemas</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {schema?.entityName}
            </Breadcrumb.Item>
          </Breadcrumb>}
        >
        </PageHeader>

        <div className="detail-body-wrapper">
          <Tabs defaultActiveKey="1" activeKey={this.state.activeTab} destroyInactiveTabPane
                onChange={(tab) => this.setState({ activeTab: tab })}>

            <TabPane destroyInactiveTabPane tab="Columns" key="1">
              <SchemaColumnListView schema={schema}/>
            </TabPane>

            <TabPane destroyInactiveTabPane tab="Types" key="7">
              <SchemaTypesList schema={schema}/>
            </TabPane>

            <TabPane destroyInactiveTabPane tab="Associations" key="2">
              <SchemaAssociationsListView schema={schema}/>
            </TabPane>

            <TabPane destroyInactiveTabPane tab="Pipeline" key="5">
              <SchemaPipelineDetailView schema={schema}/>
            </TabPane>

            <TabPane destroyInactiveTabPane tab="Permissions" key="6">
              <SchemasPermissions schema={schema}/>
            </TabPane>

            <TabPane destroyInactiveTabPane tab="Settings" key="4">
              <SchemaSettingsDetailView data={schema}/>
            </TabPane>
          </Tabs>
        </div>

      </Layout>
    );
  }
}

const mapState = (state: any) => ({
  schemaReducer: state.schemaReducer,
});

const mapDispatch = (dispatch: any) => ({
  getSchema: (payload: IGetSchemaById, cb: any) => dispatch(getSchemaByIdRequest(payload, cb)),
});

export default withRouter(connect(mapState, mapDispatch)(SchemasDetailView));
