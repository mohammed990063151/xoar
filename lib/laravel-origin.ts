/** Local `php artisan serve` */
export const LOCAL_LARAVEL_ORIGIN = "http://127.0.0.1:8000";

/** Live Laravel (API + admin + portal) */
export const PRODUCTION_LARAVEL_ORIGIN = "https://xoraplus.com";

/** Fallback when env vars are unset — production builds use xoraplus.com. */
export function defaultLaravelOrigin(): string {
  return process.env.NODE_ENV === "production"
    ? PRODUCTION_LARAVEL_ORIGIN
    : LOCAL_LARAVEL_ORIGIN;
}
