import React from "react";
import { notification, Space } from 'antd';
import { RadiusBottomrightOutlined } from '@ant-design/icons';
import { connect } from "react-redux";
import { resetNotification } from "./store/reducers";


const openNotification = (notificationReducer: any) => {
  notification.error({
    message: notificationReducer.error.message,
    description: notificationReducer.error.validation,
    placement: notificationReducer.ui.placement,
  });
};

// @ts-ignore
const Notification = ({ notificationReducer, reset }) => {

  return (<Space>
    {notificationReducer.ui.hasError && openNotification(notificationReducer)}
    {notificationReducer.ui.placement === 'bottom-right' && <RadiusBottomrightOutlined/>}
  </Space>);
};


const mapState = (state: any) => ({
  notificationReducer: state.notificationReducer,
});

const mapDispatch = (dispatch: any) => ({
  reset: () => dispatch(resetNotification()),
});


export default connect(mapState, mapDispatch)(Notification);
