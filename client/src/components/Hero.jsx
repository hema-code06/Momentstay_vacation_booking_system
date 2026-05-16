import "../styles/Hero.scss";

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero__bg">
        <img
          src="/assets/Home.jpg"
          alt="Beautiful travel destination"
          className="hero__img"
        />
        <div className="hero__overlay" />
      </div>

      <div className="hero__content">
        <h1 className="hero__headline">
          Find your next<br />
          <em>perfect escape</em>
        </h1>
        <p className="hero__sub">
          Discover handpicked stays, unique experiences, and places that feel like home — anywhere in the world.
        </p>

        <div className="hero__stats">
          <div className="hero__stat">
            <span className="hero__stat-number">1k+</span>
            <span className="hero__stat-label">Properties</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <span className="hero__stat-number">10+</span>
            <span className="hero__stat-label">Countries</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <span className="hero__stat-number">4.9★</span>
            <span className="hero__stat-label">Avg. Rating</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;