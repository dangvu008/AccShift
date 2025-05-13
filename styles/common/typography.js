/**
 * Hệ thống typography cho ứng dụng AccShift
 * Cung cấp các kích thước font chữ và font weight nhất quán cho toàn bộ ứng dụng
 */

// Font sizes
export const FONT_SIZES = {
  // Tiêu đề
  HEADER_1: 24, // Tiêu đề lớn
  HEADER_2: 20, // Tiêu đề vừa
  HEADER_3: 18, // Tiêu đề nhỏ
  
  // Nội dung
  BODY_LARGE: 16, // Nội dung lớn
  BODY: 15,       // Nội dung thường
  BODY_SMALL: 14, // Nội dung nhỏ
  
  // Phụ đề
  CAPTION: 12,    // Phụ đề
  CAPTION_SMALL: 10, // Phụ đề nhỏ
  
  // Nút
  BUTTON: 16,     // Nút
  BUTTON_SMALL: 14, // Nút nhỏ
}

// Font weights
export const FONT_WEIGHTS = {
  THIN: '200',
  LIGHT: '300',
  REGULAR: '400',
  MEDIUM: '500',
  SEMI_BOLD: '600',
  BOLD: '700',
  EXTRA_BOLD: '800',
}

// Line heights
export const LINE_HEIGHTS = {
  TIGHT: 1.2,     // Dòng sát
  NORMAL: 1.5,    // Dòng thường
  LOOSE: 1.8,     // Dòng rộng
}

// Letter spacing
export const LETTER_SPACING = {
  TIGHT: -0.5,    // Khoảng cách chữ sát
  NORMAL: 0,      // Khoảng cách chữ thường
  WIDE: 0.5,      // Khoảng cách chữ rộng
}

// Text styles
export const TEXT_STYLES = {
  // Tiêu đề
  header1: {
    fontSize: FONT_SIZES.HEADER_1,
    fontWeight: FONT_WEIGHTS.BOLD,
    lineHeight: LINE_HEIGHTS.TIGHT * FONT_SIZES.HEADER_1,
  },
  header2: {
    fontSize: FONT_SIZES.HEADER_2,
    fontWeight: FONT_WEIGHTS.BOLD,
    lineHeight: LINE_HEIGHTS.TIGHT * FONT_SIZES.HEADER_2,
  },
  header3: {
    fontSize: FONT_SIZES.HEADER_3,
    fontWeight: FONT_WEIGHTS.SEMI_BOLD,
    lineHeight: LINE_HEIGHTS.TIGHT * FONT_SIZES.HEADER_3,
  },
  
  // Nội dung
  bodyLarge: {
    fontSize: FONT_SIZES.BODY_LARGE,
    fontWeight: FONT_WEIGHTS.REGULAR,
    lineHeight: LINE_HEIGHTS.NORMAL * FONT_SIZES.BODY_LARGE,
  },
  body: {
    fontSize: FONT_SIZES.BODY,
    fontWeight: FONT_WEIGHTS.REGULAR,
    lineHeight: LINE_HEIGHTS.NORMAL * FONT_SIZES.BODY,
  },
  bodySmall: {
    fontSize: FONT_SIZES.BODY_SMALL,
    fontWeight: FONT_WEIGHTS.REGULAR,
    lineHeight: LINE_HEIGHTS.NORMAL * FONT_SIZES.BODY_SMALL,
  },
  
  // Phụ đề
  caption: {
    fontSize: FONT_SIZES.CAPTION,
    fontWeight: FONT_WEIGHTS.REGULAR,
    lineHeight: LINE_HEIGHTS.NORMAL * FONT_SIZES.CAPTION,
  },
  captionSmall: {
    fontSize: FONT_SIZES.CAPTION_SMALL,
    fontWeight: FONT_WEIGHTS.REGULAR,
    lineHeight: LINE_HEIGHTS.NORMAL * FONT_SIZES.CAPTION_SMALL,
  },
  
  // Nút
  button: {
    fontSize: FONT_SIZES.BUTTON,
    fontWeight: FONT_WEIGHTS.MEDIUM,
    lineHeight: LINE_HEIGHTS.TIGHT * FONT_SIZES.BUTTON,
  },
  buttonSmall: {
    fontSize: FONT_SIZES.BUTTON_SMALL,
    fontWeight: FONT_WEIGHTS.MEDIUM,
    lineHeight: LINE_HEIGHTS.TIGHT * FONT_SIZES.BUTTON_SMALL,
  },
}

export default {
  FONT_SIZES,
  FONT_WEIGHTS,
  LINE_HEIGHTS,
  LETTER_SPACING,
  TEXT_STYLES,
}
