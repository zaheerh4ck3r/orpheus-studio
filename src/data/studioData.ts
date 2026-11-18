export interface StudioService {
  number: string;
  slug: string;
  title: string;
  inquiryLabel: string;
  coreQuestion: string;
  shortDescription: string;
  userNeed: string;
  deliverables: string[];
  outcome: string;
}

export interface ApproachStage {
  roman: string;
  number: string;
  title: string;
  description: string;
  clientExperience: string;
}

export interface AboutChapter {
  number: string;
  title: string;
  subtitle: string;
  body: string;
  quote?: string;
}

export const STUDIO_IMAGES = {
  brandCrestImage: '/assets/aistudio/Gemini_Generated_Image_mbt0ngmbt0ngmbt0_c96ad1d9.jpeg',
  brandCrestSvg: '/assets/aistudio/file_5d76b934.svg',
} as const;

export const STUDIO_CONFIG = {
  name: 'Orpheus Studios',
  tagline: 'MAKE THINGS THAT MOVE PEOPLE.',
  location: 'NSTP, NUST, Islamabad, Pakistan',
  shortLocation: 'Islamabad, Pakistan',
  availability: 'Working internationally',
  email: 'orpheusstidos@gmail.com',
  instagram: '@orpheusstudioss',
  instagramUrl: 'https://www.instagram.com/orpheusstudioss',
  contactEndpoint: import.meta.env?.VITE_CONTACT_ENDPOINT || '/api/contact',
} as const;

export const STUDIO_SERVICES: StudioService[] = [
  {
    number: '01',
    slug: 'brand-strategy',
    title: 'BRAND STRATEGY',
    inquiryLabel: 'Brand Strategy',
    coreQuestion: 'What truth makes your brand worth remembering?',
    shortDescription: 'Positioning, naming and verbal direction built before design begins.',
    userNeed:
      'When your message feels scattered, your brand sounds like everyone else, or you are preparing for a launch that needs clear conviction.',
    deliverables: [
      'Audience & cultural research',
      'Positioning & brand narrative',
      'Naming & verbal tone',
      'Campaign strategy',
    ],
    outcome:
      'Clarity across your entire team—so every film, campaign and page speaks with one unmistakable point of view.',
  },
  {
    number: '02',
    slug: 'creative-direction',
    title: 'CREATIVE DIRECTION',
    inquiryLabel: 'Creative Direction',
    coreQuestion: 'How should the entire world of a brand feel?',
    shortDescription: 'The aesthetic vision, visual language and narrative arc behind a brand.',
    userNeed:
      'When you want every shoot, campaign and touchpoint to feel authored by one cohesive sensibility rather than piecemeal freelancers.',
    deliverables: [
      'Campaign concepts & mood systems',
      'Film & photography art direction',
      'Editorial direction',
      'On-set & post supervision',
    ],
    outcome:
      'An unmistakable visual signature audiences recognise in a single frame—before they even see a logo.',
  },
  {
    number: '03',
    slug: 'film-production',
    title: 'FILM & PRODUCTION',
    inquiryLabel: 'Film & Production',
    coreQuestion: 'Which frame will linger after the screen goes dark?',
    shortDescription: 'Brand films, documentaries and commercials crafted with cinema discipline.',
    userNeed:
      'When static slides cannot carry the weight of your story and you need a film people actually feel and finish watching.',
    deliverables: [
      'Treatments & scripts',
      'Director-led production',
      'Brand documentaries & commercials',
      'Editing, colour & sound design',
    ],
    outcome:
      'Human connection that earns trust in minutes—turning complex ideas into moments audiences carry with them.',
  },
  {
    number: '04',
    slug: 'brand-identity-design',
    title: 'BRAND IDENTITY & DESIGN',
    inquiryLabel: 'Brand Identity & Design',
    coreQuestion: 'Can an emblem carry conviction without explanation?',
    shortDescription: 'Marks, typographic systems and editorial design built to endure.',
    userNeed:
      'When your visual presence no longer reflects the calibre of your work—or you are building a lasting identity from scratch.',
    deliverables: [
      'Logotypes, marks & monograms',
      'Typography & colour systems',
      'Print, packaging & editorial grids',
      'Brand guidelines',
    ],
    outcome:
      'Quiet authority everywhere your brand lives—from a business card to a cinema title sequence.',
  },
  {
    number: '05',
    slug: 'digital-experiences',
    title: 'DIGITAL EXPERIENCES',
    inquiryLabel: 'Digital Experiences',
    coreQuestion: 'What happens when a website reads like cinema and print?',
    shortDescription: 'Custom websites and interactive brand flagships designed around your story.',
    userNeed:
      'When a generic template strips away your character and you want a fast, memorable digital home that turns visitors into conversations.',
    deliverables: [
      'Digital architecture & UX',
      'Editorial web design',
      'Custom frontend engineering',
      'Restrained motion & interaction',
    ],
    outcome:
      'A focused digital flagship that feels unmistakably yours and makes reaching out effortless.',
  },
];

export const APPROACH_STAGES: ApproachStage[] = [
  {
    roman: 'I',
    number: '01',
    title: 'UNDERSTAND',
    description: 'We start by listening—to your story, your audience and what actually matters.',
    clientExperience:
      'No bloated decks or generic discovery forms. One focused working session to uncover the real tension and opportunity.',
  },
  {
    roman: 'II',
    number: '02',
    title: 'IMAGINE',
    description: 'We shape the central idea, narrative angle and visual world before production.',
    clientExperience:
      'You see clear creative directions early—with honest rationale on why each route works and how it moves people.',
  },
  {
    roman: 'III',
    number: '03',
    title: 'CREATE',
    description: 'Direction, film, identity and digital craft happen together under one roof.',
    clientExperience:
      'Because the people thinking through strategy also direct the shoot and design the frame, nothing gets lost in handoff.',
  },
  {
    roman: 'IV',
    number: '04',
    title: 'CONNECT',
    description: 'We refine every cut, detail and launch touchpoint so the work lands cleanly.',
    clientExperience:
      'Everything ships ready for the real world—built to resonate with audiences rather than fade with next month’s trend.',
  },
];

export const ABOUT_CHAPTERS: AboutChapter[] = [
  {
    number: '01',
    title: 'AN INDEPENDENT STUDIO',
    subtitle: 'Islamabad · International',
    body: 'Based at NSTP, NUST in Islamabad, Pakistan and collaborating internationally, Orpheus Studios brings filmmaking, brand strategy, creative direction, identity and digital design together at a deliberate scale.',
  },
  {
    number: '02',
    title: 'THE MYTHOLOGY BEHIND THE NAME',
    subtitle: 'Orpheus & The Lyre',
    body: 'In Greek mythology, Orpheus played music capable of moving rivers and stone—not through spectacle, but because it carried real feeling. That standard guides everything we make.',
    quote:
      'We borrow the ambition of Orpheus—not to imitate the past, but to create work that resonates in the present.',
  },
  {
    number: '03',
    title: 'STRATEGY & ART TOGETHER',
    subtitle: 'Beyond Surface Polish',
    body: 'Most commercial work is designed to be scrolled past. We start with a genuine point of view, strip away ornament that does not serve the idea, and let restraint carry the weight.',
  },
  {
    number: '04',
    title: 'ONE ROOF, NO HANDOFFS',
    subtitle: 'Perspective Across Borders',
    body: 'Working from Pakistan with an international outlook lets us pair South Asian visual heritage with global cinema and editorial craft—keeping the same curiosity from your first message to the final frame.',
  },
];
