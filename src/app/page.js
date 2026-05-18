"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  animate,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Gideon_Roman } from "next/font/google";
import {
  TrendingUp, CalendarCheck, Zap, Star,
  CheckCircle, ArrowRight, Users, Award, Percent, BookOpen,
  ChevronRight,
} from "lucide-react";
import style from "./page.module.css";

const gideon = Gideon_Roman({ weight: "400", subsets: ["latin"] });

/* ─────────────────────────────────────────────
   ANIMATION VARIANTS
───────────────────────────────────────────── */
const containerVariant = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.18 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] } },
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.9 } },
};

/* ─────────────────────────────────────────────
   STATIC DATA
───────────────────────────────────────────── */
const images = Object.freeze([
  "/homePage/carousel1.png", "/homePage/carousel2.png", "/homePage/carousel3.png",
  "/homePage/carousel4.png", "/homePage/carousel5.png", "/homePage/carousel6.png",
  "/homePage/carousel7.png",
]);

const FRANKLIN_QUOTE = {
  line: "Starting is essential for progress.",
  text: '"An investment in knowledge always pays the best interest."',
  author: "– Benjamin Franklin",
};

const FEATURES = [
  { icon: TrendingUp,    title: "Smart Practice",        desc: "Adaptive tests tailored to your strengths & weaknesses.",  color: "#6366f1" },
  { icon: CalendarCheck, title: "Track Progress",         desc: "Visual analytics to monitor every improvement.",            color: "#22c55e" },
  { icon: Zap,           title: "AI-Powered Tools",       desc: "ReviseAI suggests what to practice next — instantly.",      color: "#f59e0b" },
  { icon: Star,          title: "Trusted by Top Learners",desc: "Join thousands preparing for success every day.",           color: "#ec4899" },
];

const STATS = [
  { icon: BookOpen, value: "1M+",   end: 1000, suffix: "M+", label: "Tests Attempted",   color: "#6366f1" },
  { icon: Users,    value: "250K+", end: 250,  suffix: "K+", label: "Active Learners",   color: "#6366f1" },
  { icon: Percent,  value: "98.7%", end: 98.7, suffix: "%",  label: "Satisfaction Rate", color: "#22c55e" },
  { icon: Award,    value: "50+",   end: 50,   suffix: "+",  label: "Exams Covered",     color: "#6366f1" },
];

const BENEFITS = [
  "Personalized Study Plans",
  "Topic-wise Performance",
  "Real-time Leaderboards",
  "Exam Simulation",
];

const TESTIMONIALS = [
  {
    quote: "Ultima's adaptive tests helped me focus on my weak areas. My scores improved dramatically!",
    name: "Ananya Sharma", role: "JEE Aspirant", rating: 5, avatar: "/homePage/carousel1.png",
  },
  {
    quote: '"The analytics dashboard is a game-changer." I can see my progress every day.',
    name: "Rohan Verma", role: "NEET Aspirant", rating: 5, avatar: "/homePage/carousel4.png",
  },
  {
    quote: '"ReviseAI is like having a personal tutor available 24/7."',
    name: "Priya Nair", role: "UPSC Aspirant", rating: 5, avatar: "/homePage/carousel2.png",
  },
];

const CAROUSEL_REPEAT = 2;

/* ─────────────────────────────────────────────
   UTILITY HOOKS & COMPONENTS
───────────────────────────────────────────── */

/** Generic scroll-triggered reveal with direction support */
function Reveal({ children, className, delay = 0, from = "bottom", distance = 40 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-70px" });
  const initial = {
    opacity: 0,
    y: from === "bottom" ? distance : from === "top" ? -distance : 0,
    x: from === "left" ? -distance : from === "right" ? distance : 0,
    scale: from === "scale" ? 0.92 : 1,
  };
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={initial}
      animate={inView ? { opacity: 1, y: 0, x: 0, scale: 1 } : initial}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/** Staggered children reveal — wraps a list container */
function StaggerReveal({ children, className, stagger = 0.09, delayStart = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: stagger, delayChildren: delayStart } } }}
    >
      {children}
    </motion.div>
  );
}

/** Single stagger child */
const StaggerChild = ({ children, className, from = "bottom" }) => {
  const initial = {
    opacity: 0,
    y: from === "bottom" ? 32 : from === "top" ? -32 : 0,
    x: from === "left" ? -24 : from === "right" ? 24 : 0,
    scale: from === "scale" ? 0.88 : 1,
  };
  return (
    <motion.div
      className={className}
      variants={{
        hidden: initial,
        visible: { opacity: 1, y: 0, x: 0, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  );
};

/** Animated number counter */
function Counter({ end, suffix, color }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const count = useMotionValue(0);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const controls = animate(count, end, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(
        end % 1 !== 0 ? v.toFixed(1) : Math.round(v).toString()
      ),
    });
    return controls.stop;
  }, [inView, end, count]);

  return (
    <div ref={ref} className={style.statValue} style={{ color }}>
      {display}{suffix}
    </div>
  );
}

/** Parallax section wrapper — subtle vertical drift on scroll */
function ParallaxSection({ children, className, speed = 0.12 }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rawY = useTransform(scrollYProgress, [0, 1], ["8%", `-${speed * 100}%`]);
  const y = useSpring(rawY, { stiffness: 60, damping: 20, mass: 0.6 });
  return (
    <div ref={ref} className={className} style={{ overflow: "hidden" }}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

/** Stars */
function Stars({ count }) {
  return (
    <div className={style.stars}>
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={13} fill="#f59e0b" stroke="none" />
      ))}
    </div>
  );
}

/** Section heading with animated underline */
function SectionHead({ eyebrow, sub, accentWord, light = false }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <div ref={ref} className={style.sectionHead}>
      <motion.p
        className={style.sectionEyebrow}
        style={light ? { color: "#0f172a" } : {}}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {eyebrow.replace(accentWord, "")}
        {accentWord && <span className={style.accentText}>{accentWord}</span>}
      </motion.p>
      <motion.p
        className={style.sectionSub}
        initial={{ opacity: 0, y: 14 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      >
        {sub}
      </motion.p>
      <motion.div
        className={style.sectionUnderline}
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
const Home = () => {
  /* progress bar */
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <div className={style.home}>

      {/* ── scroll progress bar ── */}
      <motion.div className={style.progressBar} style={{ scaleX }} />

      {/* ═══ HERO ═══ */}
      <section className={style.heroSection}>
        <div className={style.heroShell}>
          <div className={style.orbOne} />
          <div className={style.orbTwo} />
          <div className={style.bubbles} aria-hidden="true">
            <span /><span /><span /><span /><span />
          </div>
          <motion.div
            className={`${style.heroContent} ${gideon.className}`}
            variants={containerVariant}
            initial="hidden"
            animate="visible"
          >
            <motion.p className={style.eyebrow} variants={fadeUp}>
              Ultima • Practice with purpose
            </motion.p>
            <motion.h1 className={style.heroTitle} variants={fadeUp}>
              Practice is the only force that<br />
              <span className={style.highlight}>transforms potential</span><br />
              into identity.
            </motion.h1>
            <motion.p className={style.heroSubtitle} variants={fadeUp}>
              From <strong>what you could do</strong> to <strong>who you become</strong>.
            </motion.p>
            <motion.p className={style.heroTagline} variants={fadeUp}>
              You are the sum of your repetitions.
            </motion.p>
            <motion.div className={style.heroActions} variants={fadeUp}>
              <Link href="/products" className={style.primaryButton}>Practice Now</Link>
              <Link href="/upskilling" className={style.secondaryButton}>Explore More</Link>
            </motion.div>
            <motion.blockquote className={style.heroQuote} variants={fadeIn}>
              <p>"Ace the clock and conquer your next big exam with Ultima."</p>
            </motion.blockquote>
          </motion.div>
        </div>
      </section>

      {/* ═══ BRAND STRIP ═══ */}
      <section className={style.brandStrip}>
        <div className={style.carouselContainer}>
          <div className={style.carouselTrack}>
            {Array.from({ length: CAROUSEL_REPEAT }, () => images).flat()
              .map((src, index) => (
                <div className={style.carouselItem} key={`${src}-${index}`} aria-hidden={index >= images.length}>
                  <Image src={src} alt="" width={180} height={180} loading={index < images.length ? "eager" : "lazy"} />
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* ═══ QUOTE ═══ */}
      <section className={style.quoteSection}>
        <div className={style.quoteContainer}>
          <Reveal from="scale" distance={0}>
            <blockquote className={`${style.quoteCard} ${gideon.className}`}>
              <motion.p
                className={style.quoteLead}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {FRANKLIN_QUOTE.line}
              </motion.p>
              <motion.span
                className={style.quoteDivider}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                style={{ display: "block" }}
              />
              <motion.p
                className={style.quoteText}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              >
                {FRANKLIN_QUOTE.text}
              </motion.p>
              <motion.footer
                className={style.quoteAuthor}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.35 }}
              >
                {FRANKLIN_QUOTE.author}
              </motion.footer>
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className={style.featuresSection}>
        <div className={style.sectionInner}>
          <SectionHead
            eyebrow="Why learners choose Ultima"
            accentWord="Ultima"
            sub="Everything you need to practice smarter, not harder"
          />
          <StaggerReveal className={style.featuresGrid} stagger={0.1} delayStart={0.05}>
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <StaggerChild key={title} from="bottom">
                <motion.div
                  className={style.featureCard}
                  whileHover={{ y: -8, scale: 1.02, boxShadow: "0 24px 50px rgba(15,23,42,0.12)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                >
                  <motion.div
                    className={style.featureIcon}
                    style={{ "--f-color": color }}
                    whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.4 } }}
                  >
                    <Icon size={20} />
                  </motion.div>
                  <h3 className={style.featureTitle}>{title}</h3>
                  <p className={style.featureDesc}>{desc}</p>
                </motion.div>
              </StaggerChild>
            ))}
          </StaggerReveal>
          <Reveal delay={0.2} className={style.featuresCtaWrap}>
            <Link href="/products" className={style.outlineButton}>
              Explore Tests <ArrowRight size={15} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className={style.statsSection}>
        <div className={style.sectionInner}>
          <StaggerReveal className={style.statsGrid} stagger={0.12}>
            {STATS.map(({ icon: Icon, end, suffix, label, color }) => (
              <StaggerChild key={label} from="scale">
                <motion.div
                  className={style.statCard}
                  whileHover={{ y: -5, transition: { type: "spring", stiffness: 320, damping: 24 } }}
                >
                  <motion.div
                    className={style.statIcon}
                    style={{ "--stat-color": color }}
                    whileInView={{ rotate: [0, 360] }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                  >
                    <Icon size={22} />
                  </motion.div>
                  <Counter end={end} suffix={suffix} color={color} />
                  <div className={style.statLabel}>{label}</div>
                </motion.div>
              </StaggerChild>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* ═══ PRACTICE SMARTER ═══ */}
      <section className={style.practiceSection}>
        <div className={style.sectionInner}>
          <div className={style.practiceGrid}>

            {/* mockup with parallax */}
            <Reveal from="left" distance={50}>
              <div className={style.mockupShell}>
                <div className={style.mockupGlow} />
                <div className={style.mockupScreen}>
                  <div className={style.mockupBar}>
                    <span /><span /><span />
                  </div>
                  <div className={style.mockupContent}>
                    <div className={style.mockupRow}>
                      <div className={style.mockupLine} style={{ width: "70%" }} />
                      <div className={style.mockupDot} />
                    </div>
                    <div className={style.mockupRow}>
                      <div className={style.mockupLine} style={{ width: "45%" }} />
                      <div className={style.mockupDot} style={{ background: "#22c55e" }} />
                    </div>
                    <div className={style.mockupChart}>
                      {[40, 65, 50, 80, 60, 90, 75].map((h, i) => (
                        <motion.div
                          key={i}
                          className={style.mockupBar2}
                          style={{ height: `${h}%` }}
                          initial={{ scaleY: 0, opacity: 0 }}
                          whileInView={{ scaleY: 1, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                        />
                      ))}
                    </div>
                    <div className={style.mockupRow}><div className={style.mockupLine} style={{ width: "55%" }} /></div>
                    <div className={style.mockupRow}><div className={style.mockupLine} style={{ width: "80%" }} /></div>
                  </div>
                </div>

                {/* floating phone */}
                <motion.div
                  className={style.floatingPhone}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className={style.phonePill} />
                  <div className={style.phoneScreen}>
                    <div className={style.phonePct}>
                      <svg viewBox="0 0 60 60" className={style.phoneSvg}>
                        <circle cx="30" cy="30" r="24" fill="none" stroke="#e9eef5" strokeWidth="5" />
                        <motion.circle
                          cx="30" cy="30" r="24"
                          fill="none" stroke="#22c55e" strokeWidth="5"
                          strokeDasharray="150.8" strokeDashoffset="150.8"
                          strokeLinecap="round"
                          transform="rotate(-90 30 30)"
                          whileInView={{ strokeDashoffset: 37.7 }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.4, ease: "easeOut", delay: 0.5 }}
                        />
                      </svg>
                      <span>75%</span>
                    </div>
                    <div className={style.phoneLabel}>Score</div>
                  </div>
                </motion.div>
              </div>
            </Reveal>

            {/* text */}
            <Reveal from="right" distance={50} delay={0.08}>
              <div className={style.practiceText}>
                <h2 className={`${style.practiceTitle} ${gideon.className}`}>
                  Practice Smarter.<br />
                  <span className={style.accentText}>Achieve</span> Greater.
                </h2>
                <p className={style.practiceDesc}>
                  Ultima brings together smart practice, detailed analytics, and AI-powered insights to help you perform your best in every exam.
                </p>
                <ul className={style.benefitList}>
                  {BENEFITS.map((b, i) => (
                    <motion.li
                      key={b}
                      className={style.benefitItem}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.12 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <motion.span
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: 0.18 + i * 0.09, type: "spring", stiffness: 400 }}
                      >
                        <CheckCircle size={16} className={style.benefitIcon} />
                      </motion.span>
                      {b}
                    </motion.li>
                  ))}
                </ul>
                <Link href="/products" className={style.ghostButton}>
                  Learn More <ArrowRight size={14} />
                </Link>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className={style.testimonialsSection}>
        <div className={style.sectionInner}>
          <SectionHead
            eyebrow="Loved by Learners"
            accentWord=""
            sub="Real stories from real achievers."
            light
          />
          <StaggerReveal className={style.testimonialsGrid} stagger={0.12} delayStart={0.06}>
            {TESTIMONIALS.map(({ quote, name, role, rating, avatar }) => (
              <StaggerChild key={name} from="bottom">
                <motion.div
                  className={style.testimonialCard}
                  whileHover={{ y: -6, scale: 1.01, boxShadow: "0 28px 52px rgba(15,23,42,0.11)" }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                >
                  <p className={style.testimonialQuote}>{quote}</p>
                  <div className={style.testimonialFooter}>
                    <div className={style.testimonialAvatar}>
                      <Image src={avatar} alt={name} width={44} height={44}
                        style={{ objectFit: "cover", borderRadius: "50%" }} />
                    </div>
                    <div>
                      <div className={style.testimonialName}>{name}</div>
                      <div className={style.testimonialRole}>{role}</div>
                    </div>
                    <Stars count={rating} />
                  </div>
                </motion.div>
              </StaggerChild>
            ))}
          </StaggerReveal>
          <div className={style.dots}>
            <span className={`${style.dot} ${style.dotActive}`} />
            <span className={style.dot} /><span className={style.dot} />
          </div>
        </div>
      </section>

      {/* ═══ CTA BANNER ═══ */}
      <section className={style.ctaSection}>
        <div className={style.sectionInner}>
          <Reveal from="scale" distance={0}>
            <div className={style.ctaBanner}>
              <div className={style.ctaOrb1} />
              <div className={style.ctaOrb2} />
              <motion.div
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Zap size={22} className={style.ctaIcon} />
              </motion.div>
              <h2 className={`${style.ctaTitle} ${gideon.className}`}>
                Ready to unlock your potential?
              </h2>
              <p className={style.ctaSub}>
                Join thousands of learners who are already ahead with Ultima.
              </p>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link href="/products" className={style.ctaButton}>
                  Practice Now <ChevronRight size={16} />
                </Link>
              </motion.div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default Home;