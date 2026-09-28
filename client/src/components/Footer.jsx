import "../styles/Footer.scss";

const Footer = () => {
  return (
    <div className="footer">
      <div className="footer_center">
        <p className="footer_copyright">© {new Date().getFullYear()} MomentStay, Inc.</p>
        <ul>
          <li>Privacy</li>
          <li>Terms</li>
          <li>Company details</li>
        </ul>
      </div>
      <div className="footer_right">
        <img src="/assets/payment.png" alt="payment" />
      </div>
    </div>
  );
};

export default Footer;