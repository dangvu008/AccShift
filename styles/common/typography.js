/**
 * Hệ thống typography hiện đại cho ứng dụng AccShift
 * Cung cấp các kích thước font chữ đậm, rõ ràng và nhất quán cho toàn bộ ứng dụng
 */

// Font sizes - Cải thiện readability và hierarchy
export const FONT_SIZES = {
  // Tiêu đề - Tăng kích thước cho impact
  HEADER_1: 28, // Tiêu đề lớn - Tăng từ 24
  HEADER_2: 22, // Tiêu đề vừa - Tăng từ 20
  HEADER_3: 20, // Tiêu đề nhỏ - Tăng từ 18
  HEADER_4: 18, // Tiêu đề phụ - Mới thêm

  // Nội dung - Tăng kích thước cho dễ đọc
  BODY_LARGE: 17, // Nội dung lớn - Tăng từ 16
  BODY: 16,       // Nội dung thường - Tăng từ 15
  BODY_SMALL: 15, // Nội dung nhỏ - Tăng từ 14
  BODY_TINY: 13,  // Nội dung rất nhỏ - Mới thêm

  // Phụ đề - Cải thiện hierarchy
  CAPTION: 13,    // Phụ đề - Tăng từ 12
  CAPTION_SMALL: 11, // Phụ đề nhỏ - Tăng từ 10

  // Nút - Tăng kích thước cho accessibility
  BUTTON: 17,     // Nút - Tăng từ 16
  BUTTON_SMALL: 15, // Nút nhỏ - Tăng từ 14
  BUTTON_LARGE: 19, // Nút lớn - Mới thêm
}

// Font weights - Tăng độ đậm cho readability
export const FONT_WEIGHTS = {
  THIN: '200',
  LIGHT: '300',
  REGULAR: '400',
  MEDIUM: '500',    // Default cho body text
  SEMI_BOLD: '600', // Default cho tiêu đề nhỏ
  BOLD: '700',      // Default cho tiêu đề chính
  EXTRA_BOLD: '800',
  BLACK: '900',     // Thêm cho emphasis đặc biệt
}

// Line heights - Cải thiện readability
export const LINE_HEIGHTS = {
  TIGHT: 1.2,     // Dòng sát - Cho tiêu đề
  NORMAL: 1.5,    // Dòng thường - Cho body text
  LOOSE: 1.7,     // Dòng rộng - Cho đoạn văn dài
  EXTRA_LOOSE: 2.0, // Dòng rất rộng - Cho spacing đặc biệt
}

// Letter spacing - Cải thiện typography
export const LETTER_SPACING = {
  TIGHT: -0.5,    // Khoảng cách chữ sát - Cho tiêu đề lớn
  NORMAL: 0,      // Khoảng cách chữ thường - Default
  WIDE: 0.5,      // Khoảng cách chữ rộng - Cho button text
  EXTRA_WIDE: 1.0, // Khoảng cách rất rộng - Cho emphasis
}

// Text styles - Cải thiện với font weights đậm hơn
export const TEXT_STYLES = {
  // Tiêu đề - Tăng độ đậm và cải thiện spacing
  header1: {
    fontSize: FONT_SIZES.HEADER_1,
    fontWeight: FONT_WEIGHTS.EXTRA_BOLD, // Tăng từ BOLD
    lineHeight: LINE_HEIGHTS.TIGHT * FONT_SIZES.HEADER_1,
    letterSpacing: LETTER_SPACING.TIGHT,
  },
  header2: {
    fontSize: FONT_SIZES.HEADER_2,
    fontWeight: FONT_WEIGHTS.BOLD,
    lineHeight: LINE_HEIGHTS.TIGHT * FONT_SIZES.HEADER_2,
    letterSpacing: LETTER_SPACING.TIGHT,
  },
  header3: {
    fontSize: FONT_SIZES.HEADER_3,
    fontWeight: FONT_WEIGHTS.BOLD, // Tăng từ SEMI_BOLD
    lineHeight: LINE_HEIGHTS.TIGHT * FONT_SIZES.HEADER_3,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  header4: {
    fontSize: FONT_SIZES.HEADER_4,
    fontWeight: FONT_WEIGHTS.SEMI_BOLD,
    lineHeight: LINE_HEIGHTS.TIGHT * FONT_SIZES.HEADER_4,
    letterSpacing: LETTER_SPACING.NORMAL,
  },

  // Nội dung - Tăng font weight cho readability
  bodyLarge: {
    fontSize: FONT_SIZES.BODY_LARGE,
    fontWeight: FONT_WEIGHTS.MEDIUM, // Tăng từ REGULAR
    lineHeight: LINE_HEIGHTS.NORMAL * FONT_SIZES.BODY_LARGE,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  body: {
    fontSize: FONT_SIZES.BODY,
    fontWeight: FONT_WEIGHTS.MEDIUM, // Tăng từ REGULAR
    lineHeight: LINE_HEIGHTS.NORMAL * FONT_SIZES.BODY,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  bodySmall: {
    fontSize: FONT_SIZES.BODY_SMALL,
    fontWeight: FONT_WEIGHTS.REGULAR,
    lineHeight: LINE_HEIGHTS.NORMAL * FONT_SIZES.BODY_SMALL,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  bodyTiny: {
    fontSize: FONT_SIZES.BODY_TINY,
    fontWeight: FONT_WEIGHTS.REGULAR,
    lineHeight: LINE_HEIGHTS.NORMAL * FONT_SIZES.BODY_TINY,
    letterSpacing: LETTER_SPACING.NORMAL,
  },

  // Phụ đề - Cải thiện readability
  caption: {
    fontSize: FONT_SIZES.CAPTION,
    fontWeight: FONT_WEIGHTS.MEDIUM, // Tăng từ REGULAR
    lineHeight: LINE_HEIGHTS.NORMAL * FONT_SIZES.CAPTION,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  captionSmall: {
    fontSize: FONT_SIZES.CAPTION_SMALL,
    fontWeight: FONT_WEIGHTS.REGULAR,
    lineHeight: LINE_HEIGHTS.NORMAL * FONT_SIZES.CAPTION_SMALL,
    letterSpacing: LETTER_SPACING.NORMAL,
  },

  // Nút - Tăng độ đậm và spacing cho accessibility
  button: {
    fontSize: FONT_SIZES.BUTTON,
    fontWeight: FONT_WEIGHTS.SEMI_BOLD, // Tăng từ MEDIUM
    lineHeight: LINE_HEIGHTS.TIGHT * FONT_SIZES.BUTTON,
    letterSpacing: LETTER_SPACING.WIDE,
  },
  buttonSmall: {
    fontSize: FONT_SIZES.BUTTON_SMALL,
    fontWeight: FONT_WEIGHTS.SEMI_BOLD, // Tăng từ MEDIUM
    lineHeight: LINE_HEIGHTS.TIGHT * FONT_SIZES.BUTTON_SMALL,
    letterSpacing: LETTER_SPACING.WIDE,
  },
  buttonLarge: {
    fontSize: FONT_SIZES.BUTTON_LARGE,
    fontWeight: FONT_WEIGHTS.BOLD,
    lineHeight: LINE_HEIGHTS.TIGHT * FONT_SIZES.BUTTON_LARGE,
    letterSpacing: LETTER_SPACING.WIDE,
  },

  // Styles đặc biệt - Thêm cho emphasis
  emphasis: {
    fontSize: FONT_SIZES.BODY,
    fontWeight: FONT_WEIGHTS.BOLD,
    lineHeight: LINE_HEIGHTS.NORMAL * FONT_SIZES.BODY,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  strong: {
    fontSize: FONT_SIZES.BODY,
    fontWeight: FONT_WEIGHTS.EXTRA_BOLD,
    lineHeight: LINE_HEIGHTS.NORMAL * FONT_SIZES.BODY,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
}

export default {
  FONT_SIZES,
  FONT_WEIGHTS,
  LINE_HEIGHTS,
  LETTER_SPACING,
  TEXT_STYLES,
}
