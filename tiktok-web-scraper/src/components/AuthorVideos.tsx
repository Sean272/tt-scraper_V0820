'use client';

import { useState } from 'react';
import { Form, Input, Button, Table, Select, Alert, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';

interface VideoData {
  id: string;
  description: string;
  author: string;
  likes: string;
  comments: string;
  plays: string;
  createTime: string;
  videoUrl: string;
}

interface QueryInfo {
  author: string;
  timeRange: string;
  timeUnit: string;
}

export default function AuthorVideos() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<VideoData[]>([]);
  const [queryInfo, setQueryInfo] = useState<QueryInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const columns: ColumnsType<VideoData> = [
    {
      title: '视频ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '点赞数',
      dataIndex: 'likes',
      key: 'likes',
    },
    {
      title: '评论数',
      dataIndex: 'comments',
      key: 'comments',
    },
    {
      title: '播放量',
      dataIndex: 'plays',
      key: 'plays',
    },
    {
      title: '发布时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '链接',
      dataIndex: 'videoUrl',
      key: 'videoUrl',
      render: (text: string) => (
        <a href={text} target="_blank" rel="noopener noreferrer">
          查看
        </a>
      ),
    },
  ];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/author-videos', values);
      
      if (response.data && response.data.length > 0) {
        setData(response.data);
        setQueryInfo(values);
      } else {
        setData([]);
        setError('未找到视频');
      }
    } catch (error) {
      setError('查询失败，请检查输入');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Form form={form} layout="inline">
        <Form.Item
          name="author"
          rules={[{ required: true, message: '请输入作者用户名' }]}
        >
          <Input placeholder="输入作者用户名" style={{ width: 200 }} />
        </Form.Item>
        <Form.Item
          name="timeRange"
          rules={[{ required: true, message: '请输入时间范围' }]}
        >
          <Input type="number" placeholder="时间范围" style={{ width: 100 }} />
        </Form.Item>
        <Form.Item
          name="timeUnit"
          initialValue="days"
        >
          <Select style={{ width: 100 }}>
            <Select.Option value="days">天</Select.Option>
            <Select.Option value="weeks">周</Select.Option>
            <Select.Option value="months">月</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            查询
          </Button>
        </Form.Item>
      </Form>

      {queryInfo && (
        <Alert
          message={`查询信息：作者 ${queryInfo.author} 最近 ${queryInfo.timeRange} ${
            queryInfo.timeUnit === 'days' ? '天' :
            queryInfo.timeUnit === 'weeks' ? '周' : '月'
          } 的视频`}
          type="info"
        />
      )}

      {error && <Alert message={error} type="error" />}

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </Space>
  );
}
