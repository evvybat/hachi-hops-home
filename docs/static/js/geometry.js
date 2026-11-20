// Small shared geometry helpers.

// Do two rectangles {x, y, w, h} overlap? (Touching edges don't count.)
export function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}
