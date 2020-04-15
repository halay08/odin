import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { Card, Typography } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { sendConfirmationEmail } from '../../../../../core/notifications/email/store/actions';
import { IRecordReducer } from '../../../../../core/records/store/reducer';
import {
  getRecordAssociationsRequest,
  IGetRecordAssociations,
} from '../../../../../core/recordsAssociations/store/actions';
import { IRecordAssociationsReducer } from '../../../../../core/recordsAssociations/store/reducer';
import { getSchemaByModuleAndEntityRequest, ISchemaByModuleAndEntity } from '../../../../../core/schemas/store/actions';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';

type PathParams = {
  url: string,
  recordId: string
}

type PropsType = RouteComponentProps<PathParams> & {

  record: DbRecordEntityTransform
  recordReducer: IRecordReducer,
  schemaReducer: SchemaReducerState,
  recordAssociationReducer: IRecordAssociationsReducer,
  sendConfirmation: any,
  getSchema: any,
  getAssociations: any,
  match: any

}

class WorkOrderItems extends React.Component<PropsType> {

  componentDidUpdate(prevProps: Readonly<PropsType>, prevState: Readonly<{}>, snapshot?: any) {
    if(prevProps.record !== this.props.record) {
      this.getRecordAssociations('OrderModule', 'OrderItem', this.props.record);
    }
  }

  private getRecordAssociations(moduleName: string, entityName: string, record: DbRecordEntityTransform) {
    const { getAssociations, getSchema } = this.props;
    if(record) {
      getSchema({ moduleName, entityName }, (result: SchemaEntity) => {
        getAssociations({
          recordId: record.id,
          key: entityName,
          schema: result,
          entities: [ entityName ],
        });
      });
    }
  }

  private getListOfRelatedRecordsByEntity(record: DbRecordEntityTransform, entityName: string) {
    const { recordAssociationReducer } = this.props;
    const associationKey = `${record?.id}_${entityName}`;
    const associationObj: any = recordAssociationReducer.shortList[associationKey];
    if(associationObj && associationObj[entityName] && associationObj[entityName].dbRecords) {
      return associationObj[entityName].dbRecords;
    } else {
      return [];
    }
  }

  render() {
    const { record } = this.props;

    return (<Card title="Order Items">
      {this.getListOfRelatedRecordsByEntity(record, 'OrderItem').map((elem: DbRecordEntityTransform) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <Typography.Text>{elem.title}</Typography.Text>
          {getProperty(elem, 'ProductCategory') === 'BROADBAND' &&
          <Link to={`/FieldServiceModule/WorkOrder/${record.id}/OrderItem/${elem.id}`} component={Typography.Link}
                style={{ fontSize: 14 }}>Manage Devices</Link>
          }
        </div>
      ))}
    </Card>)
  }
}

const mapState = (state: any) => ({
  schemaReducer: state.schemaReducer,
  recordReducer: state.recordReducer,
  recordAssociationReducer: state.recordAssociationReducer,
});

const mapDispatch = (dispatch: any) => ({
  sendConfirmation: (payload: any) => dispatch(sendConfirmationEmail(payload)),
  getSchema: (payload: ISchemaByModuleAndEntity, cb: any) => dispatch(getSchemaByModuleAndEntityRequest(payload, cb)),
  getAssociations: (params: IGetRecordAssociations, cb: any) => dispatch(getRecordAssociationsRequest(params, cb)),
});

export default withRouter(connect(mapState, mapDispatch)(WorkOrderItems));
