# Release procedure

## Current status

Source prepared for version 0.2.0. Production OAuth and Store submission are not completed. The local personal installation under outputs/inbox-by-label remains separate.

## 1. Publish source and website

Confirm the repository owner, publisher name, support email, and a domain you control. Complete docs/privacy.md and publish a homepage and policy on that domain. Add screenshots, a support link, and accurate release status. This repository uses MIT licensing. Publish only this clean repository, not the parent workspace or private mailbox screenshots.

## 2. Reserve a Store item

Register/sign in to the Chrome Web Store Developer Dashboard. The publisher must accept applicable terms and handle any registration payment.

Run `python3 scripts/build.py --bootstrap` and upload dist/inbox-by-label-bootstrap.zip as a DRAFT ONLY. This reserves an item ID. The bootstrap build cannot connect to Gmail and must not be submitted for review.

## 3. Configure production Google authorization

Use a separate production Google Cloud project. Enable Gmail API. Configure Google Auth Platform audience and branding, publisher/support details, verified domain, homepage and privacy policy. Create an OAuth client of type Chrome Extension using the Store item ID. The client ID is public and is embedded in the distributable extension; no client secret is needed.

Declare gmail.metadata. Prepare a demonstration video showing Google authorization and the inbox label/count features. Complete Google OAuth verification as applicable; Store review does not replace OAuth verification. Do not assume unlisted Store visibility bypasses either review. The implementation has no developer-operated server; accurately explain this to Google's reviewers when determining security-assessment applicability.

For local testing of the Store extension identity, use the public key from the Store dashboard in a local-only manifest. Do not reuse the personal development extension's identity or OAuth client.

## 4. Build and validate

`npm test`

`python3 scripts/build.py --client-id 'PRODUCTION_CLIENT_ID.apps.googleusercontent.com' --homepage 'https://YOUR_DOMAIN/'`

Upload dist/inbox-by-label-store.zip to replace the draft. The ZIP has manifest.json at its root and contains only runtime code/icons.

Before submission, verify sign-in with an authorized test account, account mismatch handling, all-label discovery, prefix/exclusion/order changes, unread and total counts against Gmail, read/archive behavior, refresh failures, empty counts, sidebar placement after navigation, and disconnect. Confirm no repeated native rows appear. Capture actual runtime screenshots with synthetic labels and mail. Use 1280×800 or 640×400 Store screenshots.

## 5. Submit the unlisted beta

Complete store/listing.md values, upload runtime screenshots and promotional assets, and reconcile permission/data-use declarations with the current dashboard. Add store/reviewer-instructions.md to reviewer notes. Choose Unlisted. Submit only the final configured build, after required sign-in verification is ready. Share the resulting installation URL after approval; unlisted links can be used by anyone who has them.

After beta feedback, update the Store listing to Public when ready.

## Official references

- https://developer.chrome.com/docs/webstore/publish/
- https://developer.chrome.com/docs/webstore/cws-dashboard-distribution
- https://developer.chrome.com/docs/webstore/images
- https://developer.chrome.com/docs/extensions/how-to/integrate/oauth
- https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification
