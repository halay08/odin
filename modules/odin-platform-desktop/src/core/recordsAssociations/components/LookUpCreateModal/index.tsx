import { DbRecordAssociationRecordsTransform } from '@d19n/models/dist/schema-manager/db/record/association/transform/db.record.association.records.transform';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { Button } from 'antd';
import Modal from 'antd/lib/modal/Modal';
import React from 'react';
import { connect } from 'react-redux';
import { canUserCreateRecord } from '../../../../shared/permissions/rbacRules';
import { IdentityUserReducer } from '../../../identityUser/store/reducer';
import LookUpCreate from '../../../records/components/LookUpCreate';
import { SchemaReducerState } from '../../../schemas/store/reducer';
import { createOrderVisible } from '../../../workflow/store/actions';
import { updateOrCreateRecordAssociations } from '../../store/actions';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { getPremiseByUdprnAndUmprnRequest } from '../../../../containers/CrmModule/containers/Premise/store/actions';
import { createRecordsRequest } from '../../../records/store/actions';

interface Props {
  record: DbRecordEntityTransform,
  relation: DbRecordAssociationRecordsTransform,
  schemaReducer: SchemaReducerState,
  userReducer:IdentityUserReducer,
  createOrderVisible: any,
  createAssociations: any,
  getPremiseByUdprnAndUmprn: any,
  createRecord: any
}

interface State {
  modalVisible: boolean, 
  selected: any
}

const { ADDRESS } = SchemaModuleEntityTypeEnums;

class LookUpCreateModal extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = this.getInitialState();
  }

  getInitialState = () => ({
    modalVisible: false,
    selected: []
  })

  openModal() {
    const { createOrderVisible } = this.props;
    createOrderVisible();
    this.setState({
      modalVisible: true
    })
  }

  handleCancel = () => {
    const { createOrderVisible } = this.props;
    createOrderVisible();
    this.setState({
      modalVisible: false,
    });
  };

  handleOk = () => {
    const { record, relation, createAssociations, getPremiseByUdprnAndUmprn, createRecord } = this.props;
    const { schema, schemaAssociation } = relation;
    if(schemaAssociation && record) {
      if (schema.entityName === ADDRESS) {
        getPremiseByUdprnAndUmprn(
          { udprn: this.state.selected.properties.UDPRN, umprn: this.state.selected.properties.UMPRN },
          (res: any) => {
            const newAddress = {
              entity: `${schema.moduleName}:${schema.entityName}`,
              schemaId: schema.id,
              title: res.title,
              properties: {
                'Type': 'BILLING',
                'AddressLine1': res.properties.AddressLine1,
                'AddressLine2': res.properties.AddressLine2,
                'AddressLine3': res.properties.AddressLine3,
                'City': 'NA',
                'PostalCode': res.properties.PostalCode,
                'CountryCode': 'GB',
                'SalesStatus': res.status ? res.status : 'REGISTER_INTEREST',
                'UDPRN': res.properties.UDPRN,
                'UMPRN': res.properties.UMPRN,
                'AvailableSeason': null,
                'AvailableYear': null,
                'FullAddress': res.properties.FullAddress,
                'Premise': res.properties.Premise,
                'PostTown': res.properties.PostTown,
                'Classification': res.ab_plus_class_1
              },
            }
            createRecord({
              schema: schema,
              upsert: false,
              createUpdate: [ newAddress ],
            }, (res: DbRecordEntityTransform) => {
              const body = [{
                recordId: res.id
              }]
              createAssociations({
                recordId: record.id,
                schema,
                schemaAssociation,
                createUpdate: body,
              }, () => {
                this.handleCancel();
              });
            })
          },
        )  
      } else {
        const body = this.state.selected.map((elem: any) => ({
          recordId: elem,
          quantity: 1,
        }));
        createAssociations({
          recordId: record.id,
          schema,
          schemaAssociation,
          createUpdate: body,
        }, () => {
          this.handleCancel();
        });
      }
    }
  };

  render() {

    const { userReducer, record, relation } = this.props;
    const { schema } = relation;

    return (
      <div>
        <Button
          type="text"
          disabled={!canUserCreateRecord(userReducer, schema)}
          onClick={() => this.openModal()}>
          Lookup
        </Button>
        <Modal
          title={`Add ${schema.entityName}`}
          visible={this.state.modalVisible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}>
          <LookUpCreate 
            record={record}
            entityName={ schema.entityName === ADDRESS && schema.entityName !== undefined ? 'Premise' : ( schema.entityName !== undefined ? schema.entityName : '') }
            moduleName={ schema.moduleName !== undefined ? schema.moduleName : '' }
            checkboxItemSelect={(e: any) => this.setState({ selected: e })}
          />
        </Modal>
      </div>
    );
  }
}

const mapState = (state: any) => ({
  schemaReducer: state.schemaReducer,
  userReducer: state.userReducer,
});

const mapDispatch = (dispatch: any) => ({
  createOrderVisible: () => dispatch(createOrderVisible()),
  createAssociations: (params: any, cb: () => {}) => dispatch(updateOrCreateRecordAssociations(params, cb)),
  getPremiseByUdprnAndUmprn: (params: any, cb: () => {}) => dispatch(getPremiseByUdprnAndUmprnRequest(params, cb)),
  createRecord: (params: any, cb: any) => dispatch(createRecordsRequest(params, cb)),
});


export default connect(mapState, mapDispatch)(LookUpCreateModal);
