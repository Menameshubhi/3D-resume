// ✏️ Edit everything here — this is all placeholder text. Swap in your real details.
window.CONTENT = {
  // 📄 Resume button — drop your real PDF at this path (same name) to replace the draft
  resume: { href: "resume/Shubhangi-Sharma-Resume.pdf", file: "Shubhangi-Sharma-Resume.pdf" },

  // Tip: each job below has a  logo: ""  slot — set it to e.g. "img/logos/interview-kickstart.png" (square image) to replace the initials.

  // 🗂️ Projects section — from your Framer case studies (shubhangisharma.framer.website). Hero images are in img/projects/.
  // "View case study" opens case-study.html?project=<slug>; "link" overrides that, "framer" adds a button to the original write-up.
  caseStudies: {
    intro: "Product work I've led across AI, sales, health and enterprise.",
    items: [
      { title: "AI Career Agent: Resume Analyser & Job Finder", slug: "ai-resume-analyser", tag: "Interview Kickstart", emoji: "🤖", c1: "#cfe0ff", c2: "#e8f0ff",
        image: "img/projects/ai-resume-analyser.jpg", link: "", framer: "https://shubhangisharma.framer.website/project/ai-resume-analyser",
        sub: "Led the end-to-end design of an AI career platform that addresses “Black Box” anxiety for senior engineers.",
        outcome: { heading: "Outcomes", metrics: [{ n: "+40%", t: "perceived job-search efficiency" }, { n: "+84%", t: "sales conversion metrics" }, { n: "+25%", t: "user trust scores" }], notes: [] } },
      { title: "AI-Driven Sales Intelligence Ecosystem", slug: "sales-intelligence", tag: "Interview Kickstart", emoji: "📈", c1: "#ffe3cc", c2: "#fff1e3",
        image: "img/projects/sales-intelligence.jpg", link: "", framer: "https://shubhangisharma.framer.website/project/ai-driven-sales-intelligence-ecosystem",
        sub: "A three-tiered, AI-powered sales platform integrating management analytics, call insights and pipeline execution.",
        outcome: { heading: "Outcomes", metrics: [{ n: "24%", t: "increase in tracking user's intent" }, { n: "48%", t: "boost in resolving doubts & onboarding" }, { n: "35%", t: "increase in user acquisition" }], notes: [] } },
      { title: "The Chronic Care Ecosystem", slug: "lifestyle-management", tag: "Visit Health", emoji: "💜", c1: "#e3dcff", c2: "#f1ecff",
        image: "img/projects/lifestyle-management.jpg", link: "", framer: "https://shubhangisharma.framer.website/project/lifestyle-management",
        sub: "A scalable chronic care ecosystem that unifies patient tracking and clinical support to streamline disease management.",
        outcome: { heading: "Outcomes", metrics: [{ n: "47%", t: "increase in adherence to health plans" }, { n: "16%", t: "increase in plan rollout efficiency" }, { n: "37%", t: "improvement in platform engagement" }], notes: [] } },
      { title: "Enterprise Policy Enrolment Portal", slug: "policy-enrolment-portal", tag: "Visit Health", emoji: "🛡️", c1: "#dff6c8", c2: "#eefbe0",
        image: "img/projects/policy-enrolment-portal.jpg", link: "", framer: "https://shubhangisharma.framer.website/project/policy-enrolment-portal",
        sub: "Simplified enterprise policy onboarding with a modular multi-policy framework and a tokenised design system.",
        outcome: { heading: "Outcomes", metrics: [{ n: "35%", t: "increase in enrolment completion" }, { n: "40%", t: "more voluntary top-up purchases" }, { n: "60%", t: "decrease in HR reach-outs" }], notes: ["Also reported: an 18% boost in enrolments"] } }
    ]
  },

  // 📄 Case-study page content (case-study.html?project=<slug>). Text starting with "TODO:" shows as a dashed "to write" box.
  // Images: img/projects/<slug>-1.jpg, -2.jpg, -3.jpg appear in the gallery automatically; the cover is the card image.
  caseDetails: {
    "ai-resume-analyser": {
      meta: { Role: "Led end-to-end design", Type: "Product work · AI career platform", Timeline: "2 weeks", Team: "Product Manager, AI/Backend Engineers, business stakeholders", Tools: "Figma" },
      overview: ["At Interview Kickstart I led the end-to-end design of an AI career platform that addresses “Black Box” anxiety for senior engineers, focused on the pre-interview job-search phase."],
      problem: ["Senior job seekers were overwhelmed by fragmented searching across 45+ portals, and distrusted opaque AI resume rewrites."],
      process: [
        { title: "Benchmarking & audits", text: "Competitive benchmarking and heuristic audits." },
        { title: "AI architecture & prompts", text: "Worked across functions on the AI architecture and prompt engineering." },
        { title: "Testing & validation", text: "Internal user testing and alumni validation." },
        { title: "Ruthless scoping", text: "Advocated against building a complex inline text editor for the MVP, saving weeks of engineering overhead." }
      ],
      solution: ["A unified job feed, transparent match scoring and role alignment, a contextual resume elevator with algorithmic guardrails, and an “Inspect & Veto” verification flow so users can review changes side by side before downloading.", "TODO: Add screens and the reasoning behind each decision: ai-resume-analyser-1.jpg, -2.jpg, -3.jpg."],
      reflection: ["TODO: What did you learn about designing explainable AI? What would you do next?"]
    },
    "sales-intelligence": {
      meta: { Role: "UX design for sales dashboards (research, AI, data visualization)", Type: "Product work · Sales intelligence", Timeline: "TODO: add dates", Team: "Product Manager, engineers, sales leadership, sales team", Tools: "Figma, HubSpot, BigQuery, DCD call transcription" },
      overview: ["Instead of one monolithic dashboard, I designed a three-tiered, AI-powered sales platform integrating management analytics, call insights and pipeline execution. Interview Kickstart offers upskilling programs for mid- to late-career professionals aiming for senior roles at FAANG+ companies."],
      problem: ["The sales team was given a single all-encompassing dashboard, but managers, coaches and reps each had different needs."],
      process: [
        { title: "Challenging the brief", text: "Questioned the single-dashboard approach and found distinct needs per role." },
        { title: "Partnering with engineering early", text: "A tokenized component structure and clear BigQuery versioning rules reduced handoff friction." },
        { title: "Discarded iterations", text: "Explored and discarded options before landing on the three-tier structure." }
      ],
      solution: ["Three purpose-built dashboards: Sales Insights & Rigor for managers; AI-driven call intelligence with multi-call aggregation for coaches and reps; and a Temperature Engine to prioritise leads for sales reps.", "TODO: Add dashboard screens: sales-intelligence-1.jpg, -2.jpg, -3.jpg."],
      reflection: ["TODO: What worked, what you would change?"]
    },
    "lifestyle-management": {
      meta: { Role: "Design contributor — research, journeys, wireframes, UX, hi-fi prototyping", Type: "Product work · Chronic care", Timeline: "8–12 weeks", Team: "Co-founders, telehealth team, developers, doctors, business team", Tools: "Figma, FigJam" },
      overview: ["A scalable chronic care ecosystem for Visit Health that unifies patient tracking and clinical support to streamline disease management. Visit Health offers lifestyle management programs for diabetes and hypertension, driven by corporate and insurer demand."],
      problem: ["Coaches ran chronic care programs independently, which meant fragmented data and high dropout. About 20% of users dropped out mid-way because progress was invisible; onboarding calls ran 20 minutes and asked 30 redundant lifestyle questions."],
      process: [
        { title: "Deep-dive immersion", text: "Stakeholder interviews and immersion in how coaches actually work." },
        { title: "Firsthand empathy building", text: "Built empathy for patients and coaches first-hand." },
        { title: "Cross-functional whiteboarding", text: "Whiteboarding and affinity mapping in FigJam with the wider team." },
        { title: "From paper to systems", text: "Moved from paper sketches to a shared, cross-platform design system." }
      ],
      solution: ["A patient mobile app linked to a coach web dashboard, a shorter categorised onboarding flow, smart health reports with AI-driven engagement, and standardised operational workflows.", "TODO: Add screens: lifestyle-management-1.jpg, -2.jpg, -3.jpg."],
      reflection: ["TODO: What would you do differently?"]
    },
    "policy-enrolment-portal": {
      meta: { Role: "UX design — research, journeys, design system, wireframes, prototyping, tokenization", Type: "Product work · Enterprise portal", Timeline: "8 weeks", Team: "Co-founder, Product Manager, developers", Tools: "Figma" },
      overview: ["I streamlined enterprise policy onboarding at Visit Health with a modular multi-policy framework and a tokenised design system, boosting enrolments by 18%. Visit Health offers OPD and insurance benefits to corporate employees."],
      problem: ["The legacy enrolment portal gave users too little information, so they depended on relationship managers, causing onboarding delays and drop-offs."],
      process: [
        { title: "Research & discovery", text: "Cross-functional discovery and competitor analysis." },
        { title: "Aligning stakeholders", text: "Kept stakeholders aligned under tight deadlines." },
        { title: "Internal testing", text: "Internal user testing and validation." },
        { title: "Modular architecture", text: "A modular architecture and customisation system so each corporate client could be configured." }
      ],
      solution: ["A single multi-policy onboarding journey, real-time premium and dependent tracking, simpler plan-comparison screens, and a reusable tokenised design system that let developers launch custom corporate portals faster.", "TODO: Add screens: policy-enrolment-portal-1.jpg, -2.jpg, -3.jpg."],
      reflection: ["TODO: What did you learn from this project?"]
    }
  },

  // 💬 Testimonials (profile pictures are Minecraft-style placeholders in img/testimonials/ — set  photo  to a real image path to replace them) — from the "Praise from Peers" section of your Framer site. Two of them were cut off when I copied them (marked with …): paste the full text here.
  testimonials: {
    intro: "Kind words from the people I've built things with.",
    items: [
      { name: "Aniket Sriwastva", photo: "img/testimonials/aniket.svg", role: "SDE II (Full-Stack Developer), Visit Health", color: "#ffd0b8",
        quote: "I've been working with Shubhangi, since 1+ year. She's creative and a fast thinker, whenever we came across a blocker…" },
      { name: "Gagan Vasanth", photo: "img/testimonials/gagan.svg", role: "SDE III (Full-Stack Developer), Walmart", color: "#d8c8ff",
        quote: "What distinguishes Shubhangi is not only her technical proficiency but also her ability to comprehend the core of a project…" },
      { name: "Sourav Verma", photo: "img/testimonials/sourav.svg", role: "Product Manager, Visit Health | Ex-Swiggy", color: "#c4f0d6",
        quote: "Shubhangi possesses a rare combination of technical expertise and creative flair." },
      { name: "Shaswat Mishra", photo: "img/testimonials/shaswat.svg", role: "Product Manager, Visit Health | Ex-Cognizant", color: "#b8d8ff",
        quote: "Shubhangi is a highly collaborative and communicative individual." }
    ]
  },

  // ✨ Extras — three link cards, each with a floating voxel icon
  extras: {
    intro: "More of what I make and write, outside of client work.",
    items: [
      { icon: "figma", title: "Figma Community", handle: "@shubhangi_", accent: "#ffb8cf",
        desc: "Free files I've shared — a tarot reading kit, animal illustrations in three art forms, and an atomic design system for rebranding with Claude.",
        button: "Visit Figma profile", href: "https://www.figma.com/@shubhangi_" },
      { icon: "code", title: "GitHub", handle: "@Menameshubhi", accent: "#c8f0d8",
        desc: "Where my code experiments and side projects live.",
        button: "Visit GitHub profile", href: "https://github.com/Menameshubhi/" },
      { icon: "news", title: "Medium", handle: "@menameshubhi", accent: "#d8c8ff",
        desc: "Articles on product design, AI-assisted workflows, and designing dashboards that aren't boring.",
        button: "Read on Medium", href: "https://medium.com/@menameshubhi" }
    ]
  },

  // 🦶 Footer (social links are the ones from your Framer site)
  footer: {
    tagline: "Product designer building 0-to-1 products, design systems and tiny pixel worlds.",
    socials: [
      { label: "LinkedIn",  href: "https://www.linkedin.com/in/shubhangi-sharma-product/" },
      { label: "Instagram", href: "https://www.instagram.com/thatuiperson/" },
      { label: "Dribbble",  href: "https://dribbble.com/Menameshubhi" },
      { label: "Behance",   href: "https://www.behance.net/Shubhangi_sharma" },
      { label: "Medium",    href: "https://medium.com/@menameshubhi" },
      { label: "Figma",     href: "https://www.figma.com/@shubhangi_" },
      { label: "GitHub",    href: "https://github.com/Menameshubhi/" }
    ]
  },

  // 💼 Work experience (from shubhangisharma.framer.website). Save your real logo files in img/logos/ with these exact names: dexity.png, visit-health.png, affixious.png, kalyani.png (initials show until the file exists).
  work: {
    summary: "Product Designer with 5+ years of experience scaling 0-to-1 platforms and enterprise ecosystems.",
    jobs: [
      { role: "Product Designer 2", company: "Dexity (formerly Interview Kickstart)", period: "Sep 2025 – Sep 2026", place: "Remote, Bengaluru", initial: "D", color: "#ffd6e4", logo: "img/logos/dexity.png",
        points: [
          "Streamlined a native mobile app for tools like a salary analyser, resume analyser and career roadmapping, improving cross-tool engagement through cohesive navigation.",
          "Built a component-based design system and AI workflows using Claude to generate landing page variations and speed up marketing and design handoff.",
          "Designed an AI Resume Analyser and Job Finder that supports real-time profile optimisation and generates ATS-compatible resumes for each job description.",
          "Owned 0-to-1 products, design system architecture and governance, and mentored junior designers."] },
      { role: "Lead Product Designer (Freelance)", company: "Freelance", period: "Apr 2025 – Sep 2025", place: "Noida", initial: "FL", color: "#dccfff", logo: "",
        points: [
          "Led 0-to-1 architecture for an LMS platform in career counselling, and hired, onboarded and mentored a two-person design team for long-term scalability.",
          "Redesigned the website user journey for a German network provider (Varietel.De).",
          "Consulted on design solutions for a stealth health-tech startup (Tap Health) for a short period."] },
      { role: "Product Designer", company: "Visit Health", period: "Oct 2022 – Apr 2025", place: "Noida", initial: "VH", color: "#c6f0de", logo: "img/logos/visit-health.png",
        points: [
          "Revamped and governed the mobile app, adding features and improving user flows for different user needs. Also worked on the web app.",
          "Built AI-backed internal dashboards for operations, network and doctor teams to support better decision-making.",
          "Led 0-to-1 policy onboarding experiences and corporate portals, reporting an 18% boost in enrollments and a 17% increase in operational efficiency.",
          "Created a custom data ecosystem linking users with health coaches for personalised coaching and live updates.",
          "Designed gamified campaigns (Stepathon and Wellness Saga) that reported a 30% increase in user engagement.",
          "Mentored UI/UX designers in problem-solving and design system management."] },
      { role: "UI/UX Designer", company: "Affixious Consultancy", period: "Dec 2021 – Oct 2022", place: "Noida", initial: "AC", color: "#ffe2c6", logo: "img/logos/affixious.png",
        points: [
          "Streamlined the train booking process and led the redesign of the flight booking feature for MyHolidays across web and mobile.",
          "Established and maintained design systems on Zeroheight to standardise component references for developer handoff.",
          "Worked with product managers and developers on booking flows and data-driven brand landing pages."] },
      { role: "Web/Graphic Designer", company: "Kalyani Innerwear Pvt. Ltd.", period: "Jan 2021 – Dec 2021", place: "Delhi, India", initial: "KI", color: "#cde8ff", logo: "img/logos/kalyani.png",
        points: [
          "Led rebranding and digital packaging for the Maashie brand, reporting a 20% increase in brand recognition and a 20% rise in online sales.",
          "Mentored junior designers and guided social media design strategy."] }
    ]
  },

  // 🛠️ Desk → passion projects
  projects: {
    intro: "Things I build on my own time. Tap the image to see it full size, or open the full write-up.",
    items: [
      { title: "Cooklie", sub: "Your all-in-one kitchen buddy & recipe customizer", emoji: "🍳", tags: ["mobile app", "0-to-1", "Figma"], c1: "#ffd0b8", c2: "#ffb8cf",
        desc: "A platform that helps home cooks replicate, personalize, scale, and share recipes — with smart ingredient adjustments and a hands-free cooking assistant. Built 0-to-1 with an engineer co-founder.",
        link: "https://shubhangisharma.framer.website/personal-project/cooklie",
        image: "img/personal/cooklie-1.jpg" },
      { title: "AI-Ready Atomic Design System", sub: "Built for designers in Figma and AI agents in Claude Code", emoji: "🧩", tags: ["design system", "Figma", "Claude Code"], c1: "#d8c8ff", c2: "#b8e6ff",
        desc: "A design system that works for both human designers and AI coding agents, connecting Figma to Claude Code so UI can be generated from text prompts. Reports a 70% reduction in design-to-code translation time.",
        link: "https://shubhangisharma.framer.website/personal-project/design-system",
        image: "img/personal/design-system-1.jpg" },
      { title: "Margg", sub: "0-to-1 career roadmaps & AI mock interviews for tech aspirants", emoji: "🧭", tags: ["learning platform", "AI mock interviews", "0-to-1"], c1: "#c4f0d6", c2: "#fff0b8",
        desc: "A guided learning platform that helps graduates bridge the gap between university and industry, with a diagnostic engine, structured courses and AI-powered mock interviews. Led a team of 2 designers and a content writer.",
        link: "https://shubhangisharma.framer.website/personal-project/margg",
        image: "img/personal/margg-1.jpg" }
    ]
  },

  // 🪞 Mirror → about me
  about: {
    name: "Shubhangi Sharma", initial: "S", role: "Senior Product Designer · Bengaluru, India",
    tagline: "Hi! Nice to see you in my room.",
    c1: "#ffc6d9", c2: "#d8c8ff",
    bio: [
      "I'm a Senior Product Designer with 5+ years of experience crafting AI-integrated products, scalable design systems, and intuitive user experiences.",
      "Driven by a relentless curiosity and a builder’s mindset, I combine strong UI/UX foundations with technical fluency (React, HTML/CSS, design tokens) to bridge the gap between design and engineering.",
      "Adventurous, adaptable, and constantly leveling up—I bring passion, cross-functional energy, and strategic rigor to teams tackling ambitious challenges."
    ],
    facts: [["📍 Based in", "Bengaluru, India"], ["💼 Experience", "5+ years in product design"], ["🧩 Focus", "AI-integrated products & design systems"], ["🛠️ Tools", "Figma, React, HTML/CSS, design tokens"]]
  },

  // 📚 Last 3 reads (covers saved in img/books/)
  books: [
    { title: "When We Were Monsters", author: "Jennifer Niven", year: "2025", color: "#ffb8cf",
      cover: "img/books/when-we-were-monsters.jpg", url: "https://www.goodreads.com/book/show/223854632-when-we-were-monsters",
      note: "Eight students at an elite New England boarding school are picked for a sixteen-day writing workshop at a remote estate — and things get unsettling fast." },
    { title: "The Mystery of the Blue Train", author: "Agatha Christie", year: "1928", color: "#b8d8ff",
      cover: "img/books/mystery-of-the-blue-train.jpg", url: "https://www.goodreads.com/en/book/show/16335.The_Mystery_of_the_Blue_Train",
      note: "A glamorous night train from London to the French Riviera turns criminal when a legendary jewel vanishes, and Hercule Poirot is on the case." },
    { title: "One Amazing Thing", author: "Chitra Banerjee Divakaruni", year: "2009", color: "#c4f0d6",
      cover: "img/books/one-amazing-thing.jpg", url: "https://www.goodreads.com/en/book/show/6585252-one-amazing-thing",
      note: "After an earthquake traps nine strangers in a visa office, they pass the time by telling their stories — a novel about how storytelling keeps people going." }
  ],

  // Spotify app inside the iPad
  spotify: {
    user: "menameshubhi",
    profile: "https://open.spotify.com/user/menameshubhi",
    trackUri: "spotify:track:49JeKZqejPtqJKpK7x9Ew4",   // Patient Zero — Taylor Swift
    art: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02b2de0f5e12f0b369fde79953",
    title: "Patient Zero",
    artist: "Taylor Swift",
    caption: "I'm listening to this on repeat"
  },

  // 🐱 iPad → Hobbies (photos live in img/hobbies/). Captions show on hover; click a photo to see it full size.
  hobbies: {
    intro: "A few of the things that fill my free time.",
    items: [
      { title: "Painting",          src: "img/hobbies/painting.jpg" },
      { title: "Diamond painting",  src: "img/hobbies/diamond-painting.jpg" },
      { title: "Pottery",           src: "img/hobbies/pottery.jpg" },
      { title: "Snowman crochet",   src: "img/hobbies/snowman-crochet.jpg" },
      { title: "Pencil case",       src: "img/hobbies/pencil-case.jpg" },
      { title: "Crochet whale",     src: "img/hobbies/whale.jpg" }
    ]
  },

  // 🌄 Pegboard travel stories (photos in img/travel/). The order here is the order on the page and on the 3D pegboard.
  travel: [
    { place: "Sinquerim Beach, Goa", tag: "My most recent trip", photo: "img/travel/goa.jpg", c1: "#ffe2b8", c2: "#ffc6d9",
      story: "My recent trip to Goa, at Sinquerim Beach. I made new friends and travelled around with them." },
    { place: "Tungnath Temple", tag: "The highest Shiva temple", photo: "img/travel/tungnath.jpg", c1: "#b0d4ff", c2: "#d8c8ff",
      story: "Hiked up to Tungnath, the highest Shiva temple in the world. We started at 3am to reach the top." },
    { place: "Mana Village", tag: "The first village of India", photo: "img/travel/mana-village.jpg", c1: "#b8f0d4", c2: "#a8dcff",
      story: "Travelled by car to Mana, the first village of India, with the Himalayas all around." },
    { place: "Bir Billing", tag: "My first solo trip", photo: "img/travel/bir-billing.jpg", c1: "#ffc4a8", c2: "#ff9fb8",
      story: "My very first solo trip. I went on my own and came back with a lot of new friends and a lot of memories." },
    { place: "Kochi Biennale 2026", tag: "Art from all over the world", photo: "img/travel/kochi-biennale.jpg", c1: "#d8c8ff", c2: "#ffc6d9",
      story: "Went to the Kochi Biennale 2026 — a great event, with artists from all over the world and so much to take in." },
    { place: "Ellora Caves, Maharashtra", tag: "A historic family trip", photo: "img/travel/ellora-caves.jpg", c1: "#e8d8c0", c2: "#ffe2b8",
      story: "A historic trip to the Ellora Caves in Maharashtra with my family." },
    { place: "Kasauli, Himachal", tag: "An impromptu day trip", photo: "img/travel/kasauli.jpg", c1: "#ffd8a8", c2: "#d8c8ff",
      story: "An impromptu one-day trip to Kasauli in Himachal, and back to Delhi, with two of my best friends." }
  ]
};
