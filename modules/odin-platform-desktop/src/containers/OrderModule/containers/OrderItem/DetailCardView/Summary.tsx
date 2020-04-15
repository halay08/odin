import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { Descriptions } from 'antd';
import React from 'react';
import { createCurrencyString } from '../../../../../shared/utilities/currencyConverter';

interface Props {
  record: DbRecordEntityTransform,
  relatedRecord: DbRecordEntityTransform,
  title?: string,
  recordNumber?: number
};

class Summary extends React.Component<Props> {

  private renderSummary() {
    const { record, relatedRecord } = this.props;

    return (
      <div>
        <Descriptions
          size="small"
          layout="vertical"
          column={4}
        >
          <Descriptions.Item label={'Quantity'}>
            {getProperty(relatedRecord, 'Quantity')}
          </Descriptions.Item>

          <Descriptions.Item label={'Unit Price'}>
            {createCurrencyString(getProperty(record, 'CurrencyCode'), getProperty(relatedRecord, 'UnitPrice'))}
          </Descriptions.Item>

          <Descriptions.Item label={'Discount Value'}>
            { getProperty(relatedRecord, 'DiscountType') === 'AMOUNT' ? 
                createCurrencyString(getProperty(record, 'CurrencyCode'), getProperty(relatedRecord, 'DiscountValue')) : 
                  `${getProperty(relatedRecord, 'DiscountValue')}%` }
          </Descriptions.Item>

          <Descriptions.Item label={'Total Price'}>
            {createCurrencyString(getProperty(record, 'CurrencyCode'), getProperty(relatedRecord, 'TotalPrice'))}
          </Descriptions.Item>

        </Descriptions>

        <Descriptions
          style={{ marginTop: 10 }}
          size="small"
          layout="vertical"
          column={4}
        >
          <Descriptions.Item label={'Billing Start Date'}>
            {getProperty(relatedRecord, 'BillingStartDate')}
          </Descriptions.Item>

          <Descriptions.Item label={'Next Invoice Date'}>
            {getProperty(relatedRecord, 'NextInvoiceDate')}
          </Descriptions.Item>

          <Descriptions.Item label={'Next Billing Date'}>
            {getProperty(relatedRecord, 'NextBillingDate')}
          </Descriptions.Item>

          <Descriptions.Item label={'Billing Period Type'}>
            {getProperty(relatedRecord, 'BillingPeriodType')}
          </Descriptions.Item>

        </Descriptions>

      </div>
    );
  };

  render() {
    return (
      this.renderSummary()
    );
  };
};

export default Summary;
