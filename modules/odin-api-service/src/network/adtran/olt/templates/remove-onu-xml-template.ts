export const REMOVE_ONU_SECTION = `
  <nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
     <if:interfaces xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
      <if:interface nc:operation="delete">
        <if:name>onu 1101.@_CHANNEL_PARTITION.@_ONU_ID</if:name>
      </if:interface>
    </if:interfaces>
  </nc:config>
`;
