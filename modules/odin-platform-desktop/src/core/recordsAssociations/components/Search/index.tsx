import { DbRecordAssociationRecordsTransform } from '@d19n/models/dist/schema-manager/db/record/association/transform/db.record.association.records.transform';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { Input } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { resetTableState } from '../../../records/components/DynamicTable/store/actions';
import { TableReducer } from '../../../records/components/DynamicTable/store/reducer';
import { resetRecordsList } from '../../../records/store/actions';
import { IRecordReducer } from '../../../records/store/reducer';
import { SchemaReducerState } from '../../../schemas/store/reducer';
import { ISearchRecordAssociations, searchRecordAssociationsRequest } from '../../store/actions';
import { IRecordAssociationsReducer } from '../../store/reducer';

const { Search } = Input;

interface Props {
  record: DbRecordEntityTransform | undefined,
  relation: DbRecordAssociationRecordsTransform,
  searchAssociations: any,
  schemaReducer: SchemaReducerState,
  recordReducer: IRecordReducer,
  recordTableReducer: TableReducer,
  recordAssociationReducer: IRecordAssociationsReducer,
  resetRecordState: any,
  resetTable: any,
  isControlled?: boolean,
  hideActions?: boolean
}

class RecordAssociationSearch extends React.Component<Props> {

  componentDidMount(): void {
    this.fetchData();
  }

  // componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any): void {
  //  if(prevProps.relation.schemaAssociation !== this.props.relation.schemaAssociation) {
  //     this.resetSearch();
  //  }
  // }

  resetSearch() {
    const { record, relation, searchAssociations, recordAssociationReducer } = this.props;
    if(relation && record) {
      searchAssociations({
          schema: relation.schema,
          schemaAssociation: relation.schemaAssociation,
          recordId: record.id,
          searchQuery: {
            schemas: relation.schema.id,
            terms: '',
            pageable: {
              page: 1,
              size: 50,
            },
            sort: recordAssociationReducer.searchQuery.sort,
          },
        },
      );
    }
  }


  fetchData() {
    const { record, relation, searchAssociations, recordAssociationReducer } = this.props;
    if(relation && record) {
      searchAssociations({
          schema: relation.schema,
          schemaAssociation: relation.schemaAssociation,
          recordId: record.id,
          searchQuery: {
            schemas: relation.schema.id,
            terms: recordAssociationReducer.searchQuery.terms,
            sort: recordAssociationReducer.searchQuery.sort,
          },
        },
      );
    }
  }

  handleSearchRequest(e: any) {
    const { record, relation, searchAssociations, recordAssociationReducer } = this.props;
    if(!!recordAssociationReducer.searchQuery) {
      if(relation && record) {
        searchAssociations(
          {
            schema: relation.schema,
            schemaAssociation: relation.schemaAssociation,
            recordId: record.id,
            searchQuery: {
              terms: e.target.value,
              schemas: recordAssociationReducer.searchQuery.schemas,
              pageable: {
                page: e.current,
                size: e.pageSize,
              },
              sort: recordAssociationReducer.searchQuery.sort,
            },
          },
        );
      }
    }
  }

  setInitialSearchQuery() {
    const { recordAssociationReducer, recordTableReducer } = this.props;
    if(!!recordAssociationReducer.searchQuery) {
      return !!recordAssociationReducer.searchQuery ? recordAssociationReducer.searchQuery.terms : ''
    }
  }


  render() {
    const { recordAssociationReducer } = this.props;
    return (
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Search
            className="search-input"
            placeholder="search records"
            value={this.setInitialSearchQuery()}
            loading={recordAssociationReducer.isSearching}
            onChange={e => this.handleSearchRequest(e)}
          />
        </div>
      </div>
    )
  }
}

const mapState = (state: any) => ({
  recordTableReducer: state.recordTableReducer,
  recordAssociationReducer: state.recordAssociationReducer,
  recordReducer: state.recordReducer,
  schemaReducer: state.schemaReducer,
});

const mapDispatch = (dispatch: any) => ({
  resetTable: () => dispatch(resetTableState()),
  resetRecordState: () => dispatch(resetRecordsList()),
  searchAssociations: (params: ISearchRecordAssociations) => dispatch(searchRecordAssociationsRequest(params)),
});


export default connect(mapState, mapDispatch)(RecordAssociationSearch)
