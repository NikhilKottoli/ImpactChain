import { ArrowRight } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const subRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const patternRef = useRef<HTMLImageElement | null>(null);
  const leftImgRef = useRef<HTMLImageElement | null>(null);
  const rightImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Intro timeline
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.set(
        [headingRef.current, subRef.current, ctaRef.current, heroRef.current],
        { autoAlpha: 0, y: 40 }
      );
      tl.set([leftImgRef.current, rightImgRef.current], {
        autoAlpha: 0,
        y: 60,
        rotate: 2,
      });
      tl.to(headingRef.current, { autoAlpha: 1, y: 0, duration: 0.8 })
        .to(subRef.current, { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.4")
        .to(ctaRef.current, { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.3")
        .to(heroRef.current, { autoAlpha: 1, y: 0, duration: 0.8 }, "-=0.4")
        .to(
          [leftImgRef.current, rightImgRef.current],
          { autoAlpha: 1, y: 0, rotate: 0, duration: 0.9, stagger: 0.15 },
          "-=0.6"
        );

      // Parallax background pattern
      if (patternRef.current) {
        gsap.to(patternRef.current, {
          yPercent: 15,
          ease: "none",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      // Side images subtle parallax
      [leftImgRef, rightImgRef].forEach((r, i) => {
        if (!r.current) return;
        gsap.to(r.current, {
          yPercent: i === 0 ? -10 : 12,
          scale: 1.03,
          ease: "none",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      // Hero card float
      if (heroRef.current) {
        gsap.to(heroRef.current, {
          y: -60,
          scale: 1.02,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top center+=150",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      // Heading color shift
      if (headingRef.current) {
        gsap.to(headingRef.current, {
          color: "#111",
          filter: "drop-shadow(0 4px 18px rgba(0,0,0,0.12))",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top center",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      // CTA pulse
      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { scale: 1 },
          {
            scale: 1.025,
            yoyo: true,
            repeat: 1,
            duration: 0.5,
            delay: 1.6,
            ease: "power1.inOut",
          }
        );
      }

      // Base scroll-trigger reveal animations (generic)
      const revealEls = gsap.utils.toArray<HTMLElement>("[data-scroll-reveal]");
      revealEls.forEach((el, i) => {
        const fade = el.dataset.fade === "true";
        gsap.from(el, {
          autoAlpha: fade ? 0 : 1,
          y: 50,
          duration: 0.9,
          ease: "power3.out",
          delay: i * 0.05,
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      });

      // Horizontal slide variant
      const slideEls = gsap.utils.toArray<HTMLElement>("[data-scroll-slide]");
      slideEls.forEach((el, i) => {
        const dir = el.dataset.dir === "right" ? 60 : -60;
        gsap.from(el, {
          autoAlpha: 0,
          x: dir,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      });

      // Stagger children container
      const staggerContainers = gsap.utils.toArray<HTMLElement>(
        "[data-stagger-children]"
      );
      staggerContainers.forEach((c) => {
        const children = Array.from(c.children);
        gsap.set(children, { autoAlpha: 0, y: 40 });
        gsap.to(children, {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: c,
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <main>
      <div ref={rootRef} className="w-full h-screen relative bg-[#FBF3F0]">
        <div className="absolute">
          <Link
            to="/"
            className="flex items-center z-[100] fixed top-10 left-10"
          >
            <img src="/logo.svg" alt="Platform Logo" className="h-12 mr-3" />
          </Link>
          <div className="flex items-center gap-3 bg-white rounded-full shadow-md fixed top-10 right-10 z-[100]">
            <Link to="/login">
              <button className="px-5 py-2 bg-[#fff] text-sm font-semibold rounded-full hover:bg-[#1c99c6] transition-colors text-black/60 shadow-lg">
                Login
              </button>
            </Link>
          </div>
        </div>

        <img
          ref={patternRef}
          className="hidden lg:block absolute bottom-0 left-0 h-[50%] w-full object-cover"
          src="heropattern.png"
          alt=""
        />
        <img
          ref={leftImgRef}
          className="hidden lg:block absolute left-0 top:[40%] h-[50%] object-cover z-80 w-[20%] border-2 border-black/40"
          src="share.png"
          alt=""
        />
        <img
          ref={rightImgRef}
          className="hidden lg:block absolute right-0 top-[15%] h-[50%] object-cover z-80 w-[20%] grayscale border-2 border-black/40"
          src="login.png"
          alt=""
        />

        <div className="absolute inset-0 z-10 h-full w-full bg-[#fbf3f000] [background:radial-gradient(125%_125%_at_50%_80%,#FBF3F000_40%,#26AFE0_100%)]"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-4">
          <div className="relative pt-100 lg:pt-120">
            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                <a
                  href="#"
                  className="bg-background group mx-auto flex w-fit items-center gap-4 rounded-full border p-8 pl-4 shadow-md transition-colors duration-300"
                  data-scroll-reveal
                  data-fade="true"
                >
                  <span className="text-sm">
                    Have an impact idea? Share it & verify it on-chain
                  </span>
                  <span className="block h-4 w-0.5 border-l "></span>
                  <div className="group-hover:bg-gray-50 size-6 overflow-hidden rounded-full duration-500">
                    <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                      <span className="flex size-6">
                        <ArrowRight className="m-auto size-3" />
                      </span>
                      <span className="flex size-6">
                        <ArrowRight className="m-auto size-3" />
                      </span>
                    </div>
                  </div>
                </a>

                <h1
                  ref={headingRef}
                  className="mx-auto mt-8 max-w-4xl text-balance text-5xl font-bold shadow-xl md:text-7xl lg:mt-16 will-change-transform"
                >
                  <span> Impact Chain</span>
                  <span
                    style={{ fontStyle: "italic" }}
                    className="playfair-display font-thin text-[#525252]"
                  >
                    {" "}
                    Verify Social Good
                  </span>
                  <br />
                </h1>

                <p
                  ref={subRef}
                  className="mx-auto mt-8 max-w-2xl text-balance text-lg text-black/40 will-change-transform"
                >
                  Create campaigns, document your social impact activities, and
                  earn rewards through verified attestations on a decentralized
                  platform for positive change.
                </p>

                <div
                  ref={ctaRef}
                  className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row will-change-transform"
                  data-scroll-reveal
                  data-fade="true"
                >
                  <div className="bg-black/10 rounded-xl border p-0.5">
                    <Link to="/social">
                      <button className="px-8 py-3 bg-[#26AFE0] text-white font-semibold rounded-lg hover:bg-[#1c99c6] transition-all shadow-lg">
                        Explore Campaigns
                      </button>
                    </Link>
                  </div>
                  <Link to="/create">
                    <button className="px-8 py-3 bg-white text-[#26AFE0] font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-lg">
                      Create Impact Post
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            <div
              className="relative -mr-56 mt-8 overflow-hidden p-12 sm:mr-0 sm:mt-12 md:mt-20 will-change-transform"
              ref={heroRef}
            >
              <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border p-4 shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] bg-white">
                <img
                  className="aspect-[15/8] relative rounded-2xl w-full bg-amber-200"
                  src="/demo.png"
                  alt="Platform dashboard preview"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll sections (examples) */}
      <section className="py-28 bg-white mt-120">
        <div
          className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10"
          data-stagger-children
        >
          <div
            className="p-6 rounded-xl border bg-[#FBF3F0]"
            data-scroll-reveal
            data-fade="true"
          >
            <h3 className="font-semibold mb-2">On-Chain Proof</h3>
            <p className="text-sm text-black/60">
              Every impact post becomes a verifiable attestation.
            </p>
          </div>
          <div
            className="p-6 rounded-xl border"
            data-scroll-reveal
            data-fade="true"
          >
            <h3 className="font-semibold mb-2">Incentivized Action</h3>
            <p className="text-sm text-black/60">
              Earn rewards for transparent, validated contributions.
            </p>
          </div>
          <div
            className="p-6 rounded-xl border"
            data-scroll-reveal
            data-fade="true"
          >
            <h3 className="font-semibold mb-2">Community Trust</h3>
            <p className="text-sm text-black/60">
              Reputation signals help funders discover real impact.
            </p>
          </div>
        </div>
      </section>

      <section className="py-32 bg-[#F7FAFC]">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div data-scroll-slide data-dir="left">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Build Transparent Impact
            </h2>
            <p className="text-black/60 mb-6">
              Campaign organizers, volunteers, auditors, and funders interact in
              a shared trust layer that reduces fraud and increases attribution.
            </p>
            <Link to="/create">
              <button className="px-6 py-3 bg-[#26AFE0] text-white rounded-lg shadow hover:bg-[#1c99c6]">
                Start Posting
              </button>
            </Link>
          </div>
          <div
            className="rounded-2xl border bg-white p-6 shadow"
            data-scroll-slide
            data-dir="right"
          >
            <img
              src="/demo.png"
              alt="Workflow"
              className="rounded-lg aspect-video object-cover"
            />
          </div>
        </div>
      </section>

      <section className="py-32 bg-white">
        <div
          className="max-w-5xl mx-auto px-6 text-center"
          data-scroll-reveal
          data-fade="true"
        >
          <h2 className="text-4xl font-bold mb-6">Ready to Verify Good?</h2>
          <p className="text-black/60 max-w-2xl mx-auto mb-10">
            Join early adopters pioneering transparent, attestable social
            impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/social">
              <button className="px-8 py-3 bg-[#26AFE0] text-white rounded-lg shadow hover:bg-[#1c99c6]">
                Explore Campaigns
              </button>
            </Link>
            <Link to="/create">
              <button className="px-8 py-3 bg-black/5 text-[#26AFE0] rounded-lg shadow hover:bg-black/10">
                Create Impact Post
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

// npm i gsap
