import { NetworkAdtranOnuActivateDto } from '../../../onu/dto/network.adtran.onu.activate.dto';
import { NetworkAdtranOnuActivateVoiceDto } from '../../../onu/dto/network.adtran.onu.activate.voice.dto';
import { NetworkAdtranOnuCheckStatusDto } from '../../../onu/dto/network.adtran.onu.check-status.dto';
import { NetworkAdtranOnuDeactivateDto } from '../../../onu/dto/network.adtran.onu.deactivate.dto';
import { CHECK_STATUS_ONT_TEMPLATE } from '../check-onu-status-xml-template';

export class NetworkAdtranOltTemplatesParsers {


    public parseActivateOntTemplate(params: NetworkAdtranOnuActivateDto, template: any) {

        // request config from OLT
        // check how many ONUs are configured on the pon Port
        // select Id that is not used (0 - 127)
        // define GEM = 2304 + onuId
        // define T-CONT = 1024 + onuId

        const onuId = params.onuId;
        const ponPort = params.ponPort;
        const serialNumber = params.serialNumber;
        const description = params.fullAddress;
        const uploadSpeed = params.uploadSpeed;
        const downloadSpeed = params.downloadSpeed;

        // if ponPort = 16 change to 0
        let partition = ponPort;
        if(ponPort === '16') {
            partition = '0';
        }

        const tCont = 1024 + parseInt(params.onuId);
        const gem = 2304 + parseInt(params.onuId);

        let channelLong = `0/${ponPort}`;

        let channelInterfaceName = `0/${ponPort}`;

        if([ '6320' ].includes(params.oltModel)) {
            channelInterfaceName = `0/${ponPort}.xgs-pon`;
        }

        let onuLong = `onu-0/${partition}-${params.onuId}`;


        return template
            .replace(/@_CHANNEL_INTERFACE_NAME/g, channelInterfaceName)
            .replace(/@_CHANNEL_TERMINATION_LONG/g, channelLong)
            .replace(/@_PON_PORT/g, ponPort)
            .replace(/@_CHANNEL_PARTITION/g, partition)
            .replace(/@_ONU_ID_LONG/g, onuLong)
            .replace(/@_ONU_ID/g, onuId)
            .replace(/@_GEM/g, `${gem}`)
            .replace(/@_TCONT/g, `${tCont}`)
            .replace(/@_BANDWIDTH_PROFILE/g, `${uploadSpeed}`)
            .replace(/@_SHAPER_NAME/g, `${downloadSpeed}`)
            .replace(/@_SERIAL_NUMBER/g, serialNumber)
            .replace(/@_DESCRIPTION/g, description);
    }

    /**
     *
     * @param params
     */
    public parseDeactivateOntTemplate(params: NetworkAdtranOnuDeactivateDto, template: any) {

        // request config from OLT
        // check how many ONUs are configured on the pon Port
        // select Id that is not used (0 - 127)
        // define GEM = 2304 + onuId
        // define T-CONT = 1024 + onuId

        const onuId = params.onuId;
        const ponPort = params.ponPort;

        // if ponPort = 16 change to 0
        let partition = ponPort;
        if(ponPort === '16') {
            partition = '0';
        }

        const tCont = 1024 + parseInt(params.onuId);
        const gem = 2304 + parseInt(params.onuId);
        let channelLong = `0/${ponPort}`;

        let channelInterfaceName = `0/${ponPort}`;

        if([ '6320' ].includes(params.oltModel)) {
            channelInterfaceName = `0/${ponPort}.xgs-pon`;
        }

        let onuLong = `onu-0/${partition}-${params.onuId}`;

        return template
            .replace(/@_CHANNEL_INTERFACE_NAME/g, channelInterfaceName)
            .replace(/@_CHANNEL_TERMINATION_LONG/g, channelLong)
            .replace(/@_PON_PORT/g, ponPort)
            .replace(/@_CHANNEL_PARTITION/g, partition)
            .replace(/@_ONU_ID_LONG/g, onuLong)
            .replace(/@_ONU_ID/g, onuId)
            .replace(/@_GEM/g, `${gem}`)
            .replace(/@_TCONT/g, `${tCont}`)
    }

    /**
     * Activate voice service
     * @param params
     */
    public parseActivateVoiceTemplate(params: NetworkAdtranOnuActivateVoiceDto, template: any) {

        // request config from OLT
        // check how many ONUs are configured on the pon Port
        // select Id that is not used (0 - 127)
        // define GEM = 2304 + 256 + onuId
        // define T-CONT = 1024 + 256 + onuId

        const onuId = params.onuId;
        const ponPort = params.ponPort;

        // if ponPort = 16 change to 0
        let partition = ponPort;
        if(ponPort === '16') {
            partition = '0';
        }

        const tCont = 1024 + 256 + parseInt(params.onuId);
        const gem = 2304 + 256 + parseInt(params.onuId);

        const channelLong = `0/${ponPort}`;

        const onuLong = `onu-0/${partition}-${params.onuId}`;

        return template
            .replace(/@_CHANNEL_TERMINATION_LONG/g, channelLong)
            .replace(/@_PON_PORT/g, ponPort)
            .replace(/@_CHANNEL_PARTITION/g, partition)
            .replace(/@_ONU_ID_LONG/g, onuLong)
            .replace(/@_ONU_ID/g, onuId)
            .replace(/@_GEM/g, `${gem}`)
            .replace(/@_TCONT/g, `${tCont}`)
            .replace(/@PHONE_NUMBER/g, `${params.phoneAreaCode}${params.phoneSubscriberNumber}`)
            .replace(/@SIP_PASSWORD/g, params.sipPassword);

    }

    /**
     * Activate voice service
     * @param params
     */
    public parseDeactivateVoiceTemplate(params: NetworkAdtranOnuActivateVoiceDto, template: any) {

        // request config from OLT
        // check how many ONUs are configured on the pon Port
        // select Id that is not used (0 - 127)
        // define GEM = 2304 + 256 + onuId
        // define T-CONT = 1024 + 256 + onuId

        const onuId = params.onuId;
        const ponPort = params.ponPort;

        // if ponPort = 16 change to 0
        let partition = ponPort;
        if(ponPort === '16') {
            partition = '0';
        }

        const tCont = 1024 + 256 + parseInt(params.onuId);
        const gem = 2304 + 256 + parseInt(params.onuId);

        const channelLong = `0/${ponPort}`;

        const onuLong = `onu-0/${partition}-${params.onuId}`;

        return template
            .replace(/@_CHANNEL_TERMINATION_LONG/g, channelLong)
            .replace(/@_PON_PORT/g, ponPort)
            .replace(/@_CHANNEL_PARTITION/g, partition)
            .replace(/@_ONU_ID_LONG/g, onuLong)
            .replace(/@_ONU_ID/g, onuId)
            .replace(/@_GEM/g, `${gem}`)
            .replace(/@_TCONT/g, `${tCont}`);
    }

    /**
     * currently not working, returns error no device found to modify
     * @param params
     */
    public parseCheckStatusOntTemplate(params: NetworkAdtranOnuCheckStatusDto) {

        const template = CHECK_STATUS_ONT_TEMPLATE;

        const onuInterfaceName = params.onuInterfaceName;

        return template
            .replace(/@ONU_INTERFACE_NAME/g, onuInterfaceName)
    }
}
