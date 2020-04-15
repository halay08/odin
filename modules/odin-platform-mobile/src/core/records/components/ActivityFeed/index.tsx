import { InfoCircleOutlined } from '@ant-design/icons';
import { LogsConstants } from '@d19n/models/dist/logs/logs.constants';
import { LogsUserActivityEntity } from '@d19n/models/dist/logs/user-activity/logs.user.activity.entity';
import { Card, Empty, Popover, Timeline } from 'antd';
import Paragraph from 'antd/lib/typography/Paragraph';
import React from 'react';
import { connect } from 'react-redux';
import { changeToCapitalCase } from '../../../../shared/utilities/dataTransformationHelpers';
import { parseDateLocalizedHoursAndSeconds } from '../../../../shared/utilities/dateHelpers';
import { splitModuleAndEntityName } from '../../../../shared/utilities/recordHelpers';

interface Props {
  auditLogsReducer: any
}

const ActivityFeed = (props: Props) => {
  const { auditLogsReducer } = props;

  const parseActivityFeedEvents = (elem: any) => {
    switch (elem.type) {
      case LogsConstants.DB_RECORD_CREATED:
        return (
          <Paragraph>
            <span>{elem.userName} <strong>CREATED </strong> </span>
            <span>{changeToCapitalCase(splitModuleAndEntityName(elem?.revision?.entity)?.entityName)} </span>
            <a>{elem?.revision?.title}</a> <span>on </span>
            <span>{parseDateLocalizedHoursAndSeconds(elem.createdAt)}</span>
            <div>
              <Popover
                title={elem.type}
                content={
                  <pre>{JSON.stringify(elem.revision, null, 2)}</pre>
                }
              >
                <a><InfoCircleOutlined/> view details</a>
              </Popover>
            </div>
          </Paragraph>
        )
        break;
      case LogsConstants.DB_RECORD_UPDATED:
        return (
          <Paragraph>
            <span>{elem.userName} <strong>UPDATED </strong></span>
            <span>{changeToCapitalCase(splitModuleAndEntityName(elem?.revision?.entity)?.entityName)} </span>
            <a>{elem?.revision?.title}</a> <span>on </span>
            <span>{parseDateLocalizedHoursAndSeconds(elem.createdAt)}</span>
            <div>
              <Popover
                title={elem.type}
                content={
                  <pre>{JSON.stringify(elem.revision, null, 2)}</pre>
                }
              >
                <a><InfoCircleOutlined/> view details</a>
              </Popover>
            </div>
          </Paragraph>
        )
        break;
      case LogsConstants.DB_RECORD_STAGE_UPDATED:
        return (
          <Paragraph>
            <span>{elem.userName} <strong>MOVED </strong></span>
            <span>{changeToCapitalCase(splitModuleAndEntityName(elem?.revision?.entity)?.entityName)} </span>
            <span>to stage </span>
            <a>{elem?.revision?.stageId}</a> <span>on </span>
            <span>{parseDateLocalizedHoursAndSeconds(elem.createdAt)}</span>
            <div>
              <Popover
                title={elem.type}
                content={
                  <pre>{JSON.stringify(elem.revision, null, 2)}</pre>
                }
              >
                <a><InfoCircleOutlined/> view details</a>
              </Popover>
            </div>
          </Paragraph>
        )
        break;
      case LogsConstants.DB_RECORD_ASSOCIATION_CREATED:
        return (
          <Paragraph>
            <span>{elem.userName} <strong>CREATED </strong> a relationship between </span>
            <span>{changeToCapitalCase(splitModuleAndEntityName(elem?.revision?.parentEntity)?.entityName)} </span>
            <a>{elem?.revision?.parentRecordTitle || elem?.revision?.parentRecordId} </a>
            <span>and </span>
            <span>{changeToCapitalCase(splitModuleAndEntityName(elem?.revision?.childEntity)?.entityName)} </span>
            <a>{elem?.revision?.childRecordTitle || elem?.revision?.childRecordId} </a>
            <span>on </span>
            <span>{parseDateLocalizedHoursAndSeconds(elem.createdAt)}</span>
            <div>
              <Popover
                title={elem.type}
                content={
                  <pre>{JSON.stringify(elem.revision, null, 2)}</pre>
                }
              >
                <a><InfoCircleOutlined/> view details</a>
              </Popover>
            </div>
          </Paragraph>
        )
        break;

      case LogsConstants.DB_RECORD_ASSOCIATION_CREATED:
        return (
          <Paragraph>
            <span>{elem.userName} <strong>UPDATED </strong> the relationship between </span>
            <span>{changeToCapitalCase(splitModuleAndEntityName(elem?.revision?.parentEntity)?.entityName)} </span>
            <a>{elem?.revision?.parentRecordTitle || elem?.revision?.parentRecordId} </a>
            <span>and </span>
            <span>{changeToCapitalCase(splitModuleAndEntityName(elem?.revision?.childEntity)?.entityName)} </span>
            <a>{elem?.revision?.childRecordTitle || elem?.revision?.childRecordId} </a>
            <span>{parseDateLocalizedHoursAndSeconds(elem.createdAt)}</span>
            <div>
              <Popover
                title={elem.type}
                content={
                  <pre>{JSON.stringify(elem.revision, null, 2)}</pre>
                }
              >
                <a><InfoCircleOutlined/> view details</a>
              </Popover>
            </div>
          </Paragraph>
        )
        break;
      default:
        return (
          <Paragraph>
            <div><a>{elem.type}</a></div>
            <span>by </span>
            <span style={{ fontWeight: 600 }}>{elem.userName}</span>
            <span>on </span>
            <span>{parseDateLocalizedHoursAndSeconds(elem.createdAt)}</span>
            <div>
              <Popover
                title={elem.type}
                content={
                  <pre>{JSON.stringify(elem.revision, null, 2)}</pre>
                }
              >
                <a><InfoCircleOutlined/> view details</a>
              </Popover>
            </div>
          </Paragraph>
        )
    }

  }

  return (
    <Card size="small" title="Activity" bordered style={{ marginBottom: 10, height: 500, overflow: 'auto' }}>
      <Timeline>
        {auditLogsReducer.list.length > 0 ? auditLogsReducer.list.map((elem: LogsUserActivityEntity, index: number) => (
          <Timeline.Item key={index}>
            {parseActivityFeedEvents(elem)}
          </Timeline.Item>
        )) : (
          <Empty/>
        )}
      </Timeline>
    </Card>
  );
};

const mapState = (state: any) => ({
  auditLogsReducer: state.auditLogsReducer,
});

export default connect(mapState)(ActivityFeed);
