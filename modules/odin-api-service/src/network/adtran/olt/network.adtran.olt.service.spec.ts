import { APIClient } from '@d19n/client/dist/common/APIClient';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { AuthUserHelper } from '@d19n/schema-manager/dist/helpers/AuthUserHelper';
import { TestModuleConfig } from '@d19n/schema-manager/dist/helpers/tests/TestModuleConfig';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { TestingModule } from '@nestjs/testing';
import {
    IActivateOnt,
    IActivateOnuAndDataResponse,
    IActivateOnuResponse,
    IActivateVoice,
    IDeactivateOnt,
    IDeactivateOnuResponse,
    IDeactivateVoice,
    NextAvailableOnuInterface,
} from './interfaces/network.adtran.olt.interfaces';
import { NetworkAdtranOltService } from './network.adtran.olt.service';


jest.setTimeout(100000);

describe('Network Adtran Olt Service', () => {
    let networkService: NetworkAdtranOltService;
    let principal: OrganizationUserEntity;

    let app: TestingModule;

    const oltIp = '172.17.1.2' // DURHAM 6320 model
    // const oltIp = '172.17.0.200'; // PETERLEE 6310 model
    const port = '15';

    let activateRes: IActivateOnuAndDataResponse;
    let getStatusRes: any;
    let deactivateRes: any;


    beforeAll(async () => {
        app = await new TestModuleConfig([
            DbModule,
            SchemasModule,
        ], [
            NetworkAdtranOltService,
        ], []).initialize();

        const login = await AuthUserHelper.login();
        principal = await APIClient.call<OrganizationUserEntity>({
            facility: 'http',
            baseUrl: Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
            service: 'v1.0/users/my',
            method: 'get',
            headers: { Authorization: login.headers.authorization },
            debug: false,
        });

        networkService = app.get<NetworkAdtranOltService>(NetworkAdtranOltService);
    });


    describe('public methods', () => {
        it('all methods should be defined', (done) => {
            expect(networkService.getConfigJson).toBeDefined();
            expect(networkService.getConfigXml).toBeDefined();
            expect(networkService.initializeNewOltWithDefaultOnus).toBeDefined();
            expect(networkService.activateOnuWithData).toBeDefined();
            expect(networkService.deactivateOnuAndData).toBeDefined();
            expect(networkService.getOnuStatus).toBeDefined();
            expect(networkService.activateVoice).toBeDefined();
            expect(networkService.deactivateVoice).toBeDefined();
            done();
        });
    });

    describe('getConfigJson', () => {
        it('should get the xml config parsed to json', async (done) => {

            const config = await networkService.getConfigJson(principal, oltIp);

            console.log(config);

            expect(config.oltIp).toBe(oltIp);
            expect(config).toHaveProperty('unrecognizedDevices');
            expect(config).toHaveProperty('childNodesNoOnu');
            expect(config).toHaveProperty('interfaces');
            expect(config).toHaveProperty('summary');
            expect(config).toHaveProperty('configJson');

            done();
        })
    })

    describe('get olt by EX Polygon Id', () => {

        it('should match peterlee addresses', async (done) => {

            const exPolygonId = '6088';

            let olts = await networkService.getOltsByExchangePolygonId(principal, exPolygonId);

            console.log('-------olts', olts);

            expect(olts.length).toBeGreaterThan(0)

            const oltIpList = olts.map(elem => getProperty(elem, 'IpAddress'));

            console.log('-----oltIps', oltIpList)

            done()

        })
    })


    describe('validate address conditions matched to olt ip lists', () => {

        it('should match durham addresses', () => {

            const addresses = [
                '11 Kirkfields, DURHAM, DH6 1PR',
            ];

            for(const addr of addresses) {

                let oltList = networkService.getOltIpListFromAddress(addr);

                expect(oltList[0]).toBe('172.17.1.2');

                console.log('-------fullAddress', addr);
                console.log('-------oltList', oltList);

            }

        })


        it('should match peterlee addresses', () => {

            const addresses = [
                '6 Durham Avenue, PETERLEE, SR8 4PY',
            ];

            for(const addr of addresses) {

                let oltList = networkService.getOltIpListFromAddress(addr);

                expect(oltList[0]).toBe('172.17.0.196');

                console.log('-------fullAddress', addr);
                console.log('-------oltList', oltList);

            }

        })
    })

    describe('getNextAvailableOnuInterface for port 1', () => {
        it('should get the xml config parsed to json', async (done) => {

            const config: NextAvailableOnuInterface = await networkService.getNextAvailableOnuInterface(oltIp, '1');

            console.log(config);

            expect(config.oltIp).toBe(oltIp);
            expect(config.onuId).toBe('0');
            expect(config.interfaceName).toContain('1101.1');
            expect(config.port).toBe('1');

            done();
        })
    })

    describe('getNextAvailableOnuInterface for port 16', () => {
        it('should get the next available oltIp for port 16', async (done) => {

            const config: NextAvailableOnuInterface = await networkService.getNextAvailableOnuInterface(oltIp, '16');

            console.log('config', config);

            expect(config.oltIp).toBe(oltIp);
            expect(config.onuId).toBe('1');
            expect(config.interfaceName).toContain('1101.0');
            expect(config.port).toBe('16');

            console.log(config);

            done();
        })
    })

    describe('activate an ONU no data', () => {

        let activatedDevice: IActivateOnuResponse;

        it('should activate a new onu', async (done) => {

            const activation: IActivateOnt = {
                oltIp,
                port: port,
                serialNumber: 'ADTN12345678',
                uploadSpeed: '50M',
                downloadSpeed: '50M',
                fullAddress: 'odin test provision',
            };

            const res: IActivateOnuResponse = await networkService.activateOnu(principal, activation);

            console.log(res);

            activatedDevice = res;

            done();
        })

        it('should remove a new onu', async (done) => {

            const deactivation: IDeactivateOnt = {

                oltIp,
                oltModel: getProperty(activatedDevice.olt, 'Model'),
                port: activatedDevice.nextAvailableOnuInterface.port,
                onuId: activatedDevice.nextAvailableOnuInterface.onuId,

            }

            const res: IDeactivateOnuResponse = await networkService.deactivateOnu(principal, deactivation);

            console.log(res);

            done();
        })
    })

    describe('activate an ONU with data', () => {
        it('should activate a new onu', async (done) => {

            const activation: IActivateOnt = {
                oltIp,
                port: port,
                serialNumber: 'ADTN12345678',
                uploadSpeed: '50M',
                downloadSpeed: '50M',
                fullAddress: 'odin test provision',
            };

            const res: IActivateOnuAndDataResponse = await networkService.activateOnuWithData(principal, activation);

            console.log(res);

            activateRes = res;

            done();
        })
    })

    describe('activateVoice for an existing ONT', () => {
        it('should activate a Voice service for an existing ONT', async (done) => {

            const {
                onuId,
                port,
            } = networkService.transformInterfaceNameFromOltConfig(activateRes.nextAvailableOnuInterface.interfaceName);

            const activation: IActivateVoice = {
                oltIp,
                onuId: onuId,
                port: port,
                phoneAreaCode: '123',
                phoneSubscriberNumber: '12345678',
                sipPassword: 'test',
            };

            const res = await networkService.activateVoice(principal, activation);

            console.log(res);

            done();
        })
    });

    describe('deactivateVoice for an existing ONT', () => {
        it('should deactivate a Voice service for an existing ONT', async (done) => {

            const {
                onuId,
                port,
            } = networkService.transformInterfaceNameFromOltConfig(activateRes.nextAvailableOnuInterface.interfaceName);

            const deactivation: IDeactivateVoice = {
                oltIp,
                onuId: onuId,
                port: port,
            };

            const res = await networkService.deactivateVoice(principal, deactivation);

            console.log(res);

            done();
        })
    });

    describe('getStatus for an existing ONT', () => {
        it('should get get the status of the activated ONT', async (done) => {

            const {
                onuId,
                port,
            } = networkService.transformInterfaceNameFromOltConfig(activateRes.nextAvailableOnuInterface.interfaceName);

            const res: any = await networkService.getOnuStatus(
                principal,
                {
                    oltIp: activateRes.nextAvailableOnuInterface.oltIp,
                    port: port,
                    onuId: onuId,
                },
            );

            console.log(res);

            getStatusRes = res;

            expect(res.adminStatus).toBe('up');

            done();
        })
    })


    describe('deactivateOnt an existing ONT', () => {
        it('should deactivate the ONT', async (done) => {

            const {
                onuId,
                port,
            } = networkService.transformInterfaceNameFromOltConfig(activateRes.nextAvailableOnuInterface.interfaceName);

            const res: any = await networkService.deactivateOnuAndData(
                principal,
                {
                    oltIp: activateRes.nextAvailableOnuInterface.oltIp,
                    oltModel: getProperty(activateRes.olt, 'Model'),
                    port: port,
                    onuId: onuId,
                },
            );

            console.log(res);

            deactivateRes = res;

            done();
        })
    })

    afterAll(async () => {
        await app.close();
    });
});
