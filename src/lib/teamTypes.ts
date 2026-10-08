export type PinColor = "orange" | "purple" | "pink" | "blue" | "dark";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  ref?: string;
  department?: string;
  tag?: string;
  note?: string;
  image?: string;
  pinColor?: PinColor;
  hasPin?: boolean;
  bg?: string;
  textColor?: string;
  borderColor?: string;
  rotationClass?: string;
}

export interface FounderData {
  name: string;
  position: string;
  tag?: string;
  bio: string;
  image: string;
  expertise: string[];
  email: string;
  studioName?: string;
  focusTitle?: string;
  focusNote?: string;
}

export interface JoinTeamData {
  badge?: string;
  heading: string;
  description: string;
  ctaText: string;
  whatsappNumber?: string;
  whatsappMessage?: string;
  ctaUrl?: string;
  subtext?: string;
}

export interface TeamIntroData {
  badge?: string;
  heading?: string;
  description?: string;
}

export interface TeamData {
  intro: TeamIntroData;
  founder: FounderData;
  members: TeamMember[];
  join: JoinTeamData;
}

export const DEFAULT_TEAM_DATA: TeamData = {
  intro: {
    badge: "THE COLLECTIVE",
    heading: "The people behind the visual system.",
    description: "A lean visual production board bridging editorial art direction with proprietary AI synthesis."
  },
  founder: {
    name: "Deepak Kumawat",
    position: "FOUNDER & CREATIVE DIRECTOR",
    tag: "✦ SELECTED DIRECTION",
    bio: "Deepak founded GROTON AI Studio and Grafly Studio to help emerging and modern brands grow through stronger visual communication. His vision is to make premium creative production more accessible, efficient, and scalable — combining creative direction, AI-powered visual production, and a strong understanding of commercial imagery.",
    image: "",
    expertise: [
      "Creative Direction",
      "Visual Synthesis",
      "Lighting Logic",
      "Pipelines"
    ],
    email: "deepak@graflystudio.com",
    studioName: "Grafly Studio / GROTON AI",
    focusTitle: "Directorial Focus",
    focusNote: "✎ core pipeline"
  },
  members: [
    {
      id: "02",
      name: "Anonymous",
      role: "Generative Art & AI",
      ref: "BENCH // 01",
      department: "STUDIO POSITION",
      hasPin: true,
      pinColor: "purple",
      tag: "IN PROGRESS",
      bg: "#F5F2FF",
      textColor: "#6D28D9",
      borderColor: "#DDD6FE",
      rotationClass: "rotate-0 sm:rotate-[1.2deg] lg:translate-y-2 hover:rotate-0 hover:translate-y-0",
      note: "✎ diffusion models",
      image: ""
    },
    {
      id: "03",
      name: "Anonymous",
      role: "Creative & Art Direction",
      ref: "BENCH // 02",
      department: "STUDIO POSITION",
      hasPin: true,
      pinColor: "dark",
      tag: "DIRECTION",
      bg: "#F4F1EA",
      textColor: "#4B4842",
      borderColor: "#DDD7CD",
      rotationClass: "rotate-0 sm:rotate-[-1.5deg] lg:translate-y-6 hover:rotate-0 hover:translate-y-0",
      note: "✎ styling & mood",
      image: ""
    },
    {
      id: "04",
      name: "Anonymous",
      role: "Visual Research & 3D",
      ref: "BENCH // 03",
      department: "STUDIO POSITION",
      hasPin: true,
      pinColor: "blue",
      tag: "EXPLORE",
      bg: "#EFF6FF",
      textColor: "#1D4ED8",
      borderColor: "#BFDBFE",
      rotationClass: "rotate-0 sm:rotate-[1.0deg] lg:translate-y-1 hover:rotate-0 hover:translate-y-0",
      note: "✎ 3D lighting SOP",
      image: ""
    },
    {
      id: "05",
      name: "Anonymous",
      role: "Retouching & Finishing",
      ref: "BENCH // 04",
      department: "STUDIO POSITION",
      hasPin: true,
      pinColor: "pink",
      tag: "FINISHING",
      bg: "#FFF1F2",
      textColor: "#BE123C",
      borderColor: "#FECDD3",
      rotationClass: "rotate-0 sm:rotate-[-1.3deg] lg:translate-y-5 hover:rotate-0 hover:translate-y-0",
      note: "✎ quality control",
      image: ""
    }
  ],
  join: {
    badge: "CAREERS & COLLABORATIONS",
    heading: "Join Our Team",
    description: "We’re building a small, ambitious team shaping the future of visual production. If you think visually, experiment relentlessly, and care about the details, we’d like to hear from you.",
    ctaText: "Join Our Team",
    whatsappNumber: "916378083205",
    whatsappMessage: `Hi GROTON AI,\n\nI’m interested in joining your team.\n\nName:\nRole / Specialization:\nExperience:\nPortfolio:\n\nI’d love to discuss potential opportunities with the team.\n\nThank you.`,
    subtext: "Direct Inquiry via WhatsApp"
  }
};
