import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client.js';
import Loader from '../components/Loader.jsx';
import { formatDate, formatINR } from '../utils/format.js';

export default function Trips() {
  const location = useLocation();
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState('');
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const load = () =>
    api
      .get('/bookings/mine')
      .then(({ data }) => setBookings(data))
      .catch((err) => setError(getErrorMessage(err)));

  useEffect(() => {
    load();
  }, []);

  const confirmCancel = async () => {
    if (!cancellingBooking) return;
    setCancelling(true);
    try {
      await api.patch(`/bookings/${cancellingBooking._id}/cancel`);
      setCancellingBooking(null);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  if (!bookings && !error) return <Loader />;

  return (
    <section>
      <h1>My Trips</h1>
      {location.state?.booked && <p className="success">Booking request sent to the host!</p>}
      {error && <p className="error">{error}</p>}
      {bookings?.length === 0 && (
        <p className="muted">No trips yet. <Link to="/">Find a stay</Link></p>
      )}
      <div className="trip-list">
        {bookings?.map((b) => (
          <div key={b._id} className="card trip">
            <img src={b.listing?.images?.[0]} alt={b.listing?.title} />
            <div className="grow">
              <Link to={`/stays/${b.listing?._id}`}><strong>{b.listing?.title}</strong></Link>
              <p className="muted">{b.listing?.city}</p>
              <p>
                {formatDate(b.checkIn)} → {formatDate(b.checkOut)} · {b.nights} night{b.nights > 1 ? 's' : ''} · {b.guests} guest{b.guests > 1 ? 's' : ''}
              </p>
            </div>
            <div className="trip-side">
              <span className={`status status-${b.status}`}>{b.status}</span>
              <strong>{formatINR(b.totalPrice)}</strong>
              {['pending', 'confirmed'].includes(b.status) && (
                <button className="btn btn-danger" onClick={() => setCancellingBooking(b)}>Cancel</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {cancellingBooking && (
        <div className="modal-backdrop" onClick={() => !cancelling && setCancellingBooking(null)}>
          <div className="modal-card card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 10px' }}>Cancel Booking</h3>
            <p>
              Are you sure you want to cancel your booking for{' '}
              <strong>{cancellingBooking.listing?.title || 'this stay'}</strong>?
            </p>
            <div className="cancel-summary card">
              <p className="small"><strong>Stay:</strong> {cancellingBooking.listing?.title}</p>
              <p className="small">
                <strong>Dates:</strong> {formatDate(cancellingBooking.checkIn)} → {formatDate(cancellingBooking.checkOut)} ({cancellingBooking.nights} night{cancellingBooking.nights > 1 ? 's' : ''})
              </p>
              <p className="small"><strong>Total:</strong> {formatINR(cancellingBooking.totalPrice)}</p>
            </div>
            <p className="muted small">This action cannot be undone.</p>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: '16px', gap: '10px' }}>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => setCancellingBooking(null)}
                disabled={cancelling}
              >
                Keep Booking
              </button>
              <button
                className="btn btn-danger"
                type="button"
                onClick={confirmCancel}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
