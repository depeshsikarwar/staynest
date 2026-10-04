import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client.js';
import Loader from '../components/Loader.jsx';
import ListingCard from '../components/ListingCard.jsx';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    api
      .get('/auth/wishlist')
      .then(({ data }) => setWishlist(data))
      .catch((err) => setError(getErrorMessage(err)));
  };

  useEffect(() => {
    load();
  }, []);

  const handleWishlistToggle = (toggledId) => {
    setWishlist((prev) => prev?.filter((l) => (l._id || l) !== toggledId));
  };

  if (error) return <p className="error">{error}</p>;
  if (!wishlist) return <Loader />;

  return (
    <section>
      <h1>My Wishlist ({wishlist.length})</h1>
      {wishlist.length === 0 ? (
        <div className="empty">
          <p className="muted">No saved stays yet.</p>
          <p className="muted small" style={{ marginBottom: 16 }}>
            Click the ♥ button on any stay to save it to your wishlist.
          </p>
          <Link to="/" className="btn">
            Explore stays
          </Link>
        </div>
      ) : (
        <div className="grid">
          {wishlist.map((listing) => (
            <ListingCard
              key={listing._id}
              listing={listing}
              onWishlistToggle={handleWishlistToggle}
            />
          ))}
        </div>
      )}
    </section>
  );
}
