import React from 'react';
import { connect } from "react-redux";
import { Button, Result } from "antd";
import history from "../utilities/browserHisory";

export const Error403 = () => {
  return (
    <Result
      status="403"
      title="403"
      subTitle="Sorry, you are not authorized to access this page."
      extra={<Button type="primary" onClick={() => history.push('/')}>Back Home</Button>}
    />
  )
};

const mapState = (state: any) => ({
  userReducer: state.userReducer,
});

export default connect(mapState)(Error403);
