import { Link } from "react-router-dom";
import { selectedCategories } from "../data";
import "../styles/Categories.scss";

const Categories = () => {
  return (
    <div className="categories">
      <div className="categories_header">
        <span className="categories_eyebrow">Curated for You</span>
        <h2 className="categories_title">
          Discover Our <em>Best Picks</em>
        </h2>
      </div>
      <div className="categories_list">
        {selectedCategories.map((category, index) => (
          <Link to={`/properties/category/${category.label}`} key={index}>
            <div className="category" style={{ "--i": index }}>
              <img src={category.img} alt={category.label} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Categories;
