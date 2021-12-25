/**
 * @File: 消息通知，喇叭 + 消息列表
 */
import React from 'react'
import { withRouter } from 'react-router'
import { EllipsisOutlined } from '@ant-design/icons'
import { Badge, Popover, Tabs, Dropdown, Menu } from 'antd'
import { BiciWebSocket } from 'bici-transformers'
import { connect } from 'react-redux'
import moment from 'moment'
import styles from './Notification.module.css'
import { QtIcon } from '../../iconConfig'
import { MESSAGE_WS_URL } from '../../config'
import {
  requestMessageList,
  requestNotReadCount,
  requestRedaAllMessage,
  requestDeleteReddMessage,
} from '../../apis/message'
import { bridge } from './MessageBridge'

const { TabPane } = Tabs

class Notification extends React.Component {
  state = {
    visible: false, // 控制消息列表的显示
    messageList: [], // 消息列表
    systemMessageList: [], // 系统消息列表
    notReadCount: 0,
    current: 1,
    pageSize: 10,
    totalPage: 0,
  }

  componentDidMount = () => {
    bridge.subscribe({
      func: () => {
        this.requestList({ current: 1, messageList: [] })
        this.requestNotReadCount()
      },
      address: 'modal',
    }) // 订阅
    if (this.props.account.id) {
      this.connectWsAndRefresh()
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.account.id !== prevProps.account.id) {
      this.connectWsAndRefresh()
    }
  }

  connectWsAndRefresh() {
    const { id } = this.props.account
    const websocket = new BiciWebSocket({
      messageFormatType: '',
      baseUrl: `${MESSAGE_WS_URL}${id}`,
      onMessage: (data) => this.onWebSocketMessage(data),
    })
    websocket.init()
    this.websocket = websocket
    this.requestList({ current: 1 })
    this.requestNotReadCount()
  }

  async requestList(params) {
    ;(await params) && this.setState({ ...params })
    const { current, pageSize } = this.state
    const pagination = { current, pageSize }
    requestMessageList({ pagination, isSystemMessage: -1, type: 1 }).then(({ list, totalPage }) => {
      const messageList = this.state.messageList.slice()
      messageList.push(...list)
      this.setState({ messageList, totalPage })
    })
  }

  requestNotReadCount = () => {
    const { id } = this.props.account
    requestNotReadCount({ userId: id }).then((count) => this.setState({ notReadCount: count }))
  }

  onWebSocketMessage(message) {
    if (message !== 'HeartBeat') {
      const { messageList, systemMessageList, notReadCount } = this.state
      const content = JSON.parse(message)
      const newMessageList = messageList.slice()
      newMessageList.unshift({
        ...content,
        isRead: 1,
        createTime: moment(content.createTime).format('YYYY-MM-DD HH:mm:ss'),
      })
      this.setState({ notReadCount: notReadCount + 1, messageList: newMessageList })

      // this.requestNotReadCount()
      // this.requestList()
    } else {
      // console.log(message)
    }
  }

  componentWillUnmount = () => {
    this.websocket.close()
  }

  showMessage = (message) => {
    const { type } = message
    this.setState({ visible: false })
    this.props.history.push(`/message/user`)
  }

  onVisibleChange = (visible) => this.setState({ visible })

  onReadStatusChange = () => {
    this.setState({ visible: false })
  }

  handleHandleMessage = ({ key }) => {
    const { id } = this.props.account
    if (key === 'read') {
      // 已读所有
      requestRedaAllMessage({ userId: id }).then(() => {
        bridge.broadcast('modal')
        this.requestNotReadCount()
        const messageList = this.state.messageList.map(({ isRead, ...other }) => ({ isRead: 2, ...other }))
        this.setState({ messageList })
      })
    } else if (key === 'delete') {
      // 删除已读
      requestDeleteReddMessage({ userId: id }).then(() => {
        bridge.broadcast('modal')
        this.requestList({ current: 1, messageList: [] })
      })
    }
  }

  handleScroll = (event) => {
    // 滚动加载更多
    const { scrollTop, scrollHeight, clientHeight } = event.target
    const { current, totalPage } = this.state
    if (scrollHeight === scrollTop + clientHeight && totalPage !== current) {
      // 滚动到底部了
      const nextPage = current + 1
      this.requestList({ current: nextPage })
    }
  }

  renderMessageList = (messageList, messageType) => {
    const emptyStyle = {
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      height: 300,
    }
    // messageType :1 消息 2 系统消息
    return (
      <div className={styles.notificationContent} onScroll={this.handleScroll}>
        {messageList.length ? (
          messageList.map((item, idx) => {
            const { message = '', createTime, messageModule, isRead, messageTitle = '' } = item
            const detail = `${message.slice(0, 56)}...`
            // const title = ['点巡检任务', '故障维修任务', '设备报警', '设备润滑管理', '计量管理'][messageModule - 2]
            return (
              <div key={idx} className={styles.messageWrapper} onClick={() => this.showMessage(item)}>
                <Badge dot={isRead === 1} className="mr20" />
                <div className={styles.message}>
                  <div className={styles.messageTitle}>{messageTitle}</div>
                  <div>
                    <span className={styles.messageDesc}>{detail}</span>
                  </div>
                  <div className={styles.messageTime}>{createTime}</div>
                </div>
              </div>
            )
          })
        ) : (
          <div style={emptyStyle}>
            <QtIcon type="iconwushuju" style={{ fontSize: 48 }} />
            <p style={{ color: '#333' }} className="mt10">
              当前暂无消息
            </p>
          </div>
        )}
      </div>
    )
  }

  renderNotificationPane = () => {
    const { messageList, systemMessageList } = this.state
    const iconStyle = { fontSize: 14, marginRight: 20, cursor: 'pointer' }
    const moreMenu = (
      <Menu onClick={this.handleHandleMessage}>
        <Menu.Item key="read">
          <QtIcon type="iconyidu" style={iconStyle} />
          标记所有为已读
        </Menu.Item>
        <Menu.Item key="delete">
          <QtIcon type="iconshanchu1" style={iconStyle} />
          删除所有已读消息
        </Menu.Item>
      </Menu>
    )
    const more = (
      <Dropdown trigger={['click']} overlay={moreMenu}>
        <EllipsisOutlined style={iconStyle} />
      </Dropdown>
    )
    return (
      <div className={`${styles.notificationWrapper} no-tab-operation`}>
        <Tabs
          defaultActiveKey="1"
          tabBarStyle={{ boxShadow: '0px 4px 8px 0px rgba(32,32,34,0.08)', margin: ' 0 0 0 10px' }}
          tabBarExtraContent={more}
        >
          <TabPane tab="业务消息" key="business">
            {this.renderMessageList(messageList, 1)}
          </TabPane>
          <TabPane tab="系统推送" key="system" disabled>
            {this.renderMessageList(systemMessageList, 2)}
          </TabPane>
        </Tabs>
      </div>
    )
  }

  render() {
    const { visible, notReadCount } = this.state
    return (
      <Popover
        id="message"
        content={this.renderNotificationPane()}
        trigger="click"
        visible={visible}
        placement="bottomRight"
        arrowPointAtCenter
        onVisibleChange={this.onVisibleChange}
      >
        <Badge count={notReadCount} className={styles.notificationIcon}>
          <QtIcon type="icondaohangtiaobaojingchakan" style={{ fontSize: 14 }} />
        </Badge>
      </Popover>
    )
  }
}

function mapStateToProps(state) {
  const { account } = state
  return { account }
}

export default withRouter(connect(mapStateToProps)(Notification))
