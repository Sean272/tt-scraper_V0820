'use client';

import { useState } from 'react';
import { Form, Input, Button, Table, Upload, message, Space } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import axios from 'axios';

interface FollowerData {
  author: string;
  followers: string;
  following: string;
  likes: string;
  videos: string;
}

export default function AuthorFollowers() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FollowerData[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const columns: ColumnsType<FollowerData> = [
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: '粉丝数',
      dataIndex: 'followers',
      key: 'followers',
    },
    {
      title: '关注数',
      dataIndex: 'following',
      key: 'following',
    },
    {
      title: '获赞数',
      dataIndex: 'likes',
      key: 'likes',
    },
    {
      title: '视频数',
      dataIndex: 'videos',
      key: 'videos',
    },
  ];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const response = await axios.post('/api/author-followers', {
        author: values.author
      });
      
      if (response.data) {
        setData([response.data]);
        message.success('查询成功');
      } else {
        message.error('未找到作者信息');
      }
    } catch (error) {
      message.error('查询失败，请检查输入');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchUpload = async () => {
    if (!fileList.length) {
      message.error('请先选择文件');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', fileList[0].originFileObj as Blob);

    try {
      const response = await axios.post('/api/batch-authors-followers', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        setData(response.data);
        message.success('批量查询成功');
      } else {
        message.error('批量查询失败');
      }
    } catch (error) {
      message.error('批量查询失败，请检查文件格式');
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

      <Table
        columns={columns}
        dataSource={data}
        rowKey="author"
        pagination={{ pageSize: 10 }}
      />
    </Space>
  );
}
