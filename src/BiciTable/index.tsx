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
import moment from 'moment';
import {
  ConfigProvider,
  Table,
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  Typography,
  Tooltip,
  Dropdown,
  Menu,
} from 'antd';
import ErrorBoundary from '../components/ErrorBoundary';
import Field from '@ant-design/pro-field';

// import type { ColumnsType } from 'antd';

import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { QueryFilter } from 'bici-components';
import { EllipsisOutlined } from '@ant-design/icons';

import { useImmer } from 'use-immer';
import styles from './index.module.less';
import produce from 'immer';
const { RangePicker } = DatePicker;
const { Option } = Select;
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

export const reduceWidth = (width?: string | number): string | number | undefined => {
  if (width === undefined) {
    return width;
  }
  if (typeof width === 'string') {
    if (!width.includes('calc')) {
      return `calc(100% - ${width})`;
    }
    return width;
  }
  if (typeof width === 'number') {
    return (width as number) - 32;
  }
  return width;
};

export const TableDropdown: FC<{
  menu: { key: string; name: string }[];
  onSelect?: ({ key, name }: { key: string; name: string }) => void;
}> = (props) => {
  const { menu, onSelect = () => {} } = props;
  const menuContainer = () => {
    return (
      <Menu>
        {menu.map((item, index) => {
          return (
            <Menu.Item key={index}>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.antgroup.com"
                onClick={() => {
                  onSelect(item);
                }}
                style={{ padding: '0 20px' }}
              >
                {item.name}
              </a>
            </Menu.Item>
          );
        })}
      </Menu>
    );
  };

  return (
    <Dropdown overlay={menuContainer} placement="bottomLeft">
      <EllipsisOutlined style={{ color: '#1890ff', padding: '0 10px', cursor: 'pointer' }} />
    </Dropdown>
  );
};

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

  /*
columns:{
valueType:'input'
valueEnum:[]
    copyable: true,
     ellipsis: true,
    tip: '标题过长会自动收缩',
    formItemProps
filters: true,
    onFilter: true,
    search: false,
    hideInSearch

}

*/

  const newColumns = useMemo(() => {
    return columns.map((item: any, index: number) => {
      if (item.copyable || item.ellipsis) {
        item.render = (text: any) => {
          return (
            <>
              <Tooltip key={index} placement="topLeft" title={text}>
                <Typography.Paragraph
                  style={{
                    margin: 0,
                    padding: 0,
                  }}
                  copyable={item.copyable}
                  ellipsis={item.ellipsis}
                >
                  {text}
                </Typography.Paragraph>
              </Tooltip>
            </>
          );
        };
      }
      return item;
    });
  }, [columns]);

  async function init(pageParams: PageParams = page) {
    const params: any = await tableForm.getFieldsValue();
    const res = await request({ ...params, ...pageParams });

    setSelectedRowKeys([]);
    setDataSource(res?.data);
    setPage({
      ...pageParams,
      pageNum: res?.pageNum,
      total: res?.total,
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
  const formList = useMemo(() => {
    return columns?.map((item: any, index: any) => {
      const { valueType = 'input', valueEnum } = item;
      const selectTypeEnum = {
        input: <Input />,
        select: <Select options={valueEnum} />,
        dateTime: <DatePicker style={{ width: '100%' }} />,
        dateRange: <RangePicker />,
        dateTimeRange: <RangePicker showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" />,
      };
      // 屏蔽搜索框
      if (!item.hideInSearch || item.renderFormItem) {
        return (
          <Form.Item name={item.dataIndex} label={item.title} key={index}>
            {item.renderFormItem
              ? item.renderFormItem(item)
              : selectTypeEnum[valueType as 'input' | 'select']}
          </Form.Item>
        );
      }
    });
  }, [columns]);
  const query = useMemo(() => {
    return (
      <QueryFilter
        form={tableForm}
        onFinish={() => {
          init(
            produce(page, (value) => {
              value.pageNum = 1;
            }),
          );
        }}
      >
        {formList}
      </QueryFilter>
    );
  }, []);
  const batchContainer = useMemo(() => {
    return (
      <>
        {selectedRowKeys.length !== 0 && (
          <div className={styles.selectContainer}>
            <div>
              已选择 {selectedRowKeys.length} 项目 &emsp;
              <a
                onClick={() => {
                  // onSelectChange()
                  setSelectedRowKeys([]);
                }}
              >
                取消选择
              </a>
            </div>
            <span className={styles.cancelText}>
              <a href="">批量删除</a>&emsp;
              <a href="">导出数据</a>
            </span>
          </div>
        )}
      </>
    );
  }, []);

  return (
    // <Container.Provider initialState={props}>
    <ErrorBoundary>
      <ConfigProvider>
        <div className="flex-between" style={{ padding: '16px 0' }}>
          <div className={styles.title}>表格</div>
          <div>
            <Button style={{ marginRight: 10 }}>新建</Button>
          </div>
        </div>

        {query}
        {batchContainer}

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
      </ConfigProvider>
    </ErrorBoundary>
    // </Container.Provider>
  );
};

export default forwardRef(BiciTable);
