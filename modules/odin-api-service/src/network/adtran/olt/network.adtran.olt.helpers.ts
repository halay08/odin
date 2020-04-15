import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { parseXmlToJson } from './templates/parsers/network.adtran.xml-to-json';

export class NetworkAdtranOltHelpers {

    /**
     * Returns an array of all the possible interface names for an onu
     * from port 0 and onuId 0
     * to port 16 and onuId 127
     * @protected
     */
    protected possibleInterfaceNames() {
        const iNames = [];
        for(let port = 1; port < 17; port++) {
            for(let onuId = 0; onuId < 127; onuId++) {
                if(port === 16) {
                    iNames.push(`onu 1101.0.${onuId}`);
                } else {
                    iNames.push(`onu 1101.${port}.${onuId}`);
                }
            }
        }
        return iNames;
    }

    /**
     * Returns an array of all the default interfaces
     * @protected
     */
    protected getPossibleInterfacesByPort(port: string | number) {
        const iNames = [];
        for(let onuId = 0; onuId < 127; onuId++) {
            // needs to change currently not changing
            if(Number(port) === 16) {
                iNames.push(`onu 1101.0.${onuId}`);
            } else {
                iNames.push(`onu 1101.${port}.${onuId}`);
            }
        }
        return iNames;
    }

    /**
     * Returns an array of all the default interfaces
     * @protected
     */
    protected getInitialOnuInterfaces() {
        const iNames = [];
        for(let port = 1; port < 17; port++) {
            if(port === 16) {
                iNames.push(`onu 1101.0.127`);
            } else {
                iNames.push(`onu 1101.${port}.127`);
            }
        }
        return iNames;
    }

    /**
     *
     * @param res
     * @protected
     */
    protected async parseOltRpcStatusCheckResponse(res: unknown) {

        const parsedRes = parseXmlToJson(res);

        if(parsedRes['data'] && parsedRes['data']['interfaces-state']) {

            const onuInterface = parsedRes['data']['interfaces-state']['interface'];

            const adminStatus = onuInterface['admin-status'];
            const operStatus = onuInterface['oper-status'];

            if(onuInterface['onu']) {
                const rxPower = onuInterface['onu']['rx-power'];
                const fibreLength = onuInterface['onu']['fiber-length'];
                const uptime = onuInterface['onu']['uptime'];

                return {
                    adminStatus,
                    operStatus,
                    rxPower,
                    fibreLength,
                    uptime,
                };
            } else {
                return {
                    adminStatus,
                    operStatus,
                    rxPower: undefined,
                    fibreLength: undefined,
                    uptime: undefined,
                };
            }
        } else {
            console.error(parsedRes['rpc-reply']['exception']);
            throw new ExceptionType(500, parsedRes['rpc-reply']['exception']);
        }
    }


    /**
     *
     * @param res
     * @protected
     */
    protected async parseOltRpcResponse(res: unknown) {

        const parsedRes = parseXmlToJson(res);
        const rpcReply = parsedRes['rpc-reply'];

        console.log('rpcReply', rpcReply);

        if(rpcReply['ok'] === '') {
            return true;
        } else if(rpcReply) {
            console.error(rpcReply['exception']);
            throw new ExceptionType(500, rpcReply['exception']);
        } else {
            console.error(parsedRes);
            throw new ExceptionType(500, 'error processing request');
        }

    }

    /**
     * Parse an interface name and return
     * port
     * onuId
     * @param onuInterfaceName
     * @protected
     */
    transformInterfaceNameFromOltConfig(onuInterfaceName: string): { port: string, onuId: string } {

        let port;
        let onuId;

        console.log('onuInterfaceName', onuInterfaceName);

        if(onuInterfaceName.indexOf('onu 1101') > -1) {

            const split1 = onuInterfaceName.split(' ');
            const split2 = split1[1].split('.');

            const partition = split2[1];
            onuId = split2[2];

            console.log('onuInterfaceName', onuInterfaceName);
            console.log('partition', partition);

            // because the onu interface name requires ponPort 16 to be 0
            // we need to reverse that back to 16
            if(partition === '0') {
                port = '16';
            } else {
                port = partition;
            }
        }

        console.log({
            port: port,
            onuId: onuId,
        });

        return {
            port: port,
            onuId: onuId,
        }
    }

    /**
     * Parse an interface name and return
     * partition
     * onuId
     * @param onuInterfaceName
     * @protected
     */
    protected parseInterfaceName(onuInterfaceName: string): { partition: string, onuId: string } {

        let partition;
        let onuId;

        if(onuInterfaceName.indexOf('onu 1101') > -1) {
            // split onu
            const split1 = onuInterfaceName.split(' ');
            // split interface
            const split2 = split1[1].split('.');

            partition = split2[1];
            onuId = split2[2];
        }

        return {
            partition,
            onuId,
        }
    }
}
