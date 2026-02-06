package comp5200m.sc22ao.project.tracingdemo;

import comp5200m.sc22ao.project.tracingdemo.model.Kind;
import comp5200m.sc22ao.project.tracingdemo.model.SpanLocalEndpoint;
import comp5200m.sc22ao.project.tracingdemo.model.SpanTags;
import comp5200m.sc22ao.project.tracingdemo.model.TraceSpan;
import comp5200m.sc22ao.project.tracingdemo.repository.TracingRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {

    private final TracingRepository tracingRepository;

    public DataLoader(TracingRepository tracingRepository) {
        this.tracingRepository = tracingRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (tracingRepository.count() == 0) {
            loadDummyData();
        }
    }

    private void loadDummyData() {
        List<TraceSpan> spans = new ArrayList<>();

        // Trace 1
        TraceSpan span1 = createSpan("trace-001", "span-001", null, "GET /api/v1/products",
                Kind.SERVER, 1678886400000000L, 50000L, "product-service", "192.168.1.10");
        SpanTags tags1 = new SpanTags();
        tags1.setHttpMethod("GET");
        tags1.setHttpStatusCode(200);
        tags1.setIstioCanonicalService("product-service");
        span1.setTags(tags1);
        spans.add(span1);

        TraceSpan span2 = createSpan("trace-001", "span-002", "span-001", "SELECT * FROM products",
                Kind.CLIENT, 1678886400010000L, 30000L, "product-service", "192.168.1.10");
        SpanTags tags2 = new SpanTags();
        tags2.setIstioCanonicalService("product-service");
        span2.setTags(tags2);
        spans.add(span2);

        // Trace 2
        TraceSpan span3 = createSpan("trace-002", "span-003", null, "POST /api/v1/orders",
                Kind.SERVER, 1678886500000000L, 120000L, "order-service", "192.168.1.11");
        SpanTags tags3 = new SpanTags();
        tags3.setHttpMethod("POST");
        tags3.setHttpStatusCode(201);
        tags3.setIstioCanonicalService("order-service");
        span3.setTags(tags3);
        spans.add(span3);

        TraceSpan span4 = createSpan("trace-002", "span-004", "span-003", "check_inventory",
                Kind.CLIENT, 1678886500020000L, 40000L, "order-service", "192.168.1.11");
        SpanTags tags4 = new SpanTags();
        tags4.setIstioCanonicalService("order-service");
        span4.setTags(tags4);
        spans.add(span4);

        TraceSpan span5 = createSpan("trace-002", "span-005", "span-004", "GET /api/v1/inventory/123",
                Kind.SERVER, 1678886500025000L, 30000L, "inventory-service", "192.168.1.12");
        SpanTags tags5 = new SpanTags();
        tags5.setIstioCanonicalService("inventory-service");
        span5.setTags(tags5);
        spans.add(span5);

        tracingRepository.saveAll(spans);
        System.out.println("Dummy trace data loaded successfully.");
    }

    private TraceSpan createSpan(String traceId, String id, String parentId, String name,
            Kind kind, Long timestamp, Long duration,
            String serviceName, String ipv4) {
        TraceSpan span = new TraceSpan();
        span.setTraceId(traceId);
        span.setId(id);
        span.setParentId(parentId);
        span.setName(name);
        span.setKind(kind);
        span.setTimestamp(timestamp);
        span.setDuration(duration);

        SpanLocalEndpoint endpoint = new SpanLocalEndpoint();
        endpoint.setServiceName(serviceName);
        endpoint.setIpv4(ipv4);
        span.setLocalEndpoint(endpoint);

        return span;
    }
}
