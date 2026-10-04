import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import StarRating from './StarRating.jsx';
import { formatDate } from '../utils/format.js';

export default function Reviews({ listingId, onReviewAdded, onReviewChanged }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [error, setError] = useState('');
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: '' });
  const [editError, setEditError] = useState('');

  const notifyChange = () => {
    onReviewAdded?.();
    onReviewChanged?.();
  };

  const load = () => api.get(`/listings/${listingId}/reviews`).then(({ data }) => setReviews(data));

  useEffect(() => {
    load();
  }, [listingId]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/listings/${listingId}/reviews`, form);
      setForm({ rating: 5, comment: '' });
      await load();
      notifyChange();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleStartEdit = (r) => {
    setEditingReviewId(r._id);
    setEditForm({ rating: r.rating, comment: r.comment });
    setEditError('');
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditError('');
  };

  const handleUpdate = async (e, reviewId) => {
    e.preventDefault();
    setEditError('');
    try {
      await api.put(`/listings/${listingId}/reviews/${reviewId}`, editForm);
      setEditingReviewId(null);
      await load();
      notifyChange();
    } catch (err) {
      setEditError(getErrorMessage(err));
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/listings/${listingId}/reviews/${reviewId}`);
      await load();
      notifyChange();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const hasReviewed = Boolean(
    user && reviews.some((r) => r.user?._id === user._id || r.user === user._id)
  );

  return (
    <section className="reviews">
      <h2>Reviews ({reviews.length})</h2>
      {reviews.length === 0 && <p className="muted">No reviews yet.</p>}
      {reviews.map((r) => {
        const isAuthor = user && (r.user?._id === user._id || r.user === user._id);
        const isEditing = editingReviewId === r._id;

        return (
          <div key={r._id} className="review">
            <div className="row-between">
              <strong>
                {r.user?.name} {isAuthor && <span className="tag" style={{ marginLeft: 6 }}>You</span>}
              </strong>
              <span className="muted small">{formatDate(r.createdAt)}</span>
            </div>

            {isEditing ? (
              <form className="review-edit-form" onSubmit={(e) => handleUpdate(e, r._id)}>
                <StarRating
                  value={editForm.rating}
                  onChange={(rating) => setEditForm({ ...editForm, rating })}
                />
                <textarea
                  required
                  placeholder="Update your review"
                  value={editForm.comment}
                  onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                />
                {editError && <p className="error">{editError}</p>}
                <div className="row" style={{ marginTop: 8 }}>
                  <button type="submit" className="btn btn-sm">Save</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="stars-static">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                <p>{r.comment}</p>
                {isAuthor && (
                  <div className="row review-actions" style={{ marginTop: 8 }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleStartEdit(r)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-danger btn-sm"
                      onClick={() => handleDelete(r._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}

      {user && !hasReviewed && (
        <form className="card form" onSubmit={submit}>
          <h3>Write a review</h3>
          <StarRating value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
          <textarea
            required
            placeholder="How was your stay?"
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
          />
          {error && <p className="error">{error}</p>}
          <button className="btn">Submit review</button>
        </form>
      )}
    </section>
  );
}

