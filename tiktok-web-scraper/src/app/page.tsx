'use client';

import { Layout, Menu } from 'antd';
import { useState } from 'react';
import VideoInfo from '@/components/VideoInfo';
import AuthorVideos from '@/components/AuthorVideos';
import AuthorFollowers from '@/components/AuthorFollowers';
import VideoAnalysis from '@/components/VideoAnalysis';
import BatchProcess from '@/components/BatchProcess';

const { Header, Content, Sider } = Layout;

const menuItems = [
  { key: 'video-info', label: '视频信息查询' },
  { key: 'author-videos', label: '作者视频查询' },
  { key: 'author-followers', label: '作者粉丝查询' },
  { key: 'video-analysis', label: '视频帧分析' },
  { key: 'batch-process', label: '批量视频处理' }
];

export default function Home() {
  const [selectedKey, setSelectedKey] = useState('video-info');

  const renderContent = () => {
    switch (selectedKey) {
      case 'video-info':
        return <VideoInfo />;
      case 'author-videos':
        return <AuthorVideos />;
      case 'author-followers':
        return <AuthorFollowers />;
      case 'video-analysis':
        return <VideoAnalysis />;
      case 'batch-process':
        return <BatchProcess />;
      default:
        return <VideoInfo />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <h1 style={{ margin: 0, fontSize: '18px' }}>TikTok数据采集工具</h1>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
            onSelect={({ key }) => setSelectedKey(key)}
          />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
