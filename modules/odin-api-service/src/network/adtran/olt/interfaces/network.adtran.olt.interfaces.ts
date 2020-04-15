import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { NetworkAdtranOnuActivateDto } from '../../onu/dto/network.adtran.onu.activate.dto';

export interface IActivateOnt {

    oltIp: string,
    port: string,
    fullAddress: string,
    serialNumber: string,
    exPolygonId?: string, // if this is passed in, we will try to find all olts by exPolygonId
    uploadSpeed?: string,
    downloadSpeed?: string,

}

export interface IActivateOntData {
    oltIp: string,
    oltModel: string,
    port: string,
    onuId: string,
    fullAddress: string,
    serialNumber: string,
    uploadSpeed?: string,
    downloadSpeed?: string,
}

export interface IActivateOnuResponse {
    olt: DbRecordEntityTransform,
    newDevice: NetworkAdtranOnuActivateDto,
    nextAvailableOnuInterface: NextAvailableOnuInterface,
    onuDevice: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
}

export interface IActivateOnuDataResponse {
    evcMaps: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    subProfile: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    tCont: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    linkTable: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    tContAssociated: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    qosScheduler: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    onuDevice: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    onuSubscriber: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    onuLong: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    onuLongSub: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
}


export interface IActivateOnuAndDataResponse extends IActivateOnuResponse {
    evcMaps: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    subProfile: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    tCont: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    linkTable: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    tContAssociated: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    qosScheduler: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    onuDevice: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    onuSubscriber: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    onuLong: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    onuLongSub: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
}

export interface IDeactivateOnt {
    oltIp: string,
    oltModel: string,
    port: string,
    onuId: string,
}

export interface IDeactivateOnuResponse {
    onuDevice: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
}

export interface IDeactivateOnuDataResponse {
    evcMaps: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    subProfile: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    tCont: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    tContAssigned: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    linkTable: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    qosChildNodes: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    qosScheduler: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    onuSubscriber: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    onuLong: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    onuLongSub: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
}

export interface IDeactivateOnuAndDataResponse extends IDeactivateOnuResponse {
    evcMaps: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    subProfile: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    tCont: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    tContAssigned: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    linkTable: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    qosChildNodes: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    qosScheduler: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    onuSubscriber: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    onuLong: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    onuLongSub: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
}

export interface IActivateVoice {
    oltIp: string,
    onuId: string,
    port: string,
    phoneAreaCode: string,
    phoneSubscriberNumber: string,
    sipPassword: string
}


export interface IDeactivateVoice {
    oltIp: string,
    port: string,
    onuId: string,
}

export interface IDeactivateVoiceResponse {
    evcMaps: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    subProfile: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    tCont: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    assignedTCont: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    qosChildNodes: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    qosScheduler: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    onuDevice: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    },
    onuSubscriber: {
        setConfig: boolean,
        saveConfig: boolean,
        error: any
    }
}

export interface ICheckStatusOnt {
    oltIp: string,
    port: string,
    onuId: string,
}


export interface NextAvailableOnuInterface {
    oltIp: string,
    interfaceName: string,
    onuId: string,
    port: string
}

export interface UnrecognizedOnuMatch {
    oltIp: string,
    port: string,
    serialNumber: string
}

export interface IParsedConfig {
    summary: { childNodeCount: number; activeOnusCount: number };
    oltIp: string;
    interfaces: {
        channelTerminations: any[];
        channelSchedulerNodes: INodeObj[];
        channelTerminationsSummary: {};
        childNodes: any[];
        activatedOnus: any[];
        channelPairs: any[]
    };
    unrecognizedDevices: any[];
    childNodesNoOnu: any[],
    configJson: any
}

export interface INodeObj {
    // @ts-ignore
    channelTermination: string;

    [key: string]: {
        childNodes: any[];
    };
}
