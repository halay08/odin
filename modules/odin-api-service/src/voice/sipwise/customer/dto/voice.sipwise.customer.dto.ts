export class VoiceSipwiseCustomerDto {

    public status: string;
    // sipwise customer contactId
    public contact_id: number;
    // sipwise billing profileId
    public billing_profile_id: string;
    public billing_profile_definition: string; // id
    // 'sipaccount',
    public type: string;
    //# can be set to your crm's customer id
    public external_id: string;
    public vat_rate: number; // 0
    public add_vat: boolean;

}
