## 表单筛选查询

Demo:

```tsx
import React from 'react';
import { Form, Input } from 'antd';
import { QueryFilter } from 'bici-components';
export default () => {
  const [tableForm] = Form.useForm();
  return (
    <QueryFilter
      form={tableForm}
      onFinish={(params) => {
        console.log('params', params);
      }}
    >
      <Form.Item name={'mark'} label={'test2'}>
        <Input></Input>
      </Form.Item>
      <Form.Item name={'test12'} label={'test22'}>
        <Input></Input>
      </Form.Item>
      <Form.Item name={'test13'} label={'test23'}>
        <Input></Input>
      </Form.Item>
      <Form.Item name={'test14'} label={'test24asdasdf'}>
        <Input></Input>
      </Form.Item>
      <Form.Item name={'test15'} label={'testsdsdsa25'}>
        <Input></Input>
      </Form.Item>
    </QueryFilter>
  );
};
```

```tsx
import React from 'react';
import { Form, Input } from 'antd';
import { QueryFilter } from 'bici-components';
export default () => {
  const [tableForm] = Form.useForm();
  return (
    <QueryFilter
      form={tableForm}
      onFinish={(params) => {
        console.log('params', params);
      }}
    >
      <Form.Item name={'test15'} label={'testsdsdsa25'}>
        <Input></Input>
      </Form.Item>
    </QueryFilter>
  );
};
```
