import Image from "next/image";
import Link from "next/link";

export default function Main() {
  return (
    <>
            <section className="hero">
              <div className="hero-content">
                <h1 className="text-black">Grow your LinkedIn Audience Faster with AI</h1>
                <p>Create and schedule better content and get more reach, engagement and followers daily with less work.</p>
                <ul className="features-list">
                  <li>Create better LinkedIn content faster with AI</li>
                  <li>Grow your personal brand on LinkedIn in 5mins a day</li>
                  <li>Browse collection of 1+ million viral posts from LinkedIn creators</li>
                </ul>
                <Link href="/create" className="cta-button">
                  Start for free now →
                </Link>
                <div className="rating">
                  <span className="stars">⭐⭐⭐⭐⭐</span>
                  <span>Free plan - No credit card required</span>
                </div>
              </div>
              <div className="hero-image">
                <Image 
                  src="/assets/Images/reply-hero.764122fe.svg" 
                  alt="Typegrow Dashboard" 
                  width={500} 
                  height={400}
                />
              </div>
            </section>
      

    </>
  );
}
