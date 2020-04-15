import { DbRecordAssociationRecordsTransform } from '@d19n/models/dist/schema-manager/db/record/association/transform/db.record.association.records.transform';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { Card, Checkbox, Typography } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { getAllSchemaAssociationEntities } from '../../../../shared/utilities/recordHelpers';
import { getSchemaFromShortListBySchemaId } from '../../../../shared/utilities/schemaHelpers';
import { SchemaReducerState } from '../../../schemas/store/reducer';
import { addIdToSelectedItems, getRecordAssociationsRequest, IGetRecordAssociations } from '../../store/actions';
import { IRecordAssociationsReducer } from '../../store/reducer';

interface Props {
  record: DbRecordEntityTransform,
  schemaReducer: SchemaReducerState,
  recordAssociationReducer: IRecordAssociationsReducer,
  getAssociations: any,
  selectRecord: any,
  hidden?: string[]
}

interface State {
  checkedItems?: string[] | undefined,
  rawData?: any
}

class AssociationTabListWithCheckBoxes extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      checkedItems: [],
      rawData: [],
    }
  }


  componentDidMount(): void {
    this.fetchAssociations();
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    if(prevProps.record !== this.props.record) {
      this.fetchAssociations();
    }
  }

  private fetchAssociations() {
    const { getAssociations, record, schemaReducer, hidden } = this.props;
    if(record) {
      const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record.schemaId);
      if(schema) {
        getAssociations({
          recordId: record.id,
          schema,
          entities: getAllSchemaAssociationEntities(schema.associations, hidden),
        }, (res: { results: { [key: string]: DbRecordAssociationRecordsTransform } }) => {
          console.log('results', res.results);
          this.setState({
            rawData: res.results,
          })
        });
      }
    }
    return <div>data fetched</div>;
  }


  renderData() {
    const { record, schemaReducer, hidden } = this.props;

    if(record) {
      const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record.schemaId);
      if(schema) {
        return getAllSchemaAssociationEntities(schema.associations, hidden).map(entity => (
          this.state.rawData[entity] && this.renderList(this.state.rawData[entity].dbRecords, entity)
        ))
      }
    }
  }

  renderList(data: any, entity: string) {

    const { selectRecord } = this.props;

    if(data && entity) {
      return (
        <div style={{ marginBottom: 24 }}>
          <Typography.Text strong>{entity}</Typography.Text>
          {data.map((elem: any) => (
            <div style={{ display: 'flex', marginLeft: 24 }}>
              <Checkbox onChange={() => selectRecord(elem.id)}>{elem?.title}</Checkbox>
            </div>
          ))}
        </div>
      )
    }
  }

  render() {
    const { recordAssociationReducer } = this.props;

    return (
      <div>
        {recordAssociationReducer.isRequesting ?
          <Card style={{ height: 400 }} loading={recordAssociationReducer.isRequesting}>
            <Typography.Text>Loading related records</Typography.Text>
          </Card>
          :
          this.renderData()
        }
      </div>
    )
  }
}

const mapState = (state: any) => ({
  schemaReducer: state.schemaReducer,
  recordAssociationReducer: state.recordAssociationReducer,
});

const mapDispatch = (dispatch: any) => ({
  getAssociations: (params: IGetRecordAssociations, db: any) => dispatch(getRecordAssociationsRequest(params, db)),
  selectRecord: (recordId: string) => dispatch(addIdToSelectedItems(recordId)),
});

export default connect(mapState, mapDispatch)(AssociationTabListWithCheckBoxes);
