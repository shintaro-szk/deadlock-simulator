/**
 * Scroll behaviour that respects the "reduce motion" setting.
 * A CSS rule cannot stop `scrollTo({ behavior: 'smooth' })` from JavaScript, so scripts use this.
 */
export function scrollBehavior(): ScrollBehavior {
  if (typeof window === 'undefined' || !window.matchMedia) return 'auto';
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}
