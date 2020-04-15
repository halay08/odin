import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaColumnOptionEntity } from '@d19n/models/dist/schema-manager/schema/column/option/schema.column.option.entity';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { SchemaColumnValidatorEntity } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.entity';
import { SchemaColumnValidatorEnums } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.types';
import { Checkbox, DatePicker, Form, Input, InputNumber, Select } from 'antd';
import locale from 'antd/es/date-picker/locale/en_GB';
import moment from 'moment';

import 'moment/locale/en-gb';
import React from 'react';
import FileUploaderClickToUpload from '../../Files/FileUploaderClickToUpload';

const { TextArea } = Input;
const { Option } = Select;

export interface InputChangeParams {
  id: string;
  entity: string;
  value: any;
  association?: DbRecordAssociationCreateUpdateDto;
}

export interface FormField {
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

const dateFormat = 'YYYY-MM-DD';

const capitalizeText = (string: String) => {

  if(string) return string.slice(0,1).toUpperCase() + string.slice(1, string.length)

}

export default function renderFormField(field: FormField) {
  const setIsChecked = function (field: FormField) {
    if(field.initialValue) {
      if(field.initialValue.toLowerCase() === 'true') {
        return true;
      } else if(field.initialValue.toLowerCase() === 'false') {
        return false
      }
    }
  }
  if(!field.isHidden) {
    switch (field.type) {
      case SchemaColumnTypes.TEXT:
        return (<Form.Item
          key={field.id}
          name={field.name}
          label={capitalizeText(field.label)}
          labelCol={{ span: 24 }}
          initialValue={field.initialValue}
          rules={[ { required: field.validators.map(elem => elem.type).includes(SchemaColumnValidatorEnums.REQUIRED) } ]}
        >
          <Input
            type='text'
            width="100%"
            disabled={field.isDisabled}
            defaultValue={field.defaultValue}
            placeholder={field.description}
            onChange={(e) => field.handleInputChange({
              id: `${field.schemaId}_${field.name}`,
              entity: field.entity,
              value: e.target.value,
            })}/>
        </Form.Item>);
      case SchemaColumnTypes.TEXT_LONG:
        return (<Form.Item
          key={field.id}
          name={field.name}
          label={capitalizeText(field.label)}
          labelCol={{ span: 24 }}
          initialValue={field.initialValue}
          rules={[ { required: field.validators.map(elem => elem.type).includes(SchemaColumnValidatorEnums.REQUIRED) } ]}
        >
          <TextArea
            rows={4}
            disabled={field.isDisabled}
            defaultValue={field.defaultValue}
            placeholder={field.description}
            onChange={(e) => field.handleInputChange({
              id: `${field.schemaId}_${field.name}`,
              entity: field.entity,
              value: e.target.value,
            })}/>
        </Form.Item>);

      case SchemaColumnTypes.NUMBER:
      case SchemaColumnTypes.CURRENCY:
      case SchemaColumnTypes.PERCENT:
        return (<Form.Item
          key={field.id ? field.id.toString() : field.name}
          name={field.name}
          label={capitalizeText(field.label)}
          labelCol={{ span: 24 }}
          initialValue={field.initialValue}
          rules={[ { required: field.validators.map(elem => elem.type).includes(SchemaColumnValidatorEnums.REQUIRED) } ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            disabled={field.isDisabled}
            defaultValue={Number(field.defaultValue)}
            min={0}
            placeholder={field.description}
            onChange={(value) => field.handleInputChange({
              id: `${field.schemaId}_${field.name}`,
              entity: field.entity,
              value: value,
            })}/>
        </Form.Item>);
      case SchemaColumnTypes.DATE:
        return (
          <Form.Item
            key={field.id}
            name={field.name}
            label={field.label}
            labelCol={{ span: 24 }}
            initialValue={!!field.initialValue ? moment(field.initialValue, dateFormat) : undefined}
            rules={[ { required: field.validators.map(elem => elem.type).includes(SchemaColumnValidatorEnums.REQUIRED) } ]}
          >
            <DatePicker
              key={field.id}
              locale={locale}
              style={{ width: '100%' }}
              disabled={field.isDisabled}
              defaultValue={!!field.initialValue ? moment(field.initialValue, dateFormat) : undefined}
              format={dateFormat}
              onChange={(val) => field.handleInputChange({
                id: `${field.schemaId}_${field.name}`,
                entity: field.entity,
                value: moment(val).toISOString(),
              })}
            />
          </Form.Item>);

      case SchemaColumnTypes.ENUM:
        return (
          <Form.Item
            key={field.id}
            name={field.name}
            label={capitalizeText(field.label)}
            labelCol={{ span: 24 }}
            initialValue={!!field.initialValue ? field.initialValue : `select ${field.label}`}
            rules={[ { required: field.validators.map(elem => elem.type).includes(SchemaColumnValidatorEnums.REQUIRED) } ]}
          >
            <Select
              allowClear
              key={field.id}
              defaultValue={!!field.defaultValue ? field.defaultValue : `select ${field.label}`}
              style={{ width: '100%' }}
              disabled={field.isDisabled}
              onChange={(val) => field.handleInputChange({
                id: `${field.schemaId}_${field.name}`,
                entity: field.entity,
                value: val,
              })}
              getPopupContainer={trigger => trigger.parentNode}
            >
              {field.options ? field.options.map(opt => (
                <Option value={opt.value}>{opt.label}</Option>
              )) : (
                <Option value="">no options</Option>
              )}
            </Select>
          </Form.Item>);

      case SchemaColumnTypes.FILE_SINGLE:
        return (
          <Form.Item
            key={field.id}
            name={field.name}
            label={capitalizeText(field.label)}
            labelCol={{ span: 24 }}
            initialValue={!!field.initialValue ? field.initialValue : `select ${field.label}`}
            rules={[ { required: field.validators.map(elem => elem.type).includes(SchemaColumnValidatorEnums.REQUIRED) } ]}
          >
            <FileUploaderClickToUpload onSuccess={(elem: DbRecordEntityTransform) => {
              field.handleInputChange({
                id: `${field.schemaId}_${field.name}`,
                entity: field.entity,
                value: getProperty(elem, 'Url'),
                association: {
                  label: 'RELATES_TO',
                  recordId: elem.id,
                },
              });


            }}/>
          </Form.Item>
        )

      case SchemaColumnTypes.BOOLEAN:
        return (<Form.Item
          key={field.id ? field.id.toString() : field.name}
          name={field.name}
          label={field.label}
          labelCol={{ span: 24 }}
          initialValue={setIsChecked(field)}
          rules={[ { required: field.validators.map(elem => elem.type).includes(SchemaColumnValidatorEnums.REQUIRED) } ]}
        >
          <Checkbox
            disabled={field.isDisabled}
            defaultChecked={setIsChecked(field)}
            onChange={(e) => field.handleInputChange({
              id: `${field.schemaId}_${field.name}`,
              entity: field.entity,
              value: e.target.checked,
            })}
          />
        </Form.Item>);

      default:
        return (<Form.Item
          key={field.id ? field.id.toString() : field.name}
          name={field.name}
          label={field.label}
          labelCol={{ span: 24 }}
          initialValue={field.initialValue}
          rules={[ { required: field.validators.map(elem => elem.type).includes(SchemaColumnValidatorEnums.REQUIRED) } ]}
        >
          <Input
            type='text'
            disabled={field.isDisabled}
            defaultValue={field.defaultValue}
            placeholder={field.description}
            onChange={(e) => field.handleInputChange({
              id: `${field.schemaId}_${field.name}`,
              entity: field.entity,
              value: e.target.value,
            })}/>
        </Form.Item>);
    }
  }
}
