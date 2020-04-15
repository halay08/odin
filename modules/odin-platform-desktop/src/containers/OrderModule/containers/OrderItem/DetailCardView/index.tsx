import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import React from 'react';
import { connect } from 'react-redux';
import { IRecordReducer } from '../../../../../core/records/store/reducer';
import AssociationDataTable from '../../../../../core/recordsAssociations/components/AssociationDataTable/DataTable';
import ListItemActionMenu from '../../../../../core/recordsAssociations/components/ListActions/ListItemActionMenu';
import {
  getRecordAssociationsRequest,
  IGetRecordAssociations,
} from '../../../../../core/recordsAssociations/store/actions';
import { IRecordAssociationsReducer } from '../../../../../core/recordsAssociations/store/reducer';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import CardWithTabs from '../../../../../shared/components/CardWithTabs';
import {
  showCustomerDeviceOnt,
  showCustomerDeviceRouter,
  showNetworkTab,
  showVoiceTab,
} from '../DetailView/component-rendering-conditions';
import NetworkProvisioningModal from '../NetworkActivateModal';
import NetworkCheckModal from '../NetworkCheckModal';
import NetworkDeactivateModal from '../NetworkDeactivateModal';
import SipwiseCustomerContactSetupModal from '../SipwiseCustomerContactSetupModal';
import VoiceActivateModal from '../VoiceActivateModal';
import Summary from './Summary';

const { CUSTOMER_DEVICE_ONT, CUSTOMER_DEVICE_ROUTER, PRODUCT, WORK_ORDER } = SchemaModuleEntityTypeEnums;
const { FIELD_SERVICE_MODULE, PRODUCT_MODULE, SERVICE_MODULE } = SchemaModuleTypeEnums;

interface Props {

  moduleName: string,
  entityName: string,
  showRecordTitle?: boolean,
  disableListActions?: boolean,
  hideTabs?: string[],
  record: DbRecordEntityTransform,
  relatedRecord: DbRecordEntityTransform,
  recordReducer: IRecordReducer,
  schemaReducer: SchemaReducerState,
  recordAssociationReducer: IRecordAssociationsReducer,
  getAssociations: any,

}

interface IState {

  showStatusChangeModal: boolean;
  statusId: number | null;

}

class OrderItemDetailCardView extends React.Component<Props, IState> {

  private handleOntView() {
    const { relatedRecord } = this.props;
    return (
      <div>
        <div>
          {showCustomerDeviceOnt(relatedRecord) &&
          <div style={{ display: 'flex', marginBottom: 24 }}>
              <div style={{ marginRight: 12 }}>
                  <NetworkProvisioningModal record={relatedRecord}/>
              </div>
              <div style={{ marginRight: 12 }}>
                  <NetworkDeactivateModal record={relatedRecord}/>
              </div>
              <div style={{ marginRight: 12 }}>
                  <NetworkCheckModal record={relatedRecord}/>
              </div>
          </div>
          }
        </div>
        {showCustomerDeviceOnt(relatedRecord) &&
        <AssociationDataTable
            title={'ONT'}
            record={relatedRecord}
            moduleName={SERVICE_MODULE}
            entityName={CUSTOMER_DEVICE_ONT}/>
        }
      </div>
    )
  }

  private handleRouterView() {
    const { relatedRecord } = this.props;
    return (
      <div>
        {showCustomerDeviceRouter(relatedRecord) &&
        <AssociationDataTable
            title={'Router'}
            record={relatedRecord}
            moduleName={SERVICE_MODULE}
            entityName={CUSTOMER_DEVICE_ROUTER}/>
        }
      </div>
    )
  }

  private getListItemActionMenu(
    relatedRecord: DbRecordEntityTransform,
    entityName: string,
  ): any {

    const { record, recordAssociationReducer } = this.props;
    const associationKey = `${record?.id}_${entityName}`;
    const associationObj: any = recordAssociationReducer.shortList[associationKey];

    if(associationObj && associationObj[entityName]) {
      return <ListItemActionMenu
        relatedRecord={relatedRecord}
        record={record}
        relation={associationObj[entityName]}
        hidden={[]}/>;

    } else {
      return <div/>;
    }
  }

  renderTabsList() {

    const { relatedRecord, hideTabs } = this.props;

    if(showNetworkTab(relatedRecord) && showCustomerDeviceOnt(relatedRecord)) {

      // @ts-ignore
      return [
        {
          key: 'Summary',
          tab: 'Summary',
        },
        {
          key: 'Product',
          tab: 'Details',
        },
        {
          key: 'ONT',
          tab: 'ONT',
        },
        {
          key: 'Router',
          tab: 'Router',
        },
        {
          key: 'WorkOrder',
          tab: 'Work Order',
        },
      ].filter(elem => {

        // @ts-ignore
        return !hideTabs.includes(elem.key)

      })

    } else if(showNetworkTab(relatedRecord)) {

      // @ts-ignore
      return [
        {
          key: 'Summary',
          tab: 'Summary',
        },
        {
          key: 'Product',
          tab: 'Details',
        },
        {
          key: 'Router',
          tab: 'Router',
        },
        {
          key: 'WorkOrder',
          tab: 'Work Order',
        },
      ].filter(elem => {

        // @ts-ignore
        return !hideTabs.includes(elem.key)

      })

    } else if(showVoiceTab(relatedRecord)) {
      return [
        {
          key: 'Summary',
          tab: 'Summary',
        },
        {
          key: 'Product',
          tab: 'Details',
        },
        {
          key: 'Device',
          tab: 'Devices',
        },
        {
          key: 'WorkOrder',
          tab: 'Work Order',
        },
      ].filter(elem => {

        // @ts-ignore
        return !hideTabs.includes(elem.key)

      })

    } else {
      return []
    }
  }

  renderDynamicAssociations() {
    const { relatedRecord, record } = this.props;
    if(showNetworkTab(relatedRecord)) {
      return {
        Summary: <Summary record={record} relatedRecord={relatedRecord}/>,
        Product: <AssociationDataTable
          title={'Product'}
          record={relatedRecord}
          moduleName={PRODUCT_MODULE}
          entityName={PRODUCT}/>,
        ONT: this.handleOntView(),
        Router: this.handleRouterView(),
        WorkOrder: <AssociationDataTable
          title={WORK_ORDER}
          record={relatedRecord}
          moduleName={FIELD_SERVICE_MODULE}
          entityName={WORK_ORDER}/>,
      }
    } else if(showVoiceTab(relatedRecord)) {
      return {
        Summary: <Summary record={record} relatedRecord={relatedRecord}/>,
        Product: <AssociationDataTable
          title={'Product'}
          record={relatedRecord}
          moduleName={PRODUCT_MODULE}
          entityName={PRODUCT}/>,
        Device: <div>
          <ol>
            <li>If the customer is porting their phone number,<br/> create a phone porting entry first.
              Otherwise skip to step 2.
            </li>
            <li>Setup Sipwise profile</li>
            <li>Activate voice on the network</li>
          </ol>
          <div style={{ display: 'flex', marginBottom: 24 }}>
            <div style={{ marginRight: 12 }}>
              <SipwiseCustomerContactSetupModal record={relatedRecord}/>
            </div>
            <div style={{ marginRight: 12 }}>
              <VoiceActivateModal record={relatedRecord}/>
            </div>
          </div>
          <AssociationDataTable
            title={'Phone Porting'}
            record={relatedRecord}
            moduleName={SERVICE_MODULE}
            entityName={'CustomerPhonePorting'}/>
        </div>,
        WorkOrder: <AssociationDataTable
          title={WORK_ORDER}
          record={relatedRecord}
          moduleName={FIELD_SERVICE_MODULE}
          entityName={WORK_ORDER}/>,
      }
    } else {
      return {}
    }
  }


  private renderOrderCards() {
    const { relatedRecord, disableListActions, entityName } = this.props;

    return <CardWithTabs
      title={`${relatedRecord?.recordNumber} - ${relatedRecord?.title}`}
      extra={!disableListActions ? this.getListItemActionMenu(relatedRecord, entityName) : <div/>}
      defaultTabKey='Summary'
      tabList={this.renderTabsList()}
      contentList={{ ...this.renderDynamicAssociations() }}
    />
  }

  render() {
    return (
      this.renderOrderCards()
    )
  }
}

const mapState = (state: any) => ({
  schemaReducer: state.schemaReducer,
  recordReducer: state.recordReducer,
  recordAssociationReducer: state.recordAssociationReducer,
});

const mapDispatch = (dispatch: any) => ({
  getAssociations: (params: IGetRecordAssociations) => dispatch(getRecordAssociationsRequest(params)),
});

export default connect(mapState, mapDispatch)(OrderItemDetailCardView);
