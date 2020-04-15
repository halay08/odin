export const CHECK_STATUS_ONT_TEMPLATE = `
<nc:config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
  <get>
    <filter type="subtree">
      <if:interfaces-state xmlns:if="urn:ietf:params:xml:ns:yang:ietf-interfaces" xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0">
        <if:interface>
          <if:name>@ONU_INTERFACE_NAME</if:name>
          <adtn-xp:onu xmlns:adtn-xp="http://www.adtran.com/ns/yang/adtran-xpon"/>
        </if:interface>
      </if:interfaces-state>
    </filter>
  </get>
</nc:config>
`
