"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { MasterclassAdModal } from "@/app/MasterclassAdModal";
import { masterclassMode } from "@/lib/masterclass";

const loginHref = "/login";

const stats = [
  ["3,200+", "Students in Cohort 1"],
  ["24", "Live Sessions"],
  ["98%", "Would Recommend"],
  ["Rs 1,499", "One-Time / No Subscription"],
];

const features = [
  {
    label: "Live Chat",
    title: "Ask. Get Answered.",
    desc: "Fire questions in real-time. The instructor and TAs respond live - nothing goes unanswered.",
    icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  },
  {
    label: "Reactions",
    title: "Express Your Pulse",
    desc: "Send reactions mid-lecture. The instructor reads the room live and adjusts pace accordingly.",
    icon: "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
  },
  {
    label: "AI Doubt Solver",
    title: "24/7 Clarity on Demand",
    desc: "Submit any question - text, photo, or voice. Get a step-by-step breakdown with diagrams instantly.",
    icon: "M12 7v4M5 11h14v10H5zM9 16h.01M15 16h.01M12 3a2 2 0 0 1 0 4",
  },
  {
    label: "Live Polls",
    title: "Built-in Concept Checks",
    desc: "Mid-class polls let you test yourself before the reveal. No more passive watching.",
    icon: "M6 20v-6M12 20V4M18 20V10",
  },
  {
    label: "Leaderboard",
    title: "Make Learning Competitive",
    desc: "Earn points for attendance and correct answers. A live scoreboard keeps everyone sharp.",
    icon: "M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M18 2H6v7a6 6 0 0 0 12 0V2z",
  },
];

const testimonials = [
  ["Arjun Sharma", "AIR 847 / JEE Advanced 2025", "The way problems are broken down is unlike anything I've seen. I started scoring 95+ after just 3 weeks.", "AS", "#6C63FF"],
  ["Priya Mehta", "NEET 2025 / 680/720", "The AI doubt solver alone is worth 10x the price. No more waiting till next class to get clarity.", "PM", "#E91E8C"],
  ["Rohan Verma", "AIR 1204 / JEE Advanced", "Live polls and the leaderboard had me hooked. I attended every single class - and the results followed.", "RV", "#F59E0B"],
  ["Sneha Iyer", "JEE Main 99.2 percentile", "Invisible Mechanics lives up to its name. You see what others can't. Best investment for JEE prep.", "SI", "#10B981"],
  ["Kabir Patel", "NEET Dropper to AIR 312", "Was scoring 80/180 in Physics. After this cohort I crossed 150. The methodology is genuinely transformative.", "KP", "#00B8D9"],
  ["Aditi Rao", "JEE Advanced 2025", "Structured problem-solving is what separates toppers from the rest. This cohort teaches exactly that.", "AR", "#FF6B6B"],
] as const;

const faqs = [
  ["What topics does The Art of Problem Solving - 1 cover?", "Systematic problem-solving methodology applied to Mechanics: Newton's Laws, work-energy theorem, rotational dynamics, and oscillations. The focus is on transferable frameworks - not just specific problem types."],
  ["Are the live classes recorded?", "Yes. All sessions are recorded in HD and available for replay within 6 hours. You retain access to all recordings until the end of the academic year."],
  ["How long is the cohort?", "8 weeks - 3 live sessions per week, including concept sessions and problem-set workshops."],
  ["How does the AI Doubt Solver work?", "Submit any physics question via text, image, or voice inside the app. The AI gives a step-by-step breakdown with analogies and diagrams."],
  ["Is there a refund policy?", "Yes - 7-day full refund guarantee. Attend the first 3 sessions. If you're not satisfied, write to us for a full refund."],
  ["Do I need any prerequisites to join?", "Basic familiarity with Class 11 Physics helps but is not required. The cohort builds from first principles."],
];

export function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mockAnswer, setMockAnswer] = useState<number | null>(null);
  const [timer, setTimer] = useState(863);

  useEffect(() => {
    document.body.classList.add("im-landing-shell");
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    const timerId = window.setInterval(() => setTimer((value) => Math.max(0, value - 1)), 1000);
    const featureId = window.setInterval(
      () => setActiveFeature((value) => (value + 1) % features.length),
      4000,
    );
    return () => {
      document.body.classList.remove("im-landing-shell");
      window.removeEventListener("scroll", onScroll);
      window.clearInterval(timerId);
      window.clearInterval(featureId);
    };
  }, []);

  const hero = useMemo(() => {
    const shrinkEnd = typeof window === "undefined" ? 800 : window.innerHeight * 0.72;
    const p = Math.min(1, Math.max(0, scrollY / shrinkEnd));
    const e = 1 - Math.pow(1 - p, 3);
    const videoWidth = 100 - e * 36;
    return {
      video: {
        width: `${videoWidth}%`,
        height: `${100 - e * 42}vh`,
        top: `${e * 4}vh`,
        left: `${(100 - videoWidth) / 2}%`,
        borderRadius: `${e * 20}px`,
        boxShadow: e > 0.08 ? "0 24px 72px rgba(0,0,0,0.55)" : "none",
      },
      textOpacity: Math.max(0, (e - 0.55) / 0.45),
      hintOpacity: Math.max(0, 1 - p * 5),
      navOpaque: scrollY > 30,
    };
  }, [scrollY]);

  const minutes = Math.floor(timer / 60).toString().padStart(2, "0");
  const seconds = (timer % 60).toString().padStart(2, "0");

  return (
    <div className="landing-page">
      {masterclassMode && <MasterclassAdModal />}
      <LandingNav opaque={hero.navOpaque} />

      <section className="landing-hero-stage">
        <div className="landing-hero-sticky">
          <div className="landing-ambient" />
          <div className="landing-grid" />
          <div className="landing-video" style={hero.video}>
            <div className="landing-video-inner">
              <div className="landing-video-grid" />
              <div className="landing-video-glow" />
              <div className="landing-play-stack">
                <div className="landing-play"><span /></div>
                <div>
                  <div className="landing-video-title">Breaking Down Problems</div>
                  <div className="landing-video-sub">The methodology that changes everything / 12 min</div>
                </div>
              </div>
              <div className="landing-im">IM</div>
              <div className="landing-preview"><span />PREVIEW</div>
              <div className="landing-video-footer">Invisible Mechanics / Physics Cohort Series</div>
            </div>
          </div>

          <div
            className="landing-hero-copy"
            style={{
              opacity: hero.textOpacity,
              transform: `translateX(-50%) translateY(${(1 - hero.textOpacity) * 20}px)`,
              pointerEvents: hero.textOpacity > 0.5 ? "auto" : "none",
            }}
          >
            <p>Physics Cohort / JEE & NEET</p>
            <h1>Invisible<br /><span>Mechanics</span></h1>
            <div className="landing-hero-desc">
              Where the world's hardest physics problems become obvious - systematic, repeatable, yours.
            </div>
            <div className="landing-hero-actions">
              <Link href={loginHref}>Join the Cohort - Rs 1,499 -&gt;</Link>
              <Link href={loginHref} className="secondary">Watch Preview</Link>
            </div>
          </div>

          <div className="landing-scroll-hint" style={{ opacity: hero.hintOpacity }}>
            <span>Scroll</span>
            <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
              <path d="M7 2v12M7 14L2 9M7 14l5-5" stroke="rgba(255,255,255,.28)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </section>

      <section className="landing-stats">
        <div>
          {stats.map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="cohort" className="landing-section">
        <div className="landing-section-head">
          <div className="landing-pill"><span />Now Enrolling</div>
          <h2>Our Latest Cohort</h2>
        </div>
        <div className="landing-cohort-grid">
          <div className="landing-cohort-card">
            <div className="landing-video-grid" />
            <div className="landing-cohort-glow" />
            <div>
              <p>Invisible Mechanics / Cohort 1</p>
              <h3>The Art of<br />Problem<br />Solving</h3>
              <span>F = ma / E = 1/2mv^2 / tau = I alpha</span>
            </div>
            <b>Cohort 1</b>
          </div>
          <div className="landing-cohort-info">
            <h3>The Art of Problem Solving - 1</h3>
            <p>An 8-week live cohort that rebuilds how you think about Physics problems from the ground up. Not memorization. Not shortcuts. Pure, transferable methodology that applies to every problem you'll ever encounter.</p>
            <ul>
              {["24 live sessions over 8 weeks", "HD recordings with year-long access", "AI Doubt Solver + 24/7 TA support", "Live polls, leaderboard & reactions", "Completion certificate"].map((item) => (
                <li key={item}><span>✓</span>{item}</li>
              ))}
            </ul>
            <div className="landing-mini-stats">
              <div><strong>8 Weeks</strong><span>Duration</span></div>
              <div><strong>24 Sessions</strong><span>Live classes</span></div>
              <div><strong>1,200+</strong><span>Enrolled</span></div>
            </div>
            <div className="landing-price-row">
              <div><strong>Rs 1,499</strong><span>One-time / No subscription</span></div>
              <Link href={loginHref}>Enroll Now -&gt;</Link>
            </div>
            <p className="landing-guarantee">7-day money-back guarantee / No questions asked</p>
          </div>
        </div>
      </section>

      <section id="features" className="landing-feature-section">
        <div className="landing-feature-head">
          <p>Live Class Experience</p>
          <h2>The most engaging physics class<br />you will ever attend.</h2>
        </div>
        <div className="landing-feature-grid">
          <div className="landing-feature-tabs">
            {features.map((feature, index) => (
              <button
                key={feature.label}
                onClick={() => setActiveFeature(index)}
                className={index === activeFeature ? "active" : ""}
              >
                <Icon path={feature.icon} />
                <span>{feature.label}</span>
              </button>
            ))}
          </div>
          <div className="landing-live-panel">
            <div className="landing-panel-copy">
              <h3>{features[activeFeature].title}</h3>
              <p>{features[activeFeature].desc}</p>
            </div>
            <LiveDemo active={activeFeature} />
          </div>
        </div>
      </section>

      <section className="landing-mock-section">
        <div>
          <p className="landing-kicker">Mock Tests Included</p>
          <h2>One platform for<br />teaching <span>and</span> testing.</h2>
          <p>No switching between apps. Every topic you study is reinforced with curated mock tests - all within Invisible Mechanics.</p>
          <ul>
            {["Chapter-wise tests after every module", "Full JEE & NEET pattern mock tests", "Instant solutions with step-by-step explanations", "Performance analytics & weak area tracker"].map((item) => (
              <li key={item}><span>✓</span>{item}</li>
            ))}
          </ul>
        </div>
        <div className="landing-test-card">
          <div className="landing-test-top">
            <div><strong>Physics / Chapter Test 3</strong><span>Mechanics - Work, Energy & Power</span></div>
            <div><span>TIME LEFT</span><strong>{minutes}:{seconds}</strong></div>
          </div>
          <div className="landing-progress"><span /></div>
          <p className="landing-question">A ball of mass <b>2 kg</b> is moving with a velocity of <b>4 m/s</b>. What is its kinetic energy?</p>
          {["8 J", "16 J", "32 J", "4 J"].map((option, index) => {
            const answered = mockAnswer !== null;
            const correct = index === 1;
            const selected = mockAnswer === index;
            return (
              <button
                key={option}
                onClick={() => !answered && setMockAnswer(index)}
                className={answered ? (correct ? "correct" : selected ? "wrong" : "muted") : ""}
              >
                <span>{String.fromCharCode(65 + index)}</span>{option}{answered && correct ? "✓" : answered && selected ? "✗" : ""}
              </button>
            );
          })}
          {mockAnswer !== null && (
            <div className="landing-explanation">
              <strong>{mockAnswer === 1 ? "✓ Correct!" : "✗ Incorrect - here's why:"}</strong>
              <p>KE = 1/2mv^2 = 1/2 x 2 x 4^2 = 16 J.</p>
            </div>
          )}
        </div>
      </section>

      <section id="reviews" className="landing-reviews">
        <p>Student Reviews</p>
        <h2>Results that speak<br />for themselves.</h2>
        <div className="landing-marquee">
          <div>
            {[...testimonials, ...testimonials].map(([name, rank, text, av, bg], index) => (
              <article key={`${name}-${index}`}>
                <span>★★★★★</span>
                <p>{text}</p>
                <div><b style={{ background: bg }}>{av}</b><strong>{name}<small>{rank}</small></strong></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="landing-faq">
        <p>FAQ</p>
        <h2>Got questions?<br />We've got answers.</h2>
        <div>
          {faqs.map(([q, a], index) => (
            <button key={q} onClick={() => setOpenFaq(openFaq === index ? null : index)}>
              <span>{q}</span><b className={openFaq === index ? "open" : ""}>+</b>
              <em className={openFaq === index ? "open" : ""}>{a}</em>
            </button>
          ))}
        </div>
      </section>

      <section className="landing-final">
        <h2>Ready to see Physics<br />differently?</h2>
        <p>Join 1,200+ students who've already transformed their approach to Physics.</p>
        <Link href={loginHref}>Enroll in Cohort 1 - Rs 1,499 -&gt;</Link>
        <span>7-day money-back guarantee / No subscription / Immediate access</span>
      </section>

      <footer className="landing-footer">
        <div>
          <div>
            <h3>Invisible <span>Mechanics</span></h3>
            <p>Physics mastery for JEE & NEET. Systematic. Transferable. Unforgettable.</p>
          </div>
          <div>
            <strong>Cohort</strong>
            <a>The Art of Problem Solving - 1</a>
            <a>Features</a>
            <a>Testimonials</a>
          </div>
          <div>
            <strong>Support</strong>
            <a>FAQ</a>
            <a>Contact</a>
            <a>Refund Policy</a>
          </div>
        </div>
        <div><p>© 2025 Invisible Mechanics. All rights reserved.</p><p>Made with obsession for Physics.</p></div>
      </footer>
    </div>
  );
}

function LandingNav({ opaque }: { opaque: boolean }) {
  const ctaLabel = masterclassMode ? "Enroll Masterclass Now" : "Get Started";

  return (
    <nav className={`landing-nav ${opaque ? "opaque" : ""} ${masterclassMode ? "masterclass" : ""}`}>
      <Link href="/" className="landing-logo">
        <span className="landing-logo-mark">
          <Image
            src="/im-logo.png"
            alt="Invisible Mechanics"
            width={28}
            height={28}
            priority
          />
        </span>
        <span>Invisible <strong>Mechanics</strong></span>
      </Link>
      <div>
        {!masterclassMode && (
          <>
            <a href="#cohort">Cohort</a>
            <a href="#features">Features</a>
            <a href="#reviews">Reviews</a>
            <a href="#faq">FAQ</a>
          </>
        )}
        <Link href={loginHref}>{ctaLabel}</Link>
      </div>
    </nav>
  );
}

function Icon({ path }: { path: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

function LiveDemo({ active }: { active: number }) {
  return (
    <div className="landing-classroom">
      <div className="landing-classroom-video">
        <div><span />LIVE</div>
        <h4>Problem #7 / Projectile Motion</h4>
        <p>A ball thrown at 20 m/s at 60 degrees. Find the maximum height reached.</p>
        <strong>h = u^2 sin^2 theta / 2g = 15 m</strong>
      </div>
      <aside className={active === 0 ? "active" : ""}>
        <h5>Live Chat</h5>
        {["This is finally clicking!!", "Can we try one more example?", "Energy method > force method", "Sir please do NEET 2024 version!"].map((msg) => <p key={msg}>{msg}</p>)}
      </aside>
      <aside className={active === 1 ? "active" : ""}>
        <h5>Reactions</h5>
        <div className="landing-reaction-row"><span>🔥 147</span><span>❤️ 89</span><span>👍 203</span><span>💡 67</span></div>
      </aside>
      <aside className={active === 2 ? "active" : ""}>
        <h5>AI Doubt Solver</h5>
        <p>Horizontally: constant velocity. Vertically: uniform acceleration due to gravity.</p>
      </aside>
      <aside className={active === 3 ? "active" : ""}>
        <h5>Live Poll</h5>
        <p>Energy Method <b>68%</b></p>
        <p>Force Method <b>32%</b></p>
      </aside>
      <aside className={active === 4 ? "active" : ""}>
        <h5>Leaderboard</h5>
        {["Arjun K. 2,847 pts", "Priya M. 2,612 pts", "Rohan V. 2,445 pts", "You 2,247 pts"].map((row, i) => <p key={row}>{i + 1}. {row}</p>)}
      </aside>
    </div>
  );
}
