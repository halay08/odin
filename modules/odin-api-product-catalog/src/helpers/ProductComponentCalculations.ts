import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';

export class ProductComponentCalculations {


    /**
     * UnitPrice * Quantity
     * @param productComponent
     */
    public static computeUnitPrice(productComponent: DbRecordEntityTransform): string {

        let unitPrice = 0;
        if(productComponent) {
            unitPrice += Number(productComponent.properties['UnitPrice']) * Number(productComponent.properties.Quantity);
        }
        return Number(unitPrice).toFixed(2);
    }

    /**
     * Taxes are derived form the Subtotal - discounts
     * @param productComponent
     */
    public static computeUnitCost(productComponent: DbRecordEntityTransform): string {

        let unitCost = 0;
        if(productComponent) {
            unitCost += Number(productComponent.properties['UnitCost']) * Number(productComponent.properties.Quantity);
        }
        return Number(unitCost).toFixed(2);
    }

    /**
     * Total is the TotalPrice for the line item inclusive of discounts and taxes
     * @param productComponent
     */
    public static computeMinimumSalePrice(productComponent: DbRecordEntityTransform): string {

        let minimumSalePrice = 0;
        if(productComponent) {
            if(!!productComponent.properties['MinimumSalePrice'] && productComponent.properties['MinimumSalePrice'] > 0) {
                minimumSalePrice += Number(productComponent.properties['MinimumSalePrice']) * Number(productComponent.properties.Quantity);
            } else {
                minimumSalePrice += Number(productComponent.properties['UnitCost'])
            }
        }
        return Number(minimumSalePrice).toFixed(2);
    }


}
