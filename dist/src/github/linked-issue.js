export function verifyLinkedIssues(policy, issues) {
    if (!policy.linkedIssue.required && issues.length === 0)
        return { kind: "linked-issue", status: "SKIPPED", summary: "No linked issue is required by policy.", details: ["NOT_APPLICABLE"] };
    if (!issues.length)
        return { kind: "linked-issue", status: "FAIL", summary: "No linked issue satisfies policy.", details: ["A linked issue is required."] };
    const accepted = policy.linkedIssue.acceptedLabels.length === 0 || issues.some((issue) => issue.labels.some((label) => policy.linkedIssue.acceptedLabels.includes(label)));
    const assigned = !policy.linkedIssue.requireMaintainerAssignment || issues.some((issue) => Boolean(issue.assigneeLogin));
    return accepted && assigned ? { kind: "linked-issue", status: "PASS", summary: "A linked issue satisfies policy.", details: issues.map((issue) => `#${issue.number} ${issue.state}`) } : { kind: "linked-issue", status: "FAIL", summary: "Linked issue does not satisfy policy.", details: [accepted ? "label criteria passed" : "accepted label missing", assigned ? "assignment criteria passed" : "maintainer assignment missing"] };
}
//# sourceMappingURL=linked-issue.js.map