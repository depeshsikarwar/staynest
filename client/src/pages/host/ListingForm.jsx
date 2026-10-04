import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../../api/client.js';
import { STAY_TYPES } from '../../utils/format.js';

const empty = {
  title: '',
  description: '',
  type: 'homestay',
  city: '',
  state: '',
  address: '',
  pricePerNight: '',
  maxGuests: 2,
  bedrooms: 1,
  amenities: '',
  images: [''],
};

export default function ListingForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/listings/${id}`).then(({ data }) =>
      setForm({
        ...empty,
        ...data,
        amenities: (data.amenities || []).join(', '),
        images: data.images && data.images.length > 0 ? data.images : [''],
      })
    );
  }, [id, isEdit]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleImageChange = (index, value) => {
    // If multiple URLs were pasted (separated by commas or newlines), split and insert them
    if (value.includes(',') || value.includes('\n')) {
      const splitUrls = value
        .split(/[,\n]/)
        .map((u) => u.trim())
        .filter(Boolean);
      if (splitUrls.length > 1) {
        const nextImages = [...form.images];
        nextImages.splice(index, 1, ...splitUrls);
        setForm({ ...form, images: nextImages });
        return;
      }
    }
    const nextImages = [...form.images];
    nextImages[index] = value;
    setForm({ ...form, images: nextImages });
  };

  const addImageField = () => {
    setForm({ ...form, images: [...form.images, ''] });
  };

  const removeImageField = (index) => {
    if (form.images.length === 1) {
      setForm({ ...form, images: [''] });
    } else {
      setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
    }
  };

  // TODO: replace the image URL field with real image upload (Cloudinary / multer).
  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const { title, description, type, city, state, address, images, amenities } = form;
    const payload = {
      title,
      description,
      type,
      city,
      state,
      address,
      pricePerNight: Number(form.pricePerNight),
      maxGuests: Number(form.maxGuests),
      bedrooms: Number(form.bedrooms),
      amenities: amenities.split(',').map((a) => a.trim()).filter(Boolean),
    };
    const validImages = (images || []).map((img) => img.trim()).filter(Boolean);
    if (validImages.length > 0) payload.images = validImages;

    try {
      if (isEdit) await api.put(`/listings/${id}`, payload);
      else await api.post('/listings', payload);
      navigate('/host');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <form className="card form wide" onSubmit={submit}>
      <h1>{isEdit ? 'Edit listing' : 'Create a new listing'}</h1>
      <input required placeholder="Title" value={form.title} onChange={set('title')} />
      <textarea required placeholder="Describe your place" value={form.description} onChange={set('description')} />
      <div className="row">
        <select value={form.type} onChange={set('type')}>
          {STAY_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <input required type="number" min="0" placeholder="Price per night (₹)" value={form.pricePerNight} onChange={set('pricePerNight')} />
      </div>
      <div className="row">
        <input required placeholder="City" value={form.city} onChange={set('city')} />
        <input required placeholder="State" value={form.state} onChange={set('state')} />
      </div>
      <input required placeholder="Address" value={form.address} onChange={set('address')} />
      <div className="row">
        <label className="grow">Max guests
          <input type="number" min="1" value={form.maxGuests} onChange={set('maxGuests')} />
        </label>
        <label className="grow">Bedrooms
          <input type="number" min="0" value={form.bedrooms} onChange={set('bedrooms')} />
        </label>
      </div>
      <input placeholder="Amenities (comma separated: WiFi, AC, Parking)" value={form.amenities} onChange={set('amenities')} />
      
      <div className="form-group">
        <label className="form-label">
          Listing Photos (Add one or more image URLs)
        </label>
        <div className="image-inputs-list">
          {form.images.map((url, idx) => (
            <div key={idx} className="image-input-row">
              <input
                placeholder={idx === 0 ? "Main image URL (e.g. https://...)" : `Image URL #${idx + 1}`}
                value={url}
                onChange={(e) => handleImageChange(idx, e.target.value)}
              />
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => removeImageField(idx)}
                title="Remove image"
                aria-label="Remove image"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="form-actions-inline">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={addImageField}
          >
            + Add another image URL
          </button>
        </div>

        {form.images.some((img) => img.trim()) && (
          <div className="form-image-previews">
            <span className="small muted">Live preview:</span>
            <div className="preview-grid">
              {form.images.filter((img) => img.trim()).map((img, i) => (
                <div key={i} className="preview-item">
                  <img
                    src={img}
                    alt={`Preview ${i + 1}`}
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/100x70?text=Invalid+URL';
                    }}
                  />
                  <span className="preview-label">{i === 0 ? 'Cover' : `#${i + 1}`}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && <p className="error">{error}</p>}
      <button className="btn">{isEdit ? 'Save changes' : 'Publish listing'}</button>
    </form>
  );
}
