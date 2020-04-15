export class Calculations {

    /**
     *
     * @param originalValue
     * @param percentValue
     */
    public static computePercentValueOfNumber(originalValue: number, percentValue: number): number {
        const decimalValue = Number(percentValue) / 100;
        return Number(originalValue) * decimalValue;
    }

    /**
     *
     * @param originalValue
     */
    public static removeVATFromPriceIncludingVAT(originalValue: number): number {
        return Number(originalValue) / 1.2;
    }
}
