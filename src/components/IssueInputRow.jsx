function IssueInputRow({
  yearValue,
  onYearChange,
  issueValue,
  onIssueChange,
  yearOptions = [],
  issueOptions = [],
  showYear = true,
  useIssueSelect = false,
  prefix = '',
  suffix = '号',
  emptyIssueValue = 0,
  className = '',
  onYearSelected
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
          onChange={(e) => {
            const nextYear =
              Number(e.target.value)

            if (onYearSelected) {
              onYearSelected(nextYear)
              return
            }

            onYearChange(nextYear)
          }}
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
        {prefix &&
          Number(issueValue) !== 0 && (
            <span className="issue-number-prefix">
              {prefix}
            </span>
          )}

        {useIssueSelect ? (
          <select
            className="issue-number-input issue-number-select"
            value={Number(issueValue) || 0}
            onChange={(e) =>
              onIssueChange(
                Number(e.target.value)
              )
            }
          >
            {issueOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        ) : (
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
        )}

        {suffix && Number(issueValue) !== 0 && (
          <span className="issue-number-suffix">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

export default IssueInputRow
