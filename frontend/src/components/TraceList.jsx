
import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { Link } from 'react-router-dom';

const TraceList = () => {
    const [traces, setTraces] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTraces();
    }, []);

    const fetchTraces = async () => {
        try {
            const response = await apiClient.getTraces();
            const spans = response.data;

            const uniqueTraces = {};
            spans.forEach(span => {
                if (!uniqueTraces[span.traceId]) {
                    uniqueTraces[span.traceId] = {
                        traceId: span.traceId,
                        timestamp: span.timestamp,
                        rootSpanName: span.spanName || span.name,
                        spansCount: 0
                    };
                }
                uniqueTraces[span.traceId].spansCount++;
                if (span.timestamp < uniqueTraces[span.traceId].timestamp) {
                    uniqueTraces[span.traceId].timestamp = span.timestamp;
                    uniqueTraces[span.traceId].rootSpanName = span.spanName || span.name;
                }
            });

            setTraces(Object.values(uniqueTraces));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching traces:', error);
            setLoading(false);
        }
    };

    if (loading) return <div>Loading traces...</div>;

    return (
        <div>
            <h2>Available Traces</h2>
            {traces.length === 0 ? (
                <div className="no-data">
                    <p>No traces found. If you don't have a backend running, try enabling <strong>Demo Mode</strong> in the header.</p>
                </div>
            ) : (
                <ul className="trace-list">
                    {traces.map(trace => (
                        <li key={trace.traceId} className="trace-item">
                            <Link to={`/trace/${trace.traceId}`}>
                                <strong>Trace ID:</strong> {trace.traceId}<br />
                                <strong>Root Span:</strong> {trace.rootSpanName}<br />
                                <small>Started: {new Date(trace.timestamp / 1000).toLocaleString()}</small><br />
                                <small>Spans: {trace.spansCount}</small>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TraceList;
