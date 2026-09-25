# Inbox by label

Turn your Gmail labels into inbox-only views, with **unread / total** counts.

- Open all inbox mail for a label in one click.
- Count conversations or individual messages.
- Include all custom labels, or filter by a label-name prefix.
- Choose labels, arrange their order, and optionally hide empty ones.
- Keep Gmail's original label controls available.
- Counts refresh approximately every minute while Gmail is visible, when you open or return to Gmail, or with Refresh. No scheduled background refresh runs when Gmail is closed.

## Status

Preparing an unlisted Chrome Web Store beta. No Store installation link is available yet.

The public version defaults to all custom labels. To use labels created by Grok, set the prefix to `Grok-`. Grok is not required. Search links use lowercase label names; displayed names retain their capitalization.

Requires desktop Chrome 120+, the English Gmail interface, and one connected Google account per Chrome profile. The extension verifies the active Gmail account before displaying counts. Sidebar placement depends on Gmail's page layout and may need maintenance when Gmail changes it. Label colors are extension-assigned, not synchronized from Gmail.

## Privacy

Requests go directly from Chrome to Google's Gmail API. There is no developer-operated backend, analytics, advertising, or remote executable code. Message bodies are not requested. Cached account email, label metadata, settings, and aggregate counts are stored locally in Chrome. See [privacy policy draft](docs/privacy.md).

## Development

1. Install Node.js 20+ and Python 3.
2. Run `npm test`.
3. Create your own Google Cloud project, enable Gmail API, and configure Google Auth Platform. During testing, add your account as a test user.
4. Load `extension/` as an unpacked extension in Chrome developer mode. Copy its extension ID and create a **Chrome Extension** OAuth client using that ID.
5. For local development only, replace the placeholder `oauth2.client_id` in `extension/manifest.json` with that client's ID. Reload the extension and open its settings to connect. Do not commit this local configuration.

OAuth testing grants may expire after seven days. Production OAuth setup and verification are separate from Chrome Web Store review. An OAuth client ID is a public identifier; never put client secrets, access tokens, or private signing keys in this repository.

## Release

See [release instructions](docs/releasing.md), [Store listing](store/listing.md), and [reviewer instructions](store/reviewer-instructions.md). The build script packages only extension runtime files, with `manifest.json` at the ZIP root. It requires explicit production configuration for a usable release.

## Contributing

Run `npm test` before submitting changes. Use synthetic fixtures; do not attach private mailbox screenshots, OAuth tokens, or email data to issues. Report interface bugs with your Chrome version, extension version, and reproduction steps.

## License

MIT. Independent project; not affiliated with or endorsed by Google or Gmail.

Labels with unread inbox mail appear in bold at the top of the sidebar. Your chosen order is preserved within each group. This updates on count refresh; stale or unavailable counts do not imply unread status.
