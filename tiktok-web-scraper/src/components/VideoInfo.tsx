'use client';

import { useState } from 'react';
import { Form, Input, Button, Table, message, Space } from 'antd';
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

export default function VideoInfo() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<VideoData[]>([]);

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
      title: '作者',
      dataIndex: 'author',
      key: 'author',
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

      const videoId = values.videoUrl.match(/\d+$/)?.[0] || values.videoUrl;
      
      const response = await axios.post('/api/video-info', { videoId });
      
      if (response.data) {
        setData([response.data]);
        message.success('查询成功');
      } else {
        message.error('未找到视频信息');
      }
    } catch (error) {
      message.error('查询失败，请检查输入');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Form form={form} layout="inline">
        <Form.Item
          name="videoUrl"
          rules={[{ required: true, message: '请输入视频链接或ID' }]}
          style={{ flex: 1 }}
        >
          <Input placeholder="输入视频链接或ID" style={{ width: 400 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            查询
          </Button>
        </Form.Item>
      </Form>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={false}
      />
    </Space>
  );
}
