import { ProjectOutlined } from '@ant-design/icons';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Menu } from 'antd';
import SubMenu from 'antd/es/menu/SubMenu';
import React from 'react';
import { Link, Switch, useRouteMatch } from 'react-router-dom';
import ProtectedModule from '../../core/navigation/ProtectedModule';
import ProtectedRoute from '../../core/navigation/ProtectedRoute';
import DetailView from '../../core/records/components/DetailView';
import RecordListView from '../../core/records/components/ListView';
import DefaultRecordDetail from '../DefaultViews/RecordDetailView';
import ChangeRequestDetail from './containers/ChangeRequest/DetailView';
import Dashboard from './containers/Dashboard';
import ClosureConfigurator from './containers/Feature/ClosureConfigurator';
import FeatureDetailView from './containers/Feature/DetailView';
import FeatureComponentDetailView from './containers/FeatureComponent/DetailView';
import FeatureModelDetailView from './containers/FeatureModel/DetailView';
// import BuildPackDetailView from './containers/Milestone/BuildPack';
import MilestoneDetailView from './containers/Milestone/DetailView';
import MilestoneTemplateDetailView from './containers/Milestone/TemplateDetailView';
import ProgramDetailView from './containers/Program/DetailView';
import ProjectDetailView from './containers/Project/DetailView';
import SubtaskDetailView from './containers/Subtask/DetailView';
import SubtasktTemplateDetailView from './containers/Subtask/TemplateDetailView';
import TaskDetailView from './containers/Task/DetailView';
import TaskTemplateDetailView from './containers/Task/TemplateDetailView';

const { PROJECT_MODULE } = SchemaModuleTypeEnums;
const { PROGRAM, PROJECT, MILESTONE, TASK, SUBTASK } = SchemaModuleEntityTypeEnums;

export const ProjectModuleNavigationMenu = ({ ...props }) => (
  <ProtectedModule moduleName={PROJECT_MODULE} component={
    <SubMenu {...props} key={PROJECT_MODULE} icon={<ProjectOutlined/>} title="Projects">
      <Menu.Item key={`${PROJECT_MODULE}/Dashboard`}>
        <span>Dashboard</span>
        <Link to={`/${PROJECT_MODULE}`}/>
      </Menu.Item>
      <Menu.Item key={`${PROJECT_MODULE}Program`}>
        <span>Programs</span>
        <Link to={`/${PROJECT_MODULE}/Program`}/>
      </Menu.Item>
      <Menu.Item key={`${PROJECT_MODULE}Project`}>
        <span>Projects</span>
        <Link to={`/${PROJECT_MODULE}/Project`}/>
      </Menu.Item>
      <Menu.Item key={`${PROJECT_MODULE}Milestone`}>
        <span>Milestones</span>
        <Link to={`/${PROJECT_MODULE}/Milestone`}/>
      </Menu.Item>
      <Menu.Item key={`${PROJECT_MODULE}Task`}>
        <span>Tasks</span>
        <Link to={`/${PROJECT_MODULE}/Task`}/>
      </Menu.Item>
      <Menu.Item key={`${PROJECT_MODULE}Subtask`}>
        <span>Subtasks</span>
        <Link to={`/${PROJECT_MODULE}/Subtask`}/>
      </Menu.Item>
      <Menu.Item key={`${PROJECT_MODULE}Feature`}>
        <span>Features</span>
        <Link to={`/${PROJECT_MODULE}/Feature`}/>
      </Menu.Item>
      <Menu.Item key={`${PROJECT_MODULE}FeatureModel`}>
        <span>Feature Models</span>
        <Link to={`/${PROJECT_MODULE}/FeatureModel`}/>
      </Menu.Item>
      <Menu.Item key={`${PROJECT_MODULE}FeatureComponent`}>
        <span>Feature Components</span>
        <Link to={`/${PROJECT_MODULE}/FeatureComponent`}/>
      </Menu.Item>
      <Menu.Item key={`${PROJECT_MODULE}ChangeRequest`}>
        <span>Change Requests</span>
        <Link to={`/${PROJECT_MODULE}/ChangeRequest`}/>
      </Menu.Item>
      <SubMenu title="Templates">
        <Menu.Item key={`${PROJECT_MODULE}FeatureTemplate`}>
          <span>Feature Templates</span>
          <Link to={`/${PROJECT_MODULE}/FeatureTemplate`}/>
        </Menu.Item>
        <Menu.Item key={`${PROJECT_MODULE}MilestoneTemplate`}>
          <span>Milestone Templates</span>
          <Link to={`/${PROJECT_MODULE}/MilestoneTemplate`}/>
        </Menu.Item>
        <Menu.Item key={`${PROJECT_MODULE}TaskTemplate`}>
          <span>Task Templates</span>
          <Link to={`/${PROJECT_MODULE}/TaskTemplate`}/>
        </Menu.Item>
        <Menu.Item key={`${PROJECT_MODULE}SubtaskTemplate`}>
          <span>Subtask Templates</span>
          <Link to={`/${PROJECT_MODULE}/SubtaskTemplate`}/>
        </Menu.Item>
      </SubMenu>
    </SubMenu>}
  />
)

export const ProjectModuleRoutes = () => {
  let match = useRouteMatch();
  console.log('match', match);
  console.log('match.url', match.url);
  console.log('match.path', match.path);

  return <Switch>
    <ProtectedRoute
      exact
      path={`/${PROJECT_MODULE}`}
      moduleName={PROJECT_MODULE}
      component={<Dashboard/>}/>,
    <ProtectedRoute
      exact
      path={`/${PROJECT_MODULE}/Program`}
      moduleName={PROJECT_MODULE}
      component={<RecordListView moduleName={PROJECT_MODULE} entityName={PROGRAM} pipelinesEnabled/>}/>,
    <ProtectedRoute
      exact
      path={`/${PROJECT_MODULE}/Program/:recordId`}
      moduleName={PROJECT_MODULE}
      component={
        <DetailView moduleName={PROJECT_MODULE} entityName={PROGRAM}>
          <ProgramDetailView excludeRelations={[ 'File' ]}/>
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/${PROJECT_MODULE}/Project`}
      moduleName={PROJECT_MODULE}
      component={<RecordListView moduleName={PROJECT_MODULE} entityName={PROJECT} pipelinesEnabled/>}/>,
    <ProtectedRoute
      exact
      path={`/${PROJECT_MODULE}/Project/:recordId`}
      moduleName={PROJECT_MODULE}
      component={
        <DetailView moduleName={PROJECT_MODULE} entityName={PROJECT}>
          <ProjectDetailView excludeRelations={[ 'File' ]}/>
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/${PROJECT_MODULE}/Milestone`}
      moduleName={PROJECT_MODULE}
      component={<RecordListView moduleName={PROJECT_MODULE} entityName={MILESTONE} pipelinesEnabled/>}/>,
    <ProtectedRoute
      exact
      path={`/${PROJECT_MODULE}/Milestone/:recordId`}
      moduleName={PROJECT_MODULE}
      component={
        <DetailView moduleName={PROJECT_MODULE} entityName={MILESTONE}>
          <MilestoneDetailView excludeRelations={[ 'File' ]}/>

        </DetailView>
      }/>
    {/*<ProtectedRoute*/}
    {/*  path={`/${PROJECT_MODULE}/Milestone/build_pack/:recordId`}*/}
    {/*  exact*/}
    {/*  moduleName={PROJECT_MODULE}*/}
    {/*  component={*/}
    {/*    <DetailView moduleName={PROJECT_MODULE} entityName={MILESTONE}>*/}
    {/*      <BuildPackDetailView/>*/}
    {/*    </DetailView>*/}
    {/*  }/>*/}
    <ProtectedRoute
      exact
      path={`/${PROJECT_MODULE}/Task`}
      moduleName={PROJECT_MODULE}
      component={<RecordListView moduleName={PROJECT_MODULE} entityName={TASK} pipelinesEnabled/>}/>,
    <ProtectedRoute
      exact
      path={`/${PROJECT_MODULE}/Task/:recordId`}
      moduleName={PROJECT_MODULE}
      component={
        <DetailView moduleName={PROJECT_MODULE} entityName={TASK}>
          <TaskDetailView excludeRelations={[ 'File' ]}/>
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/${PROJECT_MODULE}/Subtask`}
      moduleName={PROJECT_MODULE}
      component={<RecordListView moduleName={PROJECT_MODULE} entityName={SUBTASK} pipelinesEnabled/>}/>,
    <ProtectedRoute
      exact
      path={`/${PROJECT_MODULE}/Subtask/:recordId`}
      moduleName={PROJECT_MODULE}
      component={
        <DetailView moduleName={PROJECT_MODULE} entityName={SUBTASK}>
          <SubtaskDetailView excludeRelations={[ 'File' ]}/>
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/${PROJECT_MODULE}/Feature`}
      moduleName={PROJECT_MODULE}
      component={<RecordListView moduleName={PROJECT_MODULE} entityName={'Feature'}/>}/>,

    <ProtectedRoute
      exact
      path={`/${PROJECT_MODULE}/Feature/:recordId`}
      moduleName={PROJECT_MODULE}
      component={
        <DetailView moduleName={PROJECT_MODULE} entityName={'Feature'}>
          <FeatureDetailView excludeRelations={[ 'Task', 'File' ]}/>
        </DetailView>
      }/>

    <ProtectedRoute
      exact
      path={`/${PROJECT_MODULE}/Feature/:recordId/configure-closure`}
      moduleName={PROJECT_MODULE}
      component={
        <DetailView moduleName={PROJECT_MODULE} entityName={'Feature'}>
          <ClosureConfigurator/>
        </DetailView>
      }/>

    <ProtectedRoute
      exact
      path={`/${PROJECT_MODULE}/FeatureModel`}
      moduleName={PROJECT_MODULE}
      component={<RecordListView moduleName={PROJECT_MODULE} entityName={'FeatureModel'}/>}/>,
    <ProtectedRoute
      exact
      path={`/${PROJECT_MODULE}/FeatureModel/:recordId`}
      moduleName={PROJECT_MODULE}
      component={
        <DetailView moduleName={PROJECT_MODULE} entityName={'FeatureModel'}>
          <FeatureModelDetailView excludeRelations={[ 'File' ]}/>
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/${PROJECT_MODULE}/FeatureComponent`}
      moduleName={PROJECT_MODULE}
      component={<RecordListView moduleName={PROJECT_MODULE} entityName={'FeatureComponent'}/>}/>,
    <ProtectedRoute
      exact
      path={`/${PROJECT_MODULE}/FeatureComponent/:recordId`}
      moduleName={PROJECT_MODULE}
      component={
        <DetailView moduleName={PROJECT_MODULE} entityName={'FeatureComponent'}>
          <FeatureComponentDetailView excludeRelations={[ 'File' ]}/>
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/${PROJECT_MODULE}/ChangeRequest`}
      moduleName={PROJECT_MODULE}
      component={<RecordListView moduleName={PROJECT_MODULE} entityName={'ChangeRequest'} pipelinesEnabled/>}/>,
    <ProtectedRoute
      exact
      path={`/${PROJECT_MODULE}/ChangeRequest/:recordId`}
      moduleName={PROJECT_MODULE}
      component={
        <DetailView moduleName={PROJECT_MODULE} entityName={'ChangeRequest'}>
          <ChangeRequestDetail excludeRelations={[ 'File' ]}/>
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/${PROJECT_MODULE}/FeatureTemplate`}
      moduleName={PROJECT_MODULE}
      component={<RecordListView moduleName={PROJECT_MODULE} entityName={'FeatureTemplate'}/>}/>,
    <ProtectedRoute
      exact
      path={`/${PROJECT_MODULE}/FeatureTemplate/:recordId`}
      moduleName={PROJECT_MODULE}
      component={
        <DetailView moduleName={PROJECT_MODULE} entityName={'FeatureTemplate'}>
          <FeatureDetailView/>
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/${PROJECT_MODULE}/MilestoneTemplate`}
      moduleName={PROJECT_MODULE}
      component={<RecordListView moduleName={PROJECT_MODULE} entityName={'MilestoneTemplate'}/>}/>,
    <ProtectedRoute
      exact
      path={`/${PROJECT_MODULE}/MilestoneTemplate/:recordId`}
      moduleName={PROJECT_MODULE}
      component={
        <DetailView moduleName={PROJECT_MODULE} entityName={'MilestoneTemplate'}>
          <MilestoneTemplateDetailView/>
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/${PROJECT_MODULE}/TaskTemplate`}
      moduleName={PROJECT_MODULE}
      component={<RecordListView moduleName={PROJECT_MODULE} entityName={'TaskTemplate'}/>}/>,
    <ProtectedRoute
      exact
      path={`/${PROJECT_MODULE}/TaskTemplate/:recordId`}
      moduleName={PROJECT_MODULE}
      component={
        <DetailView moduleName={PROJECT_MODULE} entityName={'TaskTemplate'}>
          <TaskTemplateDetailView/>
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/${PROJECT_MODULE}/SubtaskTemplate`}
      moduleName={PROJECT_MODULE}
      component={<RecordListView moduleName={PROJECT_MODULE} entityName={'SubtaskTemplate'}/>}/>,
    <ProtectedRoute
      exact
      path={`/${PROJECT_MODULE}/SubtaskTemplate/:recordId`}
      moduleName={PROJECT_MODULE}
      component={
        <DetailView moduleName={PROJECT_MODULE} entityName={'SubtaskTemplate'}>
          <SubtasktTemplateDetailView/>
        </DetailView>
      }/>
    {/*<ProtectedRoute*/}
    {/*  exact*/}
    {/*  path={`/${PRODUCT_MODULE}/related/Product/:dbRecordAssociationId/:recordId`}*/}
    {/*  moduleName={PRODUCT_MODULE}*/}
    {/*  component={*/}
    {/*    <RecordDetailView moduleName={PRODUCT_MODULE} entityName="Product">*/}
    {/*      <ContactDetailView hasColumnMappings={true} visibleProperties={[ 'Quantity' ]}/>*/}
    {/*    </RecordDetailView>*/}
    {/*  }/>*/}
    <ProtectedRoute
      exact
      path={`/${PROJECT_MODULE}/related/:entityName/:dbRecordAssociationId/:recordId`}
      moduleName={PROJECT_MODULE}
      component={
        <DetailView moduleName={PROJECT_MODULE} entityName="Feature">
          <FeatureDetailView hasColumnMappings excludeRelations={[ 'File', 'Task' ]}/>
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/${PROJECT_MODULE}/:entityName/:recordId`}
      moduleName={PROJECT_MODULE}
      component={
        <DetailView moduleName={PROJECT_MODULE}>
          <DefaultRecordDetail/>
        </DetailView>
      }/>
  </Switch>
}

