'use client';

import { useState } from 'react';
import { Form, Input, Button, Table, Select, Alert, Space, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import axios from 'axios';

interface VideoData {
  id: string;
  description: string;
  author: string;
  likes: string;
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
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const columns: ColumnsType<VideoData> = [
    {
      title: '视频ID',
      dataIndex: 'id',
      key: 'id',
      render: (text: string, record: VideoData) => (
        <a href={`https://www.tiktok.com/@${record.author}/video/${text}`} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
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
      title: '播放量',
      dataIndex: 'plays',
      key: 'plays',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    }
  ];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/author-videos', values);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
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

  const handleBatchUpload = async () => {
    if (!fileList.length) {
      setError('请先选择文件');
      return;
    }

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', fileList[0].originFileObj as Blob);

    try {
      const response = await axios.post('/api/batch-authors-videos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setData(response.data);
        setQueryInfo(null);
      } else {
        setData([]);
        setError('未找到视频');
      }
    } catch (error) {
      setError('批量查询失败，请检查文件格式');
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

      <div>
        <Upload
          accept=".txt"
          fileList={fileList}
          onChange={({ fileList }) => setFileList(fileList)}
          beforeUpload={() => false}
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>选择作者列表文件</Button>
        </Upload>
        <Button
          type="primary"
          onClick={handleBatchUpload}
          loading={loading}
          style={{ marginLeft: 16 }}
          disabled={!fileList.length}
        >
          批量查询
        </Button>
      </div>

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