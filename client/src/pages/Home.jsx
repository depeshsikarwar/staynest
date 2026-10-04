import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/client.js';
import ListingCard from '../components/ListingCard.jsx';
import Loader from '../components/Loader.jsx';
import { STAY_TYPES } from '../utils/format.js';

const initial = { city: '', type: '', guests: '', maxPrice: '' };

export default function Home() {
  const [filters, setFilters] = useState(initial);
  const [appliedFilters, setAppliedFilters] = useState(initial);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const search = (currentFilters, currentSort, currentPage) => {
    setLoading(true);
    setError('');
    const clean = Object.fromEntries(
      Object.entries({ ...currentFilters, sort: currentSort, page: currentPage, limit: 12 })
        .filter(([, v]) => v !== '' && v !== undefined && v !== null)
    );
    api
      .get('/listings', { params: clean })
      .then(({ data }) => {
        if (Array.isArray(data)) {
          setListings(data);
          setTotal(data.length);
          setTotalPages(1);
        } else {
          setListings(data.listings || []);
          setPage(data.page || 1);
          setTotalPages(data.totalPages || 1);
          setTotal(data.total || 0);
        }
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    search(appliedFilters, sort, page);
  }, [appliedFilters, sort, page]);

  const set = (key) => (e) => setFilters({ ...filters, [key]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    setPage(1);
    setAppliedFilters(filters);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section>
      <div className="hero">
        <h1>Find your next nest.</h1>
        <p className="muted">Homestays, havelis, villas and hostels across India.</p>
        <form className="search-bar card" onSubmit={submit}>
          <input placeholder="Where to? (e.g. Jaipur)" value={filters.city} onChange={set('city')} />
          <select value={filters.type} onChange={set('type')}>
            <option value="">Any type</option>
            {STAY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="number" min="1" placeholder="Guests" value={filters.guests} onChange={set('guests')} />
          <input type="number" min="0" placeholder="Max ₹/night" value={filters.maxPrice} onChange={set('maxPrice')} />
          <button className="btn">Search</button>
        </form>
      </div>

      <div className="row-between sort-bar">
        <p className="muted small">
          {loading ? 'Searching stays...' : total > 0 ? `Showing ${listings.length} of ${total} stays` : 'No stays found'}
        </p>
        <div className="row" style={{ gap: '8px' }}>
          <label htmlFor="sort-by" className="small muted" style={{ flexDirection: 'row', alignItems: 'center' }}>
            Sort by:
          </label>
          <select id="sort-by" className="sort-select" value={sort} onChange={handleSortChange}>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <Loader />
      ) : listings.length === 0 ? (
        <p className="muted">No stays match your search.</p>
      ) : (
        <>
          <div className="grid">
            {listings.map((l) => <ListingCard key={l._id} listing={l} />)}
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-ghost"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
              >
                &larr; Previous
              </button>
              <span className="muted small">
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-ghost"
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                Next &rarr;
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
