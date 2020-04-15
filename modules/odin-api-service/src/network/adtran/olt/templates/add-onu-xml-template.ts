export const ADD_ONU_SECTION = `
<nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
  <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
   <if:interface nc:operation="create">
      <if:name>onu 1101.@_CHANNEL_PARTITION.@_ONU_ID</if:name>
      <adtn-if-pm:performance xmlns:adtn-if-pm="http://www.adtran.com/ns/yang/adtran-interface-performance-management">
        <adtn-if-pm:enable>true</adtn-if-pm:enable>
      </adtn-if-pm:performance>
      <adtn-xp:onu xmlns:adtn-xp="http://www.adtran.com/ns/yang/adtran-xpon">
        <adtn-xp:aes-mode-enable>true</adtn-xp:aes-mode-enable>
        <adtn-xp:channel-partition>ChannelPartition_P@_CHANNEL_PARTITION</adtn-xp:channel-partition>
        <adtn-xp:expected-serial-number-string>@_SERIAL_NUMBER</adtn-xp:expected-serial-number-string>
        <adtn-xp:onu-id>@_ONU_ID</adtn-xp:onu-id>
        <adtn-xp:preferred-channel-pair>channel-pair 1101.@_CHANNEL_PARTITION.15</adtn-xp:preferred-channel-pair>
      </adtn-xp:onu>
      <if:enabled>true</if:enabled>
      <if:type xmlns:adtn-xp="http://www.adtran.com/ns/yang/adtran-xpon">adtn-xp:xpon-onu</if:type>
      <if:description>@_ONU_ID_LONG - @_DESCRIPTION</if:description>
    </if:interface>
  </if:interfaces>
</nc:config>`;
