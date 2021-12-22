间隔数字框：

```tsx
import React, { useState } from 'react';
import { Form, Input } from 'antd';
import { InputNum } from 'bici-components';

export default () => {
  const checked = true;
  const [dataPointStartNum, setDataPointStartNum] = useState(999);
  function onDataPointFormChange(type, value) {
    setDataPointStartNum(value);
  }
  return (
    <>
      <InputNum
        isRequired
        isRange
        disabled={!checked}
        placeholder="起始序号"
        label={null}
        min={1}
        is
        unit={'$123'}
        precision={0}
        style={{ maxWidth: 80 }}
        value={dataPointStartNum}
        onChange={(val) => onDataPointFormChange('dataPointStartNum', val)}
      />
    </>
  );
};
```
