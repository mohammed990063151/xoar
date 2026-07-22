<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Build / Collecting page data

If `next build` fails with **Collecting page data**, **jest-worker**, or **build worker exited**, find the first TypeScript or runtime error above that line (often prop mismatch or `window`/`localStorage` at module scope). Follow `.cursor/rules/nextjs-build-safety.mdc`. Never enable `ignoreBuildErrors` to hide it.
<!-- END:nextjs-agent-rules -->
