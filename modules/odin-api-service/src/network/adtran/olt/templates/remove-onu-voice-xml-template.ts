// onu-subscr-if-1101.1.1.0.fxs.1.phy
// onu-subscr-if-1101.@_CHANNEL_PARTITION.@_ONU_ID.0.fxs.1.phy
export const REMOVE_VOICE_ONU_SUBSCRIBER_SECTION = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
    <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
   <if:interface nc:operation="delete">
      <if:name>onu-subscr-if-1101.@_CHANNEL_PARTITION.@_ONU_ID.0.fxs.1.phy</if:name>
    </if:interface>
    <if:interface nc:operation="delete">
      <if:name>onu-subscr-if-1101.@_CHANNEL_PARTITION.@_ONU_ID.0.ip.1</if:name>
    </if:interface>
    </if:interfaces>
  </nc:config>
`;

export const REMOVE_VOICE_EVC_MAPS_SECTION = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
   <adtn-evc-map:evc-maps xmlns:adtn-evc-map="http://www.adtran.com/ns/yang/adtran-evc-maps" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
      <adtn-evc-map:evc-map nc:operation="delete">
        <adtn-evc-map:name>evc_map_channel-termination@_CHANNEL_TERMINATION_LONG_201_@_TCONT_@_GEM_@_ONU_ID_LONG</adtn-evc-map:name>
      </adtn-evc-map:evc-map>
   </adtn-evc-map:evc-maps>
  </nc:config>
`;

// evc_map_channel-termination0/1_201_1281_2561_onu-0/1-1
// evc_map_channel-termination@_CHANNEL_TERMINATION_LONG_201_@_TCONT_@_GEM_@_ONU_ID_LONG
export const REMOVE_VOICE_SUBSCRIBER_PROFILE_SECTION = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
   <adtn-sub-prof:subscriber-profiles xmlns:adtn-sub-prof="http://www.adtran.com/ns/yang/adtran-subscriber-profiles" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
      <adtn-sub-prof:subscriber-profile>
        <adtn-sub-prof:name>dhcp_lineinsertion</adtn-sub-prof:name>
        <adtn-sub-prof:evc-map nc:operation="delete">evc_map_channel-termination@_CHANNEL_TERMINATION_LONG_201_@_TCONT_@_GEM_@_ONU_ID_LONG</adtn-sub-prof:evc-map>
      </adtn-sub-prof:subscriber-profile>
   </adtn-sub-prof:subscriber-profiles>
  </nc:config>
`;

// onu-0/1-1-Voice
// @_ONU_ID_LONG-Voice
export const REMOVE_VOICE_T_CONT_SECTION = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
    <adtn-xp:xpon xmlns:adtn-xp="http://www.adtran.com/ns/yang/adtran-xpon" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
      <adtn-xp:t-conts>
        <adtn-xp:t-cont nc:operation="delete">
          <adtn-xp:name>@_ONU_ID_LONG-Voice</adtn-xp:name>
        </adtn-xp:t-cont>
      </adtn-xp:t-conts>
    </adtn-xp:xpon>
  </nc:config>
`;


// onu 1101.1.1
// onu 1101.@_CHANNEL_PARTITION.@_ONU_ID

// onu-0/1-1-Voice
export const REMOVE_VOICE_ASSIGNED_T_CONT_SECTION = `
<nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
  <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
    <if:interface>
      <if:name>onu 1101.@_CHANNEL_PARTITION.@_ONU_ID</if:name>
      <adtn-xp:onu xmlns:adtn-xp="http://www.adtran.com/ns/yang/adtran-xpon">
        <adtn-xp:assigned-tconts nc:operation="delete">@_ONU_ID_LONG-Voice</adtn-xp:assigned-tconts>
      </adtn-xp:onu>
    </if:interface>
  </if:interfaces>
</nc:config>
`


// channel-termination 0/1
// channel-termination @_CHANNEL_TERMINATION_LONG

// scheduler-channel-pair 1
// scheduler-channel-pair @_PON_PORT

// Voice-onu-0/1-1
// Voice-@_ONU_ID_LONG
export const REMOVE_VOICE_QOS_CHILD_NODES_SECTION = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
    <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
     <if:interface>
        <if:name>channel-termination @_CHANNEL_TERMINATION_LONG</if:name>
          <adtn-bbf-qos-tm:tm-root xmlns:adtn-bbf-qos-tm="http://www.adtran.com/ns/yang/bbf-qos-traffic-mngt">
            <adtn-bbf-qos-sched:scheduler-node xmlns:adtn-bbf-qos-sched="http://www.adtran.com/ns/yang/adtran-bbf-qos-enhanced-scheduling">
              <adtn-bbf-qos-sched:name>scheduler-channel-pair @_PON_PORT</adtn-bbf-qos-sched:name>
              <adtn-bbf-qos-sched:child-scheduler-nodes nc:operation="delete">
                <adtn-bbf-qos-sched:name>Voice-@_ONU_ID_LONG</adtn-bbf-qos-sched:name>
              </adtn-bbf-qos-sched:child-scheduler-nodes>
            </adtn-bbf-qos-sched:scheduler-node>
          </adtn-bbf-qos-tm:tm-root>
        </if:interface>
    </if:interfaces>
  </nc:config>
`;

// channel-termination 0/1
// channel-termination @_CHANNEL_TERMINATION_LONG

// Voice-onu-0/1-1
// Voice-@_ONU_ID_LONG
export const REMOVE_VOICE_QOS_SCHEDULER_SECTION = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
    <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
     <if:interface>
        <if:name>channel-termination @_CHANNEL_TERMINATION_LONG</if:name>
          <adtn-bbf-qos-tm:tm-root xmlns:adtn-bbf-qos-tm="http://www.adtran.com/ns/yang/bbf-qos-traffic-mngt">
            <adtn-bbf-qos-sched:scheduler-node xmlns:adtn-bbf-qos-sched="http://www.adtran.com/ns/yang/adtran-bbf-qos-enhanced-scheduling" nc:operation="delete">
              <adtn-bbf-qos-sched:name>Voice-@_ONU_ID_LONG</adtn-bbf-qos-sched:name>
            </adtn-bbf-qos-sched:scheduler-node>
          </adtn-bbf-qos-tm:tm-root>
        </if:interface>
    </if:interfaces>
  </nc:config>
`;

// onu 1101.1.1
// onu 1101.@_CHANNEL_PARTITION.@_ONU_ID
export const REMOVE_VOICE_ONU_SECTION = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
     <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
       <if:interface>
        <if:name>onu 1101.@_CHANNEL_PARTITION.@_ONU_ID</if:name>
        <adtn-xp:onu xmlns:adtn-xp="http://www.adtran.com/ns/yang/adtran-xpon">
          <adtn-xp:voice nc:operation="delete"/>
        </adtn-xp:onu>
      </if:interface>
    </if:interfaces>
  </nc:config>
`;


/**
 * This is to delete all sections from the olt config
 */
export const REMOVE_VOICE_TEMPLATE = `
<nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
 <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
    <if:interface nc:operation="delete">
      <if:name>onu-subscr-if-1101.@_CHANNEL_PARTITION.@_ONU_ID.0.fxs.1.phy</if:name>
    </if:interface>
  </if:interfaces>

  <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
    <if:interface nc:operation="delete">
      <if:name>onu-subscr-if-1101.@_CHANNEL_PARTITION.@_ONU_ID.0.ip.1</if:name>
    </if:interface>
  </if:interfaces>

  <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
    <if:interface>
      <if:name>onu 1101.@_CHANNEL_PARTITION.@_ONU_ID</if:name>
      <adtn-xp:onu xmlns:adtn-xp="http://www.adtran.com/ns/yang/adtran-xpon">
        <adtn-xp:assigned-tconts nc:operation="delete">@_ONU_ID_LONG-Voice</adtn-xp:assigned-tconts>
      </adtn-xp:onu>
    </if:interface>
  </if:interfaces>

  <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
    <if:interface>
      <if:name>onu 1101.@_CHANNEL_PARTITION.@_ONU_ID</if:name>
      <adtn-xp:onu xmlns:adtn-xp="http://www.adtran.com/ns/yang/adtran-xpon">
        <adtn-xp:voice nc:operation="delete"/>
      </adtn-xp:onu>
    </if:interface>
  </if:interfaces>

  <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
    <if:interface>
      <if:name>channel-termination @_CHANNEL_TERMINATION_LONG</if:name>
      <adtn-bbf-qos-tm:tm-root xmlns:adtn-bbf-qos-tm="http://www.adtran.com/ns/yang/bbf-qos-traffic-mngt">
        <adtn-bbf-qos-sched:scheduler-node xmlns:adtn-bbf-qos-sched="http://www.adtran.com/ns/yang/adtran-bbf-qos-enhanced-scheduling" nc:operation="delete">
          <adtn-bbf-qos-sched:name>Voice-@_ONU_ID_LONG</adtn-bbf-qos-sched:name>
        </adtn-bbf-qos-sched:scheduler-node>
      </adtn-bbf-qos-tm:tm-root>
    </if:interface>
  </if:interfaces>

  <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
    <if:interface>
      <if:name>channel-termination @_CHANNEL_TERMINATION_LONG</if:name>
      <adtn-bbf-qos-tm:tm-root xmlns:adtn-bbf-qos-tm="http://www.adtran.com/ns/yang/bbf-qos-traffic-mngt">
        <adtn-bbf-qos-sched:scheduler-node xmlns:adtn-bbf-qos-sched="http://www.adtran.com/ns/yang/adtran-bbf-qos-enhanced-scheduling">
          <adtn-bbf-qos-sched:name>scheduler-channel-pair @_PON_PORT</adtn-bbf-qos-sched:name>
          <adtn-bbf-qos-sched:child-scheduler-nodes nc:operation="delete">
            <adtn-bbf-qos-sched:name>Voice-@_ONU_ID_LONG</adtn-bbf-qos-sched:name>
          </adtn-bbf-qos-sched:child-scheduler-nodes>
        </adtn-bbf-qos-sched:scheduler-node>
      </adtn-bbf-qos-tm:tm-root>
    </if:interface>
  </if:interfaces>

  <adtn-xp:xpon xmlns:adtn-xp="http://www.adtran.com/ns/yang/adtran-xpon" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
    <adtn-xp:t-conts>
      <adtn-xp:t-cont nc:operation="delete">
        <adtn-xp:name>@_ONU_ID_LONG-Voice</adtn-xp:name>
      </adtn-xp:t-cont>
    </adtn-xp:t-conts>
  </adtn-xp:xpon>

  <adtn-sub-prof:subscriber-profiles xmlns:adtn-sub-prof="http://www.adtran.com/ns/yang/adtran-subscriber-profiles" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
    <adtn-sub-prof:subscriber-profile>
      <adtn-sub-prof:name>dhcp_lineinsertion</adtn-sub-prof:name>
      <adtn-sub-prof:evc-map nc:operation="delete">evc_map_channel-termination0/1_201_@_TCONT_@_GEM_@_ONU_ID_LONG</adtn-sub-prof:evc-map>
    </adtn-sub-prof:subscriber-profile>
  </adtn-sub-prof:subscriber-profiles>

  <adtn-evc-map:evc-maps xmlns:adtn-evc-map="http://www.adtran.com/ns/yang/adtran-evc-maps" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
    <adtn-evc-map:evc-map nc:operation="delete">
      <adtn-evc-map:name>evc_map_channel-termination0/1_201_@_TCONT_@_GEM_@_ONU_ID_LONG</adtn-evc-map:name>
    </adtn-evc-map:evc-map>
  </adtn-evc-map:evc-maps>

</nc:config>
`
