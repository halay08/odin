export class NetworkAdtranOnuActivateVoiceDto {

    // id from the olt config next available
    onuId: string
    // port number selected
    ponPort: string
    // area code 333
    phoneAreaCode: string
    // subscriber number 123456
    phoneSubscriberNumber: string
    // SIP password generated when creating a new subscriber
    sipPassword: string;
}
