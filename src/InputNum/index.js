/**
 * @file:数字输入框公共组件   feat:支持输入框后面增加单位,数值范围
 */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { InputNumber } from 'antd';
// import { getStrRealLength } from '@/utils/index';
import styles from './index.module.less';
import _ from 'lodash';
/**
 * 比较范围数值的下限和上限大小、上限或下限是否为空
 * @param {*} range 范围数值
 */
export const validateRangeIsAbnomal = (range) => {
  let isAbnormal = false;
  let min = null;
  let max = null;
  if (range && range.length) {
    min = _.isNumber(range[0]) ? range[0] : null;
    max = _.isNumber(range[1]) ? range[1] : null;
    if (min !== null && max !== null) {
      isAbnormal = min > max;
    } else if (min === null || max === null) {
      isAbnormal = true;
    }
  }
  return isAbnormal;
};
const SingleInputNumber = (props) => {
  const inputProps = _.omit(props, ['unit', 'onChange']);
  const { disabled, prefix, unit, bordered, isRequired, isAbnormal, value, onChange, unitStyle } =
    props;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        lineHeight: '42px',
        ...props.inputNumberStyle,
      }}
      className={`input_no_border ${
        disabled ? styles.input_number_disabled : styles.input_number_wrapper
      } ${!bordered ? styles.custom_no_border : isAbnormal ? styles.abnrmal_border : ''}`}
    >
      {prefix && <div className="pl5 pr5">{prefix}</div>}
      <div className="flex1">
        <InputNumber
          style={{ width: '100%', borderRadius: '2px' }}
          {...inputProps}
          onChange={(value) => {
            onChange &&
              onChange(
                value !== null
                  ? String(value).replace(/[^\d.]/g, '')
                    ? Number(String(value).replace(/[^\d.]/g, ''))
                    : null
                  : value,
              );
          }}
        />
      </div>
      {unit && (
        <div className="pl5 pr5" style={{ ...unitStyle }}>
          {unit}
        </div>
      )}
    </div>
  );
};
const RangeInputNumber = (props) => {
  const {
    disabled,
    minDisabled,
    maxDisabled,
    bordered,
    unit,
    minPlaceholder,
    maxPlaceholder,
    value,
    onChange,
    isRequired,
    isAbnormal: isAbnormalProps,
    unitStyle,
  } = props;
  const inputProps = _.omit(props, ['unit', 'onChange']);
  let min = null; // 这里是返回或回显的value值，非限制最小值
  let max = null;
  if (value && value.length) {
    min = _.isNumber(value[0]) ? value[0] : null;
    max = _.isNumber(value[1]) ? value[1] : null;
  }
  let isAbnormal = false;
  if (min !== null && max !== null) isAbnormal = min > max;
  const isHasAbnormalBorder = isRequired && (min === null || max === null);
  return (
    <div
      className={`input_no_border bici_input_number  ${
        disabled || (minDisabled && maxDisabled)
          ? styles.input_number_disabled
          : styles.input_number_wrapper
      }  ${
        !bordered
          ? styles.custom_no_border
          : isAbnormalProps || isHasAbnormalBorder || isAbnormal
          ? styles.abnrmal_border
          : ''
      }`}
      style={{
        lineHeight: '42px',
        ...props.inputNumberStyle,
      }}
    >
      <InputNumber
        style={{ width: '100%', borderRadius: '2px' }}
        placeholder={minPlaceholder}
        className="left-handler-wrap"
        disabled={disabled || minDisabled}
        {...inputProps}
        value={min}
        onChange={(value) => {
          const val = value !== null ? (String(value) ? Number(String(value)) : null) : value;
          onChange && onChange([val, max], isAbnormal);
        }}
      />
      <div className="pl8 pr8">~</div>
      <InputNumber
        style={{ width: '100%', borderRadius: '2px' }}
        placeholder={maxPlaceholder}
        disabled={disabled || maxDisabled}
        {...inputProps}
        value={max}
        onChange={(value) => {
          const val =
            value !== null
              ? String(value).replace(/[^\d.]/g, '')
                ? Number(String(value).replace(/[^\d.]/g, ''))
                : null
              : value;
          onChange && onChange([min, val], isAbnormal);
        }}
      />
      {unit && (
        <div className="pl5 pr5" style={{ ...unitStyle }}>
          {unit}
        </div>
      )}
    </div>
  );
};
class BiciInputNumber extends Component {
  render() {
    const { isRequired, label, className, isRange, labelStyle, wrapperStyle } = this.props;
    const inputProps = _.omit(this.props, ['label', 'labelStyle', 'wrapperStyle']);
    return (
      <div className="dpflex">
        {label && (
          <div className="form-label" style={{ ...labelStyle }}>
            {isRequired && <span className="form-labelRequired">*</span>}
            {label}
          </div>
        )}
        <div className={`flex1 ${className}`} style={{ maxWidth: 320, ...wrapperStyle }}>
          {isRange ? <RangeInputNumber {...inputProps} /> : <SingleInputNumber {...inputProps} />}
        </div>
      </div>
    );
  }
}
BiciInputNumber.propTypes = {
  isRequired: PropTypes.bool, // 是否必填
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]), // label名
  labelStyle: PropTypes.object,
  wrapperStyle: PropTypes.object,
  inputNumberStyle: PropTypes.object, // 组件外层盒子样式
  unitStyle: PropTypes.object, // 单位样式
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.array]), // 值
  prefix: PropTypes.oneOfType([PropTypes.string, PropTypes.element]), // 前缀
  unit: PropTypes.oneOfType([PropTypes.string, PropTypes.element]), // 单位
  isAbnormal: PropTypes.bool, // 是否异常（主要用于标记红色边框）
  bordered: PropTypes.bool, // 是否有边框
  // 数字区间
  isRange: PropTypes.bool, // 是否为数字区间
  minPlaceholder: PropTypes.string,
  maxPlaceholder: PropTypes.string,
  minDisabled: PropTypes.bool,
  maxDisabled: PropTypes.bool,
  onChange: PropTypes.func, // 当为区间时，第一个返回参数：[min,max] ；第二个返回参数：上下限是否填写异常
};
BiciInputNumber.defaultProps = {
  isRange: false,
  bordered: true,
  placeholder: '请输入',
  minPlaceholder: '请输入',
  maxPlaceholder: '请输入',
};
export default BiciInputNumber;
