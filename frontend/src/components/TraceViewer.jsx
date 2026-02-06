
import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useParams, Link } from 'react-router-dom';

const TraceViewer = () => {
    const { traceId } = useParams();
    const [rootNode, setRootNode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSpan, setSelectedSpan] = useState(null);

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

    return (
        <div className="trace-viewer">
            <Link to="/">&larr; Back to Traces</Link>
            <h3>Trace: {rootNode.spanName}</h3>
            <div className="trace-summary">
                <div>
                    <strong>Root Service:</strong> {rootNode.service}<br />
                </div>
                <div>
                    <strong>Total Duration:</strong> {(totalDuration / 1000).toFixed(2)} ms <br />
                </div>
                <div>
                    <strong>Start:</strong> {new Date(rootNode.timestamp / 1000).toLocaleString()}
                </div>
            </div>

            <div className="gantt-chart">
                <TreeGraph rootNode={rootNode} totalDuration={totalDuration} onSpanClick={setSelectedSpan} />
            </div>

            {selectedSpan && (
                <SpanDrawer
                    span={selectedSpan}
                    onClose={() => setSelectedSpan(null)}
                />
            )}
        </div>
    );
};

const SpanDrawer = ({ span, onClose }) => {
    return (
        <div className="span-drawer-overlay" onClick={onClose}>
            <div className="span-drawer" onClick={e => e.stopPropagation()}>
                <div className="drawer-header">
                    <div>
                        <h3>{span.spanName}</h3>
                        <span className="service-tag">{span.service}</span>
                    </div>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="drawer-content">
                    <section className="detail-section">
                        <h4>Metadata</h4>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <span className="detail-label">Span ID</span>
                                <span className="detail-value">{span.spanId}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Start Time</span>
                                <span className="detail-value">{new Date(span.timestamp / 1000).toLocaleString()}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Duration</span>
                                <span className="detail-value">{(span.duration / 1000).toFixed(2)} ms</span>
                            </div>
                        </div>
                    </section>

                    {span.tags && Object.keys(span.tags).length > 0 && (
                        <section className="detail-section">
                            <h4>Tags</h4>
                            <div className="tag-list">
                                {Object.entries(span.tags).map(([key, value]) => (
                                    <div key={key} className="tag-item">
                                        <div className="detail-label">{key}</div>
                                        <div className="detail-value">{value}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {span.logs && span.logs.length > 0 && (
                        <section className="detail-section">
                            <h4>Logs</h4>
                            <div className="log-list">
                                {span.logs.map((log, i) => (
                                    <div key={i} className="log-item">
                                        <div className="log-time">
                                            +{((log.timestamp - span.timestamp) / 1000).toFixed(3)} ms
                                        </div>
                                        <div className="log-event">{log.event}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};

const TreeGraph = ({ rootNode, totalDuration, onSpanClick }) => {
    const rootTimestamp = rootNode.timestamp;

    const renderNode = (node, depth) => {
        const relativeStart = Math.max(0, node.timestamp - rootTimestamp);

        const widthPercent = (node.duration / totalDuration) * 100;
        const offsetPercent = (relativeStart / totalDuration) * 100;

        return (
            <div key={node.spanId} className="tree-row-wrapper">
                <div className="span-row" onClick={() => onSpanClick(node)}>
                    <div
                        className="span-label"
                        style={{ paddingLeft: `${depth * 20 + 16}px` }}
                        title={`${node.service} : ${node.spanName}`}
                    >
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
                                className={`span-info ${widthPercent >= 15
                                    ? 'inside'
                                    : (offsetPercent + widthPercent > 85 ? 'outside-left' : 'outside')
                                    }`}
                                title={`Duration: ${(node.duration / 1000).toFixed(2)}ms`}
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
