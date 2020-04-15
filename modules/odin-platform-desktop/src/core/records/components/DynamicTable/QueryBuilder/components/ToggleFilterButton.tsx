import { FilterOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { toggleQueryBuilder } from '../store/actions';

interface Props {
  toggle: any
}

class QueryBuilderToggle extends React.Component<Props> {

  render() {
    const { toggle } = this.props;
    return (
      <Button onClick={() => toggle()} style={{ marginRight: 4 }} icon={<FilterOutlined/>}/>
    )
  }
}

const mapState = (state: any) => ({
  queryBuilderReducer: state.queryBuilderReducer,
});

const mapDispatch = (dispatch: any) => ({
  toggle: () => dispatch(toggleQueryBuilder()),
});


export default connect(mapState, mapDispatch)(QueryBuilderToggle);

