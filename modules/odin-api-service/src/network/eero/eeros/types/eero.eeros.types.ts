export class EeroEntity {
    public id: number;
    public serial: string;
    public mac_address: string;
    public model: string;
    public model_number: string;
    public network: {
        url: string;
        name: string;
    }
}
