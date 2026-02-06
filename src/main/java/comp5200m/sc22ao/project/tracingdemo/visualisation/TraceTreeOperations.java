package comp5200m.sc22ao.project.tracingdemo.visualisation;

import comp5200m.sc22ao.project.tracingdemo.model.TraceSpan;

import java.util.*;

public class TraceTreeOperations {
    private final Integer durationNormFactor;
    private final Map<String, List<TraceSpan>> parentToChildrenSpans;
    private final List<TraceSpan> spans;

    public TraceTreeOperations(Map<String, List<TraceSpan>> parentToChildrenSpans, Long duration,
            List<TraceSpan> spans) {
        this.durationNormFactor = findDurationNormFactor(duration);
        this.parentToChildrenSpans = parentToChildrenSpans;
        this.spans = spans;
    }

    public void populateTree(TraceTreeNode node) {
        if (parentToChildrenSpans.containsKey(node.getSpanId())) {
            List<TraceSpan> childSpans = parentToChildrenSpans.get(node.getSpanId());
            for (TraceSpan span : childSpans) {
                TraceTreeNode childNode = new TraceTreeNode(span.getId(), span.getName(),
                        span.getTags().getIstioCanonicalService(), span.getDuration(), span.getTimestamp());
                node.getChildren().add(childNode);
                populateTree(childNode);
            }
        }
    }

    public String visualise(TraceTreeNode node) {
        String traceTreeString = dfsTraversalAndVisualiseTree(node, 0);

        Set<String> spansInTree = dfsGetAllNodes(node);
        if (spansInTree.size() != spans.size()) {
            List<TraceSpan> errorSpans = findErrorSpans(spansInTree);
            traceTreeString += visualiseErrorSpans(spansInTree, errorSpans);
        }

        return traceTreeString;
    }

    public String visualiseErrorSpans(Set<String> spansAccounted, List<TraceSpan> errorSpans) {
        StringBuilder traceVisualisation = new StringBuilder()
                .append("\nError Spans: Spans with parentId not found");

        errorSpans.stream()
                .filter(errorSpan -> !spansAccounted.contains(errorSpan.getId()))
                .forEach(span -> {
                    TraceTreeNode tmpNode = initialiseTraceTreeNode(span);
                    populateTree(tmpNode);
                    spansAccounted.addAll(dfsGetAllNodes(tmpNode));
                    traceVisualisation
                            .append("\n")
                            .append(dfsTraversalAndVisualiseTree(tmpNode, 0));
                });

        return traceVisualisation.toString();
    }

    public String dfsTraversalAndVisualiseTree(TraceTreeNode node, int depth) {
        StringBuilder sb = new StringBuilder()
                .append(formatMessageForDepth(node, depth));
        for (TraceTreeNode child : node.getChildren()) {
            sb.append(dfsTraversalAndVisualiseTree(child, depth + 1));
        }
        return sb.toString();
    }

    public List<TraceSpan> findErrorSpans(Set<String> spansInTree) {
        return spans.stream().filter(span -> !spansInTree.contains(span.getId())).toList();
    }

    public TraceTreeNode initialiseTraceTreeNode(TraceSpan span) {
        return new TraceTreeNode(span.getId(), span.getName(), span.getTags().getIstioCanonicalService(),
                span.getDuration(), span.getTimestamp());
    }

    public Set<String> dfsGetAllNodes(TraceTreeNode node) {
        List<TraceTreeNode> childNodes = node.getChildren();
        Set<String> nodes = new LinkedHashSet<>();
        nodes.add(node.getSpanId());

        for (TraceTreeNode childNode : childNodes) {
            nodes.addAll(dfsGetAllNodes(childNode));
        }
        return nodes;
    }

    private String formatMessageForDepth(TraceTreeNode node, int depth) {
        StringBuilder sb = new StringBuilder()
                .append("    ".repeat(depth))
                .append(node.getSpanName())
                .append("\n")
                .append("    ".repeat(depth))
                .append("Service: ")
                .append(node.getService())
                .append("\n")
                .append("    ".repeat(depth))
                .append("Duration: [")
                .append(node.getDuration() / 1000)
                .append("ms]")
                .append("\n")
                .append("    ".repeat(depth))
                .append("=".repeat(Math.toIntExact(node.getDuration() / durationNormFactor)))
                .append("\n");

        return sb.toString();
    }

    private Integer findDurationNormFactor(Long duration) {
        if (duration < 1000) {
            return 10;
        } else if (duration < 5000) {
            return 100;
        } else if (duration < 20000) {
            return 500;
        } else {
            return Math.toIntExact(duration / 100);
        }
    }
}
