import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { InvoiceItemCalculations } from './InvoiceItemCalculations';

export class InvoiceCalculations {

    /**
     *
     * @param invoiceItems
     */
    public static computeSubtotal(invoiceItems: DbRecordEntityTransform[]): string {
        let sum = 0;
        for(const invoiceItem of invoiceItems) {
            sum = sum + Number(InvoiceItemCalculations.computeLineItemSubtotal(invoiceItem));
        }
        return Number(Number(sum).toPrecision(10)).toFixed(2);
    }

    /**
     *
     * @param invoiceItems
     * @paraminvoice
     */
    public static computeTotalDiscounts(
        invoiceItems: DbRecordEntityTransform[],
        invoice: DbRecordEntityTransform,
    ): string {
        let sum = 0;
        for(const invoiceItem of invoiceItems) {
            sum = sum + Number(InvoiceItemCalculations.computeLineItemPlusOrderTotalDiscounts(invoiceItem, invoice));
        }
        return Number(Number(sum).toPrecision(10)).toFixed(2);
    }

    /**
     * Taxes are derived form the Subtotal
     * @param invoiceItems
     * @paraminvoice
     */
    public static computeTotalTax(
        invoiceItems: DbRecordEntityTransform[],
        invoice: DbRecordEntityTransform,
    ): string {
        let sum = 0;
        for(const invoiceItem of invoiceItems) {
            sum = sum + Number(InvoiceItemCalculations.computeLineItemTaxAmount(invoiceItem, invoice));
        }
        return Number(Number(sum).toPrecision(10)).toFixed(2);
    }

    /**
     * Total is the Subtotal + taxes
     * @param invoiceItems
     * @paraminvoice
     */
    public static computeTotalDue(
        invoiceItems: DbRecordEntityTransform[],
        invoice: DbRecordEntityTransform,
    ): string {
        const invoiceSubtotal = this.computeSubtotal(invoiceItems);
        const invoiceDiscounts = this.computeTotalDiscounts(invoiceItems, invoice);
        const totalLineItemTaxes = this.computeTotalTax(invoiceItems, invoice);
        const sum = (Number(invoiceSubtotal) - Number(invoiceDiscounts)) + Number(totalLineItemTaxes);
        return Number(Number(sum).toPrecision(10)).toFixed(2);
    }
}
