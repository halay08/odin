import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { ProductComponentCalculations } from './ProductComponentCalculations';

export class ProductCalculations {

    /**
     * SalePrice includes discounts and the sum of the SalePrice is the Subtotal
     * @param productComponents
     * @param product
     */
    public static computeUnitPrice(
        productComponents: DbRecordEntityTransform[],
        product: DbRecordEntityTransform,
    ): string {

        let unitPrice: number = 0;
        for(let productComponent of productComponents) {
            console.log('productComponent', productComponent);
            // only add UnitPrice if the product component is Billable
            if(Boolean(getProperty(productComponent, 'IsBillable'))) {
                unitPrice = unitPrice + Number(ProductComponentCalculations.computeUnitPrice(productComponent));
            }
        }
        // Add Markup
        if(!!product.properties.MarkUpPercent) {
            unitPrice = unitPrice * (1 + (Number(product.properties.MarkUpPercent) / 100));
        }

        return Number(unitPrice).toFixed(2);
    }

    /**
     * Discounts are applied to the UnitPrice
     * @param productComponents
     * @param product
     */
    public static computeUnitCost(
        productComponents: DbRecordEntityTransform[],
        product: DbRecordEntityTransform,
    ): string {

        let unitCost: number = 0;
        for(let productComponent of productComponents) {
            console.log('productComponent', productComponent);
            unitCost = unitCost + Number(ProductComponentCalculations.computeUnitCost(productComponent));
        }

        return Number(unitCost).toFixed(2);
    }

    /**
     * Taxes are derived form the Subtotal
     * @param productComponents
     * @param product
     */
    public static computeMinimumSalePrice(
        productComponents: DbRecordEntityTransform[],
        product: DbRecordEntityTransform,
    ): string {

        let minimumSalePrice: number = 0;
        for(let productComponent of productComponents) {
            minimumSalePrice = minimumSalePrice + Number(ProductComponentCalculations.computeMinimumSalePrice(
                productComponent));
        }

        return Number(minimumSalePrice).toFixed(2);
    }

}
