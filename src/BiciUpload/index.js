import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { PlusOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons'
import { Row, Col, Modal, Upload, Popconfirm } from 'antd'
import { biciNotification } from 'bici-transformers'
import _ from 'lodash'
import { fetchDownloadFile } from '@/apis/commonUpload'
import { getFileExtension } from '@/utils/index'
import styles from './index.module.css'

const pictFileType = `image/bmp,image/jpeg,image/jpg,image/png,image/tif,image/pcx,image/tga,image/exif,image/fpx,image/svg,image/psd,image/cdr,image/pcd,image/dxf,image/ufo,image/eps,image/ai,image/raw,image/WMF,image/webp`
const excelAccept = '.xls,.xlsx'
const excellArr = [
  { type: '.xls', value: 'application/vnd.ms-excel' },
  { type: '.xlsx', value: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
]

export const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

class BiciUpload extends Component {
  state = {
    fileList: [],
    previewVisible: false,
    previewImage: false,
  }

  componentDidUpdate(prevProps) {
    const { label, fileList } = this.props
    if (prevProps.fileList !== fileList) {
      this.setState({ fileList })
    }
  }

  /**
   * 点击下载文件时的回调
   */
  onDownload = async (file) => {
    const { uid, id, name } = file
    const fileId = uid || id
    const url = await fetchDownloadFile({ id: fileId })
    const res = await fetch(url)
    const blob = await res.blob()
    const objectUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = name
    a.click()
    window.URL.revokeObjectURL(objectUrl)
  }

  /**
   * 上传文件前的回调  maxPictureNum
   */
  beforeUpload = (file) => {
    return new Promise(async (resolve, reject) => {
      const { maxPictureNum: max, maxSize = 10, listType, isExcell, onSelectFile, accept } = this.props
      // 文件大小限制，最大为10M
      const sizeLimit = 1024 * 1024 * maxSize
      const maxPictureNum = _.isNumber(max) ? max : null
      if (_.isNumber(max) && this.state.fileList.length > maxPictureNum - 1) {
        return
      }
      if (file.size > sizeLimit) {
        biciNotification.info({ message: `${file.name}大于${maxSize}M` })
        return
      }
      if (listType === 'picture-card') {
        file.url = await getBase64(file)
      }
      if (listType === 'picture-card' && (!file.type || pictFileType.indexOf(file.type) === -1)) {
        biciNotification.info({ message: '不支持上传此文件格式' })
        return
      }
      const fileExtension = getFileExtension(file.name)
      if (accept && !accept.split(',').some((acceptItem) => fileExtension === acceptItem)) {
        biciNotification.info({ message: '不支持上传此文件格式' })
        return
      }

      const currentFileType = excellArr.filter((item) => item.value === file.type)
      const fileNameLastPointIndex = file.name.lastIndexOf('.')
      const fileType = file.name.slice(fileNameLastPointIndex, file.name.length)
      if (isExcell && !currentFileType.length && fileType !== '.xls' && fileType !== '.xlsx') {
        biciNotification.warning({ message: '只能上传.xls和.xlsx文件类型！' })
        return
      }
      this.setState(
        (state) => ({
          fileList: [...state.fileList, file],
        }),
        () => {
          onSelectFile && onSelectFile(this.state.fileList)
        }
      )
      reject(file)
    })
  }

  /**
   * 取消预览
   */
  handleCancel = () => this.setState({ previewVisible: false })

  /**
   * 预览文件
   */
  handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj)
    }
    this.setState({
      previewImage: file.url || file.preview,
      previewVisible: true,
    })
  }

  /**
   * 删除
   */
  onRemove = (file) => {
    const { onRemoveFile } = this.props
    onRemoveFile && onRemoveFile(file)
  }

  render() {
    const { fileList, previewVisible, previewImage } = this.state
    const {
      label,
      maxPictureNum,
      disabled = false,
      isRequired = false,
      uploadButton,
      showUploadButton,
      isExcell,
      accept,
      listType,
      deleteIconHasPopConfirm,
      style,
      labelStyle,
      fileItemStyle,
    } = this.props
    const max = maxPictureNum
    const uploadDefaultButton = (
      <span>
        <PlusOutlined />
        <span className="ant-upload-text">上传</span>
      </span>
    )

    let dynamicProps = { accept: pictFileType }
    if (isExcell) {
      dynamicProps.accept = excelAccept
    }
    if (accept) {
      dynamicProps.accept = accept
    }
    let props = {
      fileList,
      multiple: true,
      ..._.omit(this.props, ['fileList', 'style', 'labelStyle']),
      ...dynamicProps,
      beforeUpload: this.beforeUpload,
    }
    if (listType === 'picture-card') {
      props.onPreview = this.handlePreview
      props.onDownload = this.onDownload
      props.onRemove = this.onRemove
    }
    if (listType === 'text') {
      props.showUploadList = false
    }
    return (
      <div className="dpflex" style={{ width: '100%' }}>
        {label && (
          <div className="form-label" style={{ ...labelStyle }}>
            {isRequired && <span className="form-labelRequired">*</span>}
            {label}：
          </div>
        )}
        <div className="flex1" style={{ width: 'inherit' }}>
          <Row style={{ ...style }}>
            <Col span={24}>
              {showUploadButton && (
                <Upload className="biciUpload" disabled={disabled} {...props}>
                  {showUploadButton
                    ? fileList.length >= max && _.isNumber(max)
                      ? null
                      : uploadButton || uploadDefaultButton
                    : null}
                </Upload>
              )}
            </Col>
            {listType === 'text' &&
              fileList.map((item, index) => (
                <Col
                  span={24}
                  key={item.id || item.uid}
                  style={{ marginTop: !showUploadButton ? '-5px' : '', ...fileItemStyle }}
                  className={`${showUploadButton && index === 0 && 'mt10'} ${styles.fileItem}`}
                >
                  <span
                    style={{ display: 'inline-block', width: '-webkit-fill-available' }}
                    className="ellipsisStyle"
                    title={item.name}
                  >
                    {item.name}
                  </span>
                  {!disabled && (
                    <DownloadOutlined
                      className={styles.icon}
                      style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
                      onClick={() => !disabled && this.onDownload(item)}
                    />
                  )}
                  {!disabled ? (
                    deleteIconHasPopConfirm ? (
                      <Popconfirm
                        title="确定删除该条数据？"
                        placement="topRight"
                        okText="确定"
                        cancelText="取消"
                        onConfirm={() => !disabled && this.onRemove(item)}
                      >
                        <DeleteOutlined
                          className={styles.icon}
                          style={{ marginLeft: '8px', cursor: disabled ? 'not-allowed' : 'pointer' }}
                        />
                      </Popconfirm>
                    ) : (
                      <DeleteOutlined
                        className={styles.icon}
                        style={{ marginLeft: '8px', cursor: disabled ? 'not-allowed' : 'pointer' }}
                        onClick={() => !disabled && this.onRemove(item)}
                      />
                    )
                  ) : (
                    ''
                  )}
                </Col>
              ))}
          </Row>
          <Modal visible={previewVisible} bodyStyle={{ padding: 40 }} footer={null} onCancel={this.handleCancel}>
            <img alt="example" style={{ width: '100%' }} src={previewImage} />
          </Modal>
        </div>
      </div>
    )
  }
}

BiciUpload.propTypes = {
  style: PropTypes.object, // 表单内容样式（除开label）
  labelStyle: PropTypes.object, // label样式
  maxSize: PropTypes.number, // 单次文件限制大小（M）
  maxPictureNum: PropTypes.number, // 上传最大照片数
  onRemoveFile: PropTypes.func, // 移除照片事件
  onSelectFile: PropTypes.func, // 选择文件回调，返回最新的文件列表
  uploadButton: PropTypes.element, // 上传文件按钮
  showUploadButton: PropTypes.element, // 是否显示上传文件按钮
  fileItemStyle: PropTypes.object, // 文件列表样式
}
BiciUpload.defaultProps = {
  maxSize: 10,
  listType: 'picture-card',
  showUploadButton: true, // 是否显示上传文件按钮
  deleteIconHasPopConfirm: false, // 删除文件是否需要二次确认icon
}

export default BiciUpload
