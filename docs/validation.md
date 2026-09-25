# Release validation — 0.2.0

- 14 Node tests passed: pagination, deduplication, unread/total separation, empty counts, failure handling, discovery, ordering, messaging errors, and public all-label defaults.
- Content and options scripts pass syntax checks.
- Bootstrap ZIP has manifest.json at its root, includes icons, and excludes setup notes, test code, personal OAuth configuration and the personal extension key.
- Browser preview with synthetic data renders the actual content script: reading changes 3 / 24 to 2 / 24.
- Preview survives 20 native-navigation rebuilds without duplicate rows or moving inside the managed navigation tree.
- Promotional tile visually inspected.

Still required before Store review: final production OAuth configuration, authorization in an actual test Gmail account with the Store identity, actual Gmail screenshots, publisher details, published privacy policy/homepage, Google OAuth verification and Store review. The bootstrap build cannot connect to Google and must never be submitted as the finished release.


## Version 0.2.2 — remove alarms

Removed the alarms permission and all alarm scheduling/listeners. Counts are requested when Gmail is visible on load, focus, visibility restoration, navigation, and every 60 seconds while visible. Manual refresh and explicit settings actions remain available; the existing worker request throttle remains in place. No recurring worker alarm is used. A refresh already in progress may finish after leaving Gmail.

Automated tests cover visible-tab refresh, hidden-tab suppression, resume, background-tab startup and alarm removal in both personal and public builds. Both builds pass JavaScript syntax checks. Live installed-extension validation still requires reload.


## Saved counts and empty labels update

The old 150-second expiry blanked all counts after inactivity, which was more visible after removing alarms. Counts now retain the last successful values, with saved-count age in the tooltip and stale/error status in the footer. Missing values still show a dash. Hide-empty defaults on and considers total inbox mail, including read mail; the personal build enables it once on extension reload/update while retaining other settings. Public builds honor an explicit prior hide-empty choice.

39 automated tests passed across both builds. Browser preview was unavailable; installed Gmail verification still requires reloading the extension and Gmail. Prior validation entries describe earlier versions.
