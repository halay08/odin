import { Calculations } from '@d19n/common/dist/helpers/Calculations';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';

export class TaskProductCalculations {

    /**
     * Returns the subtotal for a single product without tax
     * @param product
     */
    public static computeLineItemTotal(
        product: DbRecordEntityTransform,
    ): number {

        let subtotal = 0;
        let totalDiscounts = 0;
        let sum;

        const quantity = getProperty(product, 'Quantity') ? getProperty(product, 'Quantity') : 1;
        subtotal = subtotal + Number(product.properties['UnitPrice']) * quantity;
        // Subtract discounts
        if(product.properties.DiscountType === 'PERCENT') {
            const lineItemDiscountValue = Calculations.computePercentValueOfNumber(
                subtotal,
                product.properties['DiscountValue'],
            );
            totalDiscounts = totalDiscounts + lineItemDiscountValue;
        } else if(product.properties.DiscountType === 'AMOUNT') {
            const discountValue = Number(product.properties.DiscountValue);
            totalDiscounts = totalDiscounts + discountValue;
        }

        sum = Number(subtotal) - Number(totalDiscounts);

        return Number(Number(Number(sum).toPrecision(10)).toFixed(2))
    }

    /**
     * Returns the total value of products
     * @param products
     */
    public static computeTotalValue(
        products: DbRecordEntityTransform[],
    ): number {

        let totalValue = 0;

        for(const product of products) {
            const quantity = getProperty(product, 'Quantity');
            totalValue = totalValue + Number(product.properties['UnitPrice']) * quantity;
        }
        return Number(Number(Number(totalValue).toPrecision(10)).toFixed(2))
    }
}
