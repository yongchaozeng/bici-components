import React, { FC, useState, useEffect, useMemo } from 'react';
import { useToggle } from 'ahooks';
import { Button, Popover, Upload, message, Tooltip } from 'antd';
import classNames from 'classnames';
import styles from './index.module.less';

//multipartFiles
const UploadButton: FC<{
  title?: string;
  maxSize?: number;
  btnName?: string;
  downloadName?: string;
  downLoadExcelRequest?: any;
  disabled?: boolean;
  children?: JSX.Element;
  request: (params: FormData) => Promise<any>;
  fileName?: string;
  onSuccess?: (file: File) => void;
  onError?: (error: any) => void;
}> = (props) => {
  const {
    title,
    btnName = '文件上传',
    maxSize = 5,
    children,
    disabled = false,
    request,
    fileName = 'file',
    onSuccess,
    onError,
  } = props;

  const [visible, { toggle }] = useToggle();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const text = loading ? '正在上传' : file ? file.name : '上传文件';
  useEffect(() => {
    if (!visible) {
      setFile(null);
    }
  }, [visible]);

  function beforeUpload(file: File) {
    const { size, type, name } = file;
    const sizeLimit = 1024 * 1024 * maxSize;

    if (
      type !== 'application/vnd.ms-excel' &&
      type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      message.error(`${file.name} 不是excel文件！`);
      return false;
    }
    if (size > sizeLimit) {
      message.error(`${name}大于${maxSize}M`);
      return;
    }
    setFile(file);

    return false;
  }

  async function handleUpload() {
    try {
      setLoading(true);
      const formData = new FormData();
      if (file) {
        formData.append(fileName, file);
        await request(formData);
        setLoading(false);
        toggle();
        onSuccess?.(file);
        if (!onSuccess) {
          message.success(`文件上传成功！`);
        }
      }
    } catch (error: any) {
      setLoading(false);
      setError(true);
      onError?.(error);
    }
  }

  const content = (
    <div style={{ textAlign: 'center', width: 230, padding: '10px 0' }}>
      <Upload maxCount={1} itemRender={() => <></>} accept=".xls,.xlsx" beforeUpload={beforeUpload}>
        <div
          className={classNames(
            styles.upload,
            loading ? styles.iconLoading : file ? styles.iconExcel : styles.uploadIcon,
          )}
        ></div>
      </Upload>

      <Tooltip title={text}>
        <div className={styles.fileName}>{text}</div>
      </Tooltip>

      {error && (
        <div style={{ color: 'red', fontSize: 12, paddingTop: 5 }}>
          导入失败，可重试！
          <a
            onClick={() => {
              setFile(null);
              setError(false);
            }}
          >
            重新上传
          </a>
        </div>
      )}
      <div className="flex" style={{ marginTop: 10, justifyContent: 'space-evenly' }}>
        <Button
          onClick={() => {
            toggle();
          }}
          style={{ marginRight: 10, width: 100 }}
        >
          取消
        </Button>
        <Button disabled={!file} style={{ width: 100 }} type="primary" onClick={handleUpload}>
          确认导入
        </Button>
      </div>
    </div>
  );

  const render = useMemo(() => {
    return React.cloneElement(
      children || (
        <Button size="large" style={{ margin: '0 10px', width: 104 }}>
          {btnName}
        </Button>
      ),
      {
        disabled: disabled,
        onClick: () => {
          toggle(true);
        },
      },
    );
  }, [disabled]);

  return (
    <Popover title={title} placement="bottom" content={content} visible={visible} trigger="click">
      {render}
    </Popover>
  );
};
export default UploadButton;
