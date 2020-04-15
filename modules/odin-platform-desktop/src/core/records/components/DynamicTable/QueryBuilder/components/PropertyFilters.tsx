import { DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { SchemaColumnOptionEntity } from '@d19n/models/dist/schema-manager/schema/column/option/schema.column.option.entity';
import { SchemaColumnValidatorEntity } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.entity';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SearchQueryType } from '@d19n/models/dist/search/search.query.type';
import { Button, Col, Form, Input, Select } from 'antd';
import moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import { getSchemaFromShortListByModuleAndEntity } from '../../../../../../shared/utilities/schemaHelpers';
import { SchemaReducerState } from '../../../../../schemas/store/reducer';
import { searchRecordsRequest } from '../../../../store/actions';
import renderFormField from '../../../Forms/FormFields';
import {
  addFormField,
  removeFormField,
  setFormFieldCondition,
  setFormFieldEntity,
  setFormFieldProperty,
  setFormFieldValue,
  setSearchQuery,
  setFormFieldOperator,
  setFormFieldAndOr,

} from '../store/actions';
import '../styles.scss';

interface Props {
  moduleName: string | undefined,
  entityName: string | undefined,
  recordReducer: any,
  recordTableReducer: any,
  schemaReducer: SchemaReducerState,
  queryBuilderReducer: any,
  addFormField: any,
  removeFormField: any,
  setFormFieldEntity: any,
  setFormFieldProperty: any,
  setFormFieldCondition: any,
  setFormFieldValue: any,
  configure: any,
  searchRecords: any
  setFormFieldOperator: any,
  setFormFieldAndOr: any,
}

interface State {
  showFilters: boolean,
  entitySelect:any,
}

interface FormField {
  id: string;
  schemaId: string | undefined,
  entity: string | undefined,
  isHidden: boolean;
  type: string;
  name: string;
  label: string;
  description: string;
  defaultValue: string | number,
  initialValue: string | null,
  options?: SchemaColumnOptionEntity[]
  validators: SchemaColumnValidatorEntity[],
  isDisabled: boolean,
  handleInputChange: any
}

class PropertyFilters extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      showFilters: false,
      entitySelect: React.createRef()
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any): void {
    if(prevProps.queryBuilderReducer.formFields.propertyFilters !== this.props.queryBuilderReducer.formFields.propertyFilters){
      this.state.entitySelect.current?.focus();
    }
   
    if(prevProps.queryBuilderReducer.queries !== this.props.queryBuilderReducer.queries) {
      this.fetchData();
    }
  }

  componentDidMount() {
    this.state.entitySelect.current?.focus();
  }

  renderConditionField(field: any) {
    const { Option } = Select;
    const { setFormFieldCondition } = this.props;

    if(field.property) {
      return (
        <Select
          key={field.property}
          defaultValue={field.condition}
          onSelect={(e) => setFormFieldCondition(
            field.UUID,
            e.toString(),
          )}>
          <Option key='1' value={'must'}>Must include</Option>
          <Option key='2' value={'must_not'}>Must not include</Option>
          <Option key='3' value={'should'}>Should include</Option>
          <Option key='4' value={'filter'}>Filter</Option>
        </Select>
      )
    } else {
      return <Select disabled>{}</Select>
    }
  }

  renderAndOrField(field: any) {
    const { Option } = Select;
    const { setFormFieldAndOr } = this.props;

    
      return (
        <Select
          key={field.andOr}
          defaultValue={field.andOr || 'AND'}
          onSelect={(e) => setFormFieldAndOr(
            field.UUID,
            e.toString(),
          )}
          >
          <Option key='1' value={'AND'}>AND</Option>
          <Option key='2' value={'OR'}>OR</Option>
        </Select>
      )
  }


  renderOperatorField(field: any) {
    const { Option } = Select;
    const { setFormFieldOperator } = this.props;
    
      return (
        <Select
          key={field.operator}
          defaultValue={field.operator || '='}
          onSelect={(e) => setFormFieldOperator(
            field.UUID,
            e.toString(),
          )}
          >
          <Option key='1' value={'='}>EQUAL(=)</Option>
          <Option key='2' value={'!='}>NOT EQUAL(!=) </Option>
          <Option key='3' value={'LIKE'}>LIKE</Option>
          <Option key='4' value={'IN'}>ANY OF(IN) </Option>
        </Select>
      )
  }

  getFieldTypeFromColumnProperties(schema: any, entityName: string, propertyName: string) {

    let ourColumn: any = undefined;

    if(propertyName === 'title') {
      return {
        name: propertyName,
        type: 'TEXT',
        validators: [],
        options: [],
      }
    }


    /* First level association */
    if(schema && schema.entityName == entityName) {
      schema.columns.filter((column: any) => {
        if(column.name == propertyName) {
          ourColumn = column
        }
      })
    }

    /* Nested associations */
    else {
      schema && schema.associations.map((association: any) => {
        if(association.childSchema && association.childSchema.entityName == entityName) {
          association.childSchema.columns.map((column: any) => {
            if(column.name == propertyName) {
              ourColumn = column
            }
          })
        }
      })
    }

    return ourColumn;
  }

  handleInputChange(event: any, UUID: any, type: string) {
    const { setFormFieldValue } = this.props;

    if(type == 'DATE') {
      event.value = moment(event.value).format('YYYY-MM-DD')
    }

    setFormFieldValue(
      UUID,
      event.value,
    )
  }

  renderFieldInput(schema: any, field: any) {
    if(field.property) {
      let column = this.getFieldTypeFromColumnProperties(schema, field.entityName, field.property);

      if(column && schema) {
        const formField: FormField = {
          id: column.id,
          schemaId: schema.id,
          entity: field.entityName,
          isHidden: false,
          type: column.type,
          name: column.name,
          label: '',
          description: column.description,
          defaultValue: field.value,
          initialValue: field.value || '',
          options: column.options,
          validators: column.validators,
          isDisabled: column.isDisabled,
          handleInputChange: (e: any) => this.handleInputChange(e, field.UUID, column.type),
        };
        return renderFormField(formField);
      }
    } else {
      return (
        <Form.Item>
          <Input disabled>{}</Input>
        </Form.Item>
      )

    }
  }

  renderEntityProperties(schema: any, field: any) {
    const { Option } = Select;
    const { setFormFieldProperty } = this.props;

    /* We are rendering first level association */
    if(field.entityName == schema.entityName) {
      return (
        <Select
          key={schema.entityName.id}
          defaultValue={field.property||undefined}
          placeholder="Property"
          onChange={(e) => setFormFieldProperty(
            field.UUID,
            e.toString(),
            this.constructRecordSearchPropertyName(field, e),
          )}>
          <Option key={'title'} value='title'>Title</Option>
          {
            schema.columns.map((column: any) => {
              return <Option key={column.id} value={column.name}>{column.name}</Option>
            })
          }
        </Select>
      )
    } else if(field.entityName && schema.entityName != field.entityName) {
      /* We are rendering nested association */
      return (
        schema.associations.map((association: any) => {
            if(association.childSchema && association.childSchema.entityName == field.entityName) {
              return (
                <Select
                  key={association.childSchema.id}
                  defaultValue={field.property||undefined}
                  placeholder="Property"
                  onChange={(e) => setFormFieldProperty(
                    field.UUID,
                    e.toString(),
                    this.constructRelatedRecordSearchPropertyName(
                      association.childSchema.moduleName,
                      association.childSchema.entityName,
                      field,
                      e,
                    ),
                  )}>
                  <Option key={'title'} value='title'>Title</Option>
                  {
                    association.childSchema.columns.map((column: any) => {
                      return <Option key={column.id} value={column.name}>{column.name}</Option>
                    })
                  }
                </Select>
              )
            }
          },
        )
      )
    }
    /* Just return disabled select box */
    else {
      return <Select key="2" disabled>{}</Select>
    }
  }

  constructRecordSearchPropertyName(field: any, value: any) {

    const { schemaReducer, moduleName, entityName } = this.props;

    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);
    let column = this.getFieldTypeFromColumnProperties(schema, field.entityName, value);

    if(column.name === 'title') {
      return 'title';
    } else if([ 'CURRENCY', 'NUMBER', 'PERCENT', 'ENUM' ].includes(column.type)) {
      return 'properties.' + value.toString() + '.keyword';
    } else {
      return 'properties.' + value.toString();
    }
  }

  constructRelatedRecordSearchPropertyName(moduleName: string, entityName: string, field: any, value: any) {

    const { schemaReducer } = this.props;

    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);
    let column = this.getFieldTypeFromColumnProperties(schema, field.entityName, value);

    if(column && column.name === 'title') {
      return entityName + '.dbRecords.title';
    } else if(column && [ 'CURRENCY', 'NUMBER', 'PERCENT', 'CURRENCY', 'ENUM' ].includes(column.type)) {
      return entityName + '.dbRecords.properties.' + value.toString() + '.keyword';
    } else {
      return entityName + '.dbRecords.properties.' + value.toString();
    }
  }

  renderColumnFilterOptions(schema: any, field: any, index: number) {
    const { removeFormField, setFormFieldEntity } = this.props;
    const { Option } = Select;
    let andOrField
    if(index !==0){
    andOrField = <Form.Item>
      {this.renderAndOrField(field)}
     </Form.Item>
      }
    if(schema) {
      return (
        <div>
          <Form className={'filter-form'}>
            { andOrField }
            <Form.Item>
              <Select key={schema.id} ref={this.state.entitySelect} style={{ minWidth: '100%', marginTop: '5px' }}
                      defaultValue={field.entityName||undefined}
                      placeholder="Entity"
                      onSelect={(e) => setFormFieldEntity(
                        field.UUID,
                        e.toString(),
                      )}>
                <Option key={schema.entityName} value={schema.entityName}>{schema.entityName}</Option>
                {
                  schema?.associations?.map((association: any) => {
                    if(association.childSchema) {
                      return <Option
                        key={association.childSchema.id}
                        value={association.childSchema.entityName}>{association.childSchema.entityName}
                      </Option>
                    }
                  })
                }
              </Select>
            </Form.Item>
            {field.entityName && <Form.Item>
              {this.renderEntityProperties(schema, field)}
            </Form.Item>}
            {field.entityName &&  <Form.Item>
             {this.renderOperatorField(field)}
            </Form.Item>}
            {field.entityName && this.renderFieldInput(schema, field)}
            <Form.Item style={{ marginBottom: '0' }}>
              <Button icon={<DeleteOutlined/>} onClick={(e) => removeFormField(field.UUID)}
                      style={{ width: '100%', marginTop: '0px' }}
                      danger>Remove filter
              </Button>
            </Form.Item>
          </Form>
        </div>
      )
    }
  }

  renderFields = () => {
    const { moduleName, entityName, schemaReducer, queryBuilderReducer } = this.props;

    if(moduleName && entityName) {
      const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);
      if(schema) {
        return (
          <Col span={'24'}>
            <div className="form-list-wrapper">
              {
                queryBuilderReducer.formFields.propertyFilters.map((field: any, index: number) =>
                  <Col span="24" key={field.UUID}>
                    {this.renderColumnFilterOptions(schema, field, index)}
                  </Col>,
                )
              }
            </div>
          </Col>
        )
      }
    }
  };


  private applyFilters() {
    const { configure, queryBuilderReducer, schemaReducer, moduleName, entityName } = this.props;
    let queries = [
      ...queryBuilderReducer.formFields.pipelineFilters,
    ];

    if(moduleName && entityName) {
      const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);
      if(queryBuilderReducer.formFields.propertyFilters) {
        queries = [ ...queries, ...queryBuilderReducer.formFields.propertyFilters ];
      }
      configure({ schema: schema, query: queries, queryType: 'query_string' });
    }
  }


  private fetchData() {
    const { searchRecords, recordReducer, queryBuilderReducer, schemaReducer, moduleName, entityName } = this.props;

    if(moduleName && entityName) {
      const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);
      if(schema) {
        searchRecords({
          schema: schema,
          searchQuery: {
            schemas: schema.id,
            terms: recordReducer.searchQuery.terms,
            sort: recordReducer.searchQuery.sort,
            boolean: queryBuilderReducer.queries,
          },
        });
      }
    }
  }


  render() {
    const { addFormField, queryBuilderReducer } = this.props;
    return (
      <div style={{ margin: '10px', width: '95%' }}>
        {this.renderFields()}
        <Col span={24}>
          <Button key="1" icon={<PlusOutlined/>} type="dashed" style={{ width: '100%' }} onClick={() => addFormField()}>Add
            Filter</Button>
        </Col>
        <Col>
          <Button disabled={queryBuilderReducer?.formFields?.propertyFilters?.length < 1} key="2"
                  icon={<SearchOutlined/>} style={{ width: '100%', marginTop: '15px' }}
                  type="primary" onClick={() => this.applyFilters()}>Search</Button>
        </Col>
      </div>
    )
  }
}

const mapState = (state: any) => ({
  recordReducer: state.recordReducer,
  recordTableReducer: state.recordTableReducer,
  schemaReducer: state.schemaReducer,
  queryBuilderReducer: state.queryBuilderReducer,
});

const mapDispatch = (dispatch: any) => ({
  configure: (params: any) => dispatch(setSearchQuery(params)),
  searchRecords: (params: { schema: SchemaEntity, searchQuery: SearchQueryType }) => dispatch(searchRecordsRequest(
    params)),
  addFormField: () => dispatch(addFormField()),
  removeFormField: (UUID: string) => dispatch(removeFormField(UUID)),
  setFormFieldEntity: (UUID: string, value: string) => dispatch(setFormFieldEntity(UUID, value)),
  setFormFieldCondition: (UUID: string, condition: string) => dispatch(setFormFieldCondition(UUID, condition)),
  setFormFieldOperator: (UUID: string, operator: string) => dispatch(setFormFieldOperator(UUID, operator)),
  setFormFieldAndOr: (UUID: string, andOr: string) => dispatch(setFormFieldAndOr(UUID, andOr)),
  setFormFieldValue: (UUID: string, value: any) => dispatch(setFormFieldValue(UUID, value)),
  setFormFieldProperty: (UUID: string, propertyName: string, esPropPath: string) => dispatch(setFormFieldProperty(
    UUID,
    propertyName,
    esPropPath,
  )),
});

export default connect(mapState, mapDispatch)(PropertyFilters);
