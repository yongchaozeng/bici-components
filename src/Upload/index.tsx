import React, { FC, useEffect, useState, useMemo, ReactChild } from 'react';
import { Row, Col, Button, Form } from 'antd';
import { useUpdate } from 'ahooks';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
const BREAKPOINTS = {
  vertical: [
    // [breakpoint, cols, layout]
    [513, 1, 'vertical'],
    [785, 2, 'vertical'],
    [1057, 3, 'vertical'],
    [Infinity, 4, 'vertical'],
  ],
  default: [
    [513, 1, 'vertical'],
    [701, 2, 'vertical'],
    [1062, 3, 'horizontal'],
    [1352, 3, 'horizontal'],
    [Infinity, 4, 'horizontal'],
  ],
};

const QueryFilter: FC<{
  onFinish?: (params: any) => void;
  form: any;
}> = (props) => {
  const { children, onFinish, form } = props;
  const update = useUpdate();
  const [collapse, setCollapse] = useState<boolean>(false);
  const width = document.body.clientWidth;
  const config = BREAKPOINTS.default.find((e) => width < e[0]);
  const number = config![1] as number;
  const span = 24 / number;
  function size() {
    update();
  }
  useEffect(() => {
    window.addEventListener('resize', size);
    return () => {
      window.removeEventListener('resize', size);
    };
  }, []);

  let currentSpan = 0;
  const map = React.Children.toArray(children).map((item, index) => {
    if (24 - (currentSpan % 24) < span) {
      // 如果当前行空余位置放不下，那么折行
      currentSpan += 24 - (currentSpan % 24);
    }

    currentSpan += span;
    const dom =
      24 / span - 1 > index ? (
        <Col span={span} key={index}>
          {item}
        </Col>
      ) : (
        <Col span={span} style={{ display: 'none' }} key={index}>
          {item}
        </Col>
      );
    return collapse ? (
      <Col span={span} key={index}>
        {item}
      </Col>
    ) : (
      dom
    );
  });

  const offset = useMemo(() => {
    const offsetSpan = (currentSpan % 24) + span;

    return 24 - offsetSpan;
  }, [currentSpan, span]);
  const isTooShort = map.length < 24 / span;
  return (
    <Form
      form={form}
      labelCol={{ span: 6 }}
      onFinish={(values) => {
        onFinish?.(values);
      }}
      style={{
        padding: '20px 10px 0 10px',
        border: ' 1px solid #ebedf1',
        borderRadius: '1px',
      }}
      wrapperCol={{ span: 18 }}
    >
      <Row gutter={16}>
        {map}
        <Col
          span={span}
          offset={isTooShort || collapse ? offset : 0}
          style={{ textAlign: 'right' }}
        >
          <Button
            style={{ marginRight: 10 }}
            onClick={() => {
              form.resetFields();
            }}
          >
            重置
          </Button>
          <Button type="primary" htmlType="submit">
            查询
          </Button>
          {!isTooShort && (
            <a
              style={{ marginLeft: 10 }}
              onClick={() => {
                setCollapse(!collapse);
              }}
            >
              {collapse ? (
                <span>
                  收起
                  <UpOutlined />
                </span>
              ) : (
                <span>
                  展示
                  <DownOutlined />
                </span>
              )}
            </a>
          )}
        </Col>
      </Row>
    </Form>
  );
};

export default QueryFilter;
