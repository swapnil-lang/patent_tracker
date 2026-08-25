# Patently

Patently is a user-first IP portfolio tracker for Indian intellectual property.
It gives founders, inventors, legal teams, and IP owners one place to track
patents, designs, trademarks, geographical indications, and copyrights.

## The Problem

Tracking IP through public portals is fragmented and manual. Owners often need
to search every application number separately, understand formal status terms,
remember response deadlines, and repeatedly check for an update. This makes it
easy to miss a hearing, examination response, renewal, or grant notice.

## Vision

Make every IP record understandable and actionable from a single portfolio.
Patently will monitor approved status sources, show a clear timeline for each
record, preserve its documents, and notify the owner when something changes or
needs attention.

## MVP Included Here

- Mock email sign-in with light and dark modes
- Unified portfolio for patents, industrial designs, trademarks, geographical
  indications, and copyrights
- Search plus filters for IP type, status, and filing year
- Record detail popups with status timelines and mock documents
- Local mock document upload per record
- Attention list, status activity feed, and deadline-style next actions

## Planned Production Workflow

1. A scheduled backend worker obtains status data from an authorized,
   CAPTCHA-compliant data source or approved integration.
2. The worker compares the latest status against the stored record history.
3. A status change creates an activity event, updates the timeline, and
   identifies deadlines or action required.
4. The notification service sends a branded email through the configured SMTP
   provider to the record owner and approved collaborators.
5. Documents and status history are stored securely with access control and an
   audit trail.

The IP India public search experience may use CAPTCHA, so Patently should not
rely on unsanctioned automated scraping. A compliant data provider, approved
integration, or user-assisted status import is required before automatic live
notifications are enabled.

## Run Locally

Requires Node.js.

```powershell
node server.js
```

Open `http://localhost:3000`.

## Current Technical Scope

This is a static, mock-data product prototype. Login, uploads, documents, and
notifications are intentionally local/demo-only until a backend, database,
secure object storage, SMTP configuration, and authenticated status-data
integration are added.
