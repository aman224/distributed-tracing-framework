
import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useParams, Link } from 'react-router-dom';

const TraceViewer = () => {
    const { traceId } = useParams();
    const [rootNode, setRootNode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTraceTree();
    }, [traceId]);

    const fetchTraceTree = async () => {
        try {
            const response = await apiClient.getTraceTree(traceId);
            setRootNode(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching trace tree:', err);
            setError('Failed to load trace data.');
            setLoading(false);
        }
    };

    if (loading) return <div>Loading trace data...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!rootNode) return <div>No trace data found.</div>;

    return (
        <div className="trace-viewer">
            <Link to="/">&larr; Back to Traces</Link>
            <h3>Trace: {rootNode.spanName}</h3>
            <div className="trace-summary">
                <div>
                    <strong>Root Service:</strong> {rootNode.service}<br />
                </div>
                <div>
                    <strong>Total Duration:</strong> {rootNode.duration / 1000} ms <br />
                </div>
                <div>
                    <strong>Start:</strong> {new Date(rootNode.timestamp / 1000).toLocaleString()}
                </div>
            </div>

            <div className="gantt-chart">
                <TreeGraph rootNode={rootNode} />
            </div>
        </div>
    );
};

const TreeGraph = ({ rootNode }) => {
    const getEndTime = (node) => {
        let end = node.timestamp + node.duration;
        if (node.children) {
            node.children.forEach(child => {
                end = Math.max(end, getEndTime(child));
            });
        }
        return end;
    };

    const rootTimestamp = rootNode.timestamp;
    const endTime = getEndTime(rootNode);
    const totalDuration = Math.max(rootNode.duration, endTime - rootTimestamp);

    const renderNode = (node, depth) => {
        const relativeStart = Math.max(0, node.timestamp - rootTimestamp);

        const widthPercent = (node.duration / totalDuration) * 100;
        const offsetPercent = (relativeStart / totalDuration) * 100;

        return (
            <div key={node.spanId} className="tree-row-wrapper">
                <div className="span-row">
                    <div className="span-label" style={{ paddingLeft: `${depth * 20 + 16}px` }}>
                        <span className="service-name">{node.service}</span>
                        <span className="span-name">: {node.spanName}</span>
                    </div>
                    <div className="span-bar-container">

                        <div
                            className="span-bar"
                            style={{
                                width: `${Math.max(widthPercent, 0.5)}%`,
                                marginLeft: `${offsetPercent}%`
                            }}
                            title={`Start: +${(relativeStart / 1000).toFixed(2)}ms, Duration: ${(node.duration / 1000).toFixed(2)}ms`}
                        >

                            <span
                                className="span-info"
                                style={{
                                    left: (offsetPercent + widthPercent) > 90 ? (offsetPercent < 10 ? '0' : 'auto') : '100%',
                                    right: (offsetPercent + widthPercent) > 90 ? (offsetPercent < 10 ? 'auto' : '100%') : 'auto',
                                    marginLeft: (offsetPercent + widthPercent) > 90 ? (offsetPercent < 10 ? '0' : '0') : '5px',
                                    marginRight: (offsetPercent + widthPercent) > 90 ? (offsetPercent < 10 ? '0' : '5px') : '0',
                                    paddingLeft: (offsetPercent + widthPercent) > 90 && offsetPercent < 10 ? '8px' : '0',
                                    color: (offsetPercent + widthPercent) > 90 && offsetPercent < 10 ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface)',
                                    textAlign: (offsetPercent + widthPercent) > 90 ? (offsetPercent < 10 ? 'left' : 'right') : 'left'
                                }}
                            >
                                {(node.duration / 1000).toFixed(1)} ms
                            </span>
                        </div>
                    </div>
                </div>
                {node.children && node.children
                    .sort((a, b) => a.timestamp - b.timestamp)
                    .map(child => renderNode(child, depth + 1))
                }
            </div>
        );
    };

    return (
        <div className="tree-graph">
            <div className="span-row header-row">
                <div className="span-label header-label">Service & Operation</div>
                <div className="span-bar-container header-timeline">Timeline</div>
            </div>
            {renderNode(rootNode, 0)}
        </div>
    );
}

export default TraceViewer;
