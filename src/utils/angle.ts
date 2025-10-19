/**
 * Converts a direction vector (dx, dy) to degrees
 * 0° = East (→), 90° = North (↑), 180° = West (←), 270° = South (↓)
 */
export function vectorToDegrees(dx: number, dy: number): number {
  const radians = Math.atan2(dy, dx);
  const degrees = (radians * 180 / Math.PI + 360) % 360;
  return degrees;
}
