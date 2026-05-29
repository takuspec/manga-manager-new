function IssueInputRow({
  yearValue,
  onYearChange,
  issueValue,
  onIssueChange,
  yearOptions = [],
  showYear = true,
  suffix = '号',
  emptyIssueValue = 0,
  className = ''
}) {
  const handleIssueFocus = () => {
    const currentValue =
      issueValue ?? ''

    if (
      String(currentValue) !== '' &&
      Number(currentValue) === 0
    ) {
      onIssueChange('')
    }
  }

  const handleIssueBlur = (event) => {
    if (event.target.value === '') {
      onIssueChange(emptyIssueValue)
    }
  }

  return (
    <div
      className={`issue-input-row ${className}`}
    >
      {showYear && (
        <select
          className="issue-year-select"
          value={yearValue}
          onChange={(e) =>
            onYearChange(
              Number(e.target.value)
            )
          }
        >
          {yearOptions.map((year) => (
            <option
              key={year}
              value={year}
            >
              {year}年
            </option>
          ))}
        </select>
      )}

      <div className="issue-number-wrap">
        <input
          className="issue-number-input"
          type="number"
          inputMode="numeric"
          value={issueValue ?? ''}
          onFocus={handleIssueFocus}
          onBlur={handleIssueBlur}
          onChange={(e) =>
            onIssueChange(e.target.value)
          }
        />

        <span className="issue-number-suffix">
          {suffix}
        </span>
      </div>
    </div>
  )
}

export default IssueInputRow
