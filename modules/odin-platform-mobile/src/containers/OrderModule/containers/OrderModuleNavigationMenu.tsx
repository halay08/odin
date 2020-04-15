import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import React from 'react';
import { Route } from 'react-router-dom';
import RecordDetailView from '../../../core/records/components/DetailView';
import { SchemaModuleEntityTypeEnums } from "@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types";
import PlainRecordDetailView from "../../../shared/PlainRecordDetailView";

const { ORDER } = SchemaModuleEntityTypeEnums;
const { ORDER_MODULE } = SchemaModuleTypeEnums;



export const OrderModuleRoutes = [
  <Route path={`/${ORDER_MODULE}/${ORDER}/:recordId`} exact>
    <RecordDetailView moduleName={ORDER_MODULE} entityName={ORDER}>
      <PlainRecordDetailView/>
    </RecordDetailView>
  </Route>,
];

