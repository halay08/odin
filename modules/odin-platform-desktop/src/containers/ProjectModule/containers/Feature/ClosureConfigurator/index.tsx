import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { Col, Layout, PageHeader, Row } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import Pipeline from '../../../../../core/records/components/Pipeline/Pipeline';
import { IRecordReducer } from '../../../../../core/records/store/reducer';
import { IRecordAssociationsReducer } from '../../../../../core/recordsAssociations/store/reducer';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import CardWithTabs from '../../../../../shared/components/CardWithTabs';
import { setStepValidationArray } from '../../../../../shared/components/StepView/store/actions';
import history from '../../../../../shared/utilities/browserHisory';
import {
  getRecordFromShortListById,
  getRecordRelatedFromShortListById,
} from '../../../../../shared/utilities/recordHelpers';
import { getSchemaFromShortListBySchemaId } from '../../../../../shared/utilities/schemaHelpers';
import ClosureCableConfigurator from './CableConfigurator';
import ClosureFibreConfigurator from './FibreConfigurator';


type PathParams = {
  url: string,
  recordId: string
}

type PropsType = RouteComponentProps<PathParams> & {
  match: any
  recordReducer: IRecordReducer,
  schemaReducer: SchemaReducerState,
  recordAssociationReducer: IRecordAssociationsReducer,
  hasColumnMappings?: boolean,
  setValidationData: any,
  visibleProperties?: string[]
}

class ClosureConfigurator extends React.Component<PropsType> {

  componentDidMount() {

    this.setStepViewState();

  }


  setStepViewState() {

    const { setValidationData } = this.props;

    setValidationData([
      { isNextDisabled: false },
      { isNextDisabled: false },
    ]);

  }


  render() {

    const {
      recordAssociationReducer,
      schemaReducer,
      hasColumnMappings,
      recordReducer,
      match,
    } = this.props;

    let record: DbRecordEntityTransform;

    if(hasColumnMappings) {
      record = getRecordRelatedFromShortListById(
        recordAssociationReducer.shortList,
        match.params.dbRecordAssociationId,
        match.params.recordId,
      );
    } else {
      record = getRecordFromShortListById(recordReducer.shortList, match.params.recordId);
    }

    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record?.schemaId);

    return (<Layout className='record-detail-view'>
        <Row gutter={{ xs: 8, sm: 14, md: 14, lg: 14 }}>
          <Col xs={24} sm={24} md={24} lg={24}>
            <PageHeader
              onBack={() => history.push(`/ProjectModule/Feature/${record?.id}`)}
              className="page-header"
              style={{ marginTop: 14, marginBottom: 14 }}
              ghost={false}
              title={`Connections for closure ${getProperty(record, 'ExternalRef')}`}
            >
            </PageHeader>
          </Col>
          <Col xs={24} sm={24} md={24} lg={24}>
            <div className="record-detail-center-panel">
              {record?.stage &&
              <Pipeline className="record-pipeline" record={record}/>
              }

              <CardWithTabs
                title=""
                defaultTabKey="Cables"
                tabList={[
                  {
                    key: 'Cables',
                    tab: 'Cables',
                  },
                  {
                    key: 'Fibres',
                    tab: 'Fibres',
                  },
                ]}
                contentList={{
                  Cables: <ClosureCableConfigurator record={record}/>,
                  Fibres: <ClosureFibreConfigurator record={record}/>,

                }}
              />
            </div>
          </Col>

        </Row>
      </Layout>
    )
  }

}

const mapState = (state: any) => ({
  schemaReducer: state.schemaReducer,
  recordReducer: state.recordReducer,
  recordAssociationReducer: state.recordAssociationReducer,
});

const mapDispatch = (dispatch: any) => ({
  setValidationData: (params: any) => dispatch(setStepValidationArray(params)),
});

export default withRouter(connect(mapState, mapDispatch)(ClosureConfigurator));
