import { FC, useState, useEffect } from 'react';
import { useToggle } from 'ahooks';
import { Button, Popover, Upload, message } from 'antd';
import classNames from 'classnames';
import styles from './index.module.less';

const UploadButton: FC<{
  onUpload: (file: File) => void;
}> = (props) => {
  const { onUpload } = props;
  const [visible, { toggle }] = useToggle();
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!visible) {
      setFile(null);
    }
  }, [visible]);

  function beforeUpload(file: File) {
    if (
      file.type !== 'application/vnd.ms-excel' &&
      file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      message.error(`${file.name} 不是excel文件！`);
      return false;
    }

    setFile(file);

    return false;
  }

  const content = (
    <div style={{ textAlign: 'center', width: 230, padding: '10px 0' }}>
      <Upload maxCount={1} itemRender={() => <></>} accept=".xls,.xlsx" beforeUpload={beforeUpload}>
        <div
          className={classNames(styles.upload, file ? styles.iconExcel : styles.uploadIcon)}
        ></div>
      </Upload>
      {file ? <div>{file.name}</div> : <div>上传文件</div>}
      <div className="flex" style={{ marginTop: 10 }}>
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
  async function handleUpload() {
    onUpload(file!);
  }
  return (
    <Popover placement="bottom" content={content} visible={visible} trigger="click">
      <Button
        size="large"
        onClick={() => {
          toggle(true);
        }}
        style={{ margin: '0 10px', width: 104 }}
      >
        文件上传
      </Button>
    </Popover>
  );
};
export default UploadButton;
