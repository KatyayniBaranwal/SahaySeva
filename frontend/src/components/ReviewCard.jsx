import StarRating from './StarRating';
import { format_date } from '../utils/constants';

const ReviewCard = ({ review }) => (
  <div className="review-item">
    <div className="review-head">
      <span className="avatar small">
        {(review.reviewer?.name || 'A').charAt(0).toUpperCase()}
      </span>
      <div>
        <strong>{review.reviewer?.name || 'Community member'}</strong>
        <div className="review-sub">
          {format_date(review.createdAt)}
          {review.helpRequest?.title ? ` · on "${review.helpRequest.title}"` : ''}
        </div>
      </div>
      <StarRating value={review.rating} />
    </div>
    {review.comment && <p className="review-comment">{review.comment}</p>}
  </div>
);

export default ReviewCard;
