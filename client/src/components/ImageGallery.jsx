import { useState, useEffect, useCallback } from 'react';

export default function ImageGallery({ images = [], title = 'Stay' }) {
  const validImages = images && images.length > 0 ? images : ['https://placehold.co/800x500?text=StayNest'];
  const [currentIndex, setCurrentIndex] = useState(0);

  // Keep index within bounds if images change
  useEffect(() => {
    if (currentIndex >= validImages.length) {
      setCurrentIndex(0);
    }
  }, [validImages.length, currentIndex]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  }, [validImages.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  }, [validImages.length]);

  // Keyboard navigation when gallery container is focused or active
  const handleKeyDown = useCallback(
    (e) => {
      if (validImages.length <= 1) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    },
    [validImages.length, handlePrev, handleNext]
  );

  return (
    <div
      className="gallery"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`${title} gallery. Use left and right arrow keys to navigate.`}
    >
      <div className="gallery-main">
        <img
          className="gallery-hero-img"
          src={validImages[currentIndex]}
          alt={`${title} - image ${currentIndex + 1} of ${validImages.length}`}
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/800x500?text=Image+Unavailable';
          }}
        />

        {validImages.length > 1 && (
          <>
            <button
              type="button"
              className="gallery-nav-btn gallery-prev"
              onClick={handlePrev}
              aria-label="Previous image"
            >
              &#10094;
            </button>
            <button
              type="button"
              className="gallery-nav-btn gallery-next"
              onClick={handleNext}
              aria-label="Next image"
            >
              &#10095;
            </button>
            <div className="gallery-badge" aria-live="polite">
              {currentIndex + 1} / {validImages.length}
            </div>
          </>
        )}
      </div>

      {validImages.length > 1 && (
        <div className="gallery-thumbs" role="tablist" aria-label="Image thumbnails">
          {validImages.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              type="button"
              role="tab"
              aria-selected={idx === currentIndex}
              aria-label={`View photo ${idx + 1}`}
              className={`gallery-thumb ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
            >
              <img
                src={img}
                alt=""
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/120x80?text=Image';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
