import { Col, Empty, Row, Typography } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { MapReducerUpdate, updateMapState } from '../../../../../core/gis/store/actions';
import { MapReducer } from '../../../../../core/gis/store/reducer';
import { getRecordAuditLogs } from '../../../../../core/records/auditLogs/store/actions';
import ActivityFeed from '../../../../../core/records/components/ActivityFeed';
import DetailPanelLeft from '../../../../../core/records/components/DetailPanelLeft';
import RecordProperties from '../../../../../core/records/components/DetailView/RecordProperties';
import FileUploader from '../../../../../core/records/components/Files/FileUploaderDragAndDrop';
import NoteForm from '../../../../../core/records/components/Note/NoteForm';
import { getRecordByIdRequest, IGetRecordById } from '../../../../../core/records/store/actions';
import AssociationDataTable from '../../../../../core/recordsAssociations/components/AssociationDataTable/DataTable';
import CardWithTabs from '../../../../../shared/components/CardWithTabs';
import { getRecordFromShortListById } from '../../../../../shared/utilities/recordHelpers';
import { getSchemaFromShortListByModuleAndEntity } from '../../../../../shared/utilities/schemaHelpers';

interface Props {
  recordReducer: any,
  schemaReducer: any,
  mapReducer: MapReducer,
  getRecord: any,
  getAuditLogs: any,
  updateMap: (params: MapReducerUpdate) => {},
}

class FeaturePreview extends React.Component<Props> {

  componentDidMount() {

    this.fetchData();

  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {

    if(prevProps.mapReducer.recordId !== this.props.mapReducer.recordId) {
      this.fetchData();
    }

  }

  fetchData() {
    const { schemaReducer, getRecord, getAuditLogs, mapReducer } = this.props;
    const { recordId } = mapReducer;
    const moduleName = 'ProjectModule';
    const entityName = 'Feature';

    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

    if(recordId) {
      getRecord({ schema, recordId });
      getAuditLogs({ schema, recordId });

    }

  }

  render() {

    const { mapReducer, recordReducer, updateMap } = this.props;
    const { recordId } = mapReducer;

    const record = getRecordFromShortListById(recordReducer.shortList, recordId);

    return (
      record ?
        <div style={{ marginTop: 50, padding: 10 }}>
          <Row gutter={{ xs: 8, sm: 14, md: 14, lg: 14 }}>
            <Col xs={24} sm={24} md={24} lg={6}>
              <div className="record-detail-left-panel">

                <DetailPanelLeft
                  record={record}
                  onDelete={() => {
                    updateMap({
                      recordId: undefined,
                      isLoadingView: false,
                    })
                  }}
                >
                  <RecordProperties columnLayout="vertical" record={record} columns={2}/>
                </DetailPanelLeft>

              </div>
            </Col>

            <Col xs={24} sm={24} md={24} lg={12}>
              <div className="record-detail-center-panel">
                <CardWithTabs
                  extra={[
                    <Link to={`/ProjectModule/Feature/${record?.id}`} component={Typography.Link}>View Master</Link>,
                  ]}
                  title="Options"
                  defaultTabKey="File"
                  tabList={[
                    {
                      key: 'File',
                      tab: 'Files',
                    },
                  ]}
                  contentList={{
                    File: <div>
                      <div>
                        <FileUploader record={record}/>
                      </div>
                      <AssociationDataTable
                        title="Files"
                        record={record}
                        moduleName="SchemaModule"
                        entityName="File"/>
                    </div>,
                  }}
                />
              </div>
            </Col>

            <Col xs={24} sm={24} md={24} lg={6}>
              <div className="record-detail-right-panel">
                <CardWithTabs
                  title="Updates"
                  defaultTabKey="Notes"
                  tabList={[
                    {
                      key: 'Notes',
                      tab: 'Notes',
                    },
                    {
                      key: 'Activity',
                      tab: 'Activity',
                    },
                  ]}
                  contentList={{
                    Notes: <NoteForm record={record}/>,
                    Activity: <ActivityFeed/>,
                  }}
                />
              </div>
            </Col>
          </Row>

        </div> : (<Empty/>))
  }
}

const mapState = (state: any) => ({
  mapReducer: state.mapReducer,
  recordReducer: state.recordReducer,
  schemaReducer: state.schemaReducer,
});

const mapDispatch = (dispatch: any) => ({
  getRecord: (payload: IGetRecordById) => dispatch(getRecordByIdRequest(payload)),
  getAuditLogs: (params: any) => dispatch(getRecordAuditLogs(params)),
  updateMap: (params: MapReducerUpdate) => dispatch(updateMapState(params)),
});

export default connect(mapState, mapDispatch)(FeaturePreview);
