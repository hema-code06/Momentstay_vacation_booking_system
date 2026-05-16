import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Pastexperience from "../components/Pastexperience";
import Categories from "../components/Categories";
import Listings from "../components/Listings";
import Footer from "../components/Footer";
import "../styles/Home.scss";

const Home = () => {
  return (
    <div className="home">
      <div className="home__hero-wrap">
        <Navbar />
        <Hero />
      </div>

      <main className="home__main">
        <Categories />
        <Listings />
        <Pastexperience />
      </main>

      <Footer />
    </div>
  );
};

export default Home;