/**
 * 📝 Enhanced Typography System for AccShift
 * Comprehensive type scale with improved readability and accessibility
 * Supports multiple font weights, sizes, and semantic text styles
 */

// === FONT SIZE SCALE ===
// Based on a modular scale for consistent visual hierarchy
export const FONT_SIZES = {
  // Display Sizes - For hero sections and large headings
  DISPLAY_LARGE: 36,    // 36px - Hero text, splash screens
  DISPLAY_MEDIUM: 32,   // 32px - Large feature headings
  DISPLAY_SMALL: 28,    // 28px - Section headings

  // Heading Sizes - For content hierarchy
  HEADING_1: 24,        // 24px - Main page headings
  HEADING_2: 22,        // 22px - Section headings
  HEADING_3: 20,        // 20px - Subsection headings
  HEADING_4: 18,        // 18px - Component headings
  HEADING_5: 16,        // 16px - Small headings
  HEADING_6: 14,        // 14px - Micro headings

  // Body Text Sizes - For content and UI text
  BODY_LARGE: 18,       // 18px - Large body text, important content
  BODY_MEDIUM: 16,      // 16px - Default body text
  BODY_SMALL: 14,       // 14px - Secondary content
  BODY_TINY: 12,        // 12px - Captions, metadata

  // UI Element Sizes - For interface components
  BUTTON_LARGE: 18,     // 18px - Large buttons
  BUTTON_MEDIUM: 16,    // 16px - Default buttons
  BUTTON_SMALL: 14,     // 14px - Small buttons
  BUTTON_TINY: 12,      // 12px - Micro buttons

  // Label and Caption Sizes
  LABEL_LARGE: 14,      // 14px - Form labels
  LABEL_MEDIUM: 12,     // 12px - Default labels
  LABEL_SMALL: 11,      // 11px - Small labels
  CAPTION: 12,          // 12px - Image captions, metadata
  OVERLINE: 10,         // 10px - Overline text, tags
}

// === FONT WEIGHTS ===
// Comprehensive weight scale for better typography hierarchy
export const FONT_WEIGHTS = {
  THIN: '100',          // Thin weight
  EXTRA_LIGHT: '200',   // Extra light weight
  LIGHT: '300',         // Light weight
  REGULAR: '400',       // Regular weight (default)
  MEDIUM: '500',        // Medium weight (body text)
  SEMI_BOLD: '600',     // Semi-bold weight (headings)
  BOLD: '700',          // Bold weight (emphasis)
  EXTRA_BOLD: '800',    // Extra bold weight
  BLACK: '900',         // Black weight (maximum emphasis)
}

// === LINE HEIGHTS ===
// Optimized for readability across different text sizes
export const LINE_HEIGHTS = {
  TIGHT: 1.1,           // 110% - For large headings
  SNUG: 1.25,           // 125% - For headings
  NORMAL: 1.4,          // 140% - For body text (optimal readability)
  RELAXED: 1.6,         // 160% - For long-form content
  LOOSE: 1.8,           // 180% - For very readable content
  EXTRA_LOOSE: 2.0,     // 200% - For special spacing needs
}

// === LETTER SPACING ===
// Subtle adjustments for improved readability
export const LETTER_SPACING = {
  TIGHTER: -0.8,        // -0.8px - For large display text
  TIGHT: -0.4,          // -0.4px - For headings
  NORMAL: 0,            // 0px - Default spacing
  WIDE: 0.4,            // 0.4px - For button text and labels
  WIDER: 0.8,           // 0.8px - For overlines and tags
  WIDEST: 1.2,          // 1.2px - For maximum emphasis
}

// === TEXT STYLES ===
// Comprehensive text style system with semantic naming
export const TEXT_STYLES = {
  // === DISPLAY STYLES ===
  // For hero sections and large promotional content
  displayLarge: {
    fontSize: FONT_SIZES.DISPLAY_LARGE,
    fontWeight: FONT_WEIGHTS.BOLD,
    lineHeight: FONT_SIZES.DISPLAY_LARGE * LINE_HEIGHTS.TIGHT,
    letterSpacing: LETTER_SPACING.TIGHTER,
  },
  displayMedium: {
    fontSize: FONT_SIZES.DISPLAY_MEDIUM,
    fontWeight: FONT_WEIGHTS.BOLD,
    lineHeight: FONT_SIZES.DISPLAY_MEDIUM * LINE_HEIGHTS.TIGHT,
    letterSpacing: LETTER_SPACING.TIGHT,
  },
  displaySmall: {
    fontSize: FONT_SIZES.DISPLAY_SMALL,
    fontWeight: FONT_WEIGHTS.BOLD,
    lineHeight: FONT_SIZES.DISPLAY_SMALL * LINE_HEIGHTS.SNUG,
    letterSpacing: LETTER_SPACING.TIGHT,
  },

  // === HEADING STYLES ===
  // For content hierarchy and section organization
  heading1: {
    fontSize: FONT_SIZES.HEADING_1,
    fontWeight: FONT_WEIGHTS.BOLD,
    lineHeight: FONT_SIZES.HEADING_1 * LINE_HEIGHTS.SNUG,
    letterSpacing: LETTER_SPACING.TIGHT,
  },
  heading2: {
    fontSize: FONT_SIZES.HEADING_2,
    fontWeight: FONT_WEIGHTS.BOLD,
    lineHeight: FONT_SIZES.HEADING_2 * LINE_HEIGHTS.SNUG,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  heading3: {
    fontSize: FONT_SIZES.HEADING_3,
    fontWeight: FONT_WEIGHTS.SEMI_BOLD,
    lineHeight: FONT_SIZES.HEADING_3 * LINE_HEIGHTS.SNUG,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  heading4: {
    fontSize: FONT_SIZES.HEADING_4,
    fontWeight: FONT_WEIGHTS.SEMI_BOLD,
    lineHeight: FONT_SIZES.HEADING_4 * LINE_HEIGHTS.NORMAL,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  heading5: {
    fontSize: FONT_SIZES.HEADING_5,
    fontWeight: FONT_WEIGHTS.MEDIUM,
    lineHeight: FONT_SIZES.HEADING_5 * LINE_HEIGHTS.NORMAL,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  heading6: {
    fontSize: FONT_SIZES.HEADING_6,
    fontWeight: FONT_WEIGHTS.MEDIUM,
    lineHeight: FONT_SIZES.HEADING_6 * LINE_HEIGHTS.NORMAL,
    letterSpacing: LETTER_SPACING.WIDE,
  },

  // === BODY TEXT STYLES ===
  // For content and readable text
  bodyLarge: {
    fontSize: FONT_SIZES.BODY_LARGE,
    fontWeight: FONT_WEIGHTS.REGULAR,
    lineHeight: FONT_SIZES.BODY_LARGE * LINE_HEIGHTS.RELAXED,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  bodyMedium: {
    fontSize: FONT_SIZES.BODY_MEDIUM,
    fontWeight: FONT_WEIGHTS.REGULAR,
    lineHeight: FONT_SIZES.BODY_MEDIUM * LINE_HEIGHTS.NORMAL,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  bodySmall: {
    fontSize: FONT_SIZES.BODY_SMALL,
    fontWeight: FONT_WEIGHTS.REGULAR,
    lineHeight: FONT_SIZES.BODY_SMALL * LINE_HEIGHTS.NORMAL,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  bodyTiny: {
    fontSize: FONT_SIZES.BODY_TINY,
    fontWeight: FONT_WEIGHTS.REGULAR,
    lineHeight: FONT_SIZES.BODY_TINY * LINE_HEIGHTS.NORMAL,
    letterSpacing: LETTER_SPACING.NORMAL,
  },

  // === BUTTON TEXT STYLES ===
  // For interactive elements and CTAs
  buttonLarge: {
    fontSize: FONT_SIZES.BUTTON_LARGE,
    fontWeight: FONT_WEIGHTS.SEMI_BOLD,
    lineHeight: FONT_SIZES.BUTTON_LARGE * LINE_HEIGHTS.SNUG,
    letterSpacing: LETTER_SPACING.WIDE,
  },
  buttonMedium: {
    fontSize: FONT_SIZES.BUTTON_MEDIUM,
    fontWeight: FONT_WEIGHTS.SEMI_BOLD,
    lineHeight: FONT_SIZES.BUTTON_MEDIUM * LINE_HEIGHTS.SNUG,
    letterSpacing: LETTER_SPACING.WIDE,
  },
  buttonSmall: {
    fontSize: FONT_SIZES.BUTTON_SMALL,
    fontWeight: FONT_WEIGHTS.MEDIUM,
    lineHeight: FONT_SIZES.BUTTON_SMALL * LINE_HEIGHTS.SNUG,
    letterSpacing: LETTER_SPACING.WIDE,
  },
  buttonTiny: {
    fontSize: FONT_SIZES.BUTTON_TINY,
    fontWeight: FONT_WEIGHTS.MEDIUM,
    lineHeight: FONT_SIZES.BUTTON_TINY * LINE_HEIGHTS.NORMAL,
    letterSpacing: LETTER_SPACING.WIDER,
  },

  // === LABEL AND CAPTION STYLES ===
  // For form labels, metadata, and secondary information
  labelLarge: {
    fontSize: FONT_SIZES.LABEL_LARGE,
    fontWeight: FONT_WEIGHTS.MEDIUM,
    lineHeight: FONT_SIZES.LABEL_LARGE * LINE_HEIGHTS.NORMAL,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  labelMedium: {
    fontSize: FONT_SIZES.LABEL_MEDIUM,
    fontWeight: FONT_WEIGHTS.MEDIUM,
    lineHeight: FONT_SIZES.LABEL_MEDIUM * LINE_HEIGHTS.NORMAL,
    letterSpacing: LETTER_SPACING.WIDE,
  },
  labelSmall: {
    fontSize: FONT_SIZES.LABEL_SMALL,
    fontWeight: FONT_WEIGHTS.MEDIUM,
    lineHeight: FONT_SIZES.LABEL_SMALL * LINE_HEIGHTS.NORMAL,
    letterSpacing: LETTER_SPACING.WIDE,
  },
  caption: {
    fontSize: FONT_SIZES.CAPTION,
    fontWeight: FONT_WEIGHTS.REGULAR,
    lineHeight: FONT_SIZES.CAPTION * LINE_HEIGHTS.NORMAL,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  overline: {
    fontSize: FONT_SIZES.OVERLINE,
    fontWeight: FONT_WEIGHTS.SEMI_BOLD,
    lineHeight: FONT_SIZES.OVERLINE * LINE_HEIGHTS.NORMAL,
    letterSpacing: LETTER_SPACING.WIDEST,
    textTransform: 'uppercase',
  },

  // === EMPHASIS STYLES ===
  // For highlighting and emphasis
  emphasis: {
    fontSize: FONT_SIZES.BODY_MEDIUM,
    fontWeight: FONT_WEIGHTS.SEMI_BOLD,
    lineHeight: FONT_SIZES.BODY_MEDIUM * LINE_HEIGHTS.NORMAL,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  strong: {
    fontSize: FONT_SIZES.BODY_MEDIUM,
    fontWeight: FONT_WEIGHTS.BOLD,
    lineHeight: FONT_SIZES.BODY_MEDIUM * LINE_HEIGHTS.NORMAL,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  subtle: {
    fontSize: FONT_SIZES.BODY_SMALL,
    fontWeight: FONT_WEIGHTS.REGULAR,
    lineHeight: FONT_SIZES.BODY_SMALL * LINE_HEIGHTS.NORMAL,
    letterSpacing: LETTER_SPACING.NORMAL,
  },

  // === LEGACY COMPATIBILITY ===
  // Keep old style names for backward compatibility
  header1: {
    fontSize: FONT_SIZES.HEADING_1,
    fontWeight: FONT_WEIGHTS.BOLD,
    lineHeight: FONT_SIZES.HEADING_1 * LINE_HEIGHTS.SNUG,
    letterSpacing: LETTER_SPACING.TIGHT,
  },
  header2: {
    fontSize: FONT_SIZES.HEADING_2,
    fontWeight: FONT_WEIGHTS.BOLD,
    lineHeight: FONT_SIZES.HEADING_2 * LINE_HEIGHTS.SNUG,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  header3: {
    fontSize: FONT_SIZES.HEADING_3,
    fontWeight: FONT_WEIGHTS.SEMI_BOLD,
    lineHeight: FONT_SIZES.HEADING_3 * LINE_HEIGHTS.SNUG,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  body: {
    fontSize: FONT_SIZES.BODY_MEDIUM,
    fontWeight: FONT_WEIGHTS.REGULAR,
    lineHeight: FONT_SIZES.BODY_MEDIUM * LINE_HEIGHTS.NORMAL,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  legacyBodySmall: {
    fontSize: FONT_SIZES.BODY_SMALL,
    fontWeight: FONT_WEIGHTS.REGULAR,
    lineHeight: FONT_SIZES.BODY_SMALL * LINE_HEIGHTS.NORMAL,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  button: {
    fontSize: FONT_SIZES.BUTTON_MEDIUM,
    fontWeight: FONT_WEIGHTS.SEMI_BOLD,
    lineHeight: FONT_SIZES.BUTTON_MEDIUM * LINE_HEIGHTS.SNUG,
    letterSpacing: LETTER_SPACING.WIDE,
  },
}

export default {
  FONT_SIZES,
  FONT_WEIGHTS,
  LINE_HEIGHTS,
  LETTER_SPACING,
  TEXT_STYLES,
}
