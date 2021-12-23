/**
 * @file:新版擎天规范-标签组件
 * @author : duci
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Input, Popconfirm, Dropdown } from 'antd';
import { biciNotification } from 'bici-transformers';
import { getTagsList, saveTags, updateTags, deleteTags } from '@/apis/tagsManage';
import { QtIcon } from '../../iconConfig';
import { VALUE_TAG_LIST_MAX, VALUE_TAG_MAX_LENGTH } from '../../constants';
import _ from 'lodash';
import { renderTooltipText, getStrRealLength } from '@/utils/index';
import styles from './BiciTagManager.module.css';

export const ItemTag = ({ id, tagId, name, tagName, onRemove, disabled, style }) => {
  return (
    <div
      key={id || tagId}
      className={`${styles.tagWrapper} ${styles.itemTagWrapper}`}
      style={{ ...style }}
    >
      {/* width: getStrRealLength(name || tagName) * 12, */}
      {name || tagName}
      {/* {renderTooltipText({ content: `${name || tagName}`, className: styles.itemTagName }, 10)} */}
      {!disabled && (
        <div
          className={styles.removeTagIcon}
          onClick={() => {
            !disabled && onRemove && onRemove(tagId);
          }}
        >
          +
        </div>
      )}
    </div>
  );
};
function AddItemTag({ onClick, style, disabled }) {
  return (
    <div
      style={{
        ...style,
        backgroundColor: '#FFF',
        color: disabled ? '#ccc' : '',
        width: '118px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
      }}
      className={`textClick ${styles.tagWrapper} ${styles.addItemTag} ${
        disabled ? styles.disabledTag : ''
      }`}
      onClick={() => !disabled && onClick()}
    >
      点击添加标签
    </div>
  );
}

class BiciTagManager extends Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef(); // 输入框实例

    this.state = {
      dataSourceCopy: [], // 数据源副本
      tagIsEdit: false, // 标签是否为“编辑”状态
      editTagInfo: {}, // 正在编辑中的标签信息
      menuVisible: false, // 面板显隐
      tagName: '',
    };
  }

  componentDidMount() {
    this.getLatestTagsList();
  }

  getLatestTagsList = async () => {
    const { deviceType } = this.props;
    const res = await getTagsList({ deviceType });
    const dataSourceCopy = res.tagList;
    this.setState({ dataSourceCopy });
  };

  onRemove = (tagId) => {
    const { dataSourceCopy } = this.state;
    const { onChange, selectData } = this.props;
    const tagIdList = selectData.filter((selected) => selected !== tagId);
    const tagList = dataSourceCopy.filter((item) =>
      tagIdList.some((selected) => selected === item.tagId),
    );
    onChange && onChange(tagList, tagIdList);
  };

  onDeleteTag = async () => {
    const { editTagInfo } = this.state;
    const { tagId } = editTagInfo;
    await deleteTags({ id: tagId });
    this.onRemove();
    this.setState({ tagIsEdit: false }, () => this.getLatestTagsList());
  };

  saveNewTags = async (isBlur) => {
    const { deviceType, onChange, selectData, tagLength } = this.props;
    const { tagName: newTagName, dataSourceCopy } = this.state;
    if (newTagName) {
      if (dataSourceCopy.some((item) => item.tagName === newTagName)) {
        return;
      }
      if (newTagName.length > tagLength) {
        biciNotification.info({ message: `标签字段长度最大为${tagLength}！` });
        return;
      }
      const { id: tagId } = await saveTags({ deviceType, name: newTagName });
      this.setState({ tagName: '' }, async () => {
        await this.getLatestTagsList(); // 拿到最新的tagList 类似于setState的回调
        const { dataSourceCopy } = this.state;
        let tagIdList = _.cloneDeep(selectData);
        tagIdList.push(tagId);
        const tagList = dataSourceCopy.filter((item) =>
          tagIdList.some((selected) => selected === item.tagId),
        );
        onChange && onChange(tagList, tagIdList);
      });
    }
  };

  onEditTag = async () => {
    const { editTagInfo } = this.state;
    const { deviceType } = this.props;
    const { tagId, tagName } = editTagInfo;
    await updateTags({ id: tagId, name: tagName, deviceType });
    this.setState({ tagIsEdit: false }, () => this.getLatestTagsList());
  };

  handleMenuVisibleChange = async (visible) => {
    this.setState({ menuVisible: visible }, () => {
      // if (!visible) {
      //   this.setState({ tagIsEdit: false })
      // }
    });
  };

  /**
   * 选择标签（支持反选）
   */
  selectedTag = (tagInfo) => {
    const { dataSourceCopy } = this.state;
    const { selectData, onChange, selectMax } = this.props;
    let tagIdList = _.cloneDeep(selectData);
    // 取消该标签的选中
    if (tagIdList.some((selected) => selected === tagInfo.tagId)) {
      tagIdList = tagIdList.filter((selected) => selected !== tagInfo.tagId);
    } else {
      tagIdList.push(tagInfo.tagId);
      if (tagIdList.length > selectMax) {
        biciNotification.info({ message: `可选择标签数最大为${selectMax}！` });
        return;
      }
    }
    const tagList = dataSourceCopy.filter((item) =>
      tagIdList.some((selected) => selected === item.tagId),
    );
    onChange && onChange(tagList, tagIdList);
    this.inputRef.current.focus();
  };

  renderdataSourcePanel = () => {
    const { tagIsEdit, dataSourceCopy, editTagInfo, tagName } = this.state;
    const { selectData, tagLength, maxPanelTagLength } = this.props;
    const filterDataSource = dataSourceCopy.filter((item) => item.tagName.indexOf(tagName) !== -1);
    const normalStatus = (
      <div>
        <div className={styles.normalStatusTitle}>已有标签</div>
        <div className={`${styles.normalStatus}`}>
          {filterDataSource.length ? (
            filterDataSource.map(({ tagId, tagName }) => {
              const isActive = selectData.some((selected) => selected === tagId);
              const isShowEli = maxPanelTagLength && tagName.length > maxPanelTagLength;
              return (
                <div
                  key={tagId}
                  className={`${styles.existenceTag}`}
                  style={{ marginBottom: '10px', paddingRight: '30px', position: 'relative' }}
                >
                  <div
                    style={{
                      opacity: isActive ? 0.5 : 1,
                      position: 'relative',
                      paddingLeft: '14px',
                      width: isShowEli ? '160px' : 'auto',
                    }}
                    className={`${styles.tagWrapper} ${styles.itemTagWrapper}`}
                    onClick={() => this.selectedTag({ tagId, tagName })}
                  >
                    <div className={styles.positiveIcon}>+</div>
                    {isShowEli ? renderTooltipText({ content: tagName }, 4) : <div>{tagName}</div>}
                  </div>
                  <QtIcon
                    className={styles.editIcon}
                    type="iconbianji"
                    onClick={() =>
                      this.setState({ tagIsEdit: true, editTagInfo: { tagId, tagName } })
                    }
                  />
                </div>
              );
            })
          ) : (
            <div className={styles.empty_status_wrapper}>
              <div style={{ textAlign: 'center' }}>
                <QtIcon className={styles.empty_icon} type="icondangqianchaxuntiaojianxiawurenwu" />
                <div className={styles.gray_text}>回车或点击界面空白处保存新标签</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
    const editStatus = (
      <div>
        <div className={styles.editTitleWrapper}>
          <div className={styles.normalStatusTitle}>编辑标签</div>
          <Popconfirm
            overlayClassName="tag_delete_popconfirm"
            icon={null}
            placement="topRight"
            title="确认删除当前标签？"
            okText="删除"
            onConfirm={this.onDeleteTag}
          >
            <div className={styles.removeIconWrapper}>
              <QtIcon className={styles.removeIcon} type="iconshanchu3" />
              <span>删除当前标签</span>
            </div>
          </Popconfirm>
        </div>
        <Input
          value={editTagInfo.tagName}
          style={{ height: '36px', width: '150px' }}
          onChange={(e) =>
            this.setState({ editTagInfo: { ...editTagInfo, tagName: e.target.value } })
          }
          onPressEnter={this.onEditTag}
          maxLength={tagLength}
        />
        <div className={styles.btnWrapper}>
          <Button className="tag_btn mr10" onClick={() => this.setState({ tagIsEdit: false })}>
            取消
          </Button>
          <Button type="primary" className="tag_btn" onClick={this.onEditTag}>
            保存修改
          </Button>
        </div>
        <div className={`${styles.gray_text} pt10`}>保存修改后将同时更新系统中已使用的标签信息</div>
      </div>
    );

    return <div className={styles.dataSourcePanel}>{tagIsEdit ? editStatus : normalStatus}</div>;
  };
  render() {
    const { menuVisible, tagName, dataSourceCopy } = this.state;
    const {
      isRequired,
      label,
      labelStyle,
      selectData,
      disabled,
      tagLength,
      style,
      maxPanelTagLength,
    } = this.props;
    let filterSelectData = [];
    if (dataSourceCopy.length) {
      selectData.map((selected) => {
        const currentTag = dataSourceCopy.filter(({ tagId }) => selected === tagId);
        if (currentTag.length) {
          filterSelectData.push(currentTag[0]);
        }
      });
    }
    let addItemTagStyle = {};
    if (!disabled) {
      addItemTagStyle = { position: 'absolute', top: 0 };
    }
    return (
      <div className="dpflex">
        {label && (
          <div className="form-label" style={{ ...labelStyle }}>
            {isRequired && <span className="form-labelRequired">*</span>}
            {label}
          </div>
        )}
        <div
          className="flex1"
          style={{ position: 'relative', top: '5px', display: 'flex', flexWrap: 'wrap', ...style }}
        >
          {filterSelectData && filterSelectData.length
            ? filterSelectData.map((selected) => (
                <ItemTag
                  key={selected.tagId}
                  {...selected}
                  disabled={disabled}
                  onRemove={this.onRemove}
                  style={{
                    width: 'fit-content',
                    lineHeight: '36px',
                  }}
                />
              ))
            : null}
          {disabled ? (
            <AddItemTag disabled={disabled} style={{ ...addItemTagStyle }} />
          ) : (
            <Dropdown
              overlay={this.renderdataSourcePanel()}
              trigger={['click']}
              visible={menuVisible}
              onVisibleChange={this.handleMenuVisibleChange}
            >
              <div style={{ width: '100px', position: 'relative' }}>
                <Input
                  style={{ height: '36px', width: '118px', fontSize: '14px' }}
                  ref={this.inputRef}
                  maxLength={tagLength}
                  placeholder={`最大长度为${tagLength}`}
                  value={tagName}
                  onPressEnter={this.saveNewTags}
                  onBlur={this.saveNewTags}
                  onChange={(e) => this.setState({ tagName: e.target.value })}
                />
                {!menuVisible && (
                  <AddItemTag
                    style={{ ...addItemTagStyle }}
                    onClick={() => {
                      this.setState({ menuVisible: true });
                      this.inputRef.current.focus();
                    }}
                  />
                )}
              </div>
            </Dropdown>
          )}
        </div>
      </div>
    );
  }
}
BiciTagManager.propTypes = {
  isRequired: PropTypes.bool, // 是否为必填
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  labelStyle: PropTypes.object, // label覆盖样式
  style: PropTypes.object, // form-content覆盖样式
  disabled: PropTypes.bool, // 标签是否被禁用
  // 业务相关参数
  deviceType: PropTypes.number, // 每个页面的标签，该值可能不同
  selectData: PropTypes.array.isRequired, // 已经选中的标签(id list)
  onChange: PropTypes.func, // 获取当前选中的标签
  tagLength: PropTypes.number || PropTypes.string, // 标签显示(可输入)最大长度
  maxPanelTagLength: PropTypes.number || PropTypes.string, // 选择标签面板中超出几个字显示省略号
  selectMax: PropTypes.number || PropTypes.string, // 最大能选中几个标签
};
BiciTagManager.defaultProps = {
  label: '',
  tagLength: VALUE_TAG_MAX_LENGTH, // 标签显示最大长度
  selectMax: VALUE_TAG_LIST_MAX, // 最大能选中几个标签
  selectData: [],
  maxPanelTagLength: 8,
};
export default BiciTagManager;
