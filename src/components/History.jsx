import React from 'react';
import { List, Card, Typography } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';

const { Text } = Typography;

const History = ({ history, onItemClick }) => {
    return (
        <Card title="Upload History (Last 5)" bordered={false} style={{ height: '100%' }}>
            <List
                itemLayout="horizontal"
                dataSource={history}
                renderItem={(item) => (
                    <List.Item
                        style={{ cursor: 'pointer' }}
                        onClick={() => onItemClick(item)}
                        hoverable
                    >
                        <List.Item.Meta
                            avatar={<HistoryOutlined style={{ fontSize: '20px', color: '#1890ff' }} />}
                            title={<Text strong>Dataset ID: {item.id}</Text>}
                            description={`Uploaded at: ${new Date(item.upload_date).toLocaleString()}`}
                        />
                    </List.Item>
                )}
                locale={{ emptyText: 'No history found' }}
            />
        </Card>
    );
};

export default History;
