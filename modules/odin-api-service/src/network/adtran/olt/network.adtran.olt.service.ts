const FormData = require('form-data');
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordEntity } from '@d19n/models/dist/schema-manager/db/record/db.record.entity';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { DbRecordsAssociationsService } from '@d19n/schema-manager/dist/db/records/associations/db.records.associations.service';
import { DbRecordsService } from '@d19n/schema-manager/dist/db/records/db.records.service';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { BaseHttpClient } from '../../../common/Http/BaseHttpClient';
import { NetworkAdtranOnuActivateDto } from '../onu/dto/network.adtran.onu.activate.dto';
import { NetworkAdtranOnuActivateVoiceDto } from '../onu/dto/network.adtran.onu.activate.voice.dto';
import { NetworkAdtranOnuDeactivateDto } from '../onu/dto/network.adtran.onu.deactivate.dto';
import {
    IActivateOnt,
    IActivateOntData,
    IActivateOnuAndDataResponse,
    IActivateOnuResponse,
    IActivateVoice,
    ICheckStatusOnt,
    IDeactivateOnt,
    IDeactivateOnuAndDataResponse,
    IDeactivateOnuResponse,
    IDeactivateVoice,
    IDeactivateVoiceResponse,
    INodeObj,
    IParsedConfig,
    NextAvailableOnuInterface,
    UnrecognizedOnuMatch,
} from './interfaces/network.adtran.olt.interfaces';
import { NetworkAdtranOltHelpers } from './network.adtran.olt.helpers';
import { oltIpsDurham, oltIpsPeterlee } from './olt.list';
import {
    ADD_EVC_MAPS_SECTION,
    ADD_LINK_TABLE_SECTION,
    ADD_ONU_ASSIGNED_TCONT,
    ADD_ONU_LONG_SECTION,
    ADD_ONU_LONG_SUBSCRIBER_SECTION,
    ADD_ONU_SUBSCRIBER_SECTION,
    ADD_QOS_SCHEDULER_SECTION,
    ADD_SUBSCRIBER_PROFILE_SECTION,
    ADD_T_CONT_SECTION,
} from './templates/add-onu-data-residential-xml-template';
import {
    ADD_VOICE_ASSIGNED_T_CONT_SECTION,
    ADD_VOICE_EVC_MAPS_SECTION,
    ADD_VOICE_PROFILE_SECTION,
    ADD_VOICE_QOS_CHILD_NODES_SECTION,
    ADD_VOICE_SUBSCRIBER_PROFILE_SECTION,
    ADD_VOICE_SUBSCRIBER_SECTION,
    ADD_VOICE_T_CONT_SECTION,
} from './templates/add-onu-voice-xml-template';
import { ADD_ONU_SECTION } from './templates/add-onu-xml-template';
import { NetworkAdtranOltTemplatesParsers } from './templates/parsers/network.adtran.olt.templates.parsers';
import { parseXmlToJson } from './templates/parsers/network.adtran.xml-to-json';
import {
    REMOVE_EVC_MAPS_SECTION,
    REMOVE_LINK_TABLE_SECTION,
    REMOVE_ONU_ASSIGNED_TCONT,
    REMOVE_ONU_LONG_SECTION,
    REMOVE_ONU_LONG_SUBSCRIBER_SECTION,
    REMOVE_ONU_SUBSCRIBER_SECTION,
    REMOVE_QOS_CHILD_NODES_SECTION,
    REMOVE_QOS_SCHEDULER_SECTION,
    REMOVE_SUBSCRIBER_PROFILE_SECTION,
    REMOVE_T_CONT_SECTION,
} from './templates/remove-onu-data-residential-xml-template';
import {
    REMOVE_VOICE_ASSIGNED_T_CONT_SECTION,
    REMOVE_VOICE_EVC_MAPS_SECTION,
    REMOVE_VOICE_ONU_SECTION,
    REMOVE_VOICE_ONU_SUBSCRIBER_SECTION,
    REMOVE_VOICE_QOS_CHILD_NODES_SECTION,
    REMOVE_VOICE_QOS_SCHEDULER_SECTION,
    REMOVE_VOICE_SUBSCRIBER_PROFILE_SECTION,
    REMOVE_VOICE_T_CONT_SECTION,
} from './templates/remove-onu-voice-xml-template';
import { REMOVE_ONU_SECTION } from './templates/remove-onu-xml-template';

const baseUrl = process.env.NETWORK_API_BASE_URL;


@Injectable()
export class NetworkAdtranOltService extends NetworkAdtranOltHelpers {

    private httpClient: BaseHttpClient;

    private dbService: DbService;
    private dbRecordsService: DbRecordsService;
    private dbRecordsAssociationsService: DbRecordsAssociationsService;
    private schemasService: SchemasService;
    private amqpConnection: AmqpConnection;

    constructor(
        dbService: DbService,
        dbRecordsService: DbRecordsService,
        dbRecordsAssociationsService: DbRecordsAssociationsService,
        schemasService: SchemasService,
        amqpConnection: AmqpConnection,
    ) {

        super();

        this.dbService = dbService;
        this.dbRecordsService = dbRecordsService;
        this.dbRecordsAssociationsService = dbRecordsAssociationsService;
        this.schemasService = schemasService;
        this.amqpConnection = amqpConnection;

        this.httpClient = new BaseHttpClient();
    }

    /**
     * returns the config of the olt
     * @param oltName
     * @protected
     */
    public async getConfigJson(principal: OrganizationUserEntity, oltIp: string): Promise<IParsedConfig> {
        try {
            // get the config
            const config = await this.getConfigXml(oltIp);
            // parse the config
            return this.parseRawXMLConfigToJson(oltIp, config);

        } catch (e) {
            console.error(e);
        }
    }

    /**
     * returns the config of the olt
     * @param oltName
     * @protected
     */
    public async getConfigXml(oltIp: string) {
        try {
            const res = await this.httpClient.getRequest(baseUrl, `getallconfig/${oltIp}`);

            return res;
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }

    /**
     * Provisions some default devices so the ont can be searchable for unrecognized devices.
     * it must have atleast 1 device provisioned
     * @protected
     * @param principal
     * @param oltIp
     */
    public async initializeNewOltWithDefaultOnus(
        principal: OrganizationUserEntity,
        oltIp: string,
    ): Promise<IActivateOnuAndDataResponse[]> {
        try {
            // create an array of all possible interface names that can be provisioned
            const initialOnuInterfaces = this.getInitialOnuInterfaces();

            const initialized = [];

            for(const onuInterface of initialOnuInterfaces) {

                const { onuId, port } = this.transformInterfaceNameFromOltConfig(onuInterface);

                // if no onuId is assigned, select the next available
                const newDevice = new NetworkAdtranOnuActivateDto();
                newDevice.onuId = onuId;
                newDevice.ponPort = port;
                newDevice.uploadSpeed = '50M';
                newDevice.downloadSpeed = '50M';
                newDevice.fullAddress = 'initial provision';
                newDevice.serialNumber = 'ADTN12345678';

                const evcMaps = await this.addOnuAndOnuDataSection(newDevice, oltIp, ADD_EVC_MAPS_SECTION);
                const subProfile = await this.addOnuAndOnuDataSection(newDevice, oltIp, ADD_SUBSCRIBER_PROFILE_SECTION);
                const tCont = await this.addOnuAndOnuDataSection(newDevice, oltIp, ADD_T_CONT_SECTION);
                const linkTable = await this.addOnuAndOnuDataSection(newDevice, oltIp, ADD_LINK_TABLE_SECTION);
                const qosScheduler = await this.addOnuAndOnuDataSection(newDevice, oltIp, ADD_QOS_SCHEDULER_SECTION);
                const onuDevice = await this.addOnuAndOnuDataSection(newDevice, oltIp, ADD_ONU_SECTION);
                const onuSubscriber = await this.addOnuAndOnuDataSection(newDevice, oltIp, ADD_ONU_SUBSCRIBER_SECTION);
                const onuLong = await this.addOnuAndOnuDataSection(newDevice, oltIp, ADD_ONU_LONG_SECTION);
                const onuLongSub = await this.addOnuAndOnuDataSection(
                    newDevice,
                    oltIp,
                    ADD_ONU_LONG_SUBSCRIBER_SECTION,
                );

                initialized.push({
                    newDevice,
                    nextAvailableOnuInterface: {
                        oltIp,
                        interfaceName: onuInterface,
                        onuId: onuId,
                        port: port,
                    },
                    evcMaps,
                    subProfile,
                    tCont,
                    linkTable,
                    qosScheduler,
                    onuDevice,
                    onuSubscriber,
                    onuLong,
                    onuLongSub,
                });
            }

            return initialized;

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }

    /**
     *
     * @private
     * @param principal
     * @param params
     */
    public async activateOnu(
        principal: OrganizationUserEntity,
        params: IActivateOnt,
    ): Promise<IActivateOnuResponse> {
        try {

            let { oltIp, port, uploadSpeed, downloadSpeed, fullAddress, exPolygonId, serialNumber } = params;

            // this will find the olts by exchange polygon id
            if(exPolygonId) {

                const olts = await this.getOltsByExchangePolygonId(principal, exPolygonId)

                console.log('oltByExpolygon', exPolygonId, olts)

                const oltIpList = olts.map(elem => getProperty(elem, 'IpAddress'));

                console.log('oltIpList', exPolygonId, oltIpList)

                const unrecognizedMatch = await this.findUnrecognizedOntBySerialNumberParallel(
                    serialNumber,
                    oltIpList,
                );

                oltIp = unrecognizedMatch.oltIp;
                port = unrecognizedMatch.port;

            }

            // FALLBACK
            // find the unrecognized ONU that is connected no olts found by ex polygon id
            if(!port && !oltIp) {

                let oltList = this.getOltIpListFromAddress(fullAddress);

                console.log('-------fullAddress', fullAddress);
                console.log('-------oltList', oltList);

                const unrecognizedMatch = await this.findUnrecognizedOntBySerialNumberParallel(
                    serialNumber,
                    oltList,
                );

                oltIp = unrecognizedMatch.oltIp;
                port = unrecognizedMatch.port;

            }

            const olt = await this.getOltByIpAddress(principal, oltIp);

            console.log('olt', olt);

            if(!olt) {
                throw new ExceptionType(
                    400,
                    'The olt is not in the list of supported olts, please have the network admin add it and try again',
                );
            }

            const model = getProperty(olt, 'Model');

            console.log('model', model);

            // find next available onuId 1101.<partition>.<onuId>
            const nextAvailableOnuInterface = await this.getNextAvailableOnuInterface(oltIp, port);

            // if no onuId is assigned, select the next available
            const newDevice = new NetworkAdtranOnuActivateDto();
            newDevice.oltModel = model;
            newDevice.onuId = nextAvailableOnuInterface.onuId;
            newDevice.ponPort = nextAvailableOnuInterface.port;
            newDevice.uploadSpeed = uploadSpeed;
            newDevice.downloadSpeed = downloadSpeed;
            newDevice.fullAddress = fullAddress;
            newDevice.serialNumber = serialNumber;

            const onuDevice = await this.addOnuAndOnuDataSection(newDevice, oltIp, ADD_ONU_SECTION);

            console.log('adding new device', {
                olt,
                newDevice,
                nextAvailableOnuInterface,
                onuDevice,
            });

            return {
                olt,
                newDevice,
                nextAvailableOnuInterface,
                onuDevice,
            };

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }


    /**
     * Passing in the address we will return the matching list or the default
     * all olt ips
     *
     * @param fullAddress
     * @private
     */
    public getOltIpListFromAddress(fullAddress: string) {

        let oltList = [ ...oltIpsPeterlee, ...oltIpsDurham ];

        // TODO: dynamically select list of olt ips based on address
        // to optimize and reduce the number of ips we need to search
        // we are checking distinctly between durham or not durham
        if(fullAddress.toLowerCase().indexOf('durham') > -1 && fullAddress.toLowerCase().indexOf('dh') > -1) {

            oltList = oltIpsDurham

        } else if(fullAddress.toLowerCase().indexOf('sr8') > -1) {

            oltList = oltIpsPeterlee

        }
        return oltList;
    }

    /**
     *
     * @private
     * @param principal
     * @param params
     */
    public async activateOnuWithData(
        principal: OrganizationUserEntity,
        params: IActivateOnt,
    ): Promise<IActivateOnuAndDataResponse> {
        try {

            const res1 = await this.activateOnu(principal, params);

            // add onu data
            const newDeviceData: IActivateOntData = {
                oltModel: res1.newDevice.oltModel,
                oltIp: res1.nextAvailableOnuInterface.oltIp,
                onuId: res1.newDevice.onuId,
                port: res1.newDevice.ponPort,
                uploadSpeed: params.uploadSpeed,
                downloadSpeed: params.downloadSpeed,
                fullAddress: params.fullAddress,
                serialNumber: params.serialNumber,
            };

            console.log('newDeviceData', newDeviceData);

            const res2 = await this.activateOnuData(principal, newDeviceData);

            return {
                ...res1,
                ...res2,
            };

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }


    /**
     *
     * @private
     * @param principal
     * @param params
     */
    public async activateOnuData(
        principal: OrganizationUserEntity,
        params: IActivateOntData,
    ): Promise<any> {
        try {

            let { oltIp, oltModel, onuId, port, uploadSpeed, downloadSpeed, fullAddress, serialNumber } = params;

            const newDevice = new NetworkAdtranOnuActivateDto();
            newDevice.oltModel = oltModel;
            newDevice.onuId = onuId;
            newDevice.ponPort = port;
            newDevice.uploadSpeed = uploadSpeed;
            newDevice.downloadSpeed = downloadSpeed;
            newDevice.fullAddress = fullAddress;
            newDevice.serialNumber = serialNumber;

            // validate newDevice

            console.log('newDevice', newDevice);

            const evcMaps = await this.addOnuAndOnuDataSection(newDevice, oltIp, ADD_EVC_MAPS_SECTION);
            const subProfile = await this.addOnuAndOnuDataSection(newDevice, oltIp, ADD_SUBSCRIBER_PROFILE_SECTION);
            const tCont = await this.addOnuAndOnuDataSection(newDevice, oltIp, ADD_T_CONT_SECTION);
            const linkTable = await this.addOnuAndOnuDataSection(newDevice, oltIp, ADD_LINK_TABLE_SECTION);
            const qosScheduler = await this.addOnuAndOnuDataSection(newDevice, oltIp, ADD_QOS_SCHEDULER_SECTION);
            const onuSubscriber = await this.addOnuAndOnuDataSection(newDevice, oltIp, ADD_ONU_SUBSCRIBER_SECTION);
            const onuLong = await this.addOnuAndOnuDataSection(newDevice, oltIp, ADD_ONU_LONG_SECTION);
            const onuLongSub = await this.addOnuAndOnuDataSection(newDevice, oltIp, ADD_ONU_LONG_SUBSCRIBER_SECTION);
            const tContAssociated = await this.addOnuAndOnuDataSection(newDevice, oltIp, ADD_ONU_ASSIGNED_TCONT);

            return {
                newDevice,
                evcMaps,
                subProfile,
                tCont,
                linkTable,
                qosScheduler,
                onuSubscriber,
                onuLong,
                onuLongSub,
                tContAssociated,
            };


        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }


    /**
     *
     * @private
     * @param principal
     * @param params
     */
    public async deactivateOnuAndData(
        principal: OrganizationUserEntity,
        params: IDeactivateOnt,
    ): Promise<IDeactivateOnuAndDataResponse> {
        try {

            const res0 = await this.deactivateVoice(principal, params);
            const res1 = await this.deactivateOnuData(principal, params);
            const res2 = await this.deactivateOnu(principal, params);

            return {
                ...res0,
                ...res1,
                ...res2,
            };
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }

    /**
     *
     * @private
     * @param principal
     * @param params
     */
    public async deactivateOnuData(
        principal: OrganizationUserEntity,
        params: IDeactivateOnt,
    ): Promise<any> {
        try {

            let { oltIp, oltModel, port, onuId } = params;

            const existingDevice = new NetworkAdtranOnuDeactivateDto();
            existingDevice.oltModel = oltModel;
            existingDevice.ponPort = port;
            existingDevice.onuId = onuId;

            const evcMaps = await this.removeDataSection(existingDevice, oltIp, REMOVE_EVC_MAPS_SECTION);
            const subProfile = await this.removeDataSection(existingDevice, oltIp, REMOVE_SUBSCRIBER_PROFILE_SECTION);
            const tCont = await this.removeDataSection(existingDevice, oltIp, REMOVE_T_CONT_SECTION);
            const linkTable = await this.removeDataSection(existingDevice, oltIp, REMOVE_LINK_TABLE_SECTION);
            const qosChildNodes = await this.removeDataSection(existingDevice, oltIp, REMOVE_QOS_CHILD_NODES_SECTION);
            const qosScheduler = await this.removeDataSection(existingDevice, oltIp, REMOVE_QOS_SCHEDULER_SECTION);
            const onuSubscriber = await this.removeDataSection(existingDevice, oltIp, REMOVE_ONU_SUBSCRIBER_SECTION);
            const onuLong = await this.removeDataSection(existingDevice, oltIp, REMOVE_ONU_LONG_SECTION);
            const onuLongSub = await this.removeDataSection(existingDevice, oltIp, REMOVE_ONU_LONG_SUBSCRIBER_SECTION);
            const tContAssigned = await this.removeDataSection(existingDevice, oltIp, REMOVE_ONU_ASSIGNED_TCONT);

            return {
                evcMaps,
                subProfile,
                tCont,
                linkTable,
                qosChildNodes,
                qosScheduler,
                onuSubscriber,
                tContAssigned,
                onuLong,
                onuLongSub,
            };
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }

    /**
     *
     * @private
     * @param principal
     * @param params
     */
    public async deactivateOnu(
        principal: OrganizationUserEntity,
        params: IDeactivateOnt,
    ): Promise<IDeactivateOnuResponse> {
        try {

            let { oltIp, oltModel, port, onuId } = params;

            // if no onuId is assigned, select the next available
            const existingDevice = new NetworkAdtranOnuDeactivateDto();
            existingDevice.oltModel = oltModel;
            existingDevice.ponPort = port;
            existingDevice.onuId = onuId;

            const onuDevice = await this.removeDataSection(existingDevice, oltIp, REMOVE_ONU_SECTION);

            return {
                onuDevice,
            };
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }


    /**
     *
     * @param principal
     * @param params
     * @protected
     */
    public async getOnuStatus(principal: OrganizationUserEntity, params: ICheckStatusOnt) {
        try {

            const { oltIp, port, onuId } = params;

            // transform the port to partition
            let partition = port;
            if(Number(port) === 16) {
                partition = '0';
            }
            const res = await this.httpClient.getRequest(baseUrl, `getconfigstate_2/${oltIp}/${partition}/${onuId}`);

            const parsedRes = this.parseOltRpcStatusCheckResponse(res);

            return parsedRes;

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }


    /**
     *
     * @param principal
     * @param params
     */
    public async activateVoice(principal: OrganizationUserEntity, params: IActivateVoice) {

        try {

            const { oltIp, port, onuId, phoneAreaCode, phoneSubscriberNumber, sipPassword } = params;

            const newDevice = new NetworkAdtranOnuActivateVoiceDto();
            newDevice.onuId = onuId;
            newDevice.ponPort = port;
            newDevice.phoneAreaCode = phoneAreaCode;
            newDevice.phoneSubscriberNumber = phoneSubscriberNumber;
            newDevice.sipPassword = sipPassword;


            const evcMaps = await this.addOnuVoiceSection(newDevice, oltIp, ADD_VOICE_EVC_MAPS_SECTION);
            const subProfile = await this.addOnuVoiceSection(newDevice, oltIp, ADD_VOICE_SUBSCRIBER_PROFILE_SECTION);
            const tCont = await this.addOnuVoiceSection(newDevice, oltIp, ADD_VOICE_T_CONT_SECTION);
            const assignedTCont = await this.addOnuVoiceSection(newDevice, oltIp, ADD_VOICE_ASSIGNED_T_CONT_SECTION);
            const qosChildNodes = await this.addOnuVoiceSection(newDevice, oltIp, ADD_VOICE_QOS_CHILD_NODES_SECTION);
            const subscriber = await this.addOnuVoiceSection(newDevice, oltIp, ADD_VOICE_SUBSCRIBER_SECTION);
            const profile = await this.addOnuVoiceSection(newDevice, oltIp, ADD_VOICE_PROFILE_SECTION);

            return {
                evcMaps,
                subProfile,
                tCont,
                assignedTCont,
                qosChildNodes,
                subscriber,
                profile,
            }
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }


    /**
     *
     * @private
     * @param principal
     * @param params
     */
    public async deactivateVoice(
        principal: OrganizationUserEntity,
        params: IDeactivateVoice,
    ): Promise<IDeactivateVoiceResponse> {
        try {

            const { oltIp } = params;

            const newDevice = new NetworkAdtranOnuActivateVoiceDto();
            newDevice.ponPort = params.port;
            newDevice.onuId = params.onuId;

            const evcMaps = await this.removeVoiceSection(newDevice, oltIp, REMOVE_VOICE_EVC_MAPS_SECTION);
            const subProfile = await this.removeVoiceSection(newDevice, oltIp, REMOVE_VOICE_SUBSCRIBER_PROFILE_SECTION);
            const tCont = await this.removeVoiceSection(newDevice, oltIp, REMOVE_VOICE_T_CONT_SECTION);
            const assignedTCont = await this.removeVoiceSection(newDevice, oltIp, REMOVE_VOICE_ASSIGNED_T_CONT_SECTION);
            const qosChildNodes = await this.removeVoiceSection(newDevice, oltIp, REMOVE_VOICE_QOS_CHILD_NODES_SECTION);
            const qosScheduler = await this.removeVoiceSection(newDevice, oltIp, REMOVE_VOICE_QOS_SCHEDULER_SECTION);
            const onuDevice = await this.removeVoiceSection(newDevice, oltIp, REMOVE_VOICE_ONU_SECTION);
            const onuSubscriber = await this.removeVoiceSection(newDevice, oltIp, REMOVE_VOICE_ONU_SUBSCRIBER_SECTION);

            return {
                evcMaps,
                subProfile,
                tCont,
                assignedTCont,
                qosChildNodes,
                qosScheduler,
                onuDevice,
                onuSubscriber,
            };
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }


    /**
     *
     * @param oltIp
     * @param configXml
     * @private
     */
    private parseRawXMLConfigToJson(oltIp: string, configXml: any) {
        try {

            // parse the config
            const configJson = parseXmlToJson(configXml);

            let parsedConfig = {
                oltIp,
                unrecognizedDevices: [],
                childNodesNoOnu: [],
                interfaces: {
                    channelTerminationsSummary: {},
                    channelTerminations: [],
                    channelSchedulerNodes: [],
                    channelPairs: [],
                    activatedOnus: [],
                    childNodes: [],
                },
                summary: {
                    activeOnusCount: 0,
                    childNodeCount: 0,
                },
                configJson,
            }

            // parse a list of all devices activated on the onu
            if(configJson && configJson['data'] && configJson['data']['interfaces']) {

                const oltConfig = configJson['data'];

                for(const interfaceObj of configJson['data']['interfaces']['if:interface']) {

                    // Parse channel-termination interface
                    if(interfaceObj && interfaceObj['if:name'] && interfaceObj['if:name'].indexOf('channel-termination') > -1) {

                        parsedConfig.interfaces.channelTerminations.push(interfaceObj['if:name']);
                        parsedConfig = this.parseTmRootConfigSection(interfaceObj, parsedConfig);
                    }

                    // Parse channel pairs
                    if(interfaceObj && interfaceObj['if:name'] && interfaceObj['if:name'].indexOf('channel-pair') > -1) {
                        parsedConfig.interfaces.channelPairs.push(interfaceObj['if:name']);
                    }

                    // parse list of unrecognized onus
                    const unrecognizedDevices = this.parseUnrecognizedDevices(interfaceObj, oltIp);
                    parsedConfig.unrecognizedDevices = unrecognizedDevices;

                    // create list of connected onus
                    const activatedOnus = this.parseActivatedOnus(interfaceObj);
                    parsedConfig.interfaces.activatedOnus = [
                        ...parsedConfig.interfaces.activatedOnus,
                        ...activatedOnus,
                    ];
                }
            }

            // Create an ONU_LONG_ID
            // Check which of the childNodes does not have a device
            const activatedOnusOnuLongIds = parsedConfig.interfaces.activatedOnus.map(elem => `Data-onu-0/${elem.port}-${elem.onuId}`);
            const additionalChildNodes = parsedConfig.interfaces.childNodes.filter(elem => !activatedOnusOnuLongIds.includes(
                elem));
            parsedConfig.childNodesNoOnu = additionalChildNodes;

            // Build config summary
            parsedConfig.summary.activeOnusCount = parsedConfig.interfaces.activatedOnus.length;
            parsedConfig.summary.childNodeCount = parsedConfig.interfaces.childNodes.length;

            return parsedConfig;

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);

        }
    }

    /**
     *
     * @param interfaceObj
     * @private
     */
    private parseActivatedOnus(interfaceObj) {
        const activatedOnus = [];
        if(interfaceObj['adtn-xp:onu'] && interfaceObj['adtn-xp:onu']['adtn-xp:aes-mode-enable']) {

            const interfaceName = interfaceObj['if:name'];
            const serialNumber = interfaceObj['adtn-xp:onu']['adtn-xp:expected-serial-number-string'];
            const description = interfaceObj['if:description'];

            const { onuId, port } = this.transformInterfaceNameFromOltConfig(interfaceName);

            activatedOnus.push({
                port,
                onuId,
                interfaceName,
                serialNumber,
                description,
            });
        }
        return activatedOnus;
    }

    /**
     *
     * @param interfaceObj
     * @param oltIp
     * @private
     */
    private parseUnrecognizedDevices(interfaceObj, oltIp: string) {
        const channelTermination = interfaceObj['channel-termination'];
        const unrecognizedDevices = [];
        if(channelTermination && channelTermination['unrecognized-onu']) {
            // current API response returns an array if there are more than 1 unrecognized
            // serialNumbers on a single port.
            if(Array.isArray(channelTermination['unrecognized-onu'])) {
                // find the matching serial number in the array or undefined
                return channelTermination['unrecognized-onu'].find(elem => {
                    unrecognizedDevices.push({
                        oltIp,
                        serialNumber: elem,
                    });
                });
            } else if(channelTermination['unrecognized-onu']) {
                // return the serial number that matches
                unrecognizedDevices.push({
                    oltIp,
                    serialNumber: channelTermination['unrecognized-onu'],
                });
            }
        }
        return unrecognizedDevices;
    }

    /**
     *
     * @param interfaceObj
     * @param parsedConfig
     * @private
     */
    private parseTmRootConfigSection(interfaceObj: any, parsedConfig: IParsedConfig): IParsedConfig {
        if(interfaceObj['tm-root']) {
            // parse 'adtn-bbf-qos-sched:scheduler-node'

            if(Array.isArray(interfaceObj['tm-root']['adtn-bbf-qos-sched:scheduler-node'])) {

                // Parse Array scheduler nodes
                for(const node of interfaceObj['tm-root']['adtn-bbf-qos-sched:scheduler-node']) {
                    const nodeObj = this.parseChildNodes(node, interfaceObj);
                    const nodeName = node['adtn-bbf-qos-sched:name'];
                    parsedConfig.interfaces.childNodes.push(...nodeObj[nodeName].childNodes);
                    parsedConfig.interfaces.channelSchedulerNodes.push(nodeObj);
                }

            } else if(interfaceObj['tm-root']['adtn-bbf-qos-sched:scheduler-node']) {

                // Parse Object scheduler nodes
                const node = interfaceObj['tm-root']['adtn-bbf-qos-sched:scheduler-node'];
                // only parse if the name contains 'scheduler-channel-pair'
                const nodeName = node['adtn-bbf-qos-sched:name'];

                if(nodeName.indexOf('scheduler-channel-pair') > -1) {
                    const nodeObj = this.parseChildNodes(node, interfaceObj);
                    const nodeName = node['adtn-bbf-qos-sched:name'];
                    parsedConfig.interfaces.childNodes.push(...nodeObj[nodeName].childNodes);
                    parsedConfig.interfaces.channelSchedulerNodes.push(nodeObj);
                }
            }

            return parsedConfig;
        } else {
            return parsedConfig;
        }
    }

    /**
     *
     * @param node
     * @param interfaceObj
     * @private
     */
    private parseChildNodes(node, interfaceObj): INodeObj {
        // only parse if the name contains 'scheduler-channel-pair'
        const nodeName = node['adtn-bbf-qos-sched:name'];
        let nodeObj = {
            channelTermination: interfaceObj['if:name'],
            [nodeName]: {
                childNodes: [],
            },
        };

        if(nodeName.indexOf('scheduler-channel-pair') > -1) {

            if(Array.isArray(node['adtn-bbf-qos-sched:child-scheduler-nodes'])) {
                for(const childNode of node['adtn-bbf-qos-sched:child-scheduler-nodes']) {
                    const childNodeName = childNode['adtn-bbf-qos-sched:name'];
                    nodeObj[nodeName].childNodes.push(childNodeName);
                }
            } else if(node['adtn-bbf-qos-sched:child-scheduler-nodes']) {
                const childNode = node['adtn-bbf-qos-sched:child-scheduler-nodes'];
                const childNodeName = childNode['adtn-bbf-qos-sched:name'];

                nodeObj[nodeName].childNodes.push(childNodeName);
            }
        }

        return nodeObj;
    }

    /**
     * This function will add an ONU device to the OLT
     * And add the data configuration
     *
     * @param newParser
     * @param newDevice
     * @param oltIpAddress
     * @private
     */
    private async addOnuAndOnuDataSection(newDevice: NetworkAdtranOnuActivateDto, oltIpAddress, templateKey) {

        let setConfig = false;
        let saveConfig = false;

        try {

            const newParser = new NetworkAdtranOltTemplatesParsers();
            const template = newParser.parseActivateOntTemplate(newDevice, templateKey);

            setConfig = await this.setConfig(oltIpAddress, template);

            saveConfig = await this.saveConfig(oltIpAddress);

            return { setConfig, saveConfig, error: undefined };

        } catch (e) {
            console.error(e);
            return { action: 'create', setConfig, saveConfig, error: e.message }
        }
    }

    /**
     *
     * @param newParser
     * @param newDevice
     * @param oltIpAddress
     * @private
     */
    private async addOnuVoiceSection(newDevice: NetworkAdtranOnuActivateVoiceDto, oltIpAddress, templateKey) {

        let setConfig = false;
        let saveConfig = false;

        try {

            const newParser = new NetworkAdtranOltTemplatesParsers();
            const template = newParser.parseActivateVoiceTemplate(newDevice, templateKey);

            setConfig = await this.setConfig(oltIpAddress, template);

            saveConfig = await this.saveConfig(oltIpAddress);

            return { setConfig, saveConfig, error: undefined };
        } catch (e) {
            console.error(e);
            return { action: 'create', setConfig, saveConfig, error: e.message }
        }
    }

    /**
     *
     * @param newParser
     * @param newDevice
     * @param oltIpAddress
     * @private
     */
    private async removeDataSection(newDevice: NetworkAdtranOnuDeactivateDto, oltIpAddress, templateKey) {
        let setConfig = false;
        let saveConfig = false;

        try {
            // deactivate ont
            const newParser = new NetworkAdtranOltTemplatesParsers();
            const template = newParser.parseDeactivateOntTemplate(newDevice, templateKey);

            setConfig = await this.setConfig(oltIpAddress, template);

            saveConfig = await this.saveConfig(oltIpAddress);

            return { setConfig, saveConfig, error: undefined };
        } catch (e) {
            console.error(e);
            return { action: 'delete', setConfig, saveConfig, error: e.message }
        }
    }

    /**
     *
     * @param newParser
     * @param newDevice
     * @param oltIpAddress
     * @private
     */
    private async removeVoiceSection(newDevice: NetworkAdtranOnuActivateVoiceDto, oltIpAddress, templateKey) {
        let setConfig = false;
        let saveConfig = false;

        try {
            // deactivate ont voice
            const newParser = new NetworkAdtranOltTemplatesParsers();
            const template = newParser.parseDeactivateVoiceTemplate(newDevice, templateKey);

            setConfig = await this.setConfig(oltIpAddress, template);

            saveConfig = await this.saveConfig(oltIpAddress);

            return { setConfig, saveConfig, error: undefined };
        } catch (e) {
            console.error(e);
            return { action: 'delete', setConfig, saveConfig, error: e.message }
        }
    }

    /**
     * returns the oltIp and port when the serial number matches an unrecognized onu
     * @param oltName
     * @protected
     */
    protected async findUnrecognizedOntBySerialNumberParallel(
        serialNumber: string,
        oltIps: string[],
    ): Promise<UnrecognizedOnuMatch> {
        try {

            const functions = [];

            console.log('oltsIps', oltIps.length);

            for(const ip of oltIps) {

                console.log('ip', ip);

                for(const port of [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ]) {

                    functions.push({ func: this.httpClient.getRequest(baseUrl, `getunrecognizedonu/${ip}/${port}`) });

                }

                const oltResponses = await Promise.all(functions.map(elem => elem.func)).then(res => res);

                for(const res of oltResponses) {
                    const matchedSerial = this.parseConfigForUnrecognizedOnu(serialNumber, res);

                    if(matchedSerial) {
                        return { oltIp: ip, port: matchedSerial.port, serialNumber };
                    }
                }
            }

            throw new ExceptionType(400, 'Could not locate an unrecognized ONU in any of the olts');

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }

    /**
     *
     * @private
     */
    private parseConfigForUnrecognizedOnu(serialNumber: string, res: any) {

        const parsedRes = parseXmlToJson(res);

        if(parsedRes && parsedRes['data'] && parsedRes['data']['interfaces-state']) {
            const interfaceState = parsedRes['data']['interfaces-state'];

            const interfaceStateInterface = interfaceState['interface'];

            const channelTermination = interfaceStateInterface['channel-termination'];

            if(channelTermination && channelTermination['unrecognized-onu']) {
                // current API response returns an array if there are more than 1 unrecognized serialNumbers on a
                // single port.
                let splitChannel = interfaceStateInterface['name'].split(' ');
                let splitPort = splitChannel[1].split('/');
                const port = splitPort[1];

                if(Array.isArray(channelTermination['unrecognized-onu'])) {
                    // find the matching serial number in the array or undefined
                    const match = channelTermination['unrecognized-onu'].find(elem => elem === serialNumber);
                    console.log('match', match);
                    if(match) {
                        return {
                            serialNumber: match,
                            port,
                        };
                    } else {
                        return;
                    }

                } else if(channelTermination['unrecognized-onu'] === serialNumber) {
                    // return the serial number that matches
                    return {
                        serialNumber,
                        port,
                    }
                }
            }
        }
    }


    /**
     * This function is called anytime we need to modify the config on an olt
     *
     * @param oltIp
     * @param xmlConfig
     * @protected
     */
    protected async setConfig(oltIp: string, xmlConfig: any) {
        try {

            const formData = new FormData();

            formData.append('olt', oltIp);
            formData.append('payload', xmlConfig);

            const res = await this.httpClient.postFormData(baseUrl, `execute`, formData);

            return this.parseOltRpcResponse(res);

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }

    }

    /**
     * This function is called anytime we need to modify the config on an olt
     *
     * @param oltIp
     * @protected
     */
    protected async saveConfig(oltIp: string) {
        try {

            const form = new FormData();

            form.append('olt', oltIp);

            const res = await this.httpClient.postFormData(baseUrl, `save`, form);

            return this.parseOltRpcResponse(res);

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }

    }

    /**
     * returns the config of the olt
     * @param oltName
     * @protected
     */
    public async getNextAvailableOnuInterface(oltIp: string, port: string): Promise<NextAvailableOnuInterface> {
        try {

            const ontConfig = await this.getConfigXml(oltIp);

            const parsed = parseXmlToJson(ontConfig);

            const provisionedOnts = parsed['data']['interfaces']['if:interface'].filter(elem => elem['if:name'].indexOf(
                'onu 1101') > -1);
            // array of existing interface names provisioned
            const arrayOfInterfaceNames = provisionedOnts.map(elem => elem['if:name'])
            // create an array of all possible interface names that can be provisioned
            const possibleInterfaceNames = this.possibleInterfaceNames();
            // remove all taken interface names
            const availableInterfaces = possibleInterfaceNames.filter((a) => arrayOfInterfaceNames.includes(a) === false);

            const possibleInterfacesByPort = this.getPossibleInterfacesByPort(Number(port));

            const availableInterfacesForPort = availableInterfaces.filter((a) => possibleInterfacesByPort.includes(a) === true);

            if(availableInterfacesForPort && availableInterfacesForPort[0]) {
                // select the next available interface name
                // convert the onu interface name and return the onuId and port
                // handles partition 0 transformed to port 16
                const { onuId, port } = this.transformInterfaceNameFromOltConfig(availableInterfacesForPort[0]);

                // More than one QOS Scheduler
                const { childNodesNoOnu } = this.parseRawXMLConfigToJson(oltIp, ontConfig);
                if(childNodesNoOnu && childNodesNoOnu.length > 0) {
                    // we need to remove the onu node
                    const newDevice = new NetworkAdtranOnuDeactivateDto();
                    newDevice.ponPort = port;
                    newDevice.onuId = onuId;
                    await this.removeDataSection(newDevice, oltIp, REMOVE_QOS_CHILD_NODES_SECTION);
                }

                return { oltIp, interfaceName: availableInterfacesForPort[0], onuId, port };
            } else {
                throw new ExceptionType(400, `no interfaces available for port ${port}`);
            }
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }


    /**
     *
     * @param principal
     * @param oltIp
     * @private
     */
    public async getOltByIpAddress(principal: OrganizationUserEntity, oltIp: string): Promise<DbRecordEntityTransform> {

        const schema = await this.schemasService.getSchemaByOrganizationAndEntity(
            principal.organization,
            `${SchemaModuleTypeEnums.SERVICE_MODULE}:${SchemaModuleEntityTypeEnums.NETWORK_DEVICE}`,
        );

        const schemaType = schema.types.find(elem => elem.name === 'OLT');
        const ipAddressCol = schema.columns.find(elem => elem.name === 'IpAddress');

        const res: { record_id: string } = await this.dbRecordsService.getDbRecordBySchemaAndValues(
            principal.organization,
            {
                schema: schema,
                schemaTypeId: schemaType.id,
                query: [ { id: ipAddressCol.id, value: oltIp } ],
            },
        );

        if(res && res.record_id) {

            return await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                res.record_id,
            )

        } else {

            return undefined

        }

    }


    /**
     *
     * @param principal
     * @param exPolygonId
     * @private
     */
    public async getOltsByExchangePolygonId(
        principal: OrganizationUserEntity,
        exPolygonId: string,
    ): Promise<DbRecordEntityTransform[]> {

        const schema = await this.schemasService.getSchemaByOrganizationAndEntity(
            principal.organization,
            `${SchemaModuleTypeEnums.SERVICE_MODULE}:${SchemaModuleEntityTypeEnums.NETWORK_DEVICE}`,
        );

        const schemaType = schema.types.find(elem => elem.name === 'OLT');
        const exPolygonIdCol = schema.columns.find(elem => elem.name === 'ExPolygonId');

        const res: DbRecordEntity[] = await this.dbRecordsService.getDbRecordsByColumnAndValues(
            principal.organization,
            {
                schemaColumnId: exPolygonIdCol.id,
                values: [ exPolygonId ],
                schemaTypeId: schemaType.id,
            },
        );

        if(res && res.length > 0) {

            // transform the DbRecords
            return res.map(elem => DbRecordEntityTransform.transform(elem, schema))

        } else {

            return undefined

        }

    }
}
