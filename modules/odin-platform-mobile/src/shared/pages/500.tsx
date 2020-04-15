import React from 'react';
import { connect } from "react-redux";
import { Button, Result } from "antd";
import history from "../utilities/browserHisory";


export const Error500 = () => {

  return (
    <Result
      status="500"
      title="500"
      subTitle="Sorry, something went wrong."
      extra={<Button type="primary" onClick={() => history.push('/')}>Back Home</Button>}
    />
  )
};

const mapState = (state: any) => ({
  identityReducer: state.identityReducer,
});

export default connect(mapState)(Error500);
