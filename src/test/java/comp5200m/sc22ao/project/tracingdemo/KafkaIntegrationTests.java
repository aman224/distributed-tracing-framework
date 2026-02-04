package comp5200m.sc22ao.project.tracingdemo;

import comp5200m.sc22ao.project.tracingdemo.config.KafkaConfig;
import comp5200m.sc22ao.project.tracingdemo.model.TraceSpan;
import comp5200m.sc22ao.project.tracingdemo.repository.TracingRepository;
import comp5200m.sc22ao.project.tracingdemo.service.TraceProducer;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.annotation.DirtiesContext;

import java.time.Duration;
import java.util.Collections;
import java.util.List;

import static org.awaitility.Awaitility.await;
import static org.mockito.Mockito.verify;

@SpringBootTest
@DirtiesContext
@EmbeddedKafka(partitions = 1, brokerProperties = { "listeners=PLAINTEXT://localhost:9092", "port=9092" })
public class KafkaIntegrationTests {

    @Autowired
    private TraceProducer traceProducer;

    @MockBean
    private TracingRepository tracingRepository;

    @Captor
    private ArgumentCaptor<List<TraceSpan>> captor;

    @Test
    public void testTraceProductionAndConsumption() {
        TraceSpan span = new TraceSpan();
        span.setId("test-span-id");
        span.setTraceId("test-trace-id");
        span.setName("test-span");

        List<TraceSpan> spans = Collections.singletonList(span);

        traceProducer.sendSpan(spans);

        await().atMost(Duration.ofSeconds(10)).untilAsserted(() -> {
            verify(tracingRepository).saveAll(captor.capture());
            List<TraceSpan> capturedSpans = captor.getValue();
            Assertions.assertEquals(1, capturedSpans.size());
            Assertions.assertEquals("test-span-id", capturedSpans.get(0).getId());
        });
    }
}
