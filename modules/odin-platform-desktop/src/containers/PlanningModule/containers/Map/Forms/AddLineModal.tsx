import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { SchemaTypeEntity } from '@d19n/models/dist/schema-manager/schema/types/schema.type.entity';
import { Card, Col, Modal, Row } from 'antd';
import { constantCase } from 'change-case';
import React from 'react'
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { MapReducerUpdate, updateMapState } from '../../../../../core/gis/store/actions';
import { MapReducer } from '../../../../../core/gis/store/reducer';
import OdinFormModal from '../../../../../core/records/components/Forms/FormModal';
import { initializeRecordForm } from '../../../../../core/records/components/Forms/store/actions';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import { getSchemaFromShortListByModuleAndEntity } from '../../../../../shared/utilities/schemaHelpers';
import { FEATURE_NAMES } from '../constants';
import './styles.scss'

const { PROJECT_MODULE } = SchemaModuleTypeEnums;
const { FEATURE } = SchemaModuleEntityTypeEnums;

interface Props {

  schemaReducer: SchemaReducerState,
  mapReducer: MapReducer,
  updateMap: (params: MapReducerUpdate) => {},
  initializeForm: any,

}

const uuid = uuidv4();

class AddLineModal extends React.Component<Props> {

  handleMenuClick(key: string) {

    const { updateMap, initializeForm, schemaReducer, mapReducer } = this.props;
    const { coordinates } = mapReducer;

    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, PROJECT_MODULE, FEATURE);

    updateMap({ addPointModal: false })
    // @ts-ignore
    const featureName = FEATURE_NAMES[key.toUpperCase()];

    if(schema) {
      initializeForm({
        formUUID: uuid,
        title: `Create ${key}`,
        showFormModal: true,
        showInitializing: false,
        isCreateReq: true,
        schema: schema,
        recordType: constantCase(featureName),
        sections: [ { name: schema.name, schema: schema } ],
        modified: [
          {
            schemaId: schema.id,
            type: constantCase(featureName),
            properties: {
              Coordinates: coordinates ? coordinates : undefined,
              // we set a temporary UUID on create which is later updated with the id of the feature
              // created in the external database
              ExternalRef: uuid,
            },
            associations: [],
          },
        ],
      });
    }

    // @ts-ignore
    updateMap({
      // showCreateModal: true,
      addLineEnabled: true,
      addLineModal: false,
      featureName,
      mapSidebarVisible: false,
    })
  }

  private handleFormSubmit(params: { event: string, results: any }) {
    const { schemaReducer, mapReducer } = this.props;

    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, PROJECT_MODULE, FEATURE);

    console.log('params.event', params.event);

    if(mapReducer.map) {
      const getZoom = mapReducer.map.getView().getZoom();
      const newZoomIn = Number(getZoom) + 0.0000001;
      const newZoomOut = Number(getZoom) + 0.0000001;

      mapReducer.map.getView().setZoom(newZoomIn);
      mapReducer.map.getView().setZoom(newZoomOut);
    }

  }


  render() {

    const { schemaReducer, mapReducer, updateMap } = this.props
    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, PROJECT_MODULE, FEATURE)

    return (

      <>
        <OdinFormModal formUUID={uuid}
                       onSubmitEvent={(params: { event: string, results: any }) => this.handleFormSubmit(params)}/>

        <Modal
          className="addLineModal"
          centered
          title="Add New Line"
          okButtonProps={{ style: { display: 'none' } }}
          visible={mapReducer.addLineModal && mapReducer.addLineEnabled}
          onCancel={() => {
            updateMap({ addLineModal: false })
          }}
        >
          {schema?.types?.filter(elem => [
            'SURVEY_ROUTE',
          ].includes(elem.name)).map((type: SchemaTypeEntity) => (
            <Card onClick={() => this.handleMenuClick(type.name)}>
              <Row>
                <Col span={24}>
                  <h3>{type.name}</h3>
                </Col>
              </Row>
            </Card>
          ))}
        </Modal>

      </>
    )
  }

}


const mapState = (state: any) => ({
  schemaReducer: state.schemaReducer,
  mapReducer: state.mapReducer,
});

const mapDispatch = (dispatch: any) => ({
  updateMap: (params: MapReducerUpdate) => dispatch(updateMapState(params)),
  initializeForm: (params: any) => dispatch(initializeRecordForm(params)),
});
export default connect(mapState, mapDispatch)(AddLineModal);
