# Release validation — 0.2.0

- 14 Node tests passed: pagination, deduplication, unread/total separation, empty counts, failure handling, discovery, ordering, messaging errors, and public all-label defaults.
- Content and options scripts pass syntax checks.
- Bootstrap ZIP has manifest.json at its root, includes icons, and excludes setup notes, test code, personal OAuth configuration and the personal extension key.
- Browser preview with synthetic data renders the actual content script: reading changes 3 / 24 to 2 / 24.
- Preview survives 20 native-navigation rebuilds without duplicate rows or moving inside the managed navigation tree.
- Promotional tile visually inspected.

Still required before Store review: final production OAuth configuration, authorization in an actual test Gmail account with the Store identity, actual Gmail screenshots, publisher details, published privacy policy/homepage, Google OAuth verification and Store review. The bootstrap build cannot connect to Google and must never be submitted as the finished release.
