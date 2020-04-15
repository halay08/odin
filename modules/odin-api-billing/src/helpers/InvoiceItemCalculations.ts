import { Calculations } from '@d19n/common/dist/helpers/Calculations';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';

export class InvoiceItemCalculations {

    /**
     * UnitPrice * Quantity
     * @param orderItem
     */
    public static computeLineItemSubtotal(orderItem: DbRecordEntityTransform): string {
        let subtotal = 0;
        if(orderItem) {
            subtotal = subtotal + (Number(orderItem.properties.UnitPrice) * Number(orderItem.properties.Quantity));
        }
        return Number(subtotal).toPrecision(3);
    }

    /**
     * Discounts are applied to the UnitPrice
     * @param orderItem
     */
    private static computeLineItemDiscountAmount(orderItem: DbRecordEntityTransform): string {
        let totalDiscounts = 0;
        const lineItemSubtotal = Number(this.computeLineItemSubtotal(orderItem));
        if(orderItem) {
            if(orderItem.properties.DiscountType === 'PERCENT') {
                const lineItemDiscountValue = Calculations.computePercentValueOfNumber(
                    lineItemSubtotal,
                    orderItem.properties['DiscountValue'],
                );
                totalDiscounts = totalDiscounts + lineItemDiscountValue;
            } else if(orderItem.properties.DiscountType === 'AMOUNT') {
                const discountValue = Number(orderItem.properties.DiscountValue);
                totalDiscounts = totalDiscounts + discountValue;
            }
        }
        return Number(totalDiscounts).toPrecision(3);
    }


    /**
     * Discounts are applied to the UnitPrice
     * @param orderItem
     * @param order
     * @param removeDiscountPeriod
     */
    public static computeLineItemPreTaxTotalPrice(
        orderItem: DbRecordEntityTransform,
        order?: DbRecordEntityTransform,
        removeDiscountPeriod?: boolean,
    ): string {
        const lineItemSubtotal = this.computeLineItemSubtotal(orderItem);
        const lineItemDiscounts = this.computeLineItemDiscountAmount(orderItem);
        // adjust the sub total to by default include the line item discounts
        let adjSubtotal = Number(lineItemSubtotal) - Number(lineItemDiscounts);
        if(removeDiscountPeriod) {
            adjSubtotal = Number(lineItemSubtotal);
        }

        let orderDiscounts = '0.00';
        if(order) {
            orderDiscounts = this.computeLineItemWithOrderDiscountAmount(order, adjSubtotal);
        }

        const sum = Number(adjSubtotal) - Number(orderDiscounts);
        return Number(sum).toPrecision(10);
    }

    /**
     * Used by the order
     * Compute order item discounts + order level discounts
     * @param orderItem
     * @param order
     */
    public static computeLineItemPlusOrderTotalDiscounts(
        orderItem: DbRecordEntityTransform,
        order: DbRecordEntityTransform,
    ): string {
        const lineItemSubtotal = this.computeLineItemSubtotal(orderItem);
        const lineItemDiscounts = this.computeLineItemDiscountAmount(orderItem);
        const lineItemWithDiscounts = Number(lineItemSubtotal) - Number(lineItemDiscounts);
        const lineItemOrderDiscounts = this.computeLineItemWithOrderDiscountAmount(order, lineItemWithDiscounts);

        const sum = Number(lineItemDiscounts) + Number(lineItemOrderDiscounts);
        return Number(sum).toPrecision(10);
    }


    /**
     * Discounts are applied to the order item pre tax subtotal
     * @param order
     * @param lineItemWithDiscounts
     */
    private static computeLineItemWithOrderDiscountAmount(
        order: DbRecordEntityTransform,
        lineItemWithDiscounts: number,
    ): string {
        let totalOrderDiscounts = 0;
        // This should be configurable by the user
        let applyOrderDiscountAfterOrderItemDiscount = true;
        if(order && applyOrderDiscountAfterOrderItemDiscount) {
            // should add the order discount after the line item discounts are applied
            if(order.properties.DiscountType === 'PERCENT') {
                const appliedOrderDiscountAmount = Calculations.computePercentValueOfNumber(
                    lineItemWithDiscounts,
                    order.properties.DiscountValue,
                );
                totalOrderDiscounts = totalOrderDiscounts + appliedOrderDiscountAmount;
            } else if(order.properties.DiscountType === 'AMOUNT') {
                const discountValue = Number(order.properties.DiscountValue);
                totalOrderDiscounts = totalOrderDiscounts + discountValue;
            }
        } else {
            // should add order discount  + the line item discount before deducting from each line item
        }
        return Number(totalOrderDiscounts).toPrecision(10);
    }


    /**
     * Taxes are derived form the Subtotal - discounts
     * @param orderItem
     * @param order
     */
    public static computeLineItemTaxAmount(
        orderItem: DbRecordEntityTransform,
        order: DbRecordEntityTransform,
    ): string {
        let totalTaxes = 0;
        // This should be configurable by the user
        let applyOrderDiscountAfterLineItemDiscount = true;
        if(applyOrderDiscountAfterLineItemDiscount) {
            const preTaxTotal = this.computeLineItemPreTaxTotalPrice(orderItem, order);
            if(orderItem.properties.Taxable === 'YES' && orderItem.properties.TaxIncluded === 'NO') {
                totalTaxes = totalTaxes + Number(Calculations.computePercentValueOfNumber(
                    Number(preTaxTotal),
                    orderItem.properties.TaxRate,
                ));
            }
        }
        return Number(totalTaxes).toPrecision(10);
    }

    /**
     * Total is the TotalPrice for the line item inclusive of discounts and taxes
     * @param orderItem
     * @param order
     */
    public static computeLineItemTotal(
        orderItem: DbRecordEntityTransform,
        order: DbRecordEntityTransform,
    ): string {
        const lineItemPreTaxTotal = Number(this.computeLineItemPreTaxTotalPrice(orderItem, order));
        const lineItemTaxAmount = this.computeLineItemTaxAmount(orderItem, order);
        const sum = lineItemPreTaxTotal + lineItemTaxAmount;
        // Apply order discount
        return Number(Number(sum).toPrecision(10)).toFixed(2);
    }

}
