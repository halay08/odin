import React from 'react';
import {getPropertyFromRelation} from "@d19n/models/dist/schema-manager/helpers/dbRecordHelpers";
import {DbRecordEntityTransform} from "@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform";
import {Link} from "react-router-dom";
import {getBrowserPath} from "../../../shared/utilities/recordHelpers";
import {Button} from "antd";

interface Props {
  result: DbRecordEntityTransform,
  onClose: any,
  globalCollapsed: boolean
}

interface State {
  collapsed: boolean
}


class AddressLayout extends React.Component<Props, State> {
  constructor(props: any) {
    super(props)
    this.state = {collapsed: false}
  }

  render(){
    const result = this.props.result;

    return(
      <div>

        {/* Address */}
        <p>
          <span>Address</span>
          <br/>
          <span style={{fontWeight: 'bold'}}>{
            <Link to={getBrowserPath(result)} onClick={() => this.props.onClose()}>
              <span>{result.title}</span>
            </Link>
          }</span>
        </p>

      </div>
    )
  }
}

export default AddressLayout
