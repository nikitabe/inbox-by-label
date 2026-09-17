# Reviewer instructions

Use a configured production build; the bootstrap upload is only for reserving an item ID.

1. Open extension settings and select Connect Gmail. Authorize with a Google account permitted by the production OAuth configuration.
2. Open Gmail in English using that same account. Create synthetic custom labels such as Action and News and apply them to a few inbox conversations. Keep at least one unread and one read.
3. Leave the label prefix blank to include all custom labels, or set a prefix that matches your synthetic labels. Select Refresh labels.
4. The Inbox by label section appears above the native Gmail navigation. Each row displays unread / total inbox counts. Select a row and confirm the search includes in:inbox and that label.
5. Read an unread message, then refresh counts. Only unread decreases. Archive a conversation and refresh; its matching inbox totals decrease.
6. Try exclusions, ordering, hide-empty, and both counting modes. Multiple messages in one conversation count once in conversation mode.
7. Disconnect locally to clear cached account data and settings.

No payment, separate subscription, AI service, or developer-operated backend is required. The extension supports one connected account per Chrome profile and does not request message bodies or modify mail through the API. It does not contain remote executable code.
