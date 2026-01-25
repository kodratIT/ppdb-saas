# Admin System Operations Enhancement Design

**Date:** 2026-01-25
**Status:** Approved
**Author:** AI Assistant (via brainstorming session)

## Overview

Enhancement of the Admin System Operations page (`/admin/system/operations`) to transform from a static monitoring page into a comprehensive real-time operations dashboard with auto-refresh, alerting, charts, and live logs.

## Current State

### Existing Features
- **Backend**: Collects server metrics, DB health, integration health (WAHA, Xendit), platform stats
- **Frontend**: Displays metrics in cards, manual refresh button
- **Limitations**: No real-time updates, no alerts, no historical data, no logs, requires manual refresh

## Proposed Enhancements

### 1. Real-Time Data Streaming (SSE)

**Architecture:**
- Server-Sent Events (SSE) endpoint: `/api/admin/system/stream`
- Client subscribes to receive automatic updates
- Server pushes data every 5 seconds

**Benefits:**
- More efficient than polling (no repeated requests)
- Real-time updates without manual refresh
- Supports multiple concurrent admin users

**Fallback:**
- If SSE unavailable, fallback to polling (every 10 seconds)
- Show warning message: "Real-time updates unavailable, using polling"

### 2. Metrics Buffer & Charts

**In-Memory Buffer:**
- Array buffer storing 30 data points (last 30 intervals)
- Each data point: timestamp + metrics
- Used for real-time charting

**Charts:**
- Memory Usage Chart (line chart, 30 data points)
- Database Latency Chart (line chart, 30 data points)
- Auto-update on new data
- Canvas API or SVG based rendering

### 3. Alert System

**Threshold Configuration:**
```typescript
interface AlertThresholds {
  memory: {
    warning: 70,   // percent
    critical: 90   // percent
  };
  databaseLatency: {
    warning: 500,   // ms
    critical: 2000  // ms
  };
  integrationLatency: {
    warning: 1000,  // ms
    critical: 3000  // ms
  };
  apiErrorRate: {
    warning: 5,     // errors per minute
    critical: 10    // errors per minute
  };
}
```

**Alert Logic:**
- Check thresholds on every metrics update (every 5 seconds)
- Create alert if threshold exceeded
- Push to client via SSE
- Auto-resolve when values return to normal

**UI Notifications:**
- Toast notification for critical alerts (auto-dismiss 10s)
- Bell icon badge showing active alert count
- Alert panel/modal with full details
- Color indicators on status cards

### 4. Real-Time Logs Panel

**Log Sources:**
- Application errors (console.error, caught exceptions)
- Integration errors (WAHA, Xendit failures)
- Database errors (query failures, connection issues)
- System logs (memory warnings, process issues)

**Log Structure:**
```typescript
interface SystemLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'critical';
  source: 'app' | 'waha' | 'xendit' | 'database' | 'system';
  message: string;
  details?: Record<string, any>;
}
```

**Buffer Management:**
- In-memory array (100 logs max)
- FIFO (first in, first out)
- Reset on server restart

**Logs UI Features:**
- Auto-scroll to latest (toggle on/off)
- Filter by level (All, Error, Warning, Info)
- Filter by source (App, WAHA, Xendit, Database)
- Color coding: Red (error), Yellow (warning), Blue (info)
- Expandable details on click

## UI Structure

```
┌─────────────────────────────────────────────┐
│ Header + Auto-refresh Toggle + Alert Bell  │
├─────────────────────────────────────────────┤
│ Status Cards (4 cards)                      │
│ - Overall Status, Uptime, Memory, Database  │
├─────────────────────────────────────────────┤
│ Real-time Charts (2 charts)                 │
│ - Memory Usage Chart (line chart)           │
│ - Database Latency Chart (line chart)       │
├─────────────────────────────────────────────┤
│ Integration Health (WAHA, Xendit)           │
├─────────────────────────────────────────────┤
│ Platform Stats (3 metrics)                  │
├─────────────────────────────────────────────┤
│ Real-time Logs Panel (scrollable)           │
│ - Error/warning logs with timestamp         │
└─────────────────────────────────────────────┘
```

## State Management

```typescript
interface OperationsState {
  metrics: SystemMetrics;           // Current metrics
  history: MetricsHistory[];        // 30 data points for charts
  logs: SystemLog[];                // 100 latest logs
  alerts: Alert[];                  // Active alerts
  autoRefresh: boolean;             // Auto-refresh toggle state
  connected: boolean;               // SSE connection status
}
```

## Data Flow

**Server (every 5 seconds):**
1. Collect metrics (server, db, integrations)
2. Push to all subscribed clients via SSE
3. Store in buffer for charts
4. Check alert thresholds
5. Collect new logs

**Client:**
1. Subscribe to SSE endpoint
2. Update UI on data receive
3. Render charts from buffer
4. Show alerts/notifications

## Error Handling & Edge Cases

### SSE Connection Failures
- Auto-reconnect with exponential backoff
- Max 5 retries, then show connection error
- Retry delay: 1000 * 2^retryCount ms

### Metrics Collection Failures
- Return cached metrics with `unknown` status
- Don't break entire flow if one check fails
- Gracefully degrade per component

### Memory Management
- Limit buffer sizes (metrics: 30, logs: 100)
- Automatic cleanup of old data
- Monitor buffer memory usage

### Server Restart
- Client detects disconnect
- Auto-reconnect with backoff
- Show "Reconnecting..." status

### High Memory Usage
- Trigger critical alert at 95% memory
- Optional: auto-restart notification

### Integration Total Failure
- Mark service as `error`
- Continue showing other metrics
- Don't crash entire page

## Implementation Notes

**No Historical Storage (Opsi D):**
- Real-time only, no persistent historical data
- Can be extended later with database if needed
- Follows YAGNI principle for now

**Performance Considerations:**
- SSE is more efficient than polling
- In-memory buffers are fast
- Limited buffer sizes prevent memory issues

**Future Enhancements (Optional):**
- Database storage for historical trends
- Configurable thresholds via UI
- Export logs functionality
- Custom alert rules

## Testing Strategy

1. **Unit Tests**: Metrics collection, alert logic, log parsing
2. **Integration Tests**: SSE connection, data flow
3. **E2E Tests**: Full dashboard workflow, alerts, charts
4. **Load Tests**: Multiple concurrent users, long-running connections

## Success Criteria

- Real-time updates working without manual refresh
- Alerts trigger correctly on threshold breaches
- Charts render smoothly with live data
- Logs display and filter correctly
- SSE auto-reconnects on failures
- Page remains responsive under load
