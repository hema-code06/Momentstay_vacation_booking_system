import { FaStar } from "react-icons/fa";

const Stars = ({ value }) => (
  <span className="stars" aria-label={`${value} out of 5`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <FaStar key={n} className={n <= value ? "on" : ""} />
    ))}
  </span>
);

export default Stars;
