import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';

/**
 *
 * @param itemToProvision
 * @private
 */
export function parseEmailTemplateWithParams(
    ontToProvision: DbRecordEntityTransform,
    address: DbRecordEntityTransform,
) {

    try {

        const oltName = getProperty(ontToProvision, 'OltName');
        const ponPort = getProperty(ontToProvision, 'PONPort');
        const serialNumber = getProperty(ontToProvision, 'SerialNumber');
        const fullAddress = getProperty(address, 'FullAddress');


        const ontConfigTemplate = `set evc-maps evc-map evc_map_channel-termination0/<PON>_101_<T-Cont>_<GEM>_<onu-id-long> scheduler root-if-name "channel-termination 0/<PON>"
            <br />
            set evc-maps evc-map evc_map_channel-termination0/<PON>_101_<T-Cont>_<GEM>_<onu-id-long> scheduler scheduler-node-name "Data-<onu-id-long>"
            <br/>
            set evc-maps evc-map evc_map_channel-termination0/<PON>_101_<T-Cont>_<GEM>_<onu-id-long> gem-port <GEM>
            <br/>
            set evc-maps evc-map evc_map_channel-termination0/<PON>_101_<T-Cont>_<GEM>_<onu-id-long> enabled true
            <br/>
            set evc-maps evc-map evc_map_channel-termination0/<PON>_101_<T-Cont>_<GEM>_<onu-id-long> evc evc_101
            <br/>
            set evc-maps evc-map evc_map_channel-termination0/<PON>_101_<T-Cont>_<GEM>_<onu-id-long> match-untagged false
            <br/>
            set evc-maps evc-map evc_map_channel-termination0/<PON>_101_<T-Cont>_<GEM>_<onu-id-long> inherit-pri
            <br/>
            set evc-maps evc-map evc_map_channel-termination0/<PON>_101_<T-Cont>_<GEM>_<onu-id-long> uni "channel-termination 0/<PON>"
            <br/>
            <br />
            set subscriber-profiles subscriber-profile dhcp_lineinsertion evc-map evc_map_channel-termination0/<PON>_101_<T-Cont>_<GEM>_<onu-id-long>
            <br/>
            <br />
            set xpon t-conts t-cont "<onu-id-long>-Data" alloc-id <T-Cont>
            <br/>
            set xpon t-conts t-cont "<onu-id-long>-Data" bandwidth-profile <bandwidth-profile>
            <br/>
            set xpon t-conts t-cont "<onu-id-long>-Data" xgem-ports data-xgem-ports data-xgem <GEM> cos 0
            <br/>
            set xpon t-conts t-cont "<onu-id-long>-Data" xgem-ports data-xgem-ports data-xgem <GEM> cos 1
            <br/>
            set xpon t-conts t-cont "<onu-id-long>-Data" xgem-ports data-xgem-ports data-xgem <GEM> cos 2
            <br/>
            set xpon t-conts t-cont "<onu-id-long>-Data" xgem-ports data-xgem-ports data-xgem <GEM> cos 3
            <br/>
            set xpon t-conts t-cont "<onu-id-long>-Data" xgem-ports data-xgem-ports data-xgem <GEM> cos 4
            <br/>
            set xpon t-conts t-cont "<onu-id-long>-Data" xgem-ports data-xgem-ports data-xgem <GEM> cos 5
            <br/>
            set xpon t-conts t-cont "<onu-id-long>-Data" xgem-ports data-xgem-ports data-xgem <GEM> cos 6
            <br/>
            set xpon t-conts t-cont "<onu-id-long>-Data" xgem-ports data-xgem-ports data-xgem <GEM> cos 7
            <br/>
            set xpon t-conts t-cont "<onu-id-long>-Data" xgem-ports data-xgem-ports data-xgem <GEM> encryption true
            <br/>
            set xpon t-conts t-cont "<onu-id-long>-Data" xgem-ports data-xgem-ports data-xgem <GEM> interface "<onu-id-long> subscriber"
            <br/>
            <br />
            set link-table link-table "<onu-id-long>" to-interface "<onu-id-long> subscriber"
            <br/>
            <br />
            set interfaces interface "channel-termination 0/<PON>" tm-root child-scheduler-nodes "scheduler-channel-pair <PON>" priority 0
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root child-scheduler-nodes "scheduler-channel-pair <PON>" weight 1
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "scheduler-channel-pair <PON>" scheduler-type four-priority-strict-priority
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "scheduler-channel-pair <PON>" child-scheduler-nodes "Data-<onu-id-long>" priority 2
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "scheduler-channel-pair <PON>" child-scheduler-nodes "Data-<onu-id-long>" weight 0
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "scheduler-channel-pair <PON>" scheduling-level 1
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "Data-<onu-id-long>" scheduler-type four-priority-strict-priority
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "Data-<onu-id-long>" tc-id-2-queue-id-mapping-profile-name "Scheduler tctoqueue Mapping"
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "Data-<onu-id-long>" contains-queues true
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "Data-<onu-id-long>" queue 0 priority 0
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "Data-<onu-id-long>" queue 0 weight 1
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "Data-<onu-id-long>" queue 1 priority 1
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "Data-<onu-id-long>" queue 1 weight 1
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "Data-<onu-id-long>" queue 2 priority 2
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "Data-<onu-id-long>" queue 2 weight 1
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "Data-<onu-id-long>" queue 3 priority 3
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "Data-<onu-id-long>" queue 3 weight 1
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "Data-<onu-id-long>" scheduling-level 2
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "Data-<onu-id-long>" shaper-name "<shaper-name>"
            <br/>
            <br />
            set interfaces interface "onu 1101.<PID>.<onu-id>" performance enable true
            <br/>
            set interfaces interface "onu 1101.<PID>.<onu-id>" onu aes-mode-enable true
            <br/>
            set interfaces interface "onu 1101.<PID>.<onu-id>" onu assigned-tconts "<onu-id-long>-Data"
            <br/>
            set interfaces interface "onu 1101.<PID>.<onu-id>" onu channel-partition ChannelPartition_P<PID>
            <br/>
            set interfaces interface "onu 1101.<PID>.<onu-id>" onu expected-serial-number-string ${serialNumber}
            <br/>
            set interfaces interface "onu 1101.<PID>.<onu-id>" onu onu-id <onu-id>
            <br/>
            set interfaces interface "onu 1101.<PID>.<onu-id>" onu preferred-channel-pair "channel-pair 1101.<PID>.15"
            <br/>
            set interfaces interface "onu 1101.<PID>.<onu-id>" enabled true
            <br/>
            set interfaces interface "onu 1101.<PID>.<onu-id>" type adtn-xp:xpon-onu
            <br/>
            set interfaces interface "onu 1101.<PID>.<onu-id>" description "<onu-id-long> - ${fullAddress}"
            <br/>
            <br/>
            set interfaces interface onu-subscr-if-1101.<PID>.<onu-id>.0.eth.1.phy ethernet phy auto-negotiation enable true
            <br/>
            set interfaces interface onu-subscr-if-1101.<PID>.<onu-id>.0.eth.1.phy ethernet phy duplex full
            <br/>
            set interfaces interface onu-subscr-if-1101.<PID>.<onu-id>.0.eth.1.phy ethernet phy speed 1.000
            <br/>
            set interfaces interface onu-subscr-if-1101.<PID>.<onu-id>.0.eth.1.phy performance enable true
            <br/>
            set interfaces interface onu-subscr-if-1101.<PID>.<onu-id>.0.eth.1.phy enabled true
            <br/>
            set interfaces interface onu-subscr-if-1101.<PID>.<onu-id>.0.eth.1.phy type ianaift:ethernetCsmacd
            <br/>
            set interfaces interface onu-subscr-if-1101.<PID>.<onu-id>.0.eth.1.phy description "<onu-id-long> - 621i Port 1"
            <br/>
            <br/>
            set interfaces interface "<onu-id-long>" subif-lower-layer interface onu-subscr-if-1101.<PID>.<onu-id>.0.eth.1.phy
            <br/>
            set interfaces interface "<onu-id-long>" enabled true
            <br/>
            set interfaces interface "<onu-id-long>" type adtn-bbfift:vlan-sub-interface
            <br/>
            set interfaces interface "<onu-id-long> subscriber" olt-v-enet lower-layer-interface "onu 1101.<PID>.<onu-id>"
            <br/>
            set interfaces interface "<onu-id-long> subscriber" enabled true
            <br/>
            set interfaces interface "<onu-id-long> subscriber" type adtn-xp:xpon-olt-v-enet`;


        console.log({ oltName, ponPort, serialNumber });

        return {
            ontConfigTemplate,
            oltName,
            ponPort,
            serialNumber,
        };

    } catch (e) {
        console.error(e);
        throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
}
