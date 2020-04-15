/**
 * This is to add individual sections from the olt config
 */
export const ADD_EVC_MAPS_SECTION = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
      <adtn-evc-map:evc-maps xmlns:adtn-evc-map="http://www.adtran.com/ns/yang/adtran-evc-maps" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <adtn-evc-map:evc-map nc:operation="create">
          <adtn-evc-map:name>evc_map_channel-termination@_CHANNEL_TERMINATION_LONG_101_@_TCONT_@_GEM_@_ONU_ID_LONG</adtn-evc-map:name>
          <adtn-evc-map-enh-sch:scheduler xmlns:adtn-evc-map-enh-sch="http://www.adtran.com/ns/yang/adtran-evc-map-enhanced-scheduling">
            <adtn-evc-map-enh-sch:root-if-name>channel-termination @_CHANNEL_INTERFACE_NAME</adtn-evc-map-enh-sch:root-if-name>
            <adtn-evc-map-enh-sch:scheduler-node-name>Data-@_ONU_ID_LONG</adtn-evc-map-enh-sch:scheduler-node-name>
          </adtn-evc-map-enh-sch:scheduler>
          <adtn-evc-map-xpon:gem-port xmlns:adtn-evc-map-xpon="http://www.adtran.com/ns/yang/adtran-evc-map-xpon">@_GEM</adtn-evc-map-xpon:gem-port>
          <adtn-evc-map:enabled>true</adtn-evc-map:enabled>
          <adtn-evc-map:evc>evc_101</adtn-evc-map:evc>
          <adtn-evc-map:match-untagged>false</adtn-evc-map:match-untagged>
          <adtn-evc-map:inherit-pri/>
          <adtn-evc-map:uni>channel-termination @_CHANNEL_INTERFACE_NAME</adtn-evc-map:uni>
        </adtn-evc-map:evc-map>
      </adtn-evc-map:evc-maps>
  </nc:config>
`;

export const ADD_SUBSCRIBER_PROFILE_SECTION = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
    <adtn-sub-prof:subscriber-profiles xmlns:adtn-sub-prof="http://www.adtran.com/ns/yang/adtran-subscriber-profiles" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <adtn-sub-prof:subscriber-profile>
          <adtn-sub-prof:name>dhcp_lineinsertion</adtn-sub-prof:name>
          <adtn-sub-prof:evc-map>evc_map_channel-termination@_CHANNEL_TERMINATION_LONG_101_@_TCONT_@_GEM_@_ONU_ID_LONG</adtn-sub-prof:evc-map>
        </adtn-sub-prof:subscriber-profile>
    </adtn-sub-prof:subscriber-profiles>
  </nc:config>
`;

export const ADD_T_CONT_SECTION = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
    <adtn-xp:xpon xmlns:adtn-xp="http://www.adtran.com/ns/yang/adtran-xpon" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <adtn-xp:t-conts>
          <adtn-xp:t-cont nc:operation="create">
            <adtn-xp:name>@_ONU_ID_LONG-Data</adtn-xp:name>
            <adtn-xp:alloc-id>@_TCONT</adtn-xp:alloc-id>
            <adtn-xp:bandwidth-profile>@_BANDWIDTH_PROFILE</adtn-xp:bandwidth-profile>
            <adtn-xp:xgem-ports>
              <adtn-xp:data-xgem-ports>
                <adtn-xp:data-xgem>
                  <adtn-xp:xgem-id>@_GEM</adtn-xp:xgem-id>
                  <adtn-xp:cos>0</adtn-xp:cos>
                  <adtn-xp:cos>1</adtn-xp:cos>
                  <adtn-xp:cos>2</adtn-xp:cos>
                  <adtn-xp:cos>3</adtn-xp:cos>
                  <adtn-xp:cos>4</adtn-xp:cos>
                  <adtn-xp:cos>5</adtn-xp:cos>
                  <adtn-xp:cos>6</adtn-xp:cos>
                  <adtn-xp:cos>7</adtn-xp:cos>
                  <adtn-xp:encryption>true</adtn-xp:encryption>
                  <adtn-xp:interface>@_ONU_ID_LONG subscriber</adtn-xp:interface>
                </adtn-xp:data-xgem>
              </adtn-xp:data-xgem-ports>
            </adtn-xp:xgem-ports>
          </adtn-xp:t-cont>
        </adtn-xp:t-conts>
      </adtn-xp:xpon>
  </nc:config>
`;

export const ADD_LINK_TABLE_SECTION = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
    <bbf-lt:link-table xmlns:bbf-lt="urn:bbf:yang:bbf-link-table" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <bbf-lt:link-table nc:operation="create">
          <bbf-lt:from-interface>@_ONU_ID_LONG</bbf-lt:from-interface>
          <bbf-lt:to-interface>@_ONU_ID_LONG subscriber</bbf-lt:to-interface>
        </bbf-lt:link-table>
      </bbf-lt:link-table>
  </nc:config>
`;


export const ADD_QOS_SCHEDULER_SECTION = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
      <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <if:interface>
          <if:name>channel-termination @_CHANNEL_INTERFACE_NAME</if:name>
          <adtn-bbf-qos-tm:tm-root xmlns:adtn-bbf-qos-tm="http://www.adtran.com/ns/yang/bbf-qos-traffic-mngt">

            <adtn-bbf-qos-sched:child-scheduler-nodes xmlns:adtn-bbf-qos-sched="http://www.adtran.com/ns/yang/adtran-bbf-qos-enhanced-scheduling">
              <adtn-bbf-qos-sched:name>scheduler-channel-pair @_PON_PORT</adtn-bbf-qos-sched:name>
              <adtn-bbf-qos-sched:priority>0</adtn-bbf-qos-sched:priority>
              <adtn-bbf-qos-sched:weight>1</adtn-bbf-qos-sched:weight>
            </adtn-bbf-qos-sched:child-scheduler-nodes>

            <adtn-bbf-qos-sched:scheduler-node xmlns:adtn-bbf-qos-sched="http://www.adtran.com/ns/yang/adtran-bbf-qos-enhanced-scheduling">
              <adtn-bbf-qos-sched:name>scheduler-channel-pair @_PON_PORT</adtn-bbf-qos-sched:name>
              <adtn-bbf-qos-sched-ns:scheduler-type xmlns:adtn-bbf-qos-sched-ns="http://www.adtran.com/ns/yang/adtran-bbf-qos-enhanced-scheduling-ns">adtn-bbf-qos-sched-ns:four-priority-strict-priority</adtn-bbf-qos-sched-ns:scheduler-type>
              <adtn-bbf-qos-sched:child-scheduler-nodes nc:operation="create">
                <adtn-bbf-qos-sched:name>Data-@_ONU_ID_LONG</adtn-bbf-qos-sched:name>
                <adtn-bbf-qos-sched:priority>2</adtn-bbf-qos-sched:priority>
                <adtn-bbf-qos-sched:weight>0</adtn-bbf-qos-sched:weight>
              </adtn-bbf-qos-sched:child-scheduler-nodes>
              <adtn-bbf-qos-sched:scheduling-level>1</adtn-bbf-qos-sched:scheduling-level>
            </adtn-bbf-qos-sched:scheduler-node>

            <adtn-bbf-qos-sched:scheduler-node xmlns:adtn-bbf-qos-sched="http://www.adtran.com/ns/yang/adtran-bbf-qos-enhanced-scheduling" nc:operation="create">
              <adtn-bbf-qos-sched:name>Data-@_ONU_ID_LONG</adtn-bbf-qos-sched:name>
              <adtn-bbf-qos-sched-ns:scheduler-type xmlns:adtn-bbf-qos-sched-ns="http://www.adtran.com/ns/yang/adtran-bbf-qos-enhanced-scheduling-ns">adtn-bbf-qos-sched-ns:four-priority-strict-priority</adtn-bbf-qos-sched-ns:scheduler-type>
              <adtn-bbf-qos-sched-ns:tc-id-2-queue-id-mapping-profile-name xmlns:adtn-bbf-qos-sched-ns="http://www.adtran.com/ns/yang/adtran-bbf-qos-enhanced-scheduling-ns">Scheduler tctoqueue Mapping</adtn-bbf-qos-sched-ns:tc-id-2-queue-id-mapping-profile-name>
              <adtn-bbf-qos-sched:contains-queues>true</adtn-bbf-qos-sched:contains-queues>
              <adtn-bbf-qos-sched:queue>
                <adtn-bbf-qos-sched:local-queue-id>0</adtn-bbf-qos-sched:local-queue-id>
                <adtn-bbf-qos-sched:priority>0</adtn-bbf-qos-sched:priority>
                <adtn-bbf-qos-sched:weight>1</adtn-bbf-qos-sched:weight>
              </adtn-bbf-qos-sched:queue>
              <adtn-bbf-qos-sched:queue>
                <adtn-bbf-qos-sched:local-queue-id>1</adtn-bbf-qos-sched:local-queue-id>
                <adtn-bbf-qos-sched:priority>1</adtn-bbf-qos-sched:priority>
                <adtn-bbf-qos-sched:weight>1</adtn-bbf-qos-sched:weight>
              </adtn-bbf-qos-sched:queue>
              <adtn-bbf-qos-sched:queue>
                <adtn-bbf-qos-sched:local-queue-id>2</adtn-bbf-qos-sched:local-queue-id>
                <adtn-bbf-qos-sched:priority>2</adtn-bbf-qos-sched:priority>
                <adtn-bbf-qos-sched:weight>1</adtn-bbf-qos-sched:weight>
              </adtn-bbf-qos-sched:queue>
              <adtn-bbf-qos-sched:queue>
                <adtn-bbf-qos-sched:local-queue-id>3</adtn-bbf-qos-sched:local-queue-id>
                <adtn-bbf-qos-sched:priority>3</adtn-bbf-qos-sched:priority>
                <adtn-bbf-qos-sched:weight>1</adtn-bbf-qos-sched:weight>
              </adtn-bbf-qos-sched:queue>
              <adtn-bbf-qos-sched:scheduling-level>2</adtn-bbf-qos-sched:scheduling-level>
              <adtn-bbf-qos-sched:shaper-name>Shaper @_SHAPER_NAME</adtn-bbf-qos-sched:shaper-name>
            </adtn-bbf-qos-sched:scheduler-node>
          </adtn-bbf-qos-tm:tm-root>
        </if:interface>

<!--        <if:interface>-->
<!--          <if:name>onu 1101.@_CHANNEL_PARTITION.@_ONU_ID</if:name>-->
<!--          <adtn-xp:onu xmlns:adtn-xp="http://www.adtran.com/ns/yang/adtran-xpon">-->
<!--            <adtn-xp:assigned-tconts>@_ONU_ID_LONG-Data</adtn-xp:assigned-tconts>-->
<!--          </adtn-xp:onu>-->
<!--        </if:interface>-->

<!--        <if:interface nc:operation="create">-->
<!--          <if:name>onu-subscr-if-1101.@_CHANNEL_PARTITION.@_ONU_ID.0.eth.1.phy</if:name>-->
<!--          <adtn-eth:ethernet xmlns:adtn-eth="http://www.adtran.com/ns/yang/adtran-ethernet">-->
<!--            <adtn-eth:phy>-->
<!--              <adtn-eth:auto-negotiation>-->
<!--                <adtn-eth:enable>true</adtn-eth:enable>-->
<!--              </adtn-eth:auto-negotiation>-->
<!--              <adtn-eth:duplex>full</adtn-eth:duplex>-->
<!--              <adtn-eth:speed>1.000</adtn-eth:speed>-->
<!--            </adtn-eth:phy>-->
<!--          </adtn-eth:ethernet>-->
<!--          <adtn-if-pm:performance xmlns:adtn-if-pm="http://www.adtran.com/ns/yang/adtran-interface-performance-management">-->
<!--            <adtn-if-pm:enable>true</adtn-if-pm:enable>-->
<!--          </adtn-if-pm:performance>-->
<!--          <if:enabled>true</if:enabled>-->
<!--          <if:type xmlns:ianaift="urn:ietf:params:xml:ns:yang:iana-if-type">ianaift:ethernetCsmacd</if:type>-->
<!--          <if:description>@_ONU_ID_LONG - 621i Port 1</if:description>-->
<!--        </if:interface>-->

<!--        <if:interface nc:operation="create">-->
<!--          <if:name>@_ONU_ID_LONG</if:name>-->
<!--          <adtn-bbf-subif:subif-lower-layer xmlns:adtn-bbf-subif="http://www.adtran.com/ns/yang/bbf-sub-interfaces">-->
<!--            <adtn-bbf-subif:interface>onu-subscr-if-1101.@_CHANNEL_PARTITION.@_ONU_ID.0.eth.1.phy</adtn-bbf-subif:interface>-->
<!--          </adtn-bbf-subif:subif-lower-layer>-->
<!--          <if:enabled>true</if:enabled>-->
<!--          <if:type xmlns:adtn-bbfift="http://www.adtran.com/ns/yang/bbf-if-type">adtn-bbfift:vlan-sub-interface</if:type>-->
<!--        </if:interface>-->

<!--        <if:interface nc:operation="create">-->
<!--          <if:name>@_ONU_ID_LONG subscriber</if:name>-->
<!--          <adtn-xp:olt-v-enet xmlns:adtn-xp="http://www.adtran.com/ns/yang/adtran-xpon">-->
<!--            <adtn-xp:lower-layer-interface>onu 1101.@_CHANNEL_PARTITION.@_ONU_ID</adtn-xp:lower-layer-interface>-->
<!--          </adtn-xp:olt-v-enet>-->
<!--          <if:enabled>true</if:enabled>-->
<!--          <if:type xmlns:adtn-xp="http://www.adtran.com/ns/yang/adtran-xpon">adtn-xp:xpon-olt-v-enet</if:type>-->
<!--        </if:interface>-->

      </if:interfaces>
  </nc:config>
`;

export const ADD_ONU_ASSIGNED_TCONT = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
      <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
         <if:interface>
          <if:name>onu 1101.@_CHANNEL_PARTITION.@_ONU_ID</if:name>
          <adtn-xp:onu xmlns:adtn-xp="http://www.adtran.com/ns/yang/adtran-xpon">
            <adtn-xp:assigned-tconts>@_ONU_ID_LONG-Data</adtn-xp:assigned-tconts>
          </adtn-xp:onu>
        </if:interface>
      </if:interfaces>
  </nc:config>
`


export const ADD_ONU_SUBSCRIBER_SECTION = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
      <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
         <if:interface nc:operation="create">
          <if:name>onu-subscr-if-1101.@_CHANNEL_PARTITION.@_ONU_ID.0.eth.1.phy</if:name>
          <adtn-eth:ethernet xmlns:adtn-eth="http://www.adtran.com/ns/yang/adtran-ethernet">
            <adtn-eth:phy>
              <adtn-eth:auto-negotiation>
                <adtn-eth:enable>true</adtn-eth:enable>
              </adtn-eth:auto-negotiation>
              <adtn-eth:duplex>full</adtn-eth:duplex>
              <adtn-eth:speed>1.000</adtn-eth:speed>
            </adtn-eth:phy>
          </adtn-eth:ethernet>
          <adtn-if-pm:performance xmlns:adtn-if-pm="http://www.adtran.com/ns/yang/adtran-interface-performance-management">
            <adtn-if-pm:enable>true</adtn-if-pm:enable>
          </adtn-if-pm:performance>
          <if:enabled>true</if:enabled>
          <if:type xmlns:ianaift="urn:ietf:params:xml:ns:yang:iana-if-type">ianaift:ethernetCsmacd</if:type>
          <if:description>@_ONU_ID_LONG - 621i Port 1</if:description>
        </if:interface>
      </if:interfaces>
  </nc:config>
`;

export const ADD_ONU_LONG_SECTION = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
      <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
         <if:interface nc:operation="create">
          <if:name>@_ONU_ID_LONG</if:name>
          <adtn-bbf-subif:subif-lower-layer xmlns:adtn-bbf-subif="http://www.adtran.com/ns/yang/bbf-sub-interfaces">
            <adtn-bbf-subif:interface>onu-subscr-if-1101.@_CHANNEL_PARTITION.@_ONU_ID.0.eth.1.phy</adtn-bbf-subif:interface>
          </adtn-bbf-subif:subif-lower-layer>
          <if:enabled>true</if:enabled>
          <if:type xmlns:adtn-bbfift="http://www.adtran.com/ns/yang/bbf-if-type">adtn-bbfift:vlan-sub-interface</if:type>
        </if:interface>
      </if:interfaces>
  </nc:config>
`;


export const ADD_ONU_LONG_SUBSCRIBER_SECTION = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
      <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <if:interface nc:operation="create">
          <if:name>@_ONU_ID_LONG subscriber</if:name>
          <adtn-xp:olt-v-enet xmlns:adtn-xp="http://www.adtran.com/ns/yang/adtran-xpon">
            <adtn-xp:lower-layer-interface>onu 1101.@_CHANNEL_PARTITION.@_ONU_ID</adtn-xp:lower-layer-interface>
          </adtn-xp:olt-v-enet>
          <if:enabled>true</if:enabled>
          <if:type xmlns:adtn-xp="http://www.adtran.com/ns/yang/adtran-xpon">adtn-xp:xpon-olt-v-enet</if:type>
        </if:interface>
      </if:interfaces>
  </nc:config>
`;


// This template adds the full ONU data
export const ADD_ONU_DATA = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
      <adtn-evc-map:evc-maps xmlns:adtn-evc-map="http://www.adtran.com/ns/yang/adtran-evc-maps" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <adtn-evc-map:evc-map nc:operation="create">
          <adtn-evc-map:name>evc_map_channel-termination@_CHANNEL_TERMINATION_LONG_101_@_TCONT_@_GEM_@_ONU_ID_LONG</adtn-evc-map:name>
          <adtn-evc-map-enh-sch:scheduler xmlns:adtn-evc-map-enh-sch="http://www.adtran.com/ns/yang/adtran-evc-map-enhanced-scheduling">
            <adtn-evc-map-enh-sch:root-if-name>channel-termination @_CHANNEL_TERMINATION_LONG</adtn-evc-map-enh-sch:root-if-name>
            <adtn-evc-map-enh-sch:scheduler-node-name>Data-@_ONU_ID_LONG</adtn-evc-map-enh-sch:scheduler-node-name>
          </adtn-evc-map-enh-sch:scheduler>
          <adtn-evc-map-xpon:gem-port xmlns:adtn-evc-map-xpon="http://www.adtran.com/ns/yang/adtran-evc-map-xpon">@_GEM</adtn-evc-map-xpon:gem-port>
          <adtn-evc-map:enabled>true</adtn-evc-map:enabled>
          <adtn-evc-map:evc>evc_101</adtn-evc-map:evc>
          <adtn-evc-map:match-untagged>false</adtn-evc-map:match-untagged>
          <adtn-evc-map:inherit-pri/>
          <adtn-evc-map:uni>channel-termination @_CHANNEL_TERMINATION_LONG</adtn-evc-map:uni>
        </adtn-evc-map:evc-map>
      </adtn-evc-map:evc-maps>

      <adtn-sub-prof:subscriber-profiles xmlns:adtn-sub-prof="http://www.adtran.com/ns/yang/adtran-subscriber-profiles" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <adtn-sub-prof:subscriber-profile>
          <adtn-sub-prof:name>dhcp_lineinsertion</adtn-sub-prof:name>
          <adtn-sub-prof:evc-map>evc_map_channel-termination@_CHANNEL_TERMINATION_LONG_101_@_TCONT_@_GEM_@_ONU_ID_LONG</adtn-sub-prof:evc-map>
        </adtn-sub-prof:subscriber-profile>
      </adtn-sub-prof:subscriber-profiles>

      <adtn-xp:xpon xmlns:adtn-xp="http://www.adtran.com/ns/yang/adtran-xpon" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <adtn-xp:t-conts>
          <adtn-xp:t-cont nc:operation="create">
            <adtn-xp:name>@_ONU_ID_LONG-Data</adtn-xp:name>
            <adtn-xp:alloc-id>@_TCONT</adtn-xp:alloc-id>
            <adtn-xp:bandwidth-profile>@_BANDWIDTH_PROFILE</adtn-xp:bandwidth-profile>
            <adtn-xp:xgem-ports>
              <adtn-xp:data-xgem-ports>
                <adtn-xp:data-xgem>
                  <adtn-xp:xgem-id>@_GEM</adtn-xp:xgem-id>
                  <adtn-xp:cos>0</adtn-xp:cos>
                  <adtn-xp:cos>1</adtn-xp:cos>
                  <adtn-xp:cos>2</adtn-xp:cos>
                  <adtn-xp:cos>3</adtn-xp:cos>
                  <adtn-xp:cos>4</adtn-xp:cos>
                  <adtn-xp:cos>5</adtn-xp:cos>
                  <adtn-xp:cos>6</adtn-xp:cos>
                  <adtn-xp:cos>7</adtn-xp:cos>
                  <adtn-xp:encryption>true</adtn-xp:encryption>
                  <adtn-xp:interface>@_ONU_ID_LONG subscriber</adtn-xp:interface>
                </adtn-xp:data-xgem>
              </adtn-xp:data-xgem-ports>
            </adtn-xp:xgem-ports>
          </adtn-xp:t-cont>
        </adtn-xp:t-conts>
      </adtn-xp:xpon>

      <bbf-lt:link-table xmlns:bbf-lt="urn:bbf:yang:bbf-link-table" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <bbf-lt:link-table nc:operation="create">
          <bbf-lt:from-interface>@_ONU_ID_LONG</bbf-lt:from-interface>
          <bbf-lt:to-interface>@_ONU_ID_LONG subscriber</bbf-lt:to-interface>
        </bbf-lt:link-table>
      </bbf-lt:link-table>

      <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <if:interface>
          <if:name>channel-termination @_CHANNEL_TERMINATION_LONG</if:name>
          <adtn-bbf-qos-tm:tm-root xmlns:adtn-bbf-qos-tm="http://www.adtran.com/ns/yang/bbf-qos-traffic-mngt">

            <adtn-bbf-qos-sched:child-scheduler-nodes xmlns:adtn-bbf-qos-sched="http://www.adtran.com/ns/yang/adtran-bbf-qos-enhanced-scheduling">
              <adtn-bbf-qos-sched:name>scheduler-channel-pair @_PON_PORT</adtn-bbf-qos-sched:name>
              <adtn-bbf-qos-sched:priority>0</adtn-bbf-qos-sched:priority>
              <adtn-bbf-qos-sched:weight>1</adtn-bbf-qos-sched:weight>
            </adtn-bbf-qos-sched:child-scheduler-nodes>

            <adtn-bbf-qos-sched:scheduler-node xmlns:adtn-bbf-qos-sched="http://www.adtran.com/ns/yang/adtran-bbf-qos-enhanced-scheduling">
              <adtn-bbf-qos-sched:name>scheduler-channel-pair @_PON_PORT</adtn-bbf-qos-sched:name>
              <adtn-bbf-qos-sched-ns:scheduler-type xmlns:adtn-bbf-qos-sched-ns="http://www.adtran.com/ns/yang/adtran-bbf-qos-enhanced-scheduling-ns">adtn-bbf-qos-sched-ns:four-priority-strict-priority</adtn-bbf-qos-sched-ns:scheduler-type>
              <adtn-bbf-qos-sched:child-scheduler-nodes nc:operation="create">
                <adtn-bbf-qos-sched:name>Data-@_ONU_ID_LONG</adtn-bbf-qos-sched:name>
                <adtn-bbf-qos-sched:priority>2</adtn-bbf-qos-sched:priority>
                <adtn-bbf-qos-sched:weight>0</adtn-bbf-qos-sched:weight>
              </adtn-bbf-qos-sched:child-scheduler-nodes>
              <adtn-bbf-qos-sched:scheduling-level>1</adtn-bbf-qos-sched:scheduling-level>
            </adtn-bbf-qos-sched:scheduler-node>

            <adtn-bbf-qos-sched:scheduler-node xmlns:adtn-bbf-qos-sched="http://www.adtran.com/ns/yang/adtran-bbf-qos-enhanced-scheduling" nc:operation="create">
              <adtn-bbf-qos-sched:name>Data-@_ONU_ID_LONG</adtn-bbf-qos-sched:name>
              <adtn-bbf-qos-sched-ns:scheduler-type xmlns:adtn-bbf-qos-sched-ns="http://www.adtran.com/ns/yang/adtran-bbf-qos-enhanced-scheduling-ns">adtn-bbf-qos-sched-ns:four-priority-strict-priority</adtn-bbf-qos-sched-ns:scheduler-type>
              <adtn-bbf-qos-sched-ns:tc-id-2-queue-id-mapping-profile-name xmlns:adtn-bbf-qos-sched-ns="http://www.adtran.com/ns/yang/adtran-bbf-qos-enhanced-scheduling-ns">Scheduler tctoqueue Mapping</adtn-bbf-qos-sched-ns:tc-id-2-queue-id-mapping-profile-name>
              <adtn-bbf-qos-sched:contains-queues>true</adtn-bbf-qos-sched:contains-queues>
              <adtn-bbf-qos-sched:queue>
                <adtn-bbf-qos-sched:local-queue-id>0</adtn-bbf-qos-sched:local-queue-id>
                <adtn-bbf-qos-sched:priority>0</adtn-bbf-qos-sched:priority>
                <adtn-bbf-qos-sched:weight>1</adtn-bbf-qos-sched:weight>
              </adtn-bbf-qos-sched:queue>
              <adtn-bbf-qos-sched:queue>
                <adtn-bbf-qos-sched:local-queue-id>1</adtn-bbf-qos-sched:local-queue-id>
                <adtn-bbf-qos-sched:priority>1</adtn-bbf-qos-sched:priority>
                <adtn-bbf-qos-sched:weight>1</adtn-bbf-qos-sched:weight>
              </adtn-bbf-qos-sched:queue>
              <adtn-bbf-qos-sched:queue>
                <adtn-bbf-qos-sched:local-queue-id>2</adtn-bbf-qos-sched:local-queue-id>
                <adtn-bbf-qos-sched:priority>2</adtn-bbf-qos-sched:priority>
                <adtn-bbf-qos-sched:weight>1</adtn-bbf-qos-sched:weight>
              </adtn-bbf-qos-sched:queue>
              <adtn-bbf-qos-sched:queue>
                <adtn-bbf-qos-sched:local-queue-id>3</adtn-bbf-qos-sched:local-queue-id>
                <adtn-bbf-qos-sched:priority>3</adtn-bbf-qos-sched:priority>
                <adtn-bbf-qos-sched:weight>1</adtn-bbf-qos-sched:weight>
              </adtn-bbf-qos-sched:queue>
              <adtn-bbf-qos-sched:scheduling-level>2</adtn-bbf-qos-sched:scheduling-level>
              <adtn-bbf-qos-sched:shaper-name>Shaper @_SHAPER_NAME</adtn-bbf-qos-sched:shaper-name>
            </adtn-bbf-qos-sched:scheduler-node>
          </adtn-bbf-qos-tm:tm-root>
        </if:interface>

        <if:interface>
          <if:name>onu 1101.@_CHANNEL_PARTITION.@_ONU_ID</if:name>
          <adtn-xp:onu xmlns:adtn-xp="http://www.adtran.com/ns/yang/adtran-xpon">
            <adtn-xp:assigned-tconts>@_ONU_ID_LONG-Data</adtn-xp:assigned-tconts>
          </adtn-xp:onu>
        </if:interface>

        <if:interface nc:operation="create">
          <if:name>onu-subscr-if-1101.@_CHANNEL_PARTITION.@_ONU_ID.0.eth.1.phy</if:name>
          <adtn-eth:ethernet xmlns:adtn-eth="http://www.adtran.com/ns/yang/adtran-ethernet">
            <adtn-eth:phy>
              <adtn-eth:auto-negotiation>
                <adtn-eth:enable>true</adtn-eth:enable>
              </adtn-eth:auto-negotiation>
              <adtn-eth:duplex>full</adtn-eth:duplex>
              <adtn-eth:speed>1.000</adtn-eth:speed>
            </adtn-eth:phy>
          </adtn-eth:ethernet>
          <adtn-if-pm:performance xmlns:adtn-if-pm="http://www.adtran.com/ns/yang/adtran-interface-performance-management">
            <adtn-if-pm:enable>true</adtn-if-pm:enable>
          </adtn-if-pm:performance>
          <if:enabled>true</if:enabled>
          <if:type xmlns:ianaift="urn:ietf:params:xml:ns:yang:iana-if-type">ianaift:ethernetCsmacd</if:type>
          <if:description>@_ONU_ID_LONG - 621i Port 1</if:description>
        </if:interface>

        <if:interface nc:operation="create">
          <if:name>@_ONU_ID_LONG</if:name>
          <adtn-bbf-subif:subif-lower-layer xmlns:adtn-bbf-subif="http://www.adtran.com/ns/yang/bbf-sub-interfaces">
            <adtn-bbf-subif:interface>onu-subscr-if-1101.@_CHANNEL_PARTITION.@_ONU_ID.0.eth.1.phy</adtn-bbf-subif:interface>
          </adtn-bbf-subif:subif-lower-layer>
          <if:enabled>true</if:enabled>
          <if:type xmlns:adtn-bbfift="http://www.adtran.com/ns/yang/bbf-if-type">adtn-bbfift:vlan-sub-interface</if:type>
        </if:interface>

        <if:interface nc:operation="create">
          <if:name>@_ONU_ID_LONG subscriber</if:name>
          <adtn-xp:olt-v-enet xmlns:adtn-xp="http://www.adtran.com/ns/yang/adtran-xpon">
            <adtn-xp:lower-layer-interface>onu 1101.@_CHANNEL_PARTITION.@_ONU_ID</adtn-xp:lower-layer-interface>
          </adtn-xp:olt-v-enet>
          <if:enabled>true</if:enabled>
          <if:type xmlns:adtn-xp="http://www.adtran.com/ns/yang/adtran-xpon">adtn-xp:xpon-olt-v-enet</if:type>
        </if:interface>

      </if:interfaces>
  </nc:config>
`;

