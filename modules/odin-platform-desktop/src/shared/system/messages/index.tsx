import { message, Space } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { resetMessage } from './store/reducers';


const successMessage = (messageReducer: any) => {
  return message.success(messageReducer.message.body);
};
const infoMessage = (messageReducer: any) => {
  return message.info(messageReducer.message.body);
};
const errorMessage = (messageReducer: any) => {
  return message.error(messageReducer.message.body);
};

// @ts-ignore
const Message = ({ messageReducer, reset }) => {

  console.log('messageReducer', messageReducer);

  return (<Space>
    {messageReducer.message.type === 'success' && successMessage(messageReducer)}
    {messageReducer.message.type === 'info' && infoMessage(messageReducer)}
    {messageReducer.message.type === 'error' && errorMessage(messageReducer)}
  </Space>);
};


const mapState = (state: any) => ({
  messageReducer: state.messageReducer,
});

const mapDispatch = (dispatch: any) => ({
  reset: () => dispatch(resetMessage()),
});


export default connect(mapState, mapDispatch)(Message);
