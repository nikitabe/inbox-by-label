# Privacy policy — Inbox by label

Draft for release. Publisher and support contact must be completed before this policy is published or submitted to Google.

Publisher: [PUBLISHER]
Contact: [SUPPORT_EMAIL]
Effective date: [PUBLICATION_DATE]

## What the extension accesses

With your permission, Inbox by label accesses your Google account email address, Gmail label names and IDs, and message and conversation IDs for mail matching selected labels, INBOX, and UNREAD. These IDs are used temporarily to calculate counts. It requests the Gmail metadata permission, which permits access to headers and labels but not message bodies; this implementation does not request message headers or bodies. It cannot send mail or modify messages through its API permission.

On the Gmail page, the extension reads the visible account control to confirm the account and the navigation layout to add its sidebar. It does not inspect email bodies. The extension opens Gmail searches when you click a label.

## Use and storage

Data is used only to display and refresh inbox label views and unread/total counts. Account email, label metadata, aggregate counts, update timestamps, preferences, and connection error messages may be stored in local Chrome extension storage. Message and conversation IDs are held temporarily during counting and are not written to persistent storage. Google authentication tokens are managed using Chrome's identity API.

Requests go directly to Google's Gmail API. The publisher receives no mailbox data. There is no developer-operated backend, telemetry, analytics, advertising, sale of data, or use of data to train AI models. The extension does not send data to Grok or require Grok.

## Retention and control

Cached counts are replaced on successful refresh. Disconnect locally clears extension local storage and Chrome's cached tokens for the extension. To revoke Google's authorization, remove Inbox by label from your Google Account's third-party connections. Removing the extension removes its local extension data. Disconnecting or uninstalling does not change your emails or Gmail labels.

If you voluntarily contact support or file a public GitHub issue, the information you provide is handled by the chosen communication service and may be public. Do not include private email content or credentials in public issues.

## Google API Limited Use

Inbox by label's use and transfer of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements.

## Changes and contact

Updates to this policy will be published on the extension's website with a revised effective date. Contact the publisher using the support address above with privacy questions.
