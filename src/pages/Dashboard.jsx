import React, { useEffect, useState } from 'react';
import { Layout, Row, Col, Typography, message, Spin, Button, Tooltip } from 'antd';
import { UploadOutlined, DownloadOutlined, FilePdfOutlined, LogoutOutlined } from '@ant-design/icons';
import UploadCSV from '../components/UploadCSV';
import EquipmentTable from '../components/EquipmentTable';
import Charts from '../components/Charts';
import History from '../components/History';
import { getSummary, getHistory, downloadReport } from '../services/api';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const Dashboard = ({ onLogout }) => {
    const [summary, setSummary] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch latest summary and history relative to no specific ID first, 
            // or better, fetch history and then the latest if available.
            const [summaryData, historyData] = await Promise.all([
                getSummary().catch(() => null), // Allow fail if no data yet
                getHistory()
            ]);

            if (summaryData) {
                setSummary(summaryData);
            }
            setHistory(historyData);
        } catch (error) {
            console.error(error);
            message.error('Failed to load initial data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUploadSuccess = () => {
        fetchData(); // Refresh data after upload
    };

    const handleHistoryClick = (item) => {
        // In a real app, this might fetch specific dataset by ID. 
        // For this requirements, the history item click "should load and display... summary, charts, table".
        // The backend API `GET /summary/` implies *latest* but maybe we need to fetch a specific one?
        // The instructions say "Clicking a history item should load and display...".
        // The provided API only lists `GET /summary/` (latest) and `GET /history/`.
        // If the backend doesn't support fetching by ID, we might only be able to show the latest.
        // However, usually `GET /summary/` might accept a query param? or maybe the backend state updates?
        // Given the constraints, I will assume `GET /summary/` retrieves the *current active* dataset,
        // OR the history item itself contains the data?
        // Re-reading: "GET /summary/ -> Latest dataset summary + data".
        // So clicking history likely implies we can't switch view unless we re-upload or if the API supported it.
        // BUT, if the user Requirement says "Clicking a history item should load and display...", I should try to support it.
        // Maybe I can assume `item` *is* the data? 
        // If `item` from history list is just metadata, and API lacks `GET /summary/:id`, I'm stuck.
        // I will assume for now that sticking to `getSummary` (Latest) is the safe bet, 
        // OR I implies `GET /summary/?id=...` which is common.
        // But the requirement says "GET /summary/ -> Latest dataset". 
        // It implies the backend tracks "Latest".
        // I'll add a comment about this limitation or assume the history item has the data effectively.
        // Let's assume the history object contains the summary data or I can set it directly if available.
        // If not, I'll just refresh.

        // Since history endpoints return summary compatible structure, we can just set data.
        // Ideally we might want to fetch full details by ID if needed, but for now assuming summary is enough
        // or re-fetching if structure differs.
        // Actually, backend history uses get_dataset_summary, so structure is same.
        setSummary(item);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDownloadReport = async () => {
        if (!summary || !summary.id) {
            message.warning("No dataset loaded to generate report for.");
            return;
        }
        try {
            const blob = await downloadReport(summary.id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report_${summary.filename.replace('.csv', '')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            message.success("Report downloaded successfully!");
        } catch (error) {
            console.error("Download failed", error);
            message.error("Failed to download report.");
        }
    };

    return (
        <Layout className="layout" style={{ minHeight: '100vh' }}>
            <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Title level={3} style={{ color: 'white', margin: 0 }}>
                    Chemical Equipment Parameter Visualizer
                </Title>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                    {summary && (
                        <Button
                            type="primary"
                            danger
                            icon={<FilePdfOutlined />}
                            onClick={handleDownloadReport}
                        >
                            Download Report
                        </Button>
                    )}
                    <Button
                        type="text"
                        danger
                        icon={<LogoutOutlined />}
                        onClick={onLogout}
                        style={{ color: 'white' }}
                    >
                        Logout
                    </Button>
                </div>
            </Header>
            <Content style={{ padding: '0 50px', marginTop: 32 }}>
                <div className="site-layout-content">
                    <Row gutter={[24, 24]}>
                        {/* Left Column: Upload & History */}
                        <Col xs={24} lg={6}>
                            <UploadCSV onUploadSuccess={handleUploadSuccess} />
                            <History history={history} onItemClick={handleHistoryClick} />
                        </Col>

                        {/* Right Column: Charts & Table */}
                        <Col xs={24} lg={18}>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: 50 }}>
                                    <Spin size="large" />
                                </div>
                            ) : summary ? (
                                <>
                                    <Charts summary={summary} />
                                    <EquipmentTable data={summary.data} loading={loading} />
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: 50 }}>
                                    <Typography.Text type="secondary">
                                        No data available. Upload a CSV file to get started.
                                    </Typography.Text>
                                </div>
                            )}
                        </Col>
                    </Row>
                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>
                Chemical Equipment Visualizer ©{new Date().getFullYear()} Created with Ant Design
            </Footer>
        </Layout>
    );
};

export default Dashboard;
