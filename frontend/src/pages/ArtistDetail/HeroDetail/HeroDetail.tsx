import "./HeroDetail.scss";

import BookingCta from "@/components/BookingCta/BookingCta";
import type { ArtistDetailDto } from "@/Utils/Services/Public/artistsApi";

interface HeroDetailProps {
  artist: ArtistDetailDto;
}

const HeroDetail = ({ artist }: HeroDetailProps) => {
  return (
    <section
      className="artistHero"
      style={
        artist.coverImageUrl
          ? { backgroundImage: `url(${artist.coverImageUrl})` }
          : undefined
      }
      aria-labelledby="artist-name"
    >
      <div className="overlay" />
      <div className="content">
        {artist.genre ? <p className="genre">{artist.genre}</p> : null}
        <h1 id="artist-name" className="name">
          {artist.stageName}
        </h1>
        <div className="cta">
          <BookingCta
            artistSlug={artist.slug}
            artistName={artist.stageName}
            variant="primary"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroDetail;
