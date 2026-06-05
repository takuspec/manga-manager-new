import {
  formatIssueLabelParts
} from '../utils/issueUtils'

function IssueLabel({
  magazine,
  year,
  issue,
  className = ''
}) {
  const parts =
    formatIssueLabelParts(
      magazine,
      year,
      issue
    )

  if (parts.isUnread) {
    return (
      <span
        className={`issue-label issue-label-unread ${className}`}
      >
        {parts.label}
      </span>
    )
  }

  const isLongIssueNumber =
    String(parts.numberText).length > 3

  return (
    <span
      className={`issue-label ${
        isLongIssueNumber
          ? 'issue-label-long'
          : ''
      } ${className}`}
    >
      <span className="issue-label-year">
        {parts.yearText}
      </span>

      <span className="issue-label-number">
        {parts.numberText}
      </span>

      <span className="issue-label-suffix">
        {parts.suffixText}
      </span>
    </span>
  )
}

export default IssueLabel
