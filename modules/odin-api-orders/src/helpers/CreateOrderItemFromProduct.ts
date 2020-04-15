import { OrderItemDto } from '@d19n/models/dist/orders/items/order.item.dto';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { OrderItemCalculations } from './OrderItemCalculations';

export class CreateOrderItemFromProduct {

    public static construct(
        product: DbRecordEntityTransform,
        quantity: number,
        order: DbRecordEntityTransform,
    ) {

        const orderItem = new OrderItemDto();
        orderItem.ActivationStatus = 'OPEN';
        orderItem.Description = getProperty(product, 'Description');
        orderItem.UnitPrice = getProperty(product, 'UnitPrice');
        orderItem.DiscountValue = getProperty(product, 'DiscountValue'); // used in calculations
        orderItem.DiscountType = getProperty(product, 'DiscountType'); // used in calculations
        orderItem.TaxRate = getProperty(product, 'TaxRate');
        orderItem.Taxable = getProperty(product, 'Taxable');
        orderItem.TaxIncluded = getProperty(product, 'TaxIncluded');
        orderItem.Quantity = quantity || 1;
        orderItem.ProductRef = product.id;
        orderItem.ProductType = getProperty(product, 'Type');
        orderItem.ProductCategory = getProperty(product, 'Category');
        orderItem.ProductCustomerType = getProperty(product, 'CustomerType');
        orderItem.TotalPrice = Number(OrderItemCalculations.computeOrderItemPreTaxTotalPrice(
            {
                id: undefined,
                schema: undefined,
                properties: orderItem,
            },
            order,
        ));

        return orderItem;

    }

}
