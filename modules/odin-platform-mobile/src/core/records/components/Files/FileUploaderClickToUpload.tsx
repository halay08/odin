import { UploadOutlined } from '@ant-design/icons';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { Button, message, Upload } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { getRecordAssociationsRequest, IGetRecordAssociations } from '../../../recordsAssociations/store/actions';
import { getSchemaByIdRequest, ISchemaById } from '../../../schemas/store/actions';
import { SchemaReducerState } from '../../../schemas/store/reducer';

interface Props {
  schemaReducer: SchemaReducerState,
  record?: DbRecordEntityTransform,
  getAssociations: any,
  onSuccess?: any
}

const defaultUrl = process.env.REACT_APP_ODIN_API_URL;
const token = localStorage.getItem(`token`);


class FileUploaderClickToUpload extends React.Component<Props> {

  constructor(props: Props) {
    super(props);

    this.fileUploadProps = this.fileUploadProps.bind(this);
  }

  beforeUpload(file: any) {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if(!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if(!isLt2M) {
      message.error('Image must smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
  }

  public fileUploadProps() {
    const { record, onSuccess } = this.props;

    return {
      name: 'file',
      multiple: false,
      headers: {
        Authorization: 'Bearer ' + token,
      },
      action: record ? `${defaultUrl}SchemaModule/v1.0/s3/files/${record?.id}/upload` : `${defaultUrl}SchemaModule/v1.0/s3/files/SchemaModule/File/upload`,
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
  identityReducer: state.identityReducer,
  schemaReducer: state.schemaReducer,
  recordReducer: state.recordReducer,
  recordAssociationReducer: state.recordAssociationReducer,
});

const mapDispatch = (dispatch: any) => ({
  getSchema: (payload: ISchemaById, cb: any) => dispatch(getSchemaByIdRequest(payload, cb)),
  getAssociations: (params: IGetRecordAssociations) => dispatch(getRecordAssociationsRequest(params)),
});

export default connect(mapState, mapDispatch)(FileUploaderClickToUpload);
