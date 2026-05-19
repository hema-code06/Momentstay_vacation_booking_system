import Navbar from "../components/Navbar";
import { categories, types, facilities } from "../data";
import { useState, useEffect, useMemo } from "react";
import { IoIosImages } from "react-icons/io";
import { BiTrash } from "react-icons/bi";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import "../styles/UpdateProperty.scss";

const UpdateProperty = () => {
  const { listingId } = useParams();
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");

  const [formLocation, setFormLocation] = useState({
    streetAddress: "",
    aptSuite: "",
    city: "",
    province: "",
    country: "",
  });

  const [guestCount, setGuestCount] = useState(1);
  const [bedroomCount, setBedroomCount] = useState(1);
  const [bedCount, setBedCount] = useState(1);
  const [bathroomCount, setBathroomCount] = useState(1);

  const [amenities, setAmenities] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);

  const [formDescription, setFormDescription] = useState({
    title: "",
    description: "",
    highlight: "",
    price: 0,
  });

  const creatorId = useSelector((state) => state.user._id);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/properties/${listingId}`
        );
        const data = await response.json();
        if (response.ok) {
          setCategory(data.category);
          setType(data.type);
          setFormLocation({
            streetAddress: data.streetAddress,
            aptSuite: data.aptSuite,
            city: data.city,
            province: data.province,
            country: data.country,
          });
          setGuestCount(data.guestCount);
          setBedroomCount(data.bedroomCount);
          setBedCount(data.bedCount);
          setBathroomCount(data.bathroomCount);
          setAmenities(data.amenities || []);
          setExistingPhotos(data.listingPhotoPaths || []);
          setFormDescription({
            title: data.title,
            description: data.description,
            highlight: data.highlight,
            price: data.price,
          });
        }
      } catch (err) {
        console.error("Failed to fetch property details:", err);
      }
    };

    fetchPropertyDetails();
  }, [listingId]);

  // ── Fix: stable blob URLs — created once per File object, not on every render
  const newPhotoPreviews = useMemo(
    () => newPhotos.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [newPhotos]
  );

  const removeExistingPhoto = (index) => {
    setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewPhoto = (index) => {
    // revoke the blob URL before removing to free memory
    URL.revokeObjectURL(newPhotoPreviews[index].url);
    setNewPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddPhotos = (e) => {
    const files = Array.from(e.target.files);
    setNewPhotos((prev) => [...prev, ...files]);
    e.target.value = null; // reset input so same file can be re-picked
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const listingForm = new FormData();
      listingForm.append("creator", creatorId);
      listingForm.append("category", category);
      listingForm.append("type", type);
      listingForm.append("streetAddress", formLocation.streetAddress);
      listingForm.append("aptSuite", formLocation.aptSuite);
      listingForm.append("city", formLocation.city);
      listingForm.append("province", formLocation.province);
      listingForm.append("country", formLocation.country);
      listingForm.append("guestCount", guestCount);
      listingForm.append("bedroomCount", bedroomCount);
      listingForm.append("bedCount", bedCount);
      listingForm.append("bathroomCount", bathroomCount);
      listingForm.append("amenities", amenities);
      listingForm.append("title", formDescription.title);
      listingForm.append("description", formDescription.description);
      listingForm.append("highlight", formDescription.highlight);
      listingForm.append("price", formDescription.price);
      listingForm.append("existingPhotos", JSON.stringify(existingPhotos));

      newPhotos.forEach((photo) => {
        listingForm.append("listingPhotos", photo);
      });

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/properties/${listingId}`,
        { method: "PUT", body: listingForm }
      );

      if (response.ok) {
        const data = await response.json();
        // sync state with the real S3 URLs returned from server
        setExistingPhotos(data.listing.listingPhotoPaths || []);
        setNewPhotos([]);
        navigate("/");
      } else {
        const err = await response.json();
        alert("Update failed: " + (err.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Updating property failed:", err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/properties/${listingId}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        navigate("/");
      } else {
        alert("Failed to delete the property.");
      }
    } catch (err) {
      console.error("Deleting property failed:", err);
    }
  };

  const totalPhotos = existingPhotos.length + newPhotos.length;

  return (
    <>
      <Navbar />
      <div className="update-listing">
        <form onSubmit={handleUpdate}>

          <div className="update-listing_step1">
            <h2><span>Step 1 :</span> Tell us about your place</h2>
            <h3>Which of these categories best describes your place?</h3>
            <div className="category-list">
              {categories?.map((item, index) => (
                <div
                  className={`category ${category === item.label ? "selected" : ""}`}
                  key={index}
                  onClick={() => setCategory(item.label)}
                >
                  <div className="category_icon">{item.icon}</div>
                  <p>{item.label}</p>
                </div>
              ))}
            </div>

            <h3>What type of place will guests have?</h3>
            <div className="type-list">
              {types?.map((item, index) => (
                <div
                  className={`type ${type === item.name ? "selected" : ""}`}
                  key={index}
                  onClick={() => setType(item.name)}
                >
                  <div className="type-text">
                    <h4>{item.name}</h4>
                    <div className="type_icon">{item.icon}</div>
                  </div>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="update-listing_step2">
            <h2><span>Step 2 :</span> Share some basics about your place</h2>
            <div className="full">
              <div className="location">
                <p>Flat, house etc. (if applicable)</p>
                <input
                  type="text"
                  value={formLocation.streetAddress}
                  onChange={(e) => setFormLocation({ ...formLocation, streetAddress: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="half">
              <div className="location">
                <p>Street address</p>
                <input
                  type="text"
                  value={formLocation.aptSuite}
                  onChange={(e) => setFormLocation({ ...formLocation, aptSuite: e.target.value })}
                  required
                />
              </div>
              <div className="location">
                <p>City / town</p>
                <input
                  type="text"
                  value={formLocation.city}
                  onChange={(e) => setFormLocation({ ...formLocation, city: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="half">
              <div className="location">
                <p>State / union territory</p>
                <input
                  type="text"
                  value={formLocation.province}
                  onChange={(e) => setFormLocation({ ...formLocation, province: e.target.value })}
                  required
                />
              </div>
              <div className="location">
                <p>Country</p>
                <input
                  type="text"
                  value={formLocation.country}
                  onChange={(e) => setFormLocation({ ...formLocation, country: e.target.value })}
                  required
                />
              </div>
            </div>

            <h3>How many guests can your place accommodate?</h3>
            <div className="count-container">
              <div className="half2">
                {[
                  { label: "Guests", value: guestCount, setter: setGuestCount },
                  { label: "Bedrooms", value: bedroomCount, setter: setBedroomCount },
                  { label: "Beds", value: bedCount, setter: setBedCount },
                  { label: "Bathrooms", value: bathroomCount, setter: setBathroomCount },
                ].map(({ label, value, setter }) => (
                  <div className="counts" key={label}>
                    <p>{label}</p>
                    <div className="input-group">
                      <button type="button" onClick={() => setter(Math.max(value - 1, 1))}>-</button>
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => setter(Math.max(parseInt(e.target.value, 10), 1))}
                        min="1"
                        required
                      />
                      <button type="button" onClick={() => setter(value + 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="update-listing_step3">
            <h2><span>Step 3 :</span> Make your place stand out</h2>
            <h3>Tell guests what your place has to offer</h3>
            <div className="amenities">
              {facilities?.map((item, index) => (
                <div
                  className={`facility ${amenities.includes(item.name) ? "selected" : ""}`}
                  key={index}
                  onClick={() =>
                    setAmenities((prev) =>
                      prev.includes(item.name)
                        ? prev.filter((f) => f !== item.name)
                        : [...prev, item.name]
                    )
                  }
                >
                  <div className="facility_icon">{item.icon}</div>
                  <p>{item.name}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="update-listing_step4">
            <h2><span>Step 4 :</span> Update photos of your place</h2>
            <p className="photo-hint">
              {totalPhotos} photo{totalPhotos !== 1 ? "s" : ""} · remove existing ones or add new ones below
            </p>

            <div className="photos-upload">
              <input
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAddPhotos}
              />
              <div className="photos-preview">
                {existingPhotos.map((url, index) => (
                  <div key={`existing-${index}`} className="photo-preview">
                    <img src={url} alt={`existing-${index}`} />
                    <span className="photo-label">Saved</span>
                    <BiTrash
                      className="trash-icon"
                      onClick={() => removeExistingPhoto(index)}
                    />
                  </div>
                ))}

                {/* Fix: use stable blob URLs from useMemo instead of inline createObjectURL */}
                {newPhotoPreviews.map(({ url }, index) => (
                  <div key={`new-${index}`} className="photo-preview">
                    <img src={url} alt={`new-${index}`} />
                    <span className="photo-label new">New</span>
                    <BiTrash
                      className="trash-icon"
                      onClick={() => removeNewPhoto(index)}
                    />
                  </div>
                ))}

                <div
                  className="upload-placeholder"
                  onClick={() => document.getElementById("image-upload").click()}
                >
                  <div className="icon"><IoIosImages /></div>
                  Add more photos
                </div>
              </div>
            </div>
          </div>

          <div className="update-listing_step5">
            <h2><span>Step 5 :</span> Now, let's give your place a title</h2>
            <div className="full">
              <div className="description">
                <p>Short titles work best. Have fun with it</p>
                <input
                  type="text"
                  value={formDescription.title}
                  onChange={(e) => setFormDescription({ ...formDescription, title: e.target.value })}
                  required
                />
              </div>
              <div className="description">
                <p>Next, let's describe your place</p>
                <textarea
                  value={formDescription.description}
                  onChange={(e) => setFormDescription({ ...formDescription, description: e.target.value })}
                  required
                />
              </div>
              <div className="description">
                <p>Share what makes your place special. <span>(Highlights)</span></p>
                <input
                  type="text"
                  value={formDescription.highlight}
                  onChange={(e) => setFormDescription({ ...formDescription, highlight: e.target.value })}
                  required
                />
              </div>
              <div className="description">
                <p>Price <span>(per night)</span></p>
                <input
                  type="number"
                  placeholder="Price"
                  value={formDescription.price}
                  onChange={(e) => setFormDescription({ ...formDescription, price: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="navigation-buttons">
            <button type="button" className="delete-btn" onClick={handleDelete}>
              Delete Property
            </button>
            <button type="submit">Save Changes</button>
          </div>

        </form>
      </div>
      <Footer />
    </>
  );
};

export default UpdateProperty;