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
                  <Link href="/blog">Blog</Link>
                  <Link href="/pricing">Pricing</Link>
                  <Link href="/support">Help & Support</Link>
                </div>
                <div className="footer-column">
                  <h4>Legal</h4>
                  <Link href="/privacy">Privacy Policy</Link>
                  <Link href="/terms">Terms of Service</Link>
                  <Link href="/gdpr">GDPR</Link>
                </div>
                <div className="footer-column">
                  <h4>Connect with us</h4>
                  <Link href="/linkedin">LinkedIn</Link>
                  <Link href="/twitter">Twitter</Link>
                  <Link href="/youtube">YouTube</Link>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <p>© 2024 Typegrow. All rights reserved.</p>
            </div>
          </footer>
        </>
    )
}