import React from "react";
import { Link } from "react-router-dom";
import "../styles/Pastexperience.scss";
import { experiences } from "../data";

const Pastexperience = () => {
  return (
    <div className="past-experiences-section">
      <div className="past-exp__header">
        <span className="past-exp__eyebrow">Memories Made</span>
        <h2 className="past-exp__title">
          Past <em>Experiences</em>
        </h2>
        <p className="past-exp__subtitle">
          Every stay tells a story — here are some of our favourites
        </p>
      </div>

      <div className="experiences-grid">
        {experiences.map((experience, index) => (
          <Link
            key={experience.id}
            to={`/testimonials/${experience.id}`}
            className="experience-card-link"
            style={{ "--i": index }}
          >
            <div className="experience-card">
              <div className="experience-image-container">
                <img
                  src={experience.image[0]}
                  alt={experience.name}
                  className="experience-image"
                />
              </div>
              <div className="experience-details">
                <h4 className="experience-name">{experience.name}</h4>
                <p className="experience-location">{experience.location}</p>
                <span className="exp-card__host">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  {experience.host}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Pastexperience;
