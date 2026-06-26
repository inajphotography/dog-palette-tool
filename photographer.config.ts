export const config = {
  photographer: {
    name: "Ina j Photography",
    logoPath: "/logo.png",
    websiteUrl: "https://inajphotography.com",
    ctaLabel: "Back to your session guide",
    ctaUrl: "https://inajphotography.com/session-guide",
  },
  subjects: [
    { noun: "dog", nounPlural: "dogs", coatWord: "coat" },
    { noun: "cat", nounPlural: "cats", coatWord: "fur" },
    { noun: "horse", nounPlural: "horses", coatWord: "coat" },
  ],
  collectiveNoun: "animal",
  branding: {
    coralRed: "#CA5E3C",
    darkGreen: "#232817",
    lightGreen: "#99934F",
    ivory: "#EEE8E0",
    ivoryLight: "#F7F4ED",
    lightPink: "#EABDAC",
    lightPinkMuted: "#F3E1D3",
    darkTeal: "#0F6668",
    darkBrown: "#6D341B",
    headingFont: "Alice",
    bodyFont: "Quicksand",
  },
  copy: {
    pageTitle: "What to Wear for Your Session",
    pageSubtitle: "Upload a photo of your animal and we'll create a personalised colour palette for your photography session.",
    uploadGuidelines: [
      "Clear photo of your animal in natural light",
      "One animal only for the most accurate palette",
      "Face and coat clearly visible",
    ],
    privacyNote: "Your photo isn't stored after analysis",
  },
} as const
