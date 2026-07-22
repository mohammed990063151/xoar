/**
 * Prevent `npm run build` on cPanel — it OOMs (SIGABRT) and can corrupt .next.
 * Production builds must run in GitHub Actions, then rsync the artifact.
 */
const cwd = process.cwd().replace(/\\/g, "/");
const onCpanel =
  cwd.includes("/public_html/") ||
  Boolean(process.env.PASSENGER_APP_ENV) ||
  Boolean(process.env.PASSENGER_BASE_URI) ||
  /\/home\/[^/]+\/public_html\//.test(cwd);

if (onCpanel) {
  console.error(`
Do not run "npm run build" on the cPanel server.

Shared hosting kills the Next.js build worker (SIGABRT / OOM) and a
half-written .next folder takes the live site down with HTTP 500.

Deploy instead:
  git push origin main
  → GitHub Actions builds → rsync .next → Passenger restart

If the site is already broken, push any commit to main (or re-run the
"Build and Deploy to cPanel" workflow) to restore the last good build.
`);
  process.exit(1);
}
