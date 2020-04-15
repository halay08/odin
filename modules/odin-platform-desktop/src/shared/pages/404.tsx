import React from 'react';
import { connect } from "react-redux";
import { Button, Result } from "antd";
import history from "../utilities/browserHisory";

export const Error404 = () => {
  return (
    <Result
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
      extra={<Button type="primary" onClick={() => history.push('/')}>Back Home</Button>}
    />
  )
};

const mapState = (state: any) => ({
  userReducer: state.userReducer,
});

export default connect(mapState)(Error404);
