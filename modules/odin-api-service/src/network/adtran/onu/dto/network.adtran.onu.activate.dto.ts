export class NetworkAdtranOnuActivateDto {

    // the model of OLT (ie: 6310, 6320)
    oltModel: string
    // id from the olt config next available
    onuId: string
    // port number selected
    ponPort: string
    // serial number for the ONT
    serialNumber: string
    // service upload speed
    uploadSpeed: string
    // service upload speed
    downloadSpeed: string
    // temporarily using the full address as the description
    fullAddress: string
}
