export interface MenuTheme {
  id: string;
  name: string;
  nameAr: string;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    cardBg: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  styles: {
    headerStyle: string;
    cardStyle: string;
    buttonStyle: string;
    priceStyle: string;
    searchStyle: string;
  };
}

export const menuThemes: Record<string, MenuTheme> = {
  classic: {
    id: "classic",
    name: "Classic",
    nameAr: "كلاسيكي",
    preview: "🎨",
    colors: {
      primary: "#059669",
      secondary: "#f5f5dc",
      accent: "#d4af37",
      background: "linear-gradient(to bottom, #f5f5dc, #ffffff)",
      cardBg: "#ffffff",
      text: "#1f2937",
      textSecondary: "#6b7280",
      border: "#e5e7eb",
    },
    fonts: {
      heading: "Playfair Display",
      body: "Raleway",
    },
    styles: {
      headerStyle: "bg-white/90 backdrop-blur-sm border-b border-gray-200",
      cardStyle: "bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200",
      buttonStyle: "bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg",
      priceStyle: "text-emerald-600 font-bold",
      searchStyle: "border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500",
    },
  },

  elegant: {
    id: "elegant",
    name: "Elegant",
    nameAr: "أنيق",
    preview: "✨",
    colors: {
      primary: "#6366f1",
      secondary: "#faf5ff",
      accent: "#c084fc",
      background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
      cardBg: "#ffffff",
      text: "#1e1b4b",
      textSecondary: "#6366f1",
      border: "#e9d5ff",
    },
    fonts: {
      heading: "Cormorant Garamond",
      body: "Libre Franklin",
    },
    styles: {
      headerStyle: "bg-white/95 backdrop-blur-md border-b border-purple-200 shadow-sm",
      cardStyle: "bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all border border-purple-100",
      buttonStyle: "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-full",
      priceStyle: "text-indigo-600 font-semibold",
      searchStyle: "border-2 border-purple-200 rounded-full focus:ring-2 focus:ring-purple-400 focus:border-transparent",
    },
  },

  modern: {
    id: "modern",
    name: "Modern",
    nameAr: "عصري",
    preview: "🚀",
    colors: {
      primary: "#0ea5e9",
      secondary: "#f0f9ff",
      accent: "#38bdf8",
      background: "linear-gradient(to bottom right, #f0f9ff, #e0f2fe)",
      cardBg: "#ffffff",
      text: "#0c4a6e",
      textSecondary: "#0284c7",
      border: "#bae6fd",
    },
    fonts: {
      heading: "Plus Jakarta Sans",
      body: "Work Sans",
    },
    styles: {
      headerStyle: "bg-white/80 backdrop-blur-xl border-b border-sky-200",
      cardStyle: "bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all border-2 border-sky-100 hover:border-sky-300",
      buttonStyle: "bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-medium",
      priceStyle: "text-sky-600 font-bold text-xl",
      searchStyle: "border-2 border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-400",
    },
  },

  vibrant: {
    id: "vibrant",
    name: "Vibrant",
    nameAr: "نابض بالحياة",
    preview: "🌈",
    colors: {
      primary: "#ec4899",
      secondary: "#fef3f2",
      accent: "#f97316",
      background: "linear-gradient(135deg, #fef3f2 0%, #fff7ed 50%, #fef3c7 100%)",
      cardBg: "#ffffff",
      text: "#831843",
      textSecondary: "#be123c",
      border: "#fbcfe8",
    },
    fonts: {
      heading: "Outfit",
      body: "DM Sans",
    },
    styles: {
      headerStyle: "bg-gradient-to-r from-pink-50 to-orange-50 backdrop-blur-sm border-b border-pink-200",
      cardStyle: "bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all border-2 border-transparent hover:border-pink-300",
      buttonStyle: "bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white rounded-full font-semibold",
      priceStyle: "text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-orange-600 font-bold text-xl",
      searchStyle: "border-2 border-pink-300 rounded-full focus:ring-2 focus:ring-pink-400",
    },
  },

  minimal: {
    id: "minimal",
    name: "Minimal",
    nameAr: "بسيط",
    preview: "⚪",
    colors: {
      primary: "#18181b",
      secondary: "#fafafa",
      accent: "#71717a",
      background: "#ffffff",
      cardBg: "#fafafa",
      text: "#09090b",
      textSecondary: "#52525b",
      border: "#e4e4e7",
    },
    fonts: {
      heading: "Sora",
      body: "Karla",
    },
    styles: {
      headerStyle: "bg-white border-b border-zinc-200",
      cardStyle: "bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors border border-zinc-200",
      buttonStyle: "bg-zinc-900 hover:bg-zinc-800 text-white rounded-md",
      priceStyle: "text-zinc-900 font-semibold",
      searchStyle: "border border-zinc-300 rounded-md focus:ring-2 focus:ring-zinc-400",
    },
  },

  luxury: {
    id: "luxury",
    name: "Luxury",
    nameAr: "فاخر",
    preview: "👑",
    colors: {
      primary: "#92400e",
      secondary: "#fffbeb",
      accent: "#d4af37",
      background: "linear-gradient(to bottom, #fffbeb, #fef3c7)",
      cardBg: "#ffffff",
      text: "#78350f",
      textSecondary: "#92400e",
      border: "#fde68a",
    },
    fonts: {
      heading: "DM Serif Display",
      body: "Lora",
    },
    styles: {
      headerStyle: "bg-amber-50/95 backdrop-blur-md border-b-2 border-amber-300 shadow-sm",
      cardStyle: "bg-white rounded-lg shadow-2xl hover:shadow-3xl transition-all border-2 border-amber-200",
      buttonStyle: "bg-gradient-to-r from-amber-700 to-yellow-600 hover:from-amber-800 hover:to-yellow-700 text-white rounded-lg font-serif",
      priceStyle: "text-amber-700 font-bold text-xl",
      searchStyle: "border-2 border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500",
    },
  },

  nature: {
    id: "nature",
    name: "Nature",
    nameAr: "طبيعي",
    preview: "🌿",
    colors: {
      primary: "#15803d",
      secondary: "#f0fdf4",
      accent: "#84cc16",
      background: "linear-gradient(to bottom right, #f0fdf4, #dcfce7)",
      cardBg: "#ffffff",
      text: "#14532d",
      textSecondary: "#166534",
      border: "#bbf7d0",
    },
    fonts: {
      heading: "Newsreader",
      body: "Libre Baskerville",
    },
    styles: {
      headerStyle: "bg-green-50/90 backdrop-blur-sm border-b border-green-200",
      cardStyle: "bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-green-200",
      buttonStyle: "bg-green-700 hover:bg-green-800 text-white rounded-lg",
      priceStyle: "text-green-700 font-bold",
      searchStyle: "border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500",
    },
  },

  ocean: {
    id: "ocean",
    name: "Ocean",
    nameAr: "المحيط",
    preview: "🌊",
    colors: {
      primary: "#0e7490",
      secondary: "#ecfeff",
      accent: "#06b6d4",
      background: "linear-gradient(135deg, #ecfeff 0%, #cffafe 50%, #a5f3fc 100%)",
      cardBg: "#ffffff",
      text: "#164e63",
      textSecondary: "#0e7490",
      border: "#a5f3fc",
    },
    fonts: {
      heading: "Urbanist",
      body: "Rubik",
    },
    styles: {
      headerStyle: "bg-cyan-50/95 backdrop-blur-lg border-b border-cyan-200 shadow-md",
      cardStyle: "bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-cyan-200",
      buttonStyle: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-full",
      priceStyle: "text-cyan-700 font-bold text-xl",
      searchStyle: "border-2 border-cyan-300 rounded-full focus:ring-2 focus:ring-cyan-400",
    },
  },

  sunset: {
    id: "sunset",
    name: "Sunset",
    nameAr: "غروب الشمس",
    preview: "🌅",
    colors: {
      primary: "#ea580c",
      secondary: "#fff7ed",
      accent: "#fb923c",
      background: "linear-gradient(to bottom, #fff7ed, #fed7aa, #fdba74)",
      cardBg: "#ffffff",
      text: "#7c2d12",
      textSecondary: "#c2410c",
      border: "#fed7aa",
    },
    fonts: {
      heading: "Quicksand",
      body: "Nunito",
    },
    styles: {
      headerStyle: "bg-orange-50/90 backdrop-blur-md border-b border-orange-200",
      cardStyle: "bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-orange-200",
      buttonStyle: "bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-700 hover:to-red-600 text-white rounded-full",
      priceStyle: "text-orange-600 font-bold text-xl",
      searchStyle: "border-2 border-orange-300 rounded-full focus:ring-2 focus:ring-orange-400",
    },
  },

  midnight: {
    id: "midnight",
    name: "Midnight",
    nameAr: "منتصف الليل",
    preview: "🌙",
    colors: {
      primary: "#3b82f6",
      secondary: "#1e293b",
      accent: "#60a5fa",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      cardBg: "#1e293b",
      text: "#f1f5f9",
      textSecondary: "#cbd5e1",
      border: "#334155",
    },
    fonts: {
      heading: "Geist",
      body: "Bricolage Grotesque",
    },
    styles: {
      headerStyle: "bg-slate-900/95 backdrop-blur-xl border-b border-slate-700 shadow-lg",
      cardStyle: "bg-slate-800 rounded-xl shadow-2xl hover:shadow-blue-500/20 transition-all border border-slate-700 hover:border-blue-500",
      buttonStyle: "bg-blue-600 hover:bg-blue-500 text-white rounded-lg",
      priceStyle: "text-blue-400 font-bold text-xl",
      searchStyle: "bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500",
    },
  },
};

export const themeList = Object.values(menuThemes);