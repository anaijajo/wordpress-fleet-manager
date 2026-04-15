# WordPress Fleet Manager (Multi-Site Monitoring Tool)

### Overview

Built an internal monitoring system to track plugin, theme, and WordPress core updates across 30+ WordPress sites.

The tool aggregates data via custom REST API endpoints and surfaces issues in a centralized Google Sheets dashboard with automated email alerts.

### Problem
Managing 30+ WordPress sites required:
* Manually logging into each site
* Checking plugin/theme updates individually
* No centralized visibility into site health
* High risk of missed updates and inconsistencies

### Solution
Developed a JavaScript-based monitoring system that:
* Connects to each WordPress site via REST API
* Retrieves plugin, theme, and core update data
* Aggregates results into a Google Sheets dashboard
* Prioritizes sites based on update severity
* Sends automated email alerts for new issues

### Features
* Multi-site monitoring (30+ sites)
* Plugin update detection
* Theme update detection
* WordPress core update tracking
* Priority scoring system
* Google Sheets dashboard (Summary + Details)
* Automated email alerts (new issues only)

### Tech Stack
* JavaScript (Node.js)
* WordPress (custom REST API endpoint in PHP)
* Google Sheets API
* Google Apps Script (email automation)

### Key Impact
* Eliminated need to manually audit 30+ sites
* Reduced time spent on update checks
* Improved visibility into site health
* Enabled proactive issue detection via alerts

### Notes
Sensitive credentials removed for security
Example data used where appropriate
