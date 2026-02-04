package comp5200m.sc22ao.project.tracingdemo.controller;

import comp5200m.sc22ao.project.tracingdemo.service.TraceProducer;
import comp5200m.sc22ao.project.tracingdemo.service.TracingService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class TracingController {
    private final TracingService tracingService;
    private final TraceProducer traceProducer;

    public TracingController(TracingService tracingService, TraceProducer traceProducer) {
        this.tracingService = tracingService;
        this.traceProducer = traceProducer;
    }

    @PostMapping("/api/v2/spans")
    public void getSpansV2JSONMapping(@RequestBody Object request) {
        traceProducer.sendSpan(request);
    }

    @PostMapping("/api/v1/spans")
    public void getSpansV1JSONMapping(@RequestBody Object request) {
        traceProducer.sendSpan(request);
    }

    @GetMapping("/trace/spans")
    public ResponseEntity<?> findAllSpans() {
        return tracingService.findAllSpans(null);
    }

    @GetMapping("/trace/{traceId}/spans")
    public ResponseEntity<?> getAllSpansForTrace(@PathVariable String traceId) {
        return tracingService.findAllSpans(traceId);
    }

    @GetMapping("/trace/{traceId}/spans/{spanId}")
    public ResponseEntity<?> getAllSpansForTrace(@PathVariable String traceId,
            @PathVariable String spanId) {
        return tracingService.findSpan(traceId, spanId);
    }

    @GetMapping("/trace/{traceId}/visualise")
    public ResponseEntity<?> generateTraceReport(@PathVariable String traceId) {
        return tracingService.generateTraceReport(traceId);
    }
}
