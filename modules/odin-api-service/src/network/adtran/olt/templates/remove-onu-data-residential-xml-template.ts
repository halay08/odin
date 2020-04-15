/**
 * This is to delete individual sections from the olt config
 */
export const REMOVE_EVC_MAPS_SECTION = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
      <adtn-evc-map:evc-maps xmlns:adtn-evc-map="http://www.adtran.com/ns/yang/adtran-evc-maps" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <adtn-evc-map:evc-map nc:operation="delete">
          <adtn-evc-map:name>evc_map_channel-termination@_CHANNEL_TERMINATION_LONG_101_@_TCONT_@_GEM_@_ONU_ID_LONG</adtn-evc-map:name>
        </adtn-evc-map:evc-map>
      </adtn-evc-map:evc-maps>
  </nc:config>
`;

export const REMOVE_SUBSCRIBER_PROFILE_SECTION = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
      <adtn-sub-prof:subscriber-profiles xmlns:adtn-sub-prof="http://www.adtran.com/ns/yang/adtran-subscriber-profiles" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <adtn-sub-prof:subscriber-profile>
          <adtn-sub-prof:name>dhcp_lineinsertion</adtn-sub-prof:name>
          <adtn-sub-prof:evc-map nc:operation="delete">evc_map_channel-termination@_CHANNEL_TERMINATION_LONG_101_@_TCONT_@_GEM_@_ONU_ID_LONG</adtn-sub-prof:evc-map>
        </adtn-sub-prof:subscriber-profile>
      </adtn-sub-prof:subscriber-profiles>
  </nc:config>
`;

export const REMOVE_T_CONT_SECTION = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
      <adtn-xp:xpon xmlns:adtn-xp="http://www.adtran.com/ns/yang/adtran-xpon" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <adtn-xp:t-conts>
          <adtn-xp:t-cont nc:operation="delete">
            <adtn-xp:name>@_ONU_ID_LONG-Data</adtn-xp:name>
          </adtn-xp:t-cont>
        </adtn-xp:t-conts>
      </adtn-xp:xpon>
  </nc:config>
`;

export const REMOVE_LINK_TABLE_SECTION = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
      <bbf-lt:link-table xmlns:bbf-lt="urn:bbf:yang:bbf-link-table" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <bbf-lt:link-table nc:operation="delete">
          <bbf-lt:from-interface>@_ONU_ID_LONG</bbf-lt:from-interface>
        </bbf-lt:link-table>
      </bbf-lt:link-table>
  </nc:config>
`;


export const REMOVE_QOS_CHILD_NODES_SECTION = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
    <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <if:interface>
          <if:name>channel-termination @_CHANNEL_INTERFACE_NAME</if:name>
          <adtn-bbf-qos-tm:tm-root xmlns:adtn-bbf-qos-tm="http://www.adtran.com/ns/yang/bbf-qos-traffic-mngt">
            <adtn-bbf-qos-sched:scheduler-node xmlns:adtn-bbf-qos-sched="http://www.adtran.com/ns/yang/adtran-bbf-qos-enhanced-scheduling">
              <adtn-bbf-qos-sched:name>scheduler-channel-pair @_PON_PORT</adtn-bbf-qos-sched:name>
              <adtn-bbf-qos-sched:child-scheduler-nodes nc:operation="delete">
                <adtn-bbf-qos-sched:name>Data-@_ONU_ID_LONG</adtn-bbf-qos-sched:name>
              </adtn-bbf-qos-sched:child-scheduler-nodes>
            </adtn-bbf-qos-sched:scheduler-node>
          </adtn-bbf-qos-tm:tm-root>
        </if:interface>
      </if:interfaces>
  </nc:config>
`;

export const REMOVE_QOS_SCHEDULER_SECTION = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
     <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <if:interface>
          <if:name>channel-termination @_CHANNEL_INTERFACE_NAME</if:name>
          <adtn-bbf-qos-tm:tm-root xmlns:adtn-bbf-qos-tm="http://www.adtran.com/ns/yang/bbf-qos-traffic-mngt">
            <adtn-bbf-qos-sched:scheduler-node xmlns:adtn-bbf-qos-sched="http://www.adtran.com/ns/yang/adtran-bbf-qos-enhanced-scheduling" nc:operation="delete">
              <adtn-bbf-qos-sched:name>Data-@_ONU_ID_LONG</adtn-bbf-qos-sched:name>
            </adtn-bbf-qos-sched:scheduler-node>
          </adtn-bbf-qos-tm:tm-root>
        </if:interface>
      </if:interfaces>
  </nc:config>
`;

export const REMOVE_ONU_ASSIGNED_TCONT = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
     <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <if:interface>
          <if:name>onu 1101.@_CHANNEL_PARTITION.@_ONU_ID</if:name>
          <adtn-xp:onu xmlns:adtn-xp="http://www.adtran.com/ns/yang/adtran-xpon">
            <adtn-xp:assigned-tconts nc:operation="delete">@_ONU_ID_LONG-Data</adtn-xp:assigned-tconts>
          </adtn-xp:onu>
        </if:interface>
      </if:interfaces>
  </nc:config>
`

export const REMOVE_ONU_SUBSCRIBER_SECTION = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
      <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <if:interface nc:operation="delete">
          <if:name>onu-subscr-if-1101.@_CHANNEL_PARTITION.@_ONU_ID.0.eth.1.phy</if:name>
        </if:interface>
      </if:interfaces>
  </nc:config>
`;

export const REMOVE_ONU_LONG_SECTION = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
      <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <if:interface nc:operation="delete">
          <if:name>@_ONU_ID_LONG</if:name>
        </if:interface>
      </if:interfaces>
  </nc:config>
`;


export const REMOVE_ONU_LONG_SUBSCRIBER_SECTION = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
      <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <if:interface nc:operation="delete">
          <if:name>@_ONU_ID_LONG subscriber</if:name>
        </if:interface>
      </if:interfaces>
  </nc:config>
`;


// This template adds the full ONU data
export const REMOVE_ONU_DATA = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
      <adtn-evc-map:evc-maps xmlns:adtn-evc-map="http://www.adtran.com/ns/yang/adtran-evc-maps" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <adtn-evc-map:evc-map nc:operation="delete">
          <adtn-evc-map:name>evc_map_channel-termination@_CHANNEL_TERMINATION_LONG_101_@_TCONT_@_GEM_@_ONU_ID_LONG</adtn-evc-map:name>
        </adtn-evc-map:evc-map>
      </adtn-evc-map:evc-maps>

      <adtn-sub-prof:subscriber-profiles xmlns:adtn-sub-prof="http://www.adtran.com/ns/yang/adtran-subscriber-profiles" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <adtn-sub-prof:subscriber-profile>
          <adtn-sub-prof:name>dhcp_lineinsertion</adtn-sub-prof:name>
          <adtn-sub-prof:evc-map nc:operation="delete">evc_map_channel-termination@_CHANNEL_TERMINATION_LONG_101_@_TCONT_@_GEM_@_ONU_ID_LONG</adtn-sub-prof:evc-map>
        </adtn-sub-prof:subscriber-profile>
      </adtn-sub-prof:subscriber-profiles>

      <adtn-xp:xpon xmlns:adtn-xp="http://www.adtran.com/ns/yang/adtran-xpon" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <adtn-xp:t-conts>
          <adtn-xp:t-cont nc:operation="delete">
            <adtn-xp:name>@_ONU_ID_LONG-Data</adtn-xp:name>
          </adtn-xp:t-cont>
        </adtn-xp:t-conts>
      </adtn-xp:xpon>

      <bbf-lt:link-table xmlns:bbf-lt="urn:bbf:yang:bbf-link-table" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <bbf-lt:link-table nc:operation="delete">
          <bbf-lt:from-interface>@_ONU_ID_LONG</bbf-lt:from-interface>
        </bbf-lt:link-table>
      </bbf-lt:link-table>

      <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <if:interface>
          <if:name>channel-termination @_CHANNEL_TERMINATION_LONG</if:name>
          <adtn-bbf-qos-tm:tm-root xmlns:adtn-bbf-qos-tm="http://www.adtran.com/ns/yang/bbf-qos-traffic-mngt">
            <adtn-bbf-qos-sched:scheduler-node xmlns:adtn-bbf-qos-sched="http://www.adtran.com/ns/yang/adtran-bbf-qos-enhanced-scheduling">
              <adtn-bbf-qos-sched:name>scheduler-channel-pair @_PON_PORT</adtn-bbf-qos-sched:name>
              <adtn-bbf-qos-sched:child-scheduler-nodes nc:operation="delete">
                <adtn-bbf-qos-sched:name>Data-@_ONU_ID_LONG</adtn-bbf-qos-sched:name>
              </adtn-bbf-qos-sched:child-scheduler-nodes>
            </adtn-bbf-qos-sched:scheduler-node>
          </adtn-bbf-qos-tm:tm-root>
        </if:interface>
      </if:interfaces>

      <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <if:interface>
          <if:name>channel-termination @_CHANNEL_TERMINATION_LONG</if:name>
          <adtn-bbf-qos-tm:tm-root xmlns:adtn-bbf-qos-tm="http://www.adtran.com/ns/yang/bbf-qos-traffic-mngt">
            <adtn-bbf-qos-sched:scheduler-node xmlns:adtn-bbf-qos-sched="http://www.adtran.com/ns/yang/adtran-bbf-qos-enhanced-scheduling" nc:operation="delete">
              <adtn-bbf-qos-sched:name>Data-@_ONU_ID_LONG</adtn-bbf-qos-sched:name>
            </adtn-bbf-qos-sched:scheduler-node>
          </adtn-bbf-qos-tm:tm-root>
        </if:interface>
      </if:interfaces>

      <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <if:interface>
          <if:name>onu 1101.@_CHANNEL_PARTITION.@_ONU_ID</if:name>
          <adtn-xp:onu xmlns:adtn-xp="http://www.adtran.com/ns/yang/adtran-xpon">
            <adtn-xp:assigned-tconts nc:operation="delete">@_ONU_ID_LONG-Data</adtn-xp:assigned-tconts>
          </adtn-xp:onu>
        </if:interface>
      </if:interfaces>

      <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <if:interface nc:operation="delete">
          <if:name>onu-subscr-if-1101.@_CHANNEL_PARTITION.@_ONU_ID.0.eth.1.phy</if:name>
        </if:interface>
      </if:interfaces>

      <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <if:interface nc:operation="delete">
          <if:name>@_ONU_ID_LONG</if:name>
        </if:interface>
      </if:interfaces>

      <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <if:interface nc:operation="delete">
          <if:name>@_ONU_ID_LONG subscriber</if:name>
        </if:interface>
      </if:interfaces>
  </nc:config>
`;


