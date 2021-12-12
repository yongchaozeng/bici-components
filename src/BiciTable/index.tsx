import React, {
  useState,
  useEffect,
  forwardRef,
  useRef,
  useImperativeHandle,
  FC,
  useCallback,
  useMemo,
} from 'react';
import { Table, Form, Input, Select, Button, DatePicker } from 'antd';
// import type { ColumnsType } from 'antd';

import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { QueryFilter } from 'bici-components';

import { useImmer } from 'use-immer';
import styles from './index.module.less';
import produce from 'immer';
const { RangePicker } = DatePicker;

interface PageParams {
  pageNum: number;
  pageSize: number;
  total?: number;
}
interface BiciTable {
  columns: React.ReactNode | any;
  request: React.ReactNode | any;
  style?: StyleSheet;
}
const PAGE_SIZE = 10;
const BiciTable = (props: BiciTable, ref: React.Ref<React.ReactNode>) => {
  const { request, columns } = props;
  const [tableForm] = Form.useForm();
  const [selectedRows, setSelectedRows] = useImmer<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useImmer<any[]>([]);
  const [page, setPage] = useImmer<PageParams>({
    pageSize: PAGE_SIZE,
    pageNum: 1,
  });

  const newColumns = [...columns];

  async function init(pageParams: PageParams = page) {
    const params: any = await tableForm.getFieldsValue();
    const res = await request({ ...params, ...pageParams });

    setSelectedRowKeys([]);
    setDataSource(res.data);
    setPage({
      ...pageParams,
      pageNum: res.pageNum,
      total: res.total,
    });
  }

  useEffect(() => {
    init(page);
  }, []);
  useImperativeHandle(ref, () => {
    return {
      init,
    };
  });
  const onSelectChange = (selectedRowKeys: React.Key[], selectedRows: any[]) => {
    setSelectedRowKeys(selectedRowKeys);
    setSelectedRows(selectedRows);
  };
  const moveRow: any = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      setDataSource(
        produce(dataSource, (e) => {
          const tmp = e[dragIndex];
          e[dragIndex] = e[hoverIndex];
          e[hoverIndex] = tmp;
        }),
      );
    },
    [dataSource],
  );
  const formList = useMemo(
    function () {
      return columns?.map((item: any, index: any) => {
        const { valueType = 'input', valueEnum } = item;
        const selectTypeEnum = {
          input: <Input />,
          select: <Select options={valueEnum} />,
        };

        return (
          <Form.Item name={item.dataIndex} label={item.title} key={index}>
            {selectTypeEnum[valueType as 'input' | 'select']}
          </Form.Item>
        );
      });
    },
    [columns],
  );
  return (
    <div>
      <QueryFilter
        form={tableForm}
        onFinish={(params) => {
          init();
        }}
      >
        {formList}
      </QueryFilter>

      <div className="flex-between" style={{ padding: '16px 0' }}>
        <div className={styles.title}>表格</div>
        <div>
          <Button style={{ marginRight: 10 }}>新建</Button>
          {/* <span style={{ fontSize: 20 }}>icon1 icon2 icon3</span> */}
        </div>
      </div>

      {selectedRowKeys.length !== 0 && (
        <div className={styles.selectContainer}>
          <div>
            已选择 {selectedRowKeys.length} 项目 &emsp;<a href="">取消选择</a>
          </div>
          <span className={styles.cancelText}>
            <a href="">批量删除</a>&emsp;
            <a href="">导出数据</a>
          </span>
        </div>
      )}

      <DndProvider backend={HTML5Backend}>
        <Table
          rowSelection={{
            onChange: onSelectChange,
            selectedRowKeys,
          }}
          rowKey="id"
          columns={newColumns}
          dataSource={dataSource}
          onRow={(record: any, index: any): any => ({
            index,
            moveRow,
          })}
          components={{
            body: {
              row: DraggableBodyRow,
            },
          }}
          pagination={{
            current: page.pageNum,
            pageSize: page.pageSize,
            total: page.total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: (pageNum: number, pageSize: any) => {
              init({ pageNum, pageSize });
            },
          }}
        />
      </DndProvider>
    </div>
  );
};

export default forwardRef(BiciTable);
const type = 'DraggableBodyRow';

const DraggableBodyRow: FC<{
  index: number;
  className: number;
  moveRow: (dragIndex: string, hoverIndex: number) => void;
  style: StyleSheet;
}> = ({ index, moveRow, className, style, ...restProps }) => {
  const ref = useRef<HTMLTableRowElement | null>(null);
  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: type,
    collect: (monitor) => {
      const { index: dragIndex }: { index: number } = monitor.getItem() || {};
      if (dragIndex === index) {
        return {};
      }
      return {
        isOver: monitor.isOver(),
        dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
      };
    },
    drop: (item) => {
      moveRow((item as any).index, index);
    },
  });
  const [, drag] = useDrag({
    type,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drop(drag(ref));

  return (
    <tr
      ref={ref}
      className={`${className}${isOver ? dropClassName : ''}`}
      style={{ cursor: 'move', ...style }}
      {...restProps}
    />
  );
};
