import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Button, Form, Modal, PageHeader, Row, Select, Statistic } from 'antd';
import { Option } from 'antd/es/mentions';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import OdinFormModal from '../../../../../core/records/components/Forms/FormModal';
import { initializeRecordForm } from '../../../../../core/records/components/Forms/store/actions';
import { CREATE_DB_RECORD_REQUEST } from '../../../../../core/records/store/constants';
import { getSchemaByModuleAndEntityRequest, ISchemaByModuleAndEntity } from '../../../../../core/schemas/store/actions';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import history from '../../../../../shared/utilities/browserHisory';
import { splitModuleAndEntityName } from '../../../../../shared/utilities/recordHelpers';
import { getSchemaFromShortListByModuleAndEntity } from '../../../../../shared/utilities/schemaHelpers';
import { updatePremiseSalesStatusRequest } from '../store/actions';
import { LOG_PREMISE_VISIT_REQUEST } from '../store/constants';
import { PremiseReducerState } from '../store/reducer';
import { Premise } from '../types/premise.interface';


interface IProps {
  record: Premise,
  userReducer: any,
  schemaReducer: SchemaReducerState,
  premiseReducer: PremiseReducerState,
  initializeForm: any,
  updatePremiseStatus: any,
  getSchema: any,
  refresh: any,
}

interface IState {
  showStatusChangeModal: boolean;
  statusId: number | null;
}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const { CRM_MODULE } = SchemaModuleTypeEnums;
const { ADDRESS, CONTACT, LEAD } = SchemaModuleEntityTypeEnums;

const addressFormUUID = uuidv4();
const leadFormUUID = uuidv4();

class RecordPageHeader extends React.Component<IProps, IState> {

  constructor(props: any) {
    super(props);
    this.state = {
      showStatusChangeModal: false,
      statusId: null,
    };
  }

  componentDidMount(): void {
    this.loadSchema();
  }

  loadSchema() {
    const { getSchema } = this.props;
    // get schema by module and entity and save it to the local state
    getSchema({ moduleName: 'CrmModule', entityName: 'Address' });
    getSchema({ moduleName: 'CrmModule', entityName: 'Premise' });
    getSchema({ moduleName: 'CrmModule', entityName: 'Contact' });
    getSchema({ moduleName: 'CrmModule', entityName: 'Lead' });

  }


  private toggleStatusModal() {
    const { showStatusChangeModal } = this.state;
    this.setState({ showStatusChangeModal: !showStatusChangeModal });
  };


  async initializeFormForNewAddress() {
    const { initializeForm, premiseReducer, schemaReducer } = this.props;

    const addressSchema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, CRM_MODULE, ADDRESS);

    if(addressSchema && premiseReducer.selected) {
      const UDPRN = getProperty(premiseReducer.selected, 'UDPRN');
      const UMPRN = getProperty(premiseReducer.selected, 'UMPRN');
      const FullAddress = getProperty(premiseReducer.selected, 'FullAddress');
      const AddressLine1 = getProperty(premiseReducer.selected, 'AddressLine1');
      const AddressLine2 = getProperty(premiseReducer.selected, 'AddressLine2');
      const AddressLine3 = getProperty(premiseReducer.selected, 'AddressLine3');
      const PostalCode = getProperty(premiseReducer.selected, 'PostalCode');
      const Premise = getProperty(premiseReducer.selected, 'Premise');
      const PostTown = getProperty(premiseReducer.selected, 'PostTown');

      const newAddress = {
        entity: `${addressSchema.moduleName}:${addressSchema.entityName}`,
        schemaId: addressSchema.id,
        title: premiseReducer.selected.title,
        properties: {
          'Type': 'BILLING',
          'AddressLine1': AddressLine1,
          'AddressLine2': AddressLine2,
          'AddressLine3': AddressLine3,
          'City': 'NA',
          'PostalCode': PostalCode,
          'CountryCode': 'GB',
          'SalesStatus': 'NO_STATUS',
          'UDPRN': UDPRN,
          'UMPRN': UMPRN,
          'AvailableSeason': null,
          'AvailableYear': null,
          'FullAddress': FullAddress,
          'Premise': Premise,
          'PostTown': PostTown,
        },
      }

      return initializeForm({
        title: 'Create Address',
        formUUID: addressFormUUID,
        showFormModal: true,
        isCreateReq: true,
        schema: addressSchema,
        selected: newAddress,
        sections: [
          {
            entity: `${addressSchema?.moduleName}:${addressSchema?.entityName}`,
            name: addressSchema?.name,
            schema: addressSchema,
          },
        ],
        modified: [ newAddress ],
      });
    }
  }

  async initializeFormForNewLead() {
    const { schemaReducer, initializeForm, premiseReducer } = this.props;
    if(!!schemaReducer.list && premiseReducer.selected) {

      const addressSchema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, CRM_MODULE, ADDRESS);
      const contactSchema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, CRM_MODULE, CONTACT);
      const leadSchema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, CRM_MODULE, LEAD);


      if(addressSchema && contactSchema && leadSchema) {

        const UDPRN = getProperty(premiseReducer.selected, 'UDPRN');
        const UMPRN = getProperty(premiseReducer.selected, 'UMPRN');
        const FullAddress = getProperty(premiseReducer.selected, 'FullAddress');
        const AddressLine1 = getProperty(premiseReducer.selected, 'AddressLine1');
        const AddressLine2 = getProperty(premiseReducer.selected, 'AddressLine2');
        const AddressLine3 = getProperty(premiseReducer.selected, 'AddressLine3');
        const PostalCode = getProperty(premiseReducer.selected, 'PostalCode');
        const Premise = getProperty(premiseReducer.selected, 'Premise');
        const PostTown = getProperty(premiseReducer.selected, 'PostTown');


        const newLead = {
          entity: `${leadSchema.moduleName}:${leadSchema.entityName}`,
          schemaId: leadSchema.id,
          title: premiseReducer.selected.title,
          properties: {
            Type: 'RESIDENTIAL',
            Source: 'SALES_REP_D2D',
          },
        };

        const newAddress = {
          entity: `${addressSchema.moduleName}:${addressSchema.entityName}`,
          schemaId: addressSchema.id,
          title: premiseReducer.selected.title,
          properties: {
            'Type': 'BILLING',
            'AddressLine1': AddressLine1,
            'AddressLine2': AddressLine2,
            'AddressLine3': AddressLine3,
            'City': 'NA',
            'PostalCode': PostalCode,
            'CountryCode': 'GB',
            'SalesStatus': 'REGISTER_INTEREST',
            'UDPRN': UDPRN,
            'UMPRN': UMPRN,
            'AvailableSeason': null,
            'AvailableYear': null,
            'FullAddress': FullAddress,
            'Premise': Premise,
            'PostTown': PostTown,
          },
        }

        return initializeForm({
          title: 'Create Lead',
          formUUID: leadFormUUID,
          showFormModal: true,
          isCreateReq: true,
          schema: contactSchema,
          sections: [
            {
              entity: `${contactSchema.moduleName}:${contactSchema.entityName}`,
              name: contactSchema.name,
              schema: contactSchema,
            },
          ],
          modified: [ newLead, newAddress ],
        });
      }
    }
  }


  handleSubmit = () => {
    const { statusId } = this.state;
    const { updatePremiseStatus, premiseReducer, refresh } = this.props;
    if(!!premiseReducer.selected) {
      const { UDPRN, UMPRN } = premiseReducer.selected.properties;

      const payload = [
        {
          udprn: UDPRN,
          umprn: UMPRN,
          statusId: Number(statusId),
        },
      ];

      updatePremiseStatus({ createUpdate: payload }, () => {
        this.toggleStatusModal();
        refresh();
      });
    }
  };

  private handleFormSubmit(params: { event: string, results: DbRecordEntityTransform }) {
    const { schemaReducer } = this.props;

    switch (params.event) {
      case LOG_PREMISE_VISIT_REQUEST:
        console.log('results', params.results);
        return;
      case CREATE_DB_RECORD_REQUEST:
        console.log('results', params.results);
        const schema = getSchemaFromShortListByModuleAndEntity(
          schemaReducer.shortList,
          splitModuleAndEntityName(params.results.entity).moduleName,
          splitModuleAndEntityName(params.results.entity).entityName,
        );
        history.push(`/${schema?.moduleName}/${schema?.entityName}/${params.results.id}`);
    }
  }


  render() {

    const { showStatusChangeModal } = this.state;
    const { premiseReducer } = this.props;

    return (
      <Fragment>

        <OdinFormModal formUUID={addressFormUUID}
                       onSubmitEvent={(params: { event: string, results: DbRecordEntityTransform }) => this.handleFormSubmit(
                         params)}/>

        <OdinFormModal formUUID={leadFormUUID}
                       onSubmitEvent={(params: { event: string, results: DbRecordEntityTransform }) => this.handleFormSubmit(
                         params)}/>

        <Modal
          className='dynamic-form-modal'
          style={{ top: 20 }}
          title="change status"
          visible={showStatusChangeModal}
          onOk={this.handleSubmit}
          confirmLoading={premiseReducer.isCreating}
          onCancel={() => this.toggleStatusModal()}
        >
          <Form
            {...layout}
            className="dynamic-form"
            initialValues={{ remember: true }}
          >
            <Select defaultValue={!!premiseReducer.selected ? premiseReducer.selected.sales_status_id : null}
                    style={{ width: '100%' }}
                    onChange={(val) => this.setState({ statusId: val })}>
              <Option value='1'>Order</Option>
              <Option value='2'>Pre order</Option>
              <Option value='3'>Register interest</Option>
            </Select>
          </Form>
        </Modal>

        <PageHeader
          className="page-header"
          ghost={false}
          onBack={() => history.push('/CrmModule/Premise')}
          title={'Premise'}
          extra={[
            <Button key="1" size="middle"
                    style={{ width: 150 }}
                    onClick={() => this.initializeFormForNewAddress()}>new address</Button>,
            <Button key="2" size="middle"
                    style={{ width: 150 }}
                    onClick={() => this.initializeFormForNewLead()}>new lead</Button>,
            <Button key="3" type="primary" size="middle"
                    style={{ width: 150 }}
                    onClick={() => this.toggleStatusModal()}>change status</Button>,
          ]}
        >
          <Row>
            <Statistic title="Status" value={!!premiseReducer.selected ? premiseReducer.selected.status : null}/>
          </Row>
        </PageHeader>
      </Fragment>
    )
  }
}

const mapState = (state: any) => ({
  userReducer: state.userReducer,
  premiseReducer: state.premiseReducer,
  schemaReducer: state.schemaReducer,
});

const mapDispatch = (dispatch: any) => ({
  getSchema: (payload: ISchemaByModuleAndEntity, cb: any) => dispatch(getSchemaByModuleAndEntityRequest(payload, cb)),
  updatePremiseStatus: (payload: any, cb: () => {}) => dispatch(updatePremiseSalesStatusRequest(payload, cb)),
  initializeForm: (params: any) => dispatch(initializeRecordForm(params)),
});

export default connect(mapState, mapDispatch)(RecordPageHeader);

