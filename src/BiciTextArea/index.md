间隔数字框：

```tsx
import React, { useState } from 'react';
import { Form, Input } from 'antd';
import { BiciTextArea } from 'bici-components';
const { TextArea } = Input;

export default () => {
  const checked = true;
  const [dataPointStartNum, setDataPointStartNum] = useState('999');
  function onDataPointFormChange(type, value) {
    setDataPointStartNum(value);
  }
  return (
    <>
      <TextArea showCount style={{ height: 120 }} />,
      <BiciTextArea
        value={dataPointStartNum}
        placeholder="请输入备注"
        disabled={false}
        maxLength={150}
        onInputChange={(val) => setDataPointStartNum(val)}
      />
    </>
  );
};
```
