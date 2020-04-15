interface IVoiceMailCallForwardDestination {
    'announcement_id': number,
    'destination': 'voicebox',
    'priority': 1,
    'timeout': number
}


export class VoiceSipwiseCallForwardsDto {
    public 'cfb'?: {};
    public 'cfna'?: {};
    public 'cfo'?: null;
    public 'cfr'?: null;
    public 'cfs'?: {};
    public 'cft'?: {
        destinations: IVoiceMailCallForwardDestination[],
    };
    public 'cfu'?: {}
}
