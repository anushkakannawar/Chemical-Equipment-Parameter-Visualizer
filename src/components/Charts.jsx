import React from 'react';
import { Card, Row, Col } from 'antd';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

const Charts = ({ summary }) => {
    if (!summary) return null;

    const { type_distribution, avg_flowrate, avg_pressure, avg_temperature } = summary;

    // 1. Equipment Type Distribution Chart (Pie Chart covers "Distribution" well)
    const typeLabels = Object.keys(type_distribution || {});
    const typeValues = Object.values(type_distribution || {});

    const distributionData = {
        labels: typeLabels,
        datasets: [
            {
                label: 'Count',
                data: typeValues,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                ],
                borderWidth: 1,
            },
        ],
    };

    // 2. Equipment Parameter Averages (Bar Chart)
    const averagesData = {
        labels: ['Flowrate', 'Pressure', 'Temperature'],
        datasets: [
            {
                label: 'Average Value',
                data: [avg_flowrate, avg_pressure, avg_temperature],
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };

    return (
        <div style={{ marginBottom: 20 }}>
            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <Card title="Equipment Type Distribution" bordered={false}>
                        <Pie data={distributionData} options={options} />
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card title="Parameter Averages" bordered={false}>
                        <Bar data={averagesData} options={options} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Charts;
