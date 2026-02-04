package comp5200m.sc22ao.project.tracingdemo.service;

import comp5200m.sc22ao.project.tracingdemo.config.KafkaConfig;
import comp5200m.sc22ao.project.tracingdemo.model.TraceSpan;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class TraceConsumer {

    private static final Logger logger = LoggerFactory.getLogger(TraceConsumer.class);

    private final TracingService tracingService;
    private final ObjectMapper objectMapper;

    public TraceConsumer(TracingService tracingService, ObjectMapper objectMapper) {
        this.tracingService = tracingService;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = KafkaConfig.TOPIC_NAME, groupId = "tracing-group", properties = "auto.offset.reset=earliest")
    public void consume(String message) {
        logger.info("Consumed trace span from topic: {}", KafkaConfig.TOPIC_NAME);
        try {
            java.util.List<TraceSpan> spans = objectMapper.readValue(message,
                    new com.fasterxml.jackson.core.type.TypeReference<>() {
                    });
            tracingService.save(spans);
        } catch (Exception e) {
            logger.error("Error processing consumed span: {}", e.getMessage());
        }
    }
}
