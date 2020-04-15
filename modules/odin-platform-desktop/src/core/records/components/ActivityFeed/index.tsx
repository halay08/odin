import { InfoCircleOutlined } from '@ant-design/icons';
import { LogsConstants } from '@d19n/models/dist/logs/logs.constants';
import { LogsUserActivityEntity } from '@d19n/models/dist/logs/user-activity/logs.user.activity.entity';
import { Empty, Popover, Timeline, Tag } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import Paragraph from 'antd/lib/typography/Paragraph';
import React from 'react';
import { connect } from 'react-redux';
import { changeToCapitalCase } from '../../../../shared/utilities/dataTransformationHelpers';
import { parseDateLocalizedHoursAndSeconds } from '../../../../shared/utilities/dateHelpers';
import { splitModuleAndEntityName } from '../../../../shared/utilities/recordHelpers';
import {Link, useLocation} from "react-router-dom";
import {SchemaModuleTypeEnums} from "@d19n/models/dist/schema-manager/schema/types/schema.module.types";

interface Props {
  auditLogsReducer: any
}
const { CRM_MODULE } = SchemaModuleTypeEnums;

const ElementFooter = ({ elem }: { elem: any }) => (
  <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
    <span style={{ fontSize: 12 }}><CalendarOutlined /> {parseDateLocalizedHoursAndSeconds(elem?.createdAt)}</span>
    <span>
      <Popover
        title={elem?.type}
        content={
          <pre>{JSON.stringify(elem?.revision, null, 2)}</pre>
        }
      >
        <a><InfoCircleOutlined/> view details</a>
      </Popover>
    </span>
  </div>
)

const ActivityFeed = (props: Props) => {
  const { auditLogsReducer } = props;
  let parentRecordId:string, parent, childRecordId:string, child, stageId:string, stage
  let entity: any, parentEntity: any, childEntity: any
  const location = useLocation();

  const checkLink=(elem: any, entity: any) => {
    const link=`/${entity?.moduleName}/${entity?.entityName}/${elem?.recordId}`
    if(link===location.pathname){
      return <span>{elem?.revision?.title} </span>
    }
    return <Link to={link}>
    {elem?.revision?.title}</Link>
  }
  const checkParentLink=(elem: any, parent: any) => {
    const link=`/${parentEntity?.moduleName}/${parentEntity?.entityName}/${elem?.revision?.parentRecordId}`
    if(link===location.pathname){
      return <span>{parent?.title || elem?.revision?.parentRecordTitle || elem?.revision?.parentRecordId} </span>
    }
    return <Link to={link}>
    {elem?.revision?.title}</Link>
  }

  const parseActivityFeedEvents = (elem: any) => {
    switch (elem.type) {
      case LogsConstants.DB_RECORD_CREATED:
        entity = splitModuleAndEntityName(elem?.revision?.entity)
        let link
        if(entity?.moduleName!=='Record'){
          link = checkLink(elem, entity)
          }else{
            link =<span>{elem?.revision?.title} </span>
          }
        return (
          <Paragraph>
            <div style={{ marginBottom: 8 }}>
              <span> <Link to={`/IdentityManagerModule/Users/${elem.userId}`}>
                {elem.userName}
              </Link> <strong>CREATED </strong></span>
            </div>
            <Tag>
              <span>{changeToCapitalCase(entity?.entityName)} </span>
              {link}
            </Tag>
            <ElementFooter elem={elem} />
          </Paragraph>
        )
        break;
      case LogsConstants.DB_RECORD_UPDATED:
        entity = splitModuleAndEntityName(elem?.revision?.entity)

        return (
          <Paragraph>
            <div style={{ marginBottom: 8 }}>
              <span><Link to={`/IdentityManagerModule/Users/${elem.userId}`}>
                {elem.userName}
              </Link> <strong>UPDATED </strong></span>
            </div>
            <Tag>
              <span>{changeToCapitalCase(entity?.entityName)} </span>
              {checkLink(elem, entity)}
            </Tag>
            <ElementFooter elem={elem} />
          </Paragraph>
        )
        break;
      case LogsConstants.DB_RECORD_MERGED:
        entity = splitModuleAndEntityName(elem?.revision?.entity)

        return (
          <Paragraph>
            <div style={{ marginBottom: 8 }}>
              <span><Link to={`/IdentityManagerModule/Users/${elem.userId}`}>
                {elem.userName}
              </Link> <strong>MERGED </strong></span>
            </div>
            <Tag>
              <span>{changeToCapitalCase(entity?.entityName)} </span>
              {checkLink(elem, entity)}
            </Tag>
            <ElementFooter elem={elem} />
          </Paragraph>
        )
        break;
      case LogsConstants.DB_RECORD_DELETED:
        entity = splitModuleAndEntityName(elem?.revision?.entity)

        return (
          <Paragraph>
            <div style={{ marginBottom: 8 }}>
              <span><Link to={`/IdentityManagerModule/Users/${elem.userId}`}>
                {elem.userName}
              </Link> <strong>DELETED </strong></span>
            </div>
            <Tag>
              <span>{changeToCapitalCase(entity?.entityName)} </span>
              {checkLink(elem, entity)}
            </Tag>
            <ElementFooter elem={elem} />
          </Paragraph>
        )
        break;
      case LogsConstants.DB_RECORD_STAGE_UPDATED:
        stageId = elem?.revision?.stageId
        stage = stageId && elem.associations?.find((item: any) => item.id === stageId)
        entity = splitModuleAndEntityName(elem?.revision?.entity)

        return (
          <Paragraph>
            <div style={{ marginBottom: 8 }}>
              <span><Link to={`/IdentityManagerModule/Users/${elem.userId}`}>
                {elem.userName}
              </Link> <strong>MOVED </strong></span>
            </div>
            <Tag>
              <span>{changeToCapitalCase(entity?.entityName)} </span>
            </Tag>
            <div style={{ fontSize: 12 }}>to stage</div>
            <Tag>
              <Link to={`/${entity?.moduleName}/${entity?.entityName}/${elem?.recordId}`}>
                {stage?.name || elem?.revision?.stageId}
              </Link>
            </Tag>
            <ElementFooter elem={elem} />
          </Paragraph>
        )
        break;
      case LogsConstants.DB_RECORD_ASSOCIATION_CREATED:
        parentRecordId = elem?.revision?.parentRecordId
        parent = parentRecordId && elem.associations?.find((item: any) => item.id === parentRecordId)
        childRecordId = elem?.revision?.childRecordId
        child = childRecordId && elem.associations?.find((item: any) => item.id === childRecordId)
        parentEntity = splitModuleAndEntityName(elem?.revision?.parentEntity)
        childEntity = splitModuleAndEntityName(elem?.revision?.childEntity)
        let text
        if(elem.revision?.childEntity==='SupportModule:Note'){
          const noteAssociation =elem.associations.filter((association:any) => association.entity==='SupportModule:Note')
          text=noteAssociation?.[0].columns?.[0]?.value
          text=text?`${text?.slice(0,9)}...`: undefined
        }

        return (
          <Paragraph>
            <div style={{ marginBottom: 8 }}>
            <Link to={`/IdentityManagerModule/Users/${elem.userId}`}>
                {elem.userName}
              </Link> <strong>CREATED </strong> a relationship between
            </div>
            <Tag>
              <span>{changeToCapitalCase(parentEntity?.entityName)} </span>
              {(checkParentLink(elem, parent))}
            </Tag>
            <div style={{ fontSize: 12 }}>and</div>
            <Tag>
              <span>{changeToCapitalCase(childEntity?.entityName)} </span>
              <Link to={`/${childEntity?.moduleName}/${childEntity?.entityName}/${elem?.revision?.childRecordId}`}>
                {child?.title || elem?.revision?.childRecordTitle || text || elem?.revision?.childRecordId}
              </Link>
            </Tag>
            <ElementFooter elem={elem} />
          </Paragraph>
        )
        break;
      case LogsConstants.DB_RECORD_ASSOCIATION_UPDATED:
        parentRecordId = elem?.revision?.parentRecordId
        parent = parentRecordId && elem.associations?.find((item: any) => item.id === parentRecordId)
        childRecordId = elem?.revision?.childRecordId
        child = childRecordId && elem.associations?.find((item: any) => item.id === childRecordId)
        parentEntity = splitModuleAndEntityName(elem?.revision?.parentEntity)
        childEntity = splitModuleAndEntityName(elem?.revision?.childEntity)

        return (
          <Paragraph>
            <div style={{ marginBottom: 8 }}>
            <Link to={`/IdentityManagerModule/Users/${elem.userId}`}>
                {elem.userName}
              </Link> <strong>UPDATED </strong> a relationship between
            </div>
            <Tag>
              <span>{changeToCapitalCase(parentEntity?.entityName)} </span>
              <Link to={`/${parentEntity?.moduleName}/${parentEntity?.entityName}/${elem?.revision?.parentRecordId}`}>
                {parent?.title || elem?.revision?.parentRecordTitle || elem?.revision?.parentRecordId}
              </Link>
            </Tag>
            <div style={{ fontSize: 12 }}>and</div>
            <Tag>
              <span>{changeToCapitalCase(childEntity?.entityName)} </span>
              <Link to={`/${childEntity?.moduleName}/${childEntity?.entityName}/${elem?.revision?.childRecordId}`}>
                {child?.title || elem?.revision?.childRecordTitle || elem?.revision?.childRecordId}
              </Link>
            </Tag>
            <ElementFooter elem={elem} />
          </Paragraph>
        )
        break;
      case LogsConstants.DB_RECORD_ASSOCIATION_DELETED:
        parentRecordId = elem?.revision?.parentRecordId
        parent = parentRecordId && elem.associations?.find((item: any) => item.id === parentRecordId)
        childRecordId = elem?.revision?.childRecordId
        child = childRecordId && elem.associations?.find((item: any) => item.id === childRecordId)
        parentEntity = splitModuleAndEntityName(elem?.revision?.parentEntity)
        childEntity = splitModuleAndEntityName(elem?.revision?.childEntity)

        return (
          <Paragraph>
            <div style={{ marginBottom: 8 }}>
            <Link to={`/IdentityManagerModule/Users/${elem.userId}`}>
                {elem.userName}
              </Link> <strong>DELETED </strong> a relationship between
            </div>
            <Tag>
              <span>{changeToCapitalCase(parentEntity?.entityName)} </span>
              <Link to={`/${parentEntity?.moduleName}/${parentEntity?.entityName}/${elem?.revision?.parentRecordId}`}>
                {parent?.title || elem?.revision?.parentRecordTitle || elem?.revision?.parentRecordId}
              </Link>
            </Tag>
            <div style={{ fontSize: 12 }}>and</div>
            <Tag>
              <span>{changeToCapitalCase(childEntity?.entityName)} </span>
              <Link to={`/${childEntity?.moduleName}/${childEntity?.entityName}/${elem?.revision?.childRecordId}`}>
                {child?.title || elem?.revision?.childRecordTitle || elem?.revision?.childRecordId}
              </Link>
            </Tag>
            <ElementFooter elem={elem} />
          </Paragraph>
        )
        break;

      // case LogsConstants.DB_RECORD_COLUMN_CREATED:
      //   return <span>{elem.type} </span>
      // case LogsConstants.DB_RECORD_COLUMN_UPDATED:
      //   return <span>{elem.type} </span>
      // case LogsConstants.DB_RECORD_ASSOCIATION_COLUMN_CREATED:
      //   return <span>{elem.type} </span>
      // case LogsConstants.DB_RECORD_ASSOCIATION_COLUMN_UPDATED:
      //   return <span>{elem.type} </span>
      default:
        return (
          <Paragraph>
            <div style={{ marginBottom: 8 }}><a>{elem.type}</a></div>
            <ElementFooter elem={elem} />
          </Paragraph>
        )
    }

  }

  return (
    <Timeline>
      {auditLogsReducer.list.length > 0 ? auditLogsReducer.list.map((elem: LogsUserActivityEntity, index: number) => (
        <Timeline.Item key={index}>
          {parseActivityFeedEvents(elem)}
        </Timeline.Item>
      )) : (
        <Empty/>
      )}
    </Timeline>
  );
};

const mapState = (state: any) => ({
  auditLogsReducer: state.auditLogsReducer,
});

export default connect(mapState)(ActivityFeed);
