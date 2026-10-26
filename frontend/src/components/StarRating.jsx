const StarRating = ({ value = 0, count, onChange, size = 'md' }) => {
  if (onChange) {
    return (
      <div className={`star-input star-${size}`} role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={`star-btn ${n <= value ? 'active' : ''}`}
            onClick={() => onChange(n)}
            aria-label={`${n} star`}
          >
            ★
          </button>
        ))}
      </div>
    );
  }
  return (
    <span className={`star-display star-${size}`} title={value ? `${value} out of 5` : 'No ratings yet'}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= Math.round(value) ? 'star filled' : 'star'}>
          ★
        </span>
      ))}
      {value > 0 && <span className="star-value">{value.toFixed(1)}</span>}
      {count !== undefined && <span className="star-count">({count})</span>}
      {value === 0 && <span className="star-count">New</span>}
    </span>
  );
};

export default StarRating;
