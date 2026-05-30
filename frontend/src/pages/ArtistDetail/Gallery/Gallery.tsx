import "./Gallery.scss";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import type { ArtistPhotoDto } from "@/Utils/Services/Public/artistsApi";

interface GalleryProps {
  photos: ArtistPhotoDto[];
}

const Gallery = ({ photos }: GalleryProps) => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveIndex(null);
      }
      if (e.key === "ArrowRight") {
        setActiveIndex((idx) => (idx === null ? 0 : (idx + 1) % photos.length));
      }
      if (e.key === "ArrowLeft") {
        setActiveIndex((idx) =>
          idx === null ? 0 : (idx - 1 + photos.length) % photos.length,
        );
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [activeIndex, photos.length]);

  if (photos.length === 0) return null;

  const activePhoto = activeIndex !== null ? photos[activeIndex] : null;

  return (
    <section
      className="artistGallery fi"
      aria-labelledby="artist-gallery-title"
    >
      <h2 id="artist-gallery-title" className="title">
        {t("artistDetail.gallery")}
      </h2>
      <ul className="grid">
        {photos.map((photo, idx) => (
          <li key={photo.id}>
            <button
              type="button"
              className="thumb"
              onClick={() => setActiveIndex(idx)}
              aria-label={photo.alt ?? `Photo ${idx + 1}`}
            >
              <img src={photo.url} alt={photo.alt ?? ""} loading="lazy" />
            </button>
          </li>
        ))}
      </ul>

      {activePhoto ? (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.alt ?? t("artistDetail.gallery")}
          onClick={() => setActiveIndex(null)}
        >
          <button
            type="button"
            className="close"
            onClick={() => setActiveIndex(null)}
            aria-label="Close"
          >
            ×
          </button>
          <img src={activePhoto.url} alt={activePhoto.alt ?? ""} />
        </div>
      ) : null}
    </section>
  );
};

export default Gallery;
