/**
 * @file : 公共模块 - 工步（步骤条）
 */
import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import styles from './index.module.css'
import { ZYTGIcon } from '@/iconConfig'
import mockStepList from './mockData'
import { renderTooltip } from '@/utils/index'
const POINT = (props) => {
  const { isProcessQualityTraceBackPoint } = props
  return (
    <div
      className={styles.point}
      style={{
        backgroundColor: isProcessQualityTraceBackPoint ? '#219BFF' : '',
      }}
    />
  )
}
const LINE = ({ onClickAdd, className, style, isEdit, showPoint, showLine, isProcessQualityTraceBackLine }) => (
  <div
    className={`${styles.line} ${className}`}
    style={{
      ...style,
      position: 'relative',
      backgroundColor:
        isProcessQualityTraceBackLine && showLine
          ? '#C0DEFF'
          : isProcessQualityTraceBackLine && !showLine
          ? 'white'
          : showLine
          ? '#333'
          : '',
      minHeight: '30px',
    }}
  >
    {showPoint && (
      <div style={{ position: 'absolute', left: '-4px', top: '-16px' }}>
        <POINT isProcessQualityTraceBackPoint={isProcessQualityTraceBackLine ? true : false} />
      </div>
    )}
    {isEdit && <ZYTGIcon className={styles.addIcon} type="icontianjia-zhong" onClick={onClickAdd} />}
  </div>
)

function BiciWorkSteps(props) {
  const {
    data,
    Extra,
    ExtraPosition,
    onClickAdd,
    isEdit,
    isShowName,
    wrapperStyle,
    nameAndEtraIsWrap,
    isProcessQualityTraceBack,
    isShowLine,
  } = props
  return (
    <div style={{ ...wrapperStyle }}>
      {data.length ? (
        data.map((step, i) => {
          const { uuid, id, name, stepName, width } = step
          return (
            <div key={id || uuid || i + 1}>
              {ExtraPosition === 'bottom' ? (
                // 上下布局，高度自适应
                <div>
                  <div className={styles.topWrapper}>
                    <POINT />
                    {isShowName && (
                      <div className={styles.stepName}>{renderTooltip({ content: stepName || name })}</div>
                    )}
                  </div>
                  <div className={styles.contentWrapper}>
                    {isShowLine && (
                      <LINE
                        isEdit={isEdit}
                        showLine={isEdit || (!isEdit && i !== data.length - 1)}
                        onClickAdd={() => onClickAdd && onClickAdd(i)}
                      />
                    )}
                    <div>{Extra && Extra(step)}</div>
                  </div>
                </div>
              ) : (
                // 左右布局，高度自适应
                <div className="dpflex" style={{ position: 'relative' }}>
                  {isShowLine && (
                    <LINE
                      isProcessQualityTraceBackLine={isProcessQualityTraceBack}
                      isEdit={isEdit}
                      className="mt22 mb4"
                      showPoint={true}
                      showLine={isEdit || (!isEdit && i !== data.length - 1)}
                      onClickAdd={() => onClickAdd && onClickAdd(i)}
                    />
                  )}

                  {nameAndEtraIsWrap && (
                    <div>
                      {isShowName && (
                        <div className={styles.stepName} style={width && { width: width }}>
                          {renderTooltip({ content: stepName || name })}
                        </div>
                      )}
                      <div>{Extra && Extra(step, i)}</div>
                    </div>
                  )}
                  {isShowName && !nameAndEtraIsWrap && (
                    <div className={styles.stepName} style={width && { width: width }}>
                      {renderTooltip({ content: stepName || name })}
                    </div>
                  )}
                  {!nameAndEtraIsWrap && <div>{Extra && Extra(step, i)}</div>}
                </div>
              )}
            </div>
          )
        })
      ) : (
        <div>
          <div className={`${styles.line} `} style={{ position: 'relative' }}>
            {isEdit && (
              <ZYTGIcon
                className={styles.addIcon}
                type="icontianjia-zhong"
                onClick={() => onClickAdd && onClickAdd(0)}
              />
            )}
            {ExtraPosition === 'right' && (
              <div style={{ position: 'absolute', left: '-4px', bottom: '-12px' }}>{isShowLine && <POINT />}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

BiciWorkSteps.propTypes = {
  data: PropTypes.array.isRequired, // 步骤条数据
  Extra: PropTypes.func, // 额外的部分
  ExtraPosition: PropTypes.string, // 额外的部分的位置( right 或者 bottom ，默认bottom )
  nameAndEtraIsWrap: PropTypes.bool, // 额外的部分和名字是否需要换行
  isEdit: PropTypes.bool, // 是否显示添加按钮
  isShowName: PropTypes.bool, // 是否显示工步名字
  wrapperStyle: PropTypes.object, // 最外层样式
  isShowLine: PropTypes.bool, // 是否显示线
}

BiciWorkSteps.defaultProps = {
  data: mockStepList,
  Extra: () => <div className={styles.Extra}>额外部分</div>,
  ExtraPosition: 'right',
  nameAndEtraIsWrap: false,
  isEdit: true,
  isShowName: true,
  isShowLine: true,
}

export default BiciWorkSteps
