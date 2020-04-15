import { UploadOutlined } from '@ant-design/icons';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { Button, message, Upload } from 'antd';
import React from 'react';
import Resizer from 'react-image-file-resizer';
import { connect } from 'react-redux';
import { getHostName } from '../../../../shared/http/helpers';
import { getRecordAssociationsRequest, IGetRecordAssociations } from '../../../recordsAssociations/store/actions';
import { getSchemaByIdRequest, ISchemaById } from '../../../schemas/store/actions';
import { SchemaReducerState } from '../../../schemas/store/reducer';

interface Props {
  schemaReducer: SchemaReducerState,
  record?: DbRecordEntityTransform,
  getAssociations: any,
  onSuccess?: any
}


class FileUploaderClickToUpload extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    this.fileUploadProps = this.fileUploadProps.bind(this);
  }

  resizeFile = (file: any) => new Promise(resolve => {
    Resizer.imageFileResizer(file, 1200, 1200, 'JPEG', 70, 0,
      uri => resolve(uri),
      'blob',
    );
  });

  beforeUpload = async (file: any) => {
    const isLt25M = file.size / 1024 / 1024 < 25;
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if(!isLt25M) {
      message.error('File must be smaller than 25MB!');
    }

    try {
      if(isJpgOrPng) {
        const blobFile = await this.resizeFile(file);
        const files = new File([ blobFile as BlobPart ], Date.now().toString() + '.jpeg', { type: 'image/jpeg' });
        return isLt25M && files;
      } else {
        const newFile = file ? new File([ file ], Date.now().toString() + '.' + file.name.split('.').pop(), {
          type: file.type,
          lastModified: file.lastModified,
        }) : false;
        return isLt25M && newFile;
      }
    } catch (err) {
      return isLt25M && file;
    }
  }

  public fileUploadProps() {
    const { record, onSuccess } = this.props;

    console.log('token', localStorage.getItem(`token`));

    return {
      name: 'file',
      multiple: false,
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem(`token`),
      },
      action: record ? `${getHostName()}/SchemaModule/v1.0/s3/files/${record?.id}/upload` : `${getHostName()}/SchemaModule/v1.0/s3/files/SchemaModule/File/upload`,
      onChange(info: any) {
        const { status } = info.file;
        if(status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if(status === 'done') {
          const fileDbRecord: DbRecordEntityTransform = info.file.response.data;
          console.log('uploaded_info_db_record', info.file.response.data);
          onSuccess(fileDbRecord);
          message.success(`${info.file.name} file uploaded successfully.`);
        } else if(status === 'error') {
          message.error(`${info.file.name} file upload failed.`);
        }
      },
      progress: {
        strokeColor: {
          '0%': '#108ee9',
          '100%': '#87d068',
        },
        strokeWidth: 3,
        format: (percent: any) => `${parseFloat(percent.toFixed(2))}%`,
      },
    }
  }


  render() {
    return (
      <Upload {...this.fileUploadProps()} beforeUpload={this.beforeUpload}>
        <Button icon={<UploadOutlined/>}>Click to Upload</Button>
      </Upload>
    )
  }
}

const mapState = (state: any) => ({
  userReducer: state.userReducer,
  schemaReducer: state.schemaReducer,
  recordReducer: state.recordReducer,
  recordAssociationReducer: state.recordAssociationReducer,
});

const mapDispatch = (dispatch: any) => ({
  getSchema: (payload: ISchemaById, cb: any) => dispatch(getSchemaByIdRequest(payload, cb)),
  getAssociations: (params: IGetRecordAssociations) => dispatch(getRecordAssociationsRequest(params)),
});

export default connect(mapState, mapDispatch)(FileUploaderClickToUpload);
