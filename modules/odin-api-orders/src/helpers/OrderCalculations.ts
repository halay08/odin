import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { OrderItemCalculations } from './OrderItemCalculations';

export class OrderCalculations {

    /**
     *
     * @param orderItems
     */
    public static computeOrderSubtotal(orderItems: DbRecordEntityTransform[]): string {
        let sum = 0;
        for(const orderItem of orderItems) {
            sum = sum + Number(OrderItemCalculations.computeOrderItemSubtotal(orderItem));
        }
        return Number(Number(sum).toPrecision(10)).toFixed(2);
    }

    /**
     *
     * @param orderItems
     * @param order
     */
    public static computeOrderTotalDiscounts(
        orderItems: DbRecordEntityTransform[],
        order: DbRecordEntityTransform,
    ): string {
        let sum = 0;
        for(const orderItem of orderItems) {
            sum = sum + Number(OrderItemCalculations.computeOrderItemPlusOrderTotalDiscounts(orderItem, order));
        }
        return Number(Number(sum).toPrecision(10)).toFixed(2);
    }

    /**
     * Taxes are derived form the Subtotal
     * @param orderItems
     * @param order
     */
    public static computeOrderTotalTax(
        orderItems: DbRecordEntityTransform[],
        order: DbRecordEntityTransform,
    ): string {
        let sum = 0;
        for(const orderItem of orderItems) {
            sum = sum + Number(OrderItemCalculations.computeOrderItemTaxAmount(orderItem, order));
        }
        return Number(Number(sum).toPrecision(10)).toFixed(2);
    }

    /**
     * Total is the Subtotal + taxes
     * @param orderItems
     * @param order
     */
    public static computeTotalDue(
        orderItems: DbRecordEntityTransform[],
        order: DbRecordEntityTransform,
    ): string {
        const orderSubtotal = this.computeOrderSubtotal(orderItems);
        const orderDiscounts = this.computeOrderTotalDiscounts(orderItems, order);
        const totalLineItemTaxes = this.computeOrderTotalTax(orderItems, order);
        const sum = (Number(orderSubtotal) - Number(orderDiscounts)) + Number(totalLineItemTaxes);
        return Number(Number(sum).toPrecision(10)).toFixed(2);
    }
}
