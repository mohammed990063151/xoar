# Apple Pay domain association (Geidea)

Geidea supplies `apple-developer-merchantid-domain-association` (no extension).

**Required public URL (customer site):**

`https://www.xoraevents.com/.well-known/apple-developer-merchantid-domain-association`

Also verify the apex if it serves checkout:

`https://xoraevents.com/.well-known/apple-developer-merchantid-domain-association`

- Must be publicly reachable (no auth / login wall).
- Do not invent or regenerate this file; replace only with a new file from Geidea.
- After uploading, ask Geidea to enable **Apple Pay for Web** in the merchant portal.
- API host `xoraplus.com` is not the customer checkout domain; the association must live on the Next.js site domain.
