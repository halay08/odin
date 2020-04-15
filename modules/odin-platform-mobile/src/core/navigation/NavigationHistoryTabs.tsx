import { CloseOutlined } from '@ant-design/icons';
import { Col, Row, Typography } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { IRecordReducer } from '../records/store/reducer';
import { closeTab } from './store/actions';
import { NavigationReducer } from './store/reducer';

interface IProps {
  navigationReducer: NavigationReducer,
  recordReducer: IRecordReducer,
  onCloseTab: any,
}

class NavigationHistoryTabs extends React.Component<IProps> {
  componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<{}>, snapshot?: any): void {
    if(prevProps.navigationReducer.history.length !== this.props.navigationReducer.history.length) {
      this.renderTabs();
    }
  }

  renderTabs() {
    const { navigationReducer, onCloseTab } = this.props;
    if(navigationReducer.history.length > 0) {
      return <Row className="nav-tab-row">
        {navigationReducer.history.map((elem, index) => (
          <Col key={index}>
            <div className="nav-tab-wrapper">
              <Link to={elem.path} className="nav-tab-link">
                <div className="nav-tab-link-inner">
                  <Typography.Text>{elem.title}</Typography.Text>
                </div>
              </Link>
              <CloseOutlined onClick={() => onCloseTab({ path: elem.path })}/>
            </div>
          </Col>
        ))}
      </Row>
    }
    return <div/>
  }

  render() {
    return (
      <div className="nav-tab">
        {this.renderTabs()}
      </div>
    );
  }
}

const mapState = (state: any) => ({
  identityReducer: state.identityReducer,
  navigationReducer: state.navigationReducer,
  recordReducer: state.recordReducer,
});

const mapDispatch = (dispatch: any) => ({
  onCloseTab: (params: { path: string, title: string }) => dispatch(closeTab(params)),
});

export default connect(mapState, mapDispatch)(NavigationHistoryTabs);


