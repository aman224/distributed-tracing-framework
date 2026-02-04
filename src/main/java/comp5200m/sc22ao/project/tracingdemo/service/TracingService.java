package comp5200m.sc22ao.project.tracingdemo.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import comp5200m.sc22ao.project.tracingdemo.visualisation.TraceTreeNode;
import comp5200m.sc22ao.project.tracingdemo.repository.TracingRepository;
import comp5200m.sc22ao.project.tracingdemo.model.TraceSpan;

import comp5200m.sc22ao.project.tracingdemo.visualisation.TraceTreeOperations;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TracingService {
    final Logger logger = LoggerFactory.getLogger(TracingService.class);

    private final TracingRepository tracingRepository;

    public TracingService(TracingRepository tracingRepository) {
        this.tracingRepository = tracingRepository;
    }

    public void saveSpans(Object spans) {
        try {
            List<TraceSpan> traceSpans = convertObjectToSpans(spans);
            save(traceSpans);
            logger.info("Traces Saved Successfully");
        } catch (Exception e) {
            logger.error("Error saving Traces: {}", e.getMessage());
        }
    }

    public void save(List<TraceSpan> traceSpans) {
        tracingRepository.saveAll(traceSpans);
    }

    public ResponseEntity<?> findAllSpans(String traceId) {
        List<TraceSpan> traceSpans = findTraceSpans(traceId);
        sortSpans(traceSpans);
        String response = convertSpansToString(traceSpans);
        return new ResponseEntity<>("<pre>" + response + "</pre>", HttpStatus.OK);
    }

    public ResponseEntity<?> findSpan(String traceId, String spanId) {
        TraceSpan traceSpan = findTraceSpan(spanId);

        if (traceSpan != null) {
            return new ResponseEntity<>(traceSpan, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Span with Id: " + spanId + " not Found", HttpStatus.NOT_FOUND);
        }
    }

    public ResponseEntity<?> generateTraceReport(String traceId) {
        List<TraceSpan> traceSpans = findTraceSpans(traceId);

        Map<String, List<TraceSpan>> parentIdToChildSpansMap = new HashMap<>();
        TraceTreeNode rootNode = null;

        for (TraceSpan span : traceSpans) {
            if (span.getParentId() != null) {
                List<TraceSpan> children = parentIdToChildSpansMap.get(span.getParentId());
                if (children == null) {
                    children = new ArrayList<>();
                }
                children.add(span);
                parentIdToChildSpansMap.put(span.getParentId(), children);
            } else {
                rootNode = new TraceTreeNode(span.getId(), span.getName(), span.getTags().getIstioCanonicalService(),
                        span.getDuration());
            }
        }

        if (rootNode != null) {
            TraceTreeOperations operations = new TraceTreeOperations(
                    parentIdToChildSpansMap,
                    rootNode.getDuration(),
                    traceSpans);

            operations.populateTree(rootNode);
            String traceDiagram = operations.visualise(rootNode);

            logger.info("Trace Propagation Between Services\n {}", traceDiagram);
            return new ResponseEntity<>("<pre>" + traceDiagram + "</pre>", HttpStatus.OK);
        }

        return new ResponseEntity<>("Trace Not Found", HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<?> generateCompleteTraceReport() {
        List<TraceSpan> traceSpans = findTraceSpans(null);
        return new ResponseEntity<>(traceSpans, HttpStatus.OK);
    }

    public List<TraceSpan> convertObjectToSpans(Object spans) {
        ObjectMapper mapper = new ObjectMapper();
        return mapper.convertValue(spans, new TypeReference<>() {
        });
    }

    public List<TraceSpan> findTraceSpans(String traceId) {
        if (traceId != null) {
            return tracingRepository.findAll()
                    .stream()
                    .filter(traceSpan -> traceSpan.getTraceId().equals(traceId))
                    .collect(Collectors.toList());
        } else {
            return tracingRepository.findAll();
        }
    }

    public TraceSpan findTraceSpan(String spanId) {
        Optional<TraceSpan> span = tracingRepository.findById(spanId);
        return span.orElse(null);
    }

    public String convertSpansToString(List<TraceSpan> spans) {
        return spans.stream()
                .map(TraceSpan::toString)
                .collect(Collectors.joining("\n"));
    }

    public void sortSpans(List<TraceSpan> spans) {
        if (!spans.isEmpty()) {
            spans.sort(Comparator.comparing(TraceSpan::getTimestamp));
        }
    }
}
