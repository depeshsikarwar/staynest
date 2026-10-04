import { Link, useNavigate } from 'react-router-dom';
import { formatINR } from '../utils/format.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function ListingCard({ listing, onWishlistToggle }) {
  const { user, isWishlisted, toggleWishlist } = useAuth();
  const navigate = useNavigate();
  const wishlisted = isWishlisted?.(listing._id);

  const handleHeartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    await toggleWishlist(listing._id);
    onWishlistToggle?.(listing._id);
  };

  return (
    <Link to={`/stays/${listing._id}`} className="card listing-card">
      <div className="listing-img-wrap">
        <img src={listing.images[0]} alt={listing.title} />
        <button
          type="button"
          className={`wishlist-btn ${wishlisted ? 'active' : ''}`}
          onClick={handleHeartClick}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {wishlisted ? '♥' : '♡'}
        </button>
      </div>
      <div className="card-body">
        <div className="row-between">
          <span className="tag">{listing.type}</span>
          <span className="muted">
            {listing.reviewCount > 0 ? `★ ${listing.avgRating} (${listing.reviewCount})` : 'New'}
          </span>
        </div>
        <strong className="listing-title">{listing.title}</strong>
        <span className="muted">{listing.city}, {listing.state}</span>
        <span>
          <strong>{formatINR(listing.pricePerNight)}</strong> <span className="muted">/ night</span>
        </span>
      </div>
    </Link>
  );
}

