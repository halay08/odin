import { AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { Button, Card, Col, Divider, Image, Row, Table, Tooltip } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import { getBrowserPath } from '../../../../shared/utilities/recordHelpers';

interface Props {
  files: any,
  dataSource: any,
  columns: any
}

interface State {
  view: 'list' | 'thumbnails'
}

class FileManagerOverview extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = { view: 'thumbnails' }
  }

  renderList() {
    return (
      <Col span={24}>
        <Table size="small" tableLayout="auto" columns={this.props.columns} dataSource={this.props.dataSource}/>
      </Col>
    )
  }

  renderThumbnail(record: any) {
    return (
      <Col sm={12} md={8} style={{ padding: '10px' }}>
        <Card
          size="small"
          className="filePreviewCard"
          title={<Link target="_blank" to={getBrowserPath(record)}>#{record.recordNumber}</Link>}
          /*extra={
           <Dropdown.Button overlay={
           <Menu>
           <Menu.Item key="1"><Link to={getBrowserPath(record)}>View Details</Link></Menu.Item>
           <Menu.Item key="2" style={{color: 'red'}}>Delete Record</Menu.Item>
           </Menu>
           }/>
           }*/
          cover={
            <div style={{ padding: '7px 7px 0px 7px' }}>
              <Image src={record.properties.Url}/>
            </div>
          }
        />
      </Col>
    )
  }


  render() {

    const { files } = this.props

    return (
      <div>
        <Divider style={{ marginTop: '10px' }}>
          <Row style={{ marginTop: '10px', padding: '15px' }}>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Tooltip placement="left" title="Thumbnail">
                <Button
                  type={this.state.view === 'thumbnails' ? 'primary' : 'default'}
                  size="large"
                  icon={<AppstoreOutlined/>}
                  style={{ marginRight: '8px' }}
                  onClick={() => this.setState({ view: 'thumbnails' })}
                />
              </Tooltip>
              <Tooltip placement="right" title="List">
                <Button
                  type={this.state.view === 'list' ? 'primary' : 'default'}
                  size="large"
                  icon={<UnorderedListOutlined/>}
                  onClick={() => this.setState({ view: 'list' })}
                />
              </Tooltip>
            </Col>
          </Row>
        </Divider>

        <Image.PreviewGroup>
          <Row>
            {
              this.state.view === 'thumbnails'
                ?
                files.map((record: any) => (
                  this.renderThumbnail(record)
                ))
                :
                this.renderList()
            }
          </Row>
        </Image.PreviewGroup>
      </div>

    )
  }

}

export default FileManagerOverview
