package comp5200m.sc22ao.project.tracingdemo.service;

import comp5200m.sc22ao.project.tracingdemo.config.KafkaConfig;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class TraceProducer {

    private static final Logger logger = LoggerFactory.getLogger(TraceProducer.class);

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public TraceProducer(KafkaTemplate<String, String> kafkaTemplate, ObjectMapper objectMapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    public void sendSpan(Object spanData) {
        logger.info("Producing trace span to topic: {}", KafkaConfig.TOPIC_NAME);
        try {
            String json = objectMapper.writeValueAsString(spanData);
            kafkaTemplate.send(KafkaConfig.TOPIC_NAME, json);
        } catch (JsonProcessingException e) {
            logger.error("Error serializing span data: {}", e.getMessage());
        }
    }
}
