import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { Card } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import OrderItemDetailCardView from '../../../../containers/OrderModule/containers/OrderItem/DetailCardView';
import { IRecordReducer } from '../../../records/store/reducer';
import { getSchemaByModuleAndEntityRequest, ISchemaByModuleAndEntity } from '../../../schemas/store/actions';
import { getRecordAssociationsRequest, IGetRecordAssociations } from '../../store/actions';
import { IRecordAssociationsReducer } from '../../store/reducer';
import ListActionMenu from '../ListActions/ListActionMenu';

interface Props {
  title: any,
  moduleName: any,
  entityName: any,
  filters?: string[],
  hideTabs?: string[],
  getSchema?: any,
  getAssociations?: any,
  showServiceAppointmentRecord?: boolean
  match?: any,
  record: DbRecordEntityTransform,
  recordReducer: IRecordReducer,
  recordAssociationReducer: IRecordAssociationsReducer,
}

class AssociationCardWithTabsList extends React.Component<Props> {

  timer: NodeJS.Timeout | undefined;

  componentDidMount() {
    this.timer = undefined;

    if(!this.timer) {

      this.timer = setInterval(() => this.getRecordAssociations(), 5000);

    }

    this.getRecordAssociations();
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {
    if(prevProps.record !== this.props.record) {
      this.getRecordAssociations();
    }
    if(prevProps.entityName !== this.props.entityName) {
      this.getRecordAssociations();
    }
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  clearTimer() {
    //@ts-ignore
    clearInterval(this.timer)
    this.timer = undefined;
  }


  private getRecordAssociations() {
    const { getAssociations, getSchema, moduleName, entityName, record, filters } = this.props;
    if(record) {
      getSchema({ moduleName, entityName }, (result: SchemaEntity) => {
        getAssociations({
          recordId: record.id,
          key: entityName,
          schema: result,
          entities: [ entityName ],
          filters,
        });
      });
    }
  }

  private getListOfRelatedRecordsByEntity() {

    const { recordAssociationReducer, record, moduleName, entityName, hideTabs } = this.props;

    const associationKey = `${record?.id}_${entityName}`;
    const associationObj: any = recordAssociationReducer.shortList[associationKey];

    if(associationObj && associationObj[entityName] && associationObj[entityName].dbRecords) {

      const dbRecords = associationObj[entityName].dbRecords;

      if(dbRecords && entityName === 'OrderItem') {

        return dbRecords.map((relatedRecord: DbRecordEntityTransform) => (
          <OrderItemDetailCardView
            entityName={entityName}
            relatedRecord={relatedRecord}
            record={record}
            moduleName={moduleName}
            hideTabs={hideTabs || []}/>
        ))

      } else {

        return <div></div>;

      }

    } else {

      return <div></div>;

    }
  }

  render() {
    const { record, entityName, recordAssociationReducer, title } = this.props;

    const associationKey = `${record?.id}_${entityName}`;
    const associationObj: any = recordAssociationReducer.shortList[associationKey];

    return (
      <div className="association-card-with-tabs-wrapper">
        <Card
          className="association-table-card"
          size="small"
          bordered={false}
          title={title}
          extra={
            <ListActionMenu
              record={record}
              relation={associationObj && associationObj[entityName]}
            />}
        >
          {this.getListOfRelatedRecordsByEntity()}
        </Card>
      </div>
    )
  }
}

const mapState = (state: any) => ({
  recordReducer: state.recordReducer,
  recordAssociationReducer: state.recordAssociationReducer,
});

const mapDispatch = (dispatch: any) => ({
  getSchema: (payload: ISchemaByModuleAndEntity, cb: any) => dispatch(getSchemaByModuleAndEntityRequest(payload, cb)),
  getAssociations: (params: IGetRecordAssociations) => dispatch(getRecordAssociationsRequest(params)),
});

export default connect(mapState, mapDispatch)(AssociationCardWithTabsList);
