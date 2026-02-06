
const generateId = (prefix, index, subIndex = '') => `${prefix}-${index}${subIndex ? '-' + subIndex : ''}`;
const BASE_TIME = Date.now() * 1000 - 3600000000;
const SERVICES = [
    'api-gateway',
    'auth-service',
    'product-service',
    'inventory-service',
    'pricing-service',
    'order-service',
    'payment-service',
    'shipping-service',
    'notification-service',
    'search-service',
    'recommendation-service',
    'redis-cache',
    'postgres-primary',
    'kafka-broker',
    'fraud-detection-service'
];
const SAMPLE_TRACES = [];
const createCheckoutTrace = (index, offsetMinutes) => {
    const traceId = generateId('trace-checkout', index);
    let spanCounter = 0;
    const getSpanId = () => generateId('span', index, spanCounter++);
    let startTime = BASE_TIME + (offsetMinutes * 60000000);
    const spans = [];
    const addSpan = (service, name, durationInfo, parentId = null) => {
        const spanId = getSpanId();
        const duration = durationInfo.base + (index * 100);
        const span = {
            traceId,
            spanId,
            parentSpanId: parentId,
            service,
            name,
            timestamp: startTime,
            duration: Math.floor(duration)
        };
        spans.push(span);
        return spanId;
    };
    const rootId = addSpan('api-gateway', 'POST /checkout', { base: 1200000 });
    startTime += 50000;
    const authId = addSpan('auth-service', 'validate-token', { base: 150000 }, rootId);
    startTime += 20000;
    addSpan('redis-cache', 'get-user-session', { base: 50000 }, authId);
    startTime += 180000;
    const orderId = addSpan('order-service', 'create-order', { base: 900000 }, rootId);
    startTime += 50000;
    const invId = addSpan('inventory-service', 'reserve-stock', { base: 200000 }, orderId);
    startTime += 50000;
    addSpan('postgres-primary', 'update-sku-lock', { base: 100000 }, invId);
    startTime += 200000;
    const priceId = addSpan('pricing-service', 'calculate-total', { base: 50000 }, orderId);
    startTime += 60000;
    const payId = addSpan('payment-service', 'process-payment', { base: 400000 }, orderId);
    startTime += 50000;
    addSpan('fraud-detection-service', 'analyze-risk', { base: 150000 }, payId);
    startTime += 200000;
    addSpan('stripe-gateway', 'charge-card', { base: 100000 }, payId);
    startTime += 450000;
    addSpan('kafka-broker', 'publish-order-created', { base: 20000 }, orderId);
    startTime += 100000;
    const notifId = addSpan('notification-service', 'consume-order-created', { base: 200000 }, rootId);
    addSpan('email-provider', 'send-confirmation', { base: 150000 }, notifId);
    return spans;
};
const createBatchAnalyticsTrace = (index, offsetMinutes) => {
    const traceId = generateId('trace-batch', index);
    let spanCounter = 0;
    const getSpanId = () => generateId('span-batch', index, spanCounter++);
    let startTime = BASE_TIME + (offsetMinutes * 60000000);
    const spans = [];
    const addSpan = (service, name, duration, parentId = null, startOffset = 0) => {
        const spanId = getSpanId();
        const span = {
            traceId,
            spanId,
            parentSpanId: parentId,
            service,
            name,
            timestamp: startTime + startOffset,
            duration: Math.floor(duration)
        };
        spans.push(span);
        return spanId;
    };
    const rootId = addSpan('analytics-service', 'run-nightly-batch', 5000000);
    const jobId = addSpan('job-coordinator', 'Orchestrate MapReduce', 4500000, rootId, 100000);
    const workerCount = 5;
    const workerStart = 200000;
    for (let i = 0; i < workerCount; i++) {
        const workerDur = 2000000 + (Math.random() * 1000000);
        addSpan(
            `worker-node-${i + 1}`,
            `process-shard-${i}`,
            workerDur,
            jobId,
            workerStart + (Math.random() * 50000)
        );
    }
    addSpan('db-warehouse', 'store-aggregates', 500000, jobId, 4000000);
    return spans;
};
function createRideShareTrace(index, offsetMinutes) {
    const traceId = generateId('trace-ride', index);
    let spanCounter = 0;
    const getSpanId = () => generateId('span-ride', index, spanCounter++);
    let startTime = BASE_TIME + (offsetMinutes * 60000000);
    const spans = [];
    const addSpan = (service, name, duration, parentId = null, startOffset = 0) => {
        const spanId = getSpanId();
        const span = {
            traceId,
            spanId,
            parentSpanId: parentId,
            service,
            name,
            timestamp: startTime + startOffset,
            duration: Math.floor(duration)
        };
        spans.push(span);
        return spanId;
    };
    const rootId = addSpan('mobile-api-gateway', 'POST /trips/request', 2200000);
    const authId = addSpan('identity-service', 'verify-token', 50000, rootId, 20000);
    addSpan('rider-mgmt-service', 'check-outstanding-balance', 80000, authId, 60000);
    const orchId = addSpan('trip-orchestrator', 'initiate-trip-match', 1800000, rootId, 150000);
    const geoId = addSpan('geo-spatial-service', 'find-nearby-drivers', 150000, orchId, 180000);
    addSpan('driver-status-service', 'filter-online', 40000, geoId, 250000);
    addSpan('driver-status-service', 'check-vehicle-type', 30000, geoId, 290000);
    const priceId = addSpan('surge-pricing-engine', 'calc-dynamic-fare', 120000, orchId, 180000);
    addSpan('eta-service', 'calc-route-time', 250000, priceId, 200000);
    const dispatchId = addSpan('dispatch-service', 'match-driver', 1200000, orchId, 500000);
    addSpan('push-notification', 'ping-driver-A', 50000, dispatchId, 550000);
    addSpan('push-notification', 'ping-driver-B', 50000, dispatchId, 700000);
    const acceptId = addSpan('driver-app-gateway', 'driver-accept-trip', 100000, dispatchId, 1500000);
    const tripId = addSpan('trip-management-service', 'create-trip-record', 200000, orchId, 1650000);
    addSpan('postgres-trips', 'insert-trip', 80000, tripId, 1700000);
    addSpan('push-notification', 'notify-rider-match', 60000, orchId, 1800000);
    return spans;
}
SAMPLE_TRACES.push(...createCheckoutTrace(0, 0));
SAMPLE_TRACES.push(...createBatchAnalyticsTrace(0, 5));
SAMPLE_TRACES.push(...createRideShareTrace(0, 10));
export const getMockTraces = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(SAMPLE_TRACES);
        }, 100);
    });
};
export const getMockTraceTree = (traceId) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const spans = SAMPLE_TRACES.filter(s => s.traceId === traceId);
            if (spans.length === 0) {
                reject(new Error("Trace not found"));
                return;
            }
            const spanMap = {};
            let root = null;
            spans.forEach(span => {
                spanMap[span.spanId] = { ...span, children: [] };
            });
            spans.forEach(span => {
                const node = spanMap[span.spanId];
                if (span.parentSpanId) {
                    if (spanMap[span.parentSpanId]) {
                        spanMap[span.parentSpanId].children.push(node);
                    }
                } else {
                    root = node;
                }
            });
            if (!root) {
                spans.sort((a, b) => a.timestamp - b.timestamp);
                root = spanMap[spans[0].spanId];
            }
            resolve(root);
        }, 50);
    });
};
