# n8n-nodes-google-events-api

An [n8n](https://n8n.io/) community node that searches Google Events and returns structured event listings: title, date, venue, address, ticket links, and description. It is backed by the [Google Events API](https://apify.com/johnvc/google-events-api---access-google-events-data?fpr=9n7kx3) on [Apify](https://apify.com?fpr=9n7kx3) and bills per result, so there are no subscriptions and no minimums.

[Installation](#installation) · [Credentials](#credentials) · [Operations](#operations) · [Output](#output) · [Example workflows](#example-workflows) · [Pricing](#pricing) · [Resources](#resources)

## What it does

Give the node a query and an optional location, and it returns one item per event with the title, date, venue, address, link, description, and image. It also works as an **AI Agent tool**, so an agent can look up what is happening on demand.

- Search events by query, optionally centered on a location
- Localize results with a country code and language code
- Fetch multiple result pages
- Choose how much data to return per event: Simplified, Raw, or Selected Fields

## Installation

Follow the n8n [community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/):

1. In n8n, open **Settings > Community Nodes**.
2. Select **Install**.
3. Enter `n8n-nodes-google-events-api` as the npm package name.
4. Agree to the risks of using community nodes, then select **Install**.

After it installs, the **Google Events** node appears in the nodes panel.

> n8n Cloud only allows verified community nodes. Until this node is verified, install it on a self-hosted n8n instance.

## Credentials

You need a free [Apify account](https://apify.com?fpr=9n7kx3) and an API token.

1. Sign in to the [Apify Console](https://console.apify.com?fpr=9n7kx3).
2. Open **Settings > Integrations** and copy your **Personal API token**.
3. In n8n, create a new **Apify API** credential and paste the token.
4. Use the credential's **Test** button to confirm it works.

The node also supports **Apify OAuth2** if you prefer to connect that way.

## Operations

**Event > Search** returns events that match a query.

| Parameter | Description |
| --- | --- |
| Search Query | What to search for, optionally including a place. Required. |
| Location | Location to center the search on. Optional. |
| Country Code | Two-letter country code the search runs from, for example `us`. Optional. |
| Language Code | Two-letter language code for the results, for example `en`. Optional. |
| Maximum Pages | How many result pages to fetch. |
| Output | How much data to return: Simplified, Raw, or Selected Fields. |

## Output

Each event is returned as its own n8n item. The API returns nested fields per event, so the **Output** parameter lets you choose how much to return:

- **Simplified** (default): a compact object with `title`, `startDate`, `when`, `venue`, `address`, `link`, `description`, and `image`. This mode is also used automatically when the node runs as an AI Agent tool, to keep responses small.
- **Raw**: every field the API returns for each event, using the original field names below.
- **Selected Fields**: pick exactly which fields to include.

### Fields (Raw and Selected Fields)

| Field | Type | Description |
| --- | --- | --- |
| `title` | string | Event title |
| `date` | object | Date details, including `start_date` and `when` |
| `address` | array | Address lines for the venue |
| `link` | string | Link to the event page |
| `event_location_map` | object | Map image and link for the location |
| `description` | string | Event description, when available |
| `ticket_info` | array | Ticket sources and links, when available |
| `venue` | object | Venue details, including name and rating when available |
| `image` | string | Event image URL |

## Example workflows

### 1. Weekly local-events digest

1. **Schedule Trigger**: run once a week.
2. **Google Events**: Search Query `things to do this weekend`, Location your city, Output `Simplified`.
3. **Send Email** or **Slack**: send the list of `title`, `startDate`, `venue`, and `link`.

### 2. Build an events calendar feed

1. **Manual Trigger**.
2. **Google Events**: search your topic and location.
3. **Google Sheets** (or a calendar node): append each event's `title`, `startDate`, `when`, and `address`.

### 3. Let an AI Agent answer "what's on" questions

1. **AI Agent** node.
2. Attach **Google Events** as a tool.
3. Ask "What concerts are in Austin this weekend?" The agent calls the node (in Simplified mode) and answers with live listings.

## Pricing

This node calls the [Google Events API](https://apify.com/johnvc/google-events-api---access-google-events-data?fpr=9n7kx3) on Apify, which is billed **pay-per-result**: a small per-search fee (about **$0.04 per page** of results) plus a fraction of a cent per event returned, with no subscription and no minimums. Apify also includes a free monthly usage tier that covers typical volumes. See the [Actor page](https://apify.com/johnvc/google-events-api---access-google-events-data?fpr=9n7kx3) for current rates.

## Resources

- [Google Events API on Apify](https://apify.com/johnvc/google-events-api---access-google-events-data?fpr=9n7kx3)
- [npm package](https://www.npmjs.com/package/n8n-nodes-google-events-api)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Apify n8n integration guide](https://docs.apify.com/platform/integrations/n8n)

## License

[MIT](LICENSE.md)
