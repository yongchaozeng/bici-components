/**
 * @file:多行文本组件（使用原生标签，解决字数限制bug）
 */
import React, { Component } from 'react';
import _ from 'lodash';

export default class BiciTextArea extends Component {
  render() {
    const {
      isRequired,
      label,
      onInputChange,
      style,
      className = '',
      maxLength,
      isShowMaxText = true,
      isResize = true,
      bordered = true,
      value = '',
    } = this.props;
    const inputProps = _.omit(this.props, [
      'isRequired',
      'label',
      'onChange',
      'className',
      'isResize',
      'bordered',
      'onInputChange',
    ]);
    return (
      <div className={`dpflex ${className}`}>
        {label && (
          <div className="form-label">
            {isRequired && <span className="form-labelRequired">*</span>}
            {label}
          </div>
        )}
        <div className={`flex1 ${!bordered && 'input_no_border'}`}>
          <textarea
            className={`ant-input ${!isResize && 'resizeNone'}`}
            style={{ width: '100%', maxWidth: 360, fontSize: '14px', ...style }}
            maxLength={maxLength}
            onChange={(e) => {
              const val = e.target.value.replace(/\s+/g, '');
              onInputChange && onInputChange(val, e);
            }}
            rows="4"
            {...inputProps}
          />
          {maxLength && isShowMaxText && (
            <div className="taright" style={{ ..._.pick(style, ['maxWidth']) }}>
              {value ? value.length : 0}/{maxLength}字
            </div>
          )}
        </div>
      </div>
    );
  }
}
