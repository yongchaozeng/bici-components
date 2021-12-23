/**
 * @class 作为我的消息和左上角消息同步更新的桥梁
 */

class MessageBridge {
  todoList = []

  subscribe(fn) {
    this.todoList.push(fn)
  }

  broadcast(form) {
    // 发起位置到响应位置不同即可刷新页面
    this.todoList.forEach(({ func, address }) => form !== address && func())
  }
}

export const bridge = new MessageBridge()
