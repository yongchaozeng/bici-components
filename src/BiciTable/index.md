Demo:

```tsx
import React, { useState, useEffect } from 'react';
import { Form, Input } from 'antd';
import { QueryFilter, BiciTable, TableDropdown } from 'bici-components';
export default () => {
  const [tableForm] = Form.useForm();
  const [array, setArray] = useState([]);
  useEffect(() => {
    setTimeout(() => {
      setArray([
        {
          label: 'test1',
          value: 'value1',
        },
        {
          label: 'test2',
          value: 'value2',
        },
        {
          label: 'test3',
          value: 'value3',
        },
      ]);
    }, 2000);
  }, []);
  const request = async () => {
    const data = [...new Array(100)].map((item, index) => {
      return {
        coldDrawnFactoryText: {
          embryoRateQuantity: `炉号${index + 1}`,
        },
        id: `id${index}`,
        mark: `同一产品${index}`,
        onlyNum: '同一产品9MAL21575Ф4829D60127Ф3429D60127Ф342φ147φ12φ12',
        restoreState: 0,
        smeltingFactoryText: {
          num: '9MAL21575',
          steelIngotQuantity: '16266.00',
          spec: 'Ф482',
          materialCost: '102.00',
        },
        steelFactoryText: {
          spec: 'φ12',
          embryoRateQuantity: '352.00',
          materialQuantity: '267.00',
          materialCost: '34.00',
        },
        uploadTime: '2021-12-10',
      };
    });
    return Promise.resolve({
      code: '200',
      msg: 'success',
      pageNum: 1,
      pageSize: 1,
      total: 3,
      totalPage: 3,
      data,
    });
  };
  return (
    <BiciTable
      columns={[
        {
          title: '炉号',
          dataIndex: ['coldDrawnFactoryText', 'embryoRateQuantity'],
          filterType: 'input',
          copyable: true,
          hideInSearch: true,
          renderFormItem() {
            return <Input style={{ height: '82', color: 'red' }} />;
          },
        },
        {
          title: '牌号1',
          dataIndex: 'onlyNum',
          copyable: true,
          ellipsis: true,
          valueType: 'select',
          valueEnum: array,
          hideInSearch: true,
        },
        {
          title: '牌号2',
          dataIndex: 'onlyNum',
          ellipsis: true,
          valueType: 'select',
          valueEnum: array,
        },
        { title: '努不光彩', dataIndex: 'id', valueType: 'dateTime' },
        { title: '嘤嘤嘤', dataIndex: 'mark', valueType: 'dateRange' },
        { title: '增不绝口', dataIndex: 'uploadTime' },
        {
          title: '操作',
          width: '180px',
          valueType: 'option',
          render: (text, record, _, action) => [
            <a
              key="editable"
              onClick={() => {
                // action?.startEditable?.(record.id);
              }}
            >
              编辑
            </a>,
            <a href={record.url} target="_blank" rel="noopener noreferrer" key="view">
              查看
            </a>,
            <TableDropdown
              menu={[
                { key: 'copy', name: '复制' },
                { key: 'delete', name: '删除' },
              ]}
            />,
          ],
        },
      ]}
      request={(params = {}, sort, filter) => {
        return request(params);
      }}
    />
  );
};
```
