export const ADD_VOICE_EVC_MAPS_SECTION = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
    <adtn-evc-map:evc-maps xmlns:adtn-evc-map="http://www.adtran.com/ns/yang/adtran-evc-maps" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
     <adtn-evc-map:evc-map nc:operation="create">
        <adtn-evc-map:name>evc_map_channel-termination@_CHANNEL_TERMINATION_LONG_201_@_TCONT_@_GEM_@_ONU_ID_LONG</adtn-evc-map:name>
         <adtn-evc-map-enh-sch:scheduler xmlns:adtn-evc-map-enh-sch="http://www.adtran.com/ns/yang/adtran-evc-map-enhanced-scheduling">
            <adtn-evc-map-enh-sch:root-if-name>channel-termination @_CHANNEL_TERMINATION_LONG</adtn-evc-map-enh-sch:root-if-name>
            <adtn-evc-map-enh-sch:scheduler-node-name>Voice-@_ONU_ID_LONG</adtn-evc-map-enh-sch:scheduler-node-name>
          </adtn-evc-map-enh-sch:scheduler>
          <adtn-evc-map-xpon:gem-port xmlns:adtn-evc-map-xpon="http://www.adtran.com/ns/yang/adtran-evc-map-xpon">@_GEM</adtn-evc-map-xpon:gem-port>
          <adtn-evc-map:enabled>true</adtn-evc-map:enabled>
          <adtn-evc-map:evc>evc_201</adtn-evc-map:evc>
          <adtn-evc-map:match-untagged>false</adtn-evc-map:match-untagged>
          <adtn-evc-map:inherit-pri/>
          <adtn-evc-map:uni>channel-termination @_CHANNEL_TERMINATION_LONG</adtn-evc-map:uni>
        </adtn-evc-map:evc-map>
      </adtn-evc-map:evc-maps>
  </nc:config>
`;

// evc_map_channel-termination0/1_201_1281_2561_onu-0/1-1
// evc_map_channel-termination@_CHANNEL_TERMINATION_LONG_201_@_TCONT_@_GEM_@_ONU_ID_LONG
export const ADD_VOICE_SUBSCRIBER_PROFILE_SECTION = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
    <adtn-sub-prof:subscriber-profiles xmlns:adtn-sub-prof="http://www.adtran.com/ns/yang/adtran-subscriber-profiles" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
      <adtn-sub-prof:subscriber-profile>
        <adtn-sub-prof:name>dhcp_lineinsertion</adtn-sub-prof:name>
        <adtn-sub-prof:evc-map>evc_map_channel-termination@_CHANNEL_TERMINATION_LONG_201_@_TCONT_@_GEM_@_ONU_ID_LONG</adtn-sub-prof:evc-map>
      </adtn-sub-prof:subscriber-profile>
    </adtn-sub-prof:subscriber-profiles>
  </nc:config>
`;

// onu-0/1-1-Voice
// @_ONU_ID_LONG-Voice
export const ADD_VOICE_T_CONT_SECTION = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
      <adtn-xp:xpon xmlns:adtn-xp="http://www.adtran.com/ns/yang/adtran-xpon" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <adtn-xp:t-conts>
          <adtn-xp:t-cont nc:operation="create">
            <adtn-xp:name>@_ONU_ID_LONG-Voice</adtn-xp:name>
            <adtn-xp:alloc-id>@_TCONT</adtn-xp:alloc-id>
            <adtn-xp:bandwidth-profile>bw-Customer-Voice</adtn-xp:bandwidth-profile>
            <adtn-xp:xgem-ports>
              <adtn-xp:voice-xgem-ports>
                <adtn-xp:cos>0</adtn-xp:cos>
                <adtn-xp:cos>1</adtn-xp:cos>
                <adtn-xp:cos>2</adtn-xp:cos>
                <adtn-xp:cos>3</adtn-xp:cos>
                <adtn-xp:cos>4</adtn-xp:cos>
                <adtn-xp:cos>5</adtn-xp:cos>
                <adtn-xp:cos>6</adtn-xp:cos>
                <adtn-xp:cos>7</adtn-xp:cos>
                <adtn-xp:encryption>true</adtn-xp:encryption>
                <adtn-xp:xgem-id>@_GEM</adtn-xp:xgem-id>
              </adtn-xp:voice-xgem-ports>
            </adtn-xp:xgem-ports>
          </adtn-xp:t-cont>
        </adtn-xp:t-conts>
      </adtn-xp:xpon>
  </nc:config>
`;

// channel-termination 0/1
// channel-termination @_CHANNEL_TERMINATION_LONG

// scheduler-channel-pair 1
// scheduler-channel-pair @_PON_PORT

// Voice-onu-0/1-1
// Voice-@_ONU_ID_LONG
export const ADD_VOICE_QOS_CHILD_NODES_SECTION = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
    <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <if:interface>
          <if:name>channel-termination @_CHANNEL_TERMINATION_LONG</if:name>
          <adtn-bbf-qos-tm:tm-root xmlns:adtn-bbf-qos-tm="http://www.adtran.com/ns/yang/bbf-qos-traffic-mngt">
            <adtn-bbf-qos-sched:scheduler-node xmlns:adtn-bbf-qos-sched="http://www.adtran.com/ns/yang/adtran-bbf-qos-enhanced-scheduling">
              <adtn-bbf-qos-sched:name>scheduler-channel-pair @_PON_PORT</adtn-bbf-qos-sched:name>
              <adtn-bbf-qos-sched:child-scheduler-nodes nc:operation="create">
                <adtn-bbf-qos-sched:name>Voice-@_ONU_ID_LONG</adtn-bbf-qos-sched:name>
                <adtn-bbf-qos-sched:priority>3</adtn-bbf-qos-sched:priority>
                <adtn-bbf-qos-sched:weight>1</adtn-bbf-qos-sched:weight>
              </adtn-bbf-qos-sched:child-scheduler-nodes>
            </adtn-bbf-qos-sched:scheduler-node>
            <adtn-bbf-qos-sched:scheduler-node xmlns:adtn-bbf-qos-sched="http://www.adtran.com/ns/yang/adtran-bbf-qos-enhanced-scheduling" nc:operation="create">
              <adtn-bbf-qos-sched:name>Voice-@_ONU_ID_LONG</adtn-bbf-qos-sched:name>
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
              <adtn-bbf-qos-sched:shaper-name>Shaper-2M</adtn-bbf-qos-sched:shaper-name>
            </adtn-bbf-qos-sched:scheduler-node>
          </adtn-bbf-qos-tm:tm-root>
        </if:interface>
    </if:interfaces>
  </nc:config>
`;

// onu 1101.1.1
// onu 1101.@_CHANNEL_PARTITION.@_ONU_ID

// onu-0/1-1-Voice
export const ADD_VOICE_ASSIGNED_T_CONT_SECTION = `
<nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
  <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
    <if:interface>
      <if:name>onu 1101.@_CHANNEL_PARTITION.@_ONU_ID</if:name>
      <adtn-xp:onu xmlns:adtn-xp="http://www.adtran.com/ns/yang/adtran-xpon">
        <adtn-xp:assigned-tconts>@_ONU_ID_LONG-Voice</adtn-xp:assigned-tconts>
        <adtn-xp:voice>
          <adtn-xp-onu-voice:configuration-method xmlns:adtn-voice="http://www.adtran.com/ns/yang/adtran-voice" xmlns:adtn-xp-onu-voice="http://www.adtran.com/ns/yang/adtran-xpon-onu-voice">adtn-voice:omci</adtn-xp-onu-voice:configuration-method>
          <adtn-xp-onu-voice:signalling-protocol xmlns:adtn-voice="http://www.adtran.com/ns/yang/adtran-voice" xmlns:adtn-xp-onu-voice="http://www.adtran.com/ns/yang/adtran-xpon-onu-voice">adtn-voice:sip</adtn-xp-onu-voice:signalling-protocol>
          <adtn-xp:interface>onu-subscr-if-1101.@_CHANNEL_PARTITION.@_ONU_ID.0.ip.1</adtn-xp:interface>
        </adtn-xp:voice>
      </adtn-xp:onu>
    </if:interface>
  </if:interfaces>
</nc:config>
`;

// channel-termination 0/1
// channel-termination @_CHANNEL_TERMINATION_LONG

// Voice-onu-0/1-1
// Voice-@_ONU_ID_LONG
export const ADD_VOICE_SUBSCRIBER_SECTION = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
    <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <if:interface nc:operation="create">
          <if:name>onu-subscr-if-1101.@_CHANNEL_PARTITION.@_ONU_ID.0.ip.1</if:name>
          <adtn-ip:dhcp xmlns:adtn-ip="http://www.adtran.com/ns/yang/adtran-ip">
            <adtn-ip:dhcpv4-enabled>true</adtn-ip:dhcpv4-enabled>
          </adtn-ip:dhcp>
          <if:type xmlns:ianaift="urn:ietf:params:xml:ns:yang:iana-if-type">ianaift:ip</if:type>
        </if:interface>
    </if:interfaces>
  </nc:config>
`;


// onu-subscr-if-1101.1.1.0.fxs.1.phy
// onu-subscr-if-1101.@_CHANNEL_PARTITION.@_ONU_ID.0.fxs.1.phy
export const ADD_VOICE_PROFILE_SECTION = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
    <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <if:interface nc:operation="create">
          <if:name>onu-subscr-if-1101.@_CHANNEL_PARTITION.@_ONU_ID.0.fxs.1.phy</if:name>
          <adtn-fxs:voice xmlns:adtn-fxs="http://www.adtran.com/ns/yang/adtran-fxs">
            <adtn-fxs:admin-state xmlns:adtn-voice="http://www.adtran.com/ns/yang/adtran-voice">adtn-voice:unlock</adtn-fxs:admin-state>
            <adtn-fxs:sip>
              <adtn-fxs:call-feature-profile>Voice Call Feature Profile</adtn-fxs:call-feature-profile>
              <adtn-fxs:dial-plan>Voice Dialing Profile</adtn-fxs:dial-plan>
              <adtn-fxs:identity>@PHONE_NUMBER</adtn-fxs:identity>
              <adtn-fxs:password>@SIP_PASSWORD</adtn-fxs:password>
              <adtn-fxs:primary-sip-trunk>Voice Sip Trunk Profile</adtn-fxs:primary-sip-trunk>
              <adtn-fxs:rtp-profile>Voice Media Profile</adtn-fxs:rtp-profile>
              <adtn-fxs:username>@PHONE_NUMBER</adtn-fxs:username>
            </adtn-fxs:sip>
          </adtn-fxs:voice>
          <adtn-if-pm:performance xmlns:adtn-if-pm="http://www.adtran.com/ns/yang/adtran-interface-performance-management">
            <adtn-if-pm:enable>true</adtn-if-pm:enable>
          </adtn-if-pm:performance>
          <if:enabled>true</if:enabled>
          <if:type xmlns:ianaift="urn:ietf:params:xml:ns:yang:iana-if-type">ianaift:voiceFXS</if:type>
       </if:interface>
    </if:interfaces>
  </nc:config>
`;


export const ADD_VOICE_TEMPLATE = `
<nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
    <adtn-evc-map:evc-maps xmlns:adtn-evc-map="http://www.adtran.com/ns/yang/adtran-evc-maps" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
     <adtn-evc-map:evc-map nc:operation="create">
        <adtn-evc-map:name>evc_map_channel-termination@_CHANNEL_TERMINATION_LONG_201_@_TCONT_@_GEM_@_ONU_ID_LONG</adtn-evc-map:name>
         <adtn-evc-map-enh-sch:scheduler xmlns:adtn-evc-map-enh-sch="http://www.adtran.com/ns/yang/adtran-evc-map-enhanced-scheduling">
            <adtn-evc-map-enh-sch:root-if-name>channel-termination @_CHANNEL_TERMINATION_LONG</adtn-evc-map-enh-sch:root-if-name>
            <adtn-evc-map-enh-sch:scheduler-node-name>Voice-@_ONU_ID_LONG</adtn-evc-map-enh-sch:scheduler-node-name>
          </adtn-evc-map-enh-sch:scheduler>
          <adtn-evc-map-xpon:gem-port xmlns:adtn-evc-map-xpon="http://www.adtran.com/ns/yang/adtran-evc-map-xpon">@_GEM</adtn-evc-map-xpon:gem-port>
          <adtn-evc-map:enabled>true</adtn-evc-map:enabled>
          <adtn-evc-map:evc>evc_201</adtn-evc-map:evc>
          <adtn-evc-map:match-untagged>false</adtn-evc-map:match-untagged>
          <adtn-evc-map:inherit-pri/>
          <adtn-evc-map:uni>channel-termination @_CHANNEL_TERMINATION_LONG</adtn-evc-map:uni>
        </adtn-evc-map:evc-map>
      </adtn-evc-map:evc-maps>

      <adtn-sub-prof:subscriber-profiles xmlns:adtn-sub-prof="http://www.adtran.com/ns/yang/adtran-subscriber-profiles" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <adtn-sub-prof:subscriber-profile>
          <adtn-sub-prof:name>dhcp_lineinsertion</adtn-sub-prof:name>
          <adtn-sub-prof:evc-map>evc_map_channel-termination@_CHANNEL_TERMINATION_LONG_201_@_TCONT_@_GEM_@_ONU_ID_LONG</adtn-sub-prof:evc-map>
        </adtn-sub-prof:subscriber-profile>
      </adtn-sub-prof:subscriber-profiles>

      <adtn-xp:xpon xmlns:adtn-xp="http://www.adtran.com/ns/yang/adtran-xpon" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <adtn-xp:t-conts>
          <adtn-xp:t-cont nc:operation="create">
            <adtn-xp:name>@_ONU_ID_LONG-Voice</adtn-xp:name>
            <adtn-xp:alloc-id>@_TCONT</adtn-xp:alloc-id>
            <adtn-xp:bandwidth-profile>bw-Customer-Voice</adtn-xp:bandwidth-profile>
            <adtn-xp:xgem-ports>
              <adtn-xp:voice-xgem-ports>
                <adtn-xp:cos>0</adtn-xp:cos>
                <adtn-xp:cos>1</adtn-xp:cos>
                <adtn-xp:cos>2</adtn-xp:cos>
                <adtn-xp:cos>3</adtn-xp:cos>
                <adtn-xp:cos>4</adtn-xp:cos>
                <adtn-xp:cos>5</adtn-xp:cos>
                <adtn-xp:cos>6</adtn-xp:cos>
                <adtn-xp:cos>7</adtn-xp:cos>
                <adtn-xp:encryption>true</adtn-xp:encryption>
                <adtn-xp:xgem-id>@_GEM</adtn-xp:xgem-id>
              </adtn-xp:voice-xgem-ports>
            </adtn-xp:xgem-ports>
          </adtn-xp:t-cont>
        </adtn-xp:t-conts>
      </adtn-xp:xpon>

      <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <if:interface>
          <if:name>channel-termination @_CHANNEL_TERMINATION_LONG</if:name>
          <adtn-bbf-qos-tm:tm-root xmlns:adtn-bbf-qos-tm="http://www.adtran.com/ns/yang/bbf-qos-traffic-mngt">
            <adtn-bbf-qos-sched:scheduler-node xmlns:adtn-bbf-qos-sched="http://www.adtran.com/ns/yang/adtran-bbf-qos-enhanced-scheduling">
              <adtn-bbf-qos-sched:name>scheduler-channel-pair @_PON_PORT</adtn-bbf-qos-sched:name>
              <adtn-bbf-qos-sched:child-scheduler-nodes nc:operation="create">
                <adtn-bbf-qos-sched:name>Voice-@_ONU_ID_LONG</adtn-bbf-qos-sched:name>
                <adtn-bbf-qos-sched:priority>3</adtn-bbf-qos-sched:priority>
                <adtn-bbf-qos-sched:weight>1</adtn-bbf-qos-sched:weight>
              </adtn-bbf-qos-sched:child-scheduler-nodes>
            </adtn-bbf-qos-sched:scheduler-node>
            <adtn-bbf-qos-sched:scheduler-node xmlns:adtn-bbf-qos-sched="http://www.adtran.com/ns/yang/adtran-bbf-qos-enhanced-scheduling" nc:operation="create">
              <adtn-bbf-qos-sched:name>Voice-@_ONU_ID_LONG</adtn-bbf-qos-sched:name>
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
              <adtn-bbf-qos-sched:shaper-name>Shaper-2M</adtn-bbf-qos-sched:shaper-name>
            </adtn-bbf-qos-sched:scheduler-node>
          </adtn-bbf-qos-tm:tm-root>
        </if:interface>

        <if:interface>
          <if:name>onu 1101.@_CHANNEL_PARTITION.@_ONU_ID</if:name>
          <adtn-xp:onu xmlns:adtn-xp="http://www.adtran.com/ns/yang/adtran-xpon">
            <adtn-xp:assigned-tconts>@_ONU_ID_LONG-Voice</adtn-xp:assigned-tconts>
            <adtn-xp:voice>
              <adtn-xp-onu-voice:configuration-method xmlns:adtn-voice="http://www.adtran.com/ns/yang/adtran-voice" xmlns:adtn-xp-onu-voice="http://www.adtran.com/ns/yang/adtran-xpon-onu-voice">adtn-voice:omci</adtn-xp-onu-voice:configuration-method>
              <adtn-xp-onu-voice:signalling-protocol xmlns:adtn-voice="http://www.adtran.com/ns/yang/adtran-voice" xmlns:adtn-xp-onu-voice="http://www.adtran.com/ns/yang/adtran-xpon-onu-voice">adtn-voice:sip</adtn-xp-onu-voice:signalling-protocol>
              <adtn-xp:interface>onu-subscr-if-1101.@_CHANNEL_PARTITION.@_ONU_ID.0.ip.1</adtn-xp:interface>
            </adtn-xp:voice>
          </adtn-xp:onu>
        </if:interface>

        <if:interface nc:operation="create">
          <if:name>onu-subscr-if-1101.@_CHANNEL_PARTITION.@_ONU_ID.0.ip.1</if:name>
          <adtn-ip:dhcp xmlns:adtn-ip="http://www.adtran.com/ns/yang/adtran-ip">
            <adtn-ip:dhcpv4-enabled>true</adtn-ip:dhcpv4-enabled>
          </adtn-ip:dhcp>
          <if:type xmlns:ianaift="urn:ietf:params:xml:ns:yang:iana-if-type">ianaift:ip</if:type>
        </if:interface>

        <if:interface nc:operation="create">
          <if:name>onu-subscr-if-1101.@_CHANNEL_PARTITION.@_ONU_ID.0.fxs.1.phy</if:name>
          <adtn-fxs:voice xmlns:adtn-fxs="http://www.adtran.com/ns/yang/adtran-fxs">
            <adtn-fxs:admin-state xmlns:adtn-voice="http://www.adtran.com/ns/yang/adtran-voice">adtn-voice:unlock</adtn-fxs:admin-state>
            <adtn-fxs:sip>
              <adtn-fxs:call-feature-profile>Voice Call Feature Profile</adtn-fxs:call-feature-profile>
              <adtn-fxs:dial-plan>Voice Dialing Profile</adtn-fxs:dial-plan>
              <adtn-fxs:identity>@PHONE_NUMBER</adtn-fxs:identity>
              <adtn-fxs:password>@SIP_PASSWORD</adtn-fxs:password>
              <adtn-fxs:primary-sip-trunk>Voice Sip Trunk Profile</adtn-fxs:primary-sip-trunk>
              <adtn-fxs:rtp-profile>Voice Media Profile</adtn-fxs:rtp-profile>
              <adtn-fxs:username>@PHONE_NUMBER</adtn-fxs:username>
            </adtn-fxs:sip>
          </adtn-fxs:voice>
          <adtn-if-pm:performance xmlns:adtn-if-pm="http://www.adtran.com/ns/yang/adtran-interface-performance-management">
            <adtn-if-pm:enable>true</adtn-if-pm:enable>
          </adtn-if-pm:performance>
          <if:enabled>true</if:enabled>
          <if:type xmlns:ianaift="urn:ietf:params:xml:ns:yang:iana-if-type">ianaift:voiceFXS</if:type>
        </if:interface>

      </if:interfaces>


</nc:config>
`
