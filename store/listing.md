# Chrome Web Store listing

Status: prepared copy; not submitted.

Name: Inbox by label

Summary: Open Gmail labels as inbox-only views, with unread / total counts and configurable label selection.

Category suggestion: Productivity
Language: English
Initial visibility: Unlisted
Publisher: [PUBLISHER]
Support email: [SUPPORT_EMAIL]
Homepage: [HOMEPAGE_URL]
Privacy policy: [PRIVACY_URL]
Support URL: [SUPPORT_URL]

## Description

See what still needs attention in each Gmail label.

Inbox by label adds a section above Gmail's normal navigation. Click a label to open only the mail with that label that is still in your inbox. Each badge shows unread / total, so 3 / 12 means three unread out of twelve inbox conversations or messages.

• Choose conversation counts or individual-message counts.
• Discover all custom labels, or filter by a label-name prefix.
• Select and reorder the labels you want to see.
• Optionally hide labels with no inbox mail.
• Keep Gmail's original label controls available.
• Refresh counts manually or let them update approximately every minute while Gmail is visible. Counts also refresh when you open or return to Gmail.

Connect your Google account, choose your labels, and open Gmail. Reading mail reduces the unread count; archiving removes it from the inbox totals after refresh.

The extension uses Gmail metadata access to calculate counts. It does not request message bodies or change your email. Data goes directly to Google and counts are stored locally in Chrome. There is no developer-operated backend or analytics.

Designed for desktop Chrome and the English Gmail interface. Supports one connected Google account per Chrome profile. Labels can be created manually or by other tools; no AI service is required. Label colors are assigned by this extension. Gmail interface changes may require an extension update.

Independent project, not affiliated with or endorsed by Google or Gmail.

## Single purpose

Display inbox-only Gmail label views and their unread/total counts in the Gmail sidebar.

## Permission justifications

identity: Authenticate the user with Google to calculate Gmail inbox counts.
storage: Store label preferences, connected account email, cached aggregate counts, and connection status locally.
gmail.googleapis.com: Read Gmail profile email, custom label metadata, and matching message/thread IDs to calculate exact counts across all result pages.
mail.google.com content script: Insert the sidebar, confirm the visible active account, and open inbox-only label searches.
gmail.metadata OAuth scope: List labels and message/thread IDs using INBOX, custom label, and UNREAD filters. No narrower Gmail scope provides these counting operations.

## Data disclosure preparation

Disclose account email (personally identifiable information) and email-related label/message metadata (personal communications) according to the dashboard's current definitions. Data is processed locally and sent only directly to Google API endpoints. No browsing history, financial data, location, analytics, or advertising data is collected. Reconcile these statements with the current Store form before submitting. OAuth tokens are handled through Chrome identity; disclose authentication handling if the form asks.

## Assets

Extension icons: extension/icons/icon128.png (other runtime sizes included).
Promotional tile: store/promo-440x280.png.
Screenshots: still require actual runtime capture with synthetic test data; do not upload private mailbox screenshots or present a mockup as a live Gmail screenshot.
