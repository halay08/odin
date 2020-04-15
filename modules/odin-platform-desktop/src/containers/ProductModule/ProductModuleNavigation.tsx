import { BarcodeOutlined } from '@ant-design/icons';
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
import RelatedRecordDetailView from '../DefaultViews/RelatedRecordDetailView';
import OfferDetailView from './Offer';
import PriceBookDetailView from './PriceBook';
import ProductDetailView from './Product';

const { PRODUCT_MODULE } = SchemaModuleTypeEnums;

export const ProductModuleNavigationMenu = ({ ...props }) => (
  <ProtectedModule moduleName={PRODUCT_MODULE} component={
    <SubMenu {...props} key={PRODUCT_MODULE} icon={<BarcodeOutlined/>} title="Products" >
      <Menu.Item key={`${PRODUCT_MODULE}Vendor`}>
        <span>Vendors</span>
        <Link to={`/${PRODUCT_MODULE}/Vendor`}/>
      </Menu.Item>
      <Menu.Item key={`${PRODUCT_MODULE}PriceBook`}>
        <span>Price Books</span>
        <Link to={`/${PRODUCT_MODULE}/PriceBook`}/>
      </Menu.Item>
      <Menu.Item key={`${PRODUCT_MODULE}Offer`}>
        <span>Offers</span>
        <Link to={`/${PRODUCT_MODULE}/Offer`}/>
      </Menu.Item>
      <Menu.Item key={`${PRODUCT_MODULE}Discount`}>
        <span>Discounts</span>
        <Link to={`/${PRODUCT_MODULE}/Discount`}/>
      </Menu.Item>
      <Menu.Item key={`${PRODUCT_MODULE}Product`}>
        <span>Products</span>
        <Link to={`/${PRODUCT_MODULE}/Product`}/>
      </Menu.Item>
      <Menu.Item key={`${PRODUCT_MODULE}ProductComponent`}>
        <span>Product Components</span>
        <Link to={`/${PRODUCT_MODULE}/ProductComponent`}/>
      </Menu.Item>
    </SubMenu>}
  />
)

export const ProductModuleRoutes = () => {

  let match = useRouteMatch();
  console.log('match', match);
  console.log('match.url', match.url);
  console.log('match.path', match.path);

  return <Switch>
    <ProtectedRoute
      exact
      path={`/${PRODUCT_MODULE}/Vendor`}
      moduleName={PRODUCT_MODULE}
      component={<RecordListView moduleName={PRODUCT_MODULE} entityName="Vendor"/>}/>,
    <ProtectedRoute
      exact
      path={`/${PRODUCT_MODULE}/Vendor/:recordId`}
      moduleName={PRODUCT_MODULE}
      component={
        <DetailView moduleName={PRODUCT_MODULE} entityName="Vendor">
          <DefaultRecordDetail/>
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/${PRODUCT_MODULE}/PriceBook`}
      moduleName={PRODUCT_MODULE}
      component={<RecordListView moduleName={PRODUCT_MODULE} entityName="PriceBook"/>}/>,
    <ProtectedRoute
      exact
      path={`/${PRODUCT_MODULE}/PriceBook/:recordId`}
      moduleName={PRODUCT_MODULE}
      component={
        <DetailView moduleName={PRODUCT_MODULE} entityName="PriceBook">
          <PriceBookDetailView/>
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/${PRODUCT_MODULE}`}
      moduleName={PRODUCT_MODULE}
      component={<RecordListView moduleName={PRODUCT_MODULE} entityName="Product"/>}/>,
    <ProtectedRoute
      exact
      path={`/${PRODUCT_MODULE}/Offer`}
      moduleName={PRODUCT_MODULE}
      component={<RecordListView moduleName={PRODUCT_MODULE} entityName="Offer"/>}/>,
    <ProtectedRoute
      exact
      path={`/${PRODUCT_MODULE}/Offer/:recordId`}
      moduleName={PRODUCT_MODULE}
      component={
        <DetailView moduleName={PRODUCT_MODULE} entityName="Offer">
          <OfferDetailView/>
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/${PRODUCT_MODULE}/Product`}
      moduleName={PRODUCT_MODULE}
      component={
        <RecordListView moduleName={PRODUCT_MODULE} entityName="Product"/>
      }/>,
    <ProtectedRoute
      exact
      path={`/${PRODUCT_MODULE}/Product/:recordId`}
      moduleName={PRODUCT_MODULE}
      component={
        <DetailView moduleName={PRODUCT_MODULE} entityName="Product">
          <ProductDetailView
            excludeRelations={[ 'Lead', 'OrderItem', 'WorkOrder', 'Task', 'ConsumptionSchedule', 'Feature' ]}/>
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/${PRODUCT_MODULE}/related/Product/:dbRecordAssociationId/:recordId`}
      moduleName={PRODUCT_MODULE}
      component={
        <DetailView moduleName={PRODUCT_MODULE} entityName="Product">
          <ProductDetailView
            hasColumnMappings={true}
            excludeRelations={[ 'Lead', 'OrderItem', 'WorkOrder', 'Task', 'ConsumptionSchedule', 'Feature' ]}
            visibleProperties={[
              'UnitPrice',
              'DiscountValue',
              'DiscountLength',
              'DiscountType',
              'DiscountUnit',
              'TrialLength',
              'TrialUnit',
              'IntervalUnit',
              'IntervalLength',
            ]}
          />
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/${PRODUCT_MODULE}/related/ProductComponent/:dbRecordAssociationId/:recordId`}
      moduleName={PRODUCT_MODULE}
      component={
        <DetailView moduleName={PRODUCT_MODULE} entityName="Product">
          <RelatedRecordDetailView
            excludeRelations={[ 'Lead', 'OrderItem', 'WorkOrder', 'Task', 'ConsumptionSchedule' ]}
            visibleProperties={[
              'Quantity',
            ]}/>
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/${PRODUCT_MODULE}/ProductComponent`}
      moduleName={PRODUCT_MODULE}
      component={<RecordListView moduleName={PRODUCT_MODULE} entityName="ProductComponent"/>}/>,
    <ProtectedRoute
      exact
      path={`/${PRODUCT_MODULE}/ProductComponent/:recordId`}
      moduleName={PRODUCT_MODULE}
      component={
        <DetailView moduleName={PRODUCT_MODULE} entityName="ProductComponent">
          <DefaultRecordDetail/>
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/${PRODUCT_MODULE}/Discount`}
      moduleName={PRODUCT_MODULE}
      component={<RecordListView moduleName={PRODUCT_MODULE} entityName="Discount"/>}/>,
    <ProtectedRoute
      exact
      path={`/${PRODUCT_MODULE}/Discount/:recordId`}
      moduleName={PRODUCT_MODULE}
      component={
        <DetailView moduleName={PRODUCT_MODULE} entityName="Discount">
          <DefaultRecordDetail excludeRelations={[ 'Lead', 'Order' ]}/>
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/${PRODUCT_MODULE}/:entityName/:recordId`}
      moduleName={PRODUCT_MODULE}
      component={
        <DetailView moduleName={PRODUCT_MODULE}>
          <DefaultRecordDetail excludeRelations={[]}/>
        </DetailView>
      }/>
  </Switch>
}


