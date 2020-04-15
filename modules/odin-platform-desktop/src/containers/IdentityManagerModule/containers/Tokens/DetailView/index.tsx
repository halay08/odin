import { Button, Layout, PageHeader, Tabs, Popconfirm } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { DeleteToken, deleteTokenRequest, getTokenByIdRequest } from '../../../../../core/identityTokens/store/actions';
import { IdentityTokensReducer } from '../../../../../core/identityTokens/store/reducer';
import { getTokenFromShortListByTokenId } from '../../../../../shared/utilities/identityHelpers';
import DetailTabTemplate from '../../../components/DetailTabTemplate';

interface Props {
  match: any,
  getToken: any,
  identityTokensReducer: IdentityTokensReducer,
  deleteToken: (params: DeleteToken) => void
}

const { TabPane } = Tabs;

class TokensDetailView extends React.Component<Props> {

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {

    const { getToken, match } = this.props;
    const tokenId = match.params.tokenId;

    if(tokenId) {
      getToken({ tokenId: tokenId }, (result: any) => {
      });
    }

  }

  deleteToken() {
    const { deleteToken, match } = this.props;
    const tokenId = match.params.tokenId;
    deleteToken({tokenId: tokenId})
  }

  render() {
    const { identityTokensReducer, match } = this.props;

    const tokenId = match.params.tokenId;
    const token = getTokenFromShortListByTokenId(identityTokensReducer.shortList, tokenId);

    const detail = [
      { label: 'id', text: token?.id },
      { label: 'Group Name', text: token?.name },
      { label: 'Description', text: token?.description },
      { label: 'Created At', text: token?.createdAt },
      { label: 'Updated At', text: token?.updatedAt },
    ];
    return (
      <Layout className="record-detail-view">
        <PageHeader
          className="page-header"
          ghost={false}
          onBack={() => window.history.back()}
          title={"Token: " + token?.name}
          extra={[
            <Popconfirm
                    title="Are you sure you want to delete token?"
                    onConfirm={() => this.deleteToken()}
                    okText="Yes"
                    cancelText="No"
                  >
              <Button danger key="1">Delete</Button>
            </Popconfirm>,
          ]}/>
        <div className="detail-body-wrapper">
          <Tabs defaultActiveKey="Details">
            <TabPane tab="Details" key="Details">
              <DetailTabTemplate detail={detail}/>
            </TabPane>
          </Tabs>
        </div>
      </Layout>
    );
  }
}

const mapState = (state: any) => ({
  identityTokensReducer: state.identityTokensReducer,
});

const mapDispatch = (dispatch: any) => ({
  getToken: (params: any) => dispatch(getTokenByIdRequest(params)),
  deleteToken: (params: DeleteToken) => dispatch(deleteTokenRequest(params))
});

export default withRouter(connect(mapState, mapDispatch)(TokensDetailView));
