// constants/theme.js
// ⭐ مصدر الحقيقة الواحد لكل ألوان وستايل التطبيق
// الثيم: سماوي فاتح طفولي راقي

export const COLORS = {
  // ========== الألوان الأساسية (السماوية) ==========
  PRIMARY: "#79ccf8", // السماوي الأساسي (الهيدر، الأزرار)
  PRIMARY_DARK: "#0288D1", // سماوي غامق (للنصوص فوق الأبيض)
  PRIMARY_LIGHT: "#E1F5FE", // سماوي فاتح جداً (الخلفيات)
  PRIMARY_BG: "#F1F9FE", // خلفية البابل والعناصر التفاعلية

  // ========== الخلفيات ==========
  WHITE: "#FFFFFF",
  BG: "#F0F4F8", // خلفية الشاشة الرئيسية (رمادي فاتح جداً)
  CARD_BG: "#FFFFFF", // خلفية البطاقات (أبيض)
  CARD_BG_ALT: "#F8FBFE", // خلفية البطاقات البديلة

  // ========== الحدود ==========
  BORDER_LIGHT: "#E1F5FE", // حدود فاتحة
  BORDER_GRAY: "#EEEEEE", // حدود رمادية

  // ========== النصوص ==========
  TEXT: "#1A1A1A", // النص الأساسي
  TEXT_DARK: "#000000", // نص داكن
  MUTED: "#757575", // نص خافت
  MUTED_LIGHT: "#9E9E9E", // نص خافت فاتح

  // ========== حالات ==========
  SUCCESS: "#4CAF50", // أخضر نجاح / تقدم ≥70%
  INFO: "#5A8DEE", // أزرق معلومات
  WARNING: "#F5A623", // برتقالي تحذير
  DANGER: "#FF4D4F", // أحمر خطر / إشعارات

  // ========== ألوان إضافية ==========
  YELLOW: "#fbc707", // أصفر الجرس
  WARNING_BG: "#FFF6E8", // خلفية بطاقات التحذير
  WARNING_BORDER: "#FFE2B5", // حدود بطاقات التحذير
  SUCCESS_BG: "#E8F5E9", // خلفية النجاح
  SUCCESS_BORDER: "#C8E6C9", // حدود النجاح
};

// ========== ألوان فئات الأنشطة ==========
export const CATEGORY_COLORS = {
  memory: { color: "#9C27B0", bg: "#F3E5F5", icon: "brain" },
  focus: { color: "#FFC107", bg: "#FFF8E1", icon: "eye-outline" },
  thinking: { color: "#2196F3", bg: "#E3F2FD", icon: "lightbulb-outline" },
  perception: { color: "#F44336", bg: "#FFEBEE", icon: "shape-outline" },
};

// ========== ألوان التقييم 1-5 ==========
export const SCORE_COLORS = {
  1: "#4CAF50", // ممتاز
  2: "#8BC34A", // جيد
  3: "#FFC107", // متوسط
  4: "#FF9800", // ضعيف
  5: "#F44336", // ضعيف جداً
};

// ========== التدرّجات (Gradients) ==========
export const GRADIENTS = {
  primary: ["#79ccf8", "#5BB5E8"], // التدرج الأساسي للأزرار
  primaryLight: ["#E1F5FE", "#B3E5FC"], // تدرج خفيف
  header: ["#79ccf8", "#5BB5E8"], // تدرج الهيدر
};

// ========== الظلال ==========
export const SHADOWS = {
  // ظل بطاقة عادية
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  // ظل سماوي للأزرار والبابل
  bubble: {
    shadowColor: "#79ccf8",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  // ظل خفيف
  light: {
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  // ظل قوي للهيدر
  header: {
    shadowColor: "#79ccf8",
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
};

// ========== المسافات (Spacing) ==========
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 25,
  xxxl: 30,
};

// ========== الزوايا المدورة ==========
export const RADIUS = {
  xs: 8,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 28,
  full: 9999,
};

// ========== أحجام الخطوط ==========
export const FONT_SIZE = {
  xs: 11,
  sm: 12,
  md: 13,
  base: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
};

// ========== أوزان الخطوط ==========
export const FONT_WEIGHT = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
};

// ========== دوال مساعدة ==========
// لون التقدم بناء على النسبة
export const getProgressColor = (progress) => {
  if (progress >= 70) return COLORS.SUCCESS;
  if (progress >= 50) return COLORS.INFO;
  return COLORS.WARNING;
};

export default {
  COLORS,
  CATEGORY_COLORS,
  SCORE_COLORS,
  GRADIENTS,
  SHADOWS,
  SPACING,
  RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
  getProgressColor,
};
