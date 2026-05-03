// constants/theme.js
// ⭐ مصدر الحقيقة الواحد لكل ألوان وستايل التطبيق
// لو تبغين تغيرين شي في الثيم، عدّلي هنا فقط

export const COLORS = {
  // ========== الألوان الأساسية ==========
  PRIMARY: "#5A8DEE", // الأزرق الأساسي (الهوية)
  PRIMARY_LIGHT: "#EAF2FF", // أزرق فاتح (للأفاتار والخلفيات الخفيفة)
  PRIMARY_BG: "#F1F6FF", // خلفية البابل والعناصر التفاعلية

  // ========== الخلفيات ==========
  WHITE: "#FFFFFF",
  CARD_BG: "#F8FAFF", // خلفية البطاقات الأساسية
  CARD_BG_ALT: "#F9FBFF", // خلفية البطاقات البديلة
  SEARCH_BG: "#F6F8FB", // خلفية مربع البحث

  // ========== الحدود ==========
  BORDER_LIGHT: "#EEF2FF", // حدود البطاقات
  BORDER_GRAY: "#EEEEEE", // حدود عامة

  // ========== النصوص ==========
  TEXT: "#000000", // النص الأساسي
  TEXT_DARK: "#1A1A1A", // نص داكن
  MUTED: "#777777", // نص خافت
  MUTED_DARK: "#888888", // نص خافت أغمق

  // ========== حالات ==========
  SUCCESS: "#2ECC71", // نجاح / تقدم ≥70%
  INFO: "#5A8DEE", // معلومات / تقدم ≥50%
  WARNING: "#F5A623", // تحذير / تقدم <50%
  DANGER: "#FF4D4F", // خطر / إشعارات

  // ========== ألوان إضافية ==========
  YELLOW: "#fbc707", // أصفر الجرس
  WARNING_BG: "#FFF6E8", // خلفية بطاقات التحذير
  WARNING_BORDER: "#FFE2B5", // حدود بطاقات التحذير
  ICON_BLUE: "#6E8FC8", // لون أيقونة الأفاتار
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

// ========== الظلال ==========
export const SHADOWS = {
  bubble: {
    shadowColor: "#5A8DEE",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  card: {
    shadowColor: "#4d76bd",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  light: {
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
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

// تصدير الكل ك default للسهولة
export default {
  COLORS,
  CATEGORY_COLORS,
  SCORE_COLORS,
  SHADOWS,
  SPACING,
  RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
  getProgressColor,
};
