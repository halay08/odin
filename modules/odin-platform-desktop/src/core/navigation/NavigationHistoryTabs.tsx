import { CloseOutlined } from '@ant-design/icons';
import { Col, Row, Typography } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { IRecordReducer } from '../records/store/reducer';
import { closeTab } from './store/actions';
import { NavigationReducer } from './store/reducer';

interface IProps {
  navigationReducer: NavigationReducer,
  recordReducer: IRecordReducer,
  onCloseTab: any,
  history:any;
}

class NavigationHistoryTabs extends React.Component<IProps> {

  componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<{}>, snapshot?: any): void {
    if(prevProps.navigationReducer.tabHistory && this.props.navigationReducer.tabHistory){
      if(prevProps.navigationReducer.tabHistory.length !== this.props.navigationReducer.tabHistory.length) {
        this.renderTabs();
      }
    }
  }

  checkIfTabIsActive(fullRecordPath:string){

    const {history} = this.props

    let recordPathPieces:Array<string> = fullRecordPath.split('/')
    let recordPath:string = recordPathPieces[recordPathPieces.length - 1]

    let locationPieces = history.location.pathname.split('/')
    let recordLocation = locationPieces[locationPieces.length - 1]

    return recordPath === recordLocation;

  }

  renderTabs() {
    const { navigationReducer, onCloseTab } = this.props;

    if(navigationReducer.tabHistory && navigationReducer.tabHistory.length > 0) {

      return <Row className="nav-tab-row">
        {navigationReducer.tabHistory.map((elem, index) => (
          <Col key={index}>
            <div className="nav-tab-wrapper" style={{borderBottom: this.checkIfTabIsActive(elem.path) ? '3px solid #1890ff': '3px solid #ffffff'}}>
              <Link to={elem.path} className="nav-tab-link">
                <div className="nav-tab-link-inner" >
                  <Typography.Text>{elem.title}</Typography.Text>
                </div>
              </Link>
              <CloseOutlined className="nav-tab-icon" onClick={() => onCloseTab({ path: elem.path })}/>
            </div>
          </Col>
        ))}
      </Row>
    }
    return <></>

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
  userReducer: state.userReducer,
  navigationReducer: state.navigationReducer,
  recordReducer: state.recordReducer,
});

const mapDispatch = (dispatch: any) => ({
  onCloseTab: (params: { path: string, title: string }) => dispatch(closeTab(params)),
});


// @ts-ignore
const NavigationHistoryTabsWithRouter = withRouter(NavigationHistoryTabs)
export default connect(mapState, mapDispatch)(NavigationHistoryTabsWithRouter);

