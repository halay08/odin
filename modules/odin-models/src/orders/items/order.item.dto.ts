import { OrganizationEntity } from '../../identity/organization/organization.entity';

export class OrderItemDto {

  public id?: string;
  public ActivationStatus?: string;
  public organization?: OrganizationEntity;
  public Description?: string;
  public TotalPrice?: number;
  public UnitPrice?: number;
  public Quantity?: number;
  public DiscountValue?: number;
  public DiscountType?: 'AMOUNT' | 'PERCENT';
  public TaxRate?: string;
  public Taxable?: string;
  public TaxIncluded?: string;
  public ProductRef?: string;
  public ProductType?: string;
  public ProductCategory?: string;
  public ProductCustomerType?: string;

}
