const fs = require("fs");
const { google } = require("googleapis");
const sites = require("./sites");

// Fetch plugin data from your custom WP endpoint
async function getPlugins(site) {
  const credentials = Buffer.from(
    `${site.username}:${site.appPassword}`,
  ).toString("base64");

  const response = await fetch(`${site.url}/wp-json/custom/v1/plugins`, {
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });

  return await response.json();
}

// Write data to Google Sheets
async function writeToSheet(rows, sheetName) {
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const spreadsheetId = "1sOz5mOuBMs7_PFEHh0XhHJtPN4O-GvB9weX8UqOEj40";

  // Clear the specific sheet
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
  });

  // Write to that same sheet
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
    valueInputOption: "RAW",
    requestBody: {
      values: rows,
    },
  });
}

// Main function
async function run() {
  let detailRows = [["Site", "Plugin", "Status", "Version", "Issue"]];

  let summaryRows = [
    [
      "Site",
      "WP Version",
      "WP Update",
      "Theme",
      "Theme Version",
      "Theme Update",
      "Plugin Updates",
      "Inactive Plugins",
    ],
  ];

  for (const site of sites) {
    try {
      const data = await getPlugins(site);
      const plugins = data.plugins;

      let updateCount = 0;
      let inactiveCount = 0;

      plugins.forEach((p) => {
        let issues = [];

        if (p.needs_update) {
          issues.push("Update Needed");
          updateCount++;
        }

        if (!p.active) {
          issues.push("Inactive");
          inactiveCount++;
        }

        // Only show problem plugins
        if (issues.length > 0) {
          detailRows.push([
            site.name,
            p.name,
            p.active ? "Active" : "Inactive",
            p.version,
            issues.join(", "),
          ]);
        }
      });

      let priorityScore = 0;

      if (data.wp_needs_update) priorityScore += 5;
      if (data.theme.needs_update) priorityScore += 3;
      priorityScore += updateCount * 2;
      priorityScore += inactiveCount;

      // Add summary row per site
      if (
        data.wp_needs_update ||
        data.theme.needs_update ||
        updateCount > 0 ||
        inactiveCount > 0
      ) {
        summaryRows.push([
          site.name,
          data.wp_version,
          data.wp_needs_update ? "🚨" : "✅",
          data.theme.name,
          data.theme.version,
          data.theme.needs_update ? "🚨" : "✅",
          updateCount,
          inactiveCount,
          priorityScore,
        ]);
      }
    } catch (err) {
      detailRows.push([site.name, "ERROR", "", "", err.message]);
      summaryRows.push([site.name, "ERROR", "ERROR"]);
    }
  }

  const header = summaryRows[0];
  const dataRows = summaryRows.slice(1);

  dataRows.sort((a, b) => b[8] - a[8]); // sort by priorityScore

  summaryRows = [header, ...dataRows];
  summaryRows = summaryRows.map((row) => row.slice(0, 8));

  // Combine summary + detail into one sheet
  summaryRows.unshift([`Last Updated: ${new Date().toLocaleString()}`]);

  await writeToSheet(summaryRows, "Summary");
  await writeToSheet(detailRows, "Details");

  fs.writeFileSync(
    "report.json",
    JSON.stringify(
      {
        summary: summaryRows,
        details: detailRows,
      },
      null,
      2,
    ),
  );

  console.log("✅ Sheet updated successfully");
}

// Run the script
run();
