package comp5200m.sc22ao.project.tracingdemo.visualisation;

import java.util.LinkedList;
import java.util.List;
import java.util.Objects;

public class TraceTreeNode {
    private String spanId;
    private String spanName;
    private String service;
    private Long duration;
    private List<TraceTreeNode> children = new LinkedList<>();

    public TraceTreeNode(String spanId) {
        this.spanId = spanId;
    }

    public TraceTreeNode(String spanId, String spanName) {
        this.spanId = spanId;
        this.spanName = spanName;
    }

    public TraceTreeNode(String spanId, String spanName, String service, Long duration, Long timestamp) {
        this.spanId = spanId;
        this.spanName = spanName;
        this.service = service;
        this.duration = duration;
        this.timestamp = timestamp;
    }

    private Long timestamp;

    public Long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }

    public TraceTreeNode(String spanId, List<TraceTreeNode> children) {
        this.spanId = spanId;
        this.children = children;
    }

    public String getSpanId() {
        return spanId;
    }

    public void setSpanId(String spanId) {
        this.spanId = spanId;
    }

    public List<TraceTreeNode> getChildren() {
        return children;
    }

    public void setChildren(List<TraceTreeNode> children) {
        this.children = children;
    }

    public String getSpanName() {
        return this.spanName;
    }

    public void setSpanName(String spanName) {
        this.spanName = spanName;
    }

    public Long getDuration() {
        return this.duration;
    }

    public void setDuration(Long duration) {
        this.duration = duration;
    }

    public String getService() {
        return this.service;
    }

    public void setService(String service) {
        this.service = service;
    }

    @Override
    public boolean equals(Object o) {
        TraceTreeNode compare = (TraceTreeNode) o;
        return Objects.equals(this.spanId, compare.getSpanId())
                && Objects.equals(this.spanName, compare.getSpanName())
                && Objects.equals(this.service, compare.getService())
                && Objects.equals(this.duration, compare.getDuration())
                && Objects.equals(this.children, compare.getChildren());
    }
}
