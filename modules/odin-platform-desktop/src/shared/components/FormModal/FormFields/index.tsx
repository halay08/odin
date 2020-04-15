import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { SchemaColumnOptionEntity } from '@d19n/models/dist/schema-manager/schema/column/option/schema.column.option.entity';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { SchemaColumnValidatorEntity } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.entity';
import { Checkbox, Form, Input, Select } from 'antd';

import 'moment/locale/en-gb';
import React from 'react';
import { setIsChecked } from '../../../utilities/validateDataTypes';

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
  defaultValue: string | number | string[],
  initialValue: string | null,
  options?: SchemaColumnOptionEntity[]
  validators: SchemaColumnValidatorEntity[],
  isDisabled: boolean,
  handleInputChange: any
}

export default function renderFormField(field: any) {

  if(!field.isHidden) {
    switch (field.type) {
      case SchemaColumnTypes.PASSWORD:
        return (<Form.Item
          key={field.property}
          name={field.property}
          label={field.label}
          labelCol={{ span: 24 }}
          initialValue={field.value}
          rules={[
            {
              required: field.isRequired,
              message: field.message,
            },
            field.customValidation ? {
              validator(rule, value, callback) {
                if(value === undefined) {
                  callback()
                } else if(value.length < 8 || value.length > 20) {
                  callback(field.customValidationMessage)
                } else {
                  return callback(undefined);
                }
              },
            } : {},
          ]}
          className={field.className}
        >
          <Input
            type='password'
            disabled={field.isDisabled}
            defaultValue={field.value}
            placeholder={field.label}
            onChange={(e) => field.handleInputChange({
              property: field.property,
              value: e.target.value,
            })}
            autoComplete="new-password"
          />
        </Form.Item>);

        case SchemaColumnTypes.EMAIL:
          return (<Form.Item
            key={field.property}
            name={field.property}
            label={field.label}
            labelCol={{ span: 24 }}
            initialValue={field.value}
            rules={[ { required: field.isRequired, message: field.message } ]}
            className={field.className}
          >
            <Input
              type='email'
              disabled={field.isDisabled}
              defaultValue={field.value}
              placeholder={field.label}
              onChange={(e) => field.handleInputChange({
                property: field.property,
                value: e.target.value,
              })}/>
          </Form.Item>);
      case SchemaColumnTypes.TEXT:
        return (<Form.Item
          key={field.property}
          name={field.property}
          label={field.label}
          labelCol={{ span: 24 }}
          initialValue={field.value}
          rules={[
            {
              required: field.isRequired,
              message: field.message,
            },
            field.customValidation ? {
              validator(rule, value, callback) {
                if(value === undefined) {
                  callback()
                } else if(value.length < field.customValidationCondition) {
                  callback(field.customValidationMessage)
                } else {
                  return callback(undefined);
                }
              },
            } : {},
          ]}
        >
          <Input
            type='text'
            disabled={field.isDisabled}
            defaultValue={field.value}
            placeholder={field.label}
            onChange={(e) => field.handleInputChange({
              property: field.property,
              value: e.target.value,
            })}/>
        </Form.Item>);
      case SchemaColumnTypes.TEXT_LONG:
        return (<Form.Item
          key={field.property}
          name={field.property}
          label={field.label}
          labelCol={{ span: 24 }}
          initialValue={field.initialValue}
          rules={[ { required: field.isRequired } ]}
        >
          <TextArea
            rows={4}
            disabled={field.isDisabled}
            defaultValue={field.defaultValue}
            placeholder={field.description}
            onChange={(e) => field.handleInputChange({
              property: field.property,
              value: e.target.value,
            })}/>
        </Form.Item>);

      case SchemaColumnTypes.NUMBER:
      case SchemaColumnTypes.CURRENCY:
      case SchemaColumnTypes.PERCENT:
        return (<Form.Item
          key={field.property}
          name={field.property}
          label={field.label}
          labelCol={{ span: 24 }}
          initialValue={field.value}
          rules={[ { required: field.isRequired, message: field.message } ]}
        >
          <Input
            type='number'
            disabled={field.isDisabled}
            defaultValue={field.value}
            placeholder={field.description}
            onChange={(e) => field.handleInputChange({
              property: field.property,
              value: parseInt(e.target.value),
            })}/>
        </Form.Item>);

      case SchemaColumnTypes.ENUM:
        return (
          <Form.Item
            key={field.id ? field.id.toString() : field.property}
            name={field.property}
            label={field.label}
            labelCol={{ span: 24 }}
            initialValue={!!field.value ? field.value : undefined}
            rules={[ { required: field.isRequired, message: field.message } ]}
          >
            <Select
              allowClear={field.allowClear}
              placeholder="Select"
              key={field.id}
              defaultValue={!!field.defaultValue ? field.defaultValue : undefined}
              style={{ width: '100%' }}
              disabled={field.isDisabled}
              onChange={(val) => field.handleInputChange({
                property: field.property,
                value: val,
              })}
              getPopupContainer={trigger => trigger.parentNode}
            >
              {field.options ? field.options.map((opt: any) => (

                <Option value={opt.value}>{opt.label}</Option>
              )) : (
                <Option value="">no options</Option>
              )}
            </Select>
          </Form.Item>);
      case 'CHECKBOX':
        return (
          <Form.Item
            key={field.property}
            name={field.property}
            label={field.label}
            labelCol={{ span: 24 }}
            initialValue={setIsChecked(field)}
            rules={[ { required: field.isRequired, message: field.message } ]}
          >
            <Checkbox
              disabled={field.isDisabled}
              key={field.property}
              defaultChecked={setIsChecked(field)}
              onChange={(val) => field.handleInputChange({
                property: field.property,
                value: val.target.checked,
              })}
            />
          </Form.Item>);

      default:
        return (<Form.Item
          key={field.property}
          name={field.property}
          label={field.label}
          labelCol={{ span: 24 }}
          initialValue={field.value}
          rules={[ { required: field.isRequired, message: field.message } ]}
        >
          <Input
            type='text'
            disabled={field.isDisabled}
            defaultValue={field.value}
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
