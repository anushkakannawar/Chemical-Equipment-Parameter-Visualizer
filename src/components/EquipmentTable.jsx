import React from 'react';
import { Table, Card } from 'antd';

const EquipmentTable = ({ data, loading }) => {
    // Columns definition corresponding to the CSV headers
    const columns = [
        {
            title: 'Equipment Name',
            dataIndex: 'Equipment Name',
            key: 'Equipment Name',
        },
        {
            title: 'Type',
            dataIndex: 'Type',
            key: 'Type',
            filters: Array.from(new Set(data?.map(item => item.Type) || [])).map(type => ({ text: type, value: type })),
            onFilter: (value, record) => record.Type.indexOf(value) === 0,
        },
        {
            title: 'Flowrate',
            dataIndex: 'Flowrate',
            key: 'Flowrate',
            sorter: (a, b) => a.Flowrate - b.Flowrate,
        },
        {
            title: 'Pressure',
            dataIndex: 'Pressure',
            key: 'Pressure',
            sorter: (a, b) => a.Pressure - b.Pressure,
        },
        {
            title: 'Temperature',
            dataIndex: 'Temperature',
            key: 'Temperature',
            sorter: (a, b) => a.Temperature - b.Temperature,
        },
    ];

    return (
        <Card title="Equipment Data" bordered={false} style={{ marginBottom: 20 }}>
            <Table
                dataSource={data}
                columns={columns}
                rowKey={(record, index) => index} // Fallback rowKey
                loading={loading}
                pagination={{ pageSize: 10 }}
                scroll={{ x: true }}
            />
        </Card>
    );
};

export default EquipmentTable;
