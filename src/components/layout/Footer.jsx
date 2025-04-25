import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <Image src="/assets/Images/logo.jpg" alt="Typegrow" width={50} height={50} />
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Resources</h4>
              <Link href="/">Blog</Link>
              <Link href="/">Pricing</Link>
              <Link href="/">Help & Support</Link>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <Link href="/">Privacy Policy</Link>
              <Link href="/">Terms of Service</Link>
              <Link href="/">GDPR</Link>
            </div>
            <div className="footer-column">
              <h4>Connect with us</h4>
              <Link href="/">LinkedIn</Link>
              <Link href="/">Twitter</Link>
              <Link href="/">YouTube</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 SOHAM WEB SOLUTION. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}