export interface IPhoneNumber {
    cc: number,
    ac: number,
    sn: number
}

export class VoiceSipwiseSubscriberDto {
    public status: string;
    // sipwise customerId
    public customer_id: number;
    //{ cc => 43, ac => 9876, sn => 10001 }, # the main number
    public primary_number: IPhoneNumber;
    //# as many alias numbers the subscriber can be reached at (or skip param if none)
    public alias_numbers?: IPhoneNumber[];
    // phone number minus first 2 digits
    public username: string;
    // 'voip.example.com',
    public domain_id: string;
    // 'secret subscriber pass',
    public password: string;
    //# set undef if subscriber shouldn't be able to log into sipwise csc
    // phone number minus first 2 digits
    public webusername?: string;
    // auto generated hashed password
    public webpassword: string;
    // # can be set to the operator crm's subscriber id
    public external_id: string;
}
