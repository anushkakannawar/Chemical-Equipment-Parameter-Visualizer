import React, { useState } from 'react';
import { Upload, Button, message, Card } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { uploadFile } from '../services/api';

const UploadCSV = ({ onUploadSuccess }) => {
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (file) => {
        setUploading(true);
        try {
            await uploadFile(file);
            message.success('File uploaded successfully');
            if (onUploadSuccess) {
                onUploadSuccess(); // Trigger parent refresh
            }
        } catch (error) {
            console.error('Upload error:', error);
            message.error('Failed to upload file. Please try again.');
        } finally {
            setUploading(false);
        }
        return false; // Prevent automatic upload by Ant Design
    };

    const uploadProps = {
        beforeUpload: (file) => {
            const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
            if (!isCSV) {
                message.error('You can only upload CSV files!');
                return Upload.LIST_IGNORE;
            }
            return handleUpload(file);
        },
        showUploadList: false, // We handle the upload immediately, so no need for list
        accept: '.csv',
    };

    return (
        <Card title="Upload Dataset" bordered={false} style={{ marginBottom: 20 }}>
            <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />} loading={uploading} type="primary">
                    Click to Upload CSV
                </Button>
            </Upload>
            <div style={{ marginTop: 10, color: '#888' }}>
                Only .csv files are supported.
            </div>
        </Card>
    );
};

export default UploadCSV;
