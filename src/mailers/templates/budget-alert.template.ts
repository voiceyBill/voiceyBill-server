import { getBaseEmailTemplate } from "./base.template";

export const getBudgetAlertEmailTemplate = (params: {
  username: string;
  alerts: Array<{ message: string; type: "category" | "overall"; category?: string }>;
  month: number;
  year: number;
  totalBudget: number;
  spent: number;
}) => {
  const { username, alerts, month, year, totalBudget, spent } = params;

  const monthName = new Date(year, month - 1).toLocaleString("default", {
    month: "long",
  });

  // SVG icon generator for categories - Lucide style icons
  const getCategoryIconSVG = (categoryName: string): string => {
    const n = categoryName?.toLowerCase() || "";
    const baseStyle = "display:inline-block;margin-right:6px;vertical-align:middle;";

    if (n.includes("groceries") || n.includes("shopping")) {
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${baseStyle}"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`;
    }
    if (n.includes("dining") || n.includes("restaurant")) {
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${baseStyle}"><path d="M3 2v7c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V2"/><path d="M7 2v7"/><path d="M19 3v12"/><path d="M19 15a2 2 0 0 1-2 2H9a2 2 0 0 0-2 2v3h14v-3a2 2 0 0 0-2-2z"/></svg>`;
    }
    if (n.includes("transportation") || n.includes("travel")) {
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${baseStyle}"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="6" cy="16" r="1"/><circle cx="17" cy="16" r="1"/></svg>`;
    }
    if (n.includes("utilities")) {
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${baseStyle}"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;
    }
    if (n.includes("entertainment")) {
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${baseStyle}"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>`;
    }
    if (n.includes("housing") || n.includes("rent")) {
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${baseStyle}"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
    }
    if (n.includes("healthcare")) {
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${baseStyle}"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`;
    }
    if (n.includes("investments") || n.includes("income")) {
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${baseStyle}"><circle cx="12" cy="12" r="1"/><path d="M12 1v6m0 6v4"/><path d="M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6m6 0h4M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/></svg>`;
    }

    return ``;
  };

  const alertsHtml = alerts
    .map((alert) => {
      const isCategoryAlert = alert.type === "category";
      const baseStyle = "display:inline-block;margin-right:6px;vertical-align:middle;";
      let icon = "";

      if (isCategoryAlert) {
        icon = getCategoryIconSVG(alert.category || "");
      } else {
        // Overall alert warning icon
        icon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${baseStyle}"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
      }

      const bgColor = isCategoryAlert ? "#fef3c7" : "#fee2e2";
      const textColor = isCategoryAlert ? "#92400e" : "#991b1b";
      const borderColor = isCategoryAlert ? "#fcd34d" : "#fca5a5";
      const title = isCategoryAlert ? `${alert.category} Alert` : "Overall Budget Alert";

      return `
        <div style="
          margin-bottom:12px;
          padding:12px 16px;
          background:${bgColor};
          border-left:4px solid ${borderColor};
          border-radius:6px;
        ">
          <p style="margin:0;font-size:14px;color:${textColor};font-weight:600;">
            ${icon} ${title}
          </p>
          <p style="margin:4px 0 0;font-size:13px;color:${textColor};">
            ${alert.message}
          </p>
        </div>
      `;
    })
    .join("");

  const contentRowsHtml = `
    <p style="margin:0 0 16px;font-size:16px;color:#222;">
      Hi ${username},
    </p>

    <p style="margin:0 0 24px;font-size:15px;color:#444;line-height:1.6;">
      We wanted to notify you that your budget has exceeded its limits for ${monthName} ${year}.
    </p>

    <div style="
      padding:16px;
      background:#f9fafb;
      border:1px solid #e5e7eb;
      border-radius:8px;
      margin-bottom:20px;
    ">
      <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#111;">
        📈 Budget Summary
      </p>
      <div style="font-size:13px;color:#666;line-height:1.8;">
        <p style="margin:0;"><strong>Total Budget:</strong> $${totalBudget.toFixed(2)}</p>
        <p style="margin:0;"><strong>Amount Spent:</strong> $${spent.toFixed(2)}</p>
        <p style="margin:0;"><strong>Overage:</strong> <span style="color:#dc2626;font-weight:600;">$${(spent - totalBudget).toFixed(2)}</span></p>
      </div>
    </div>

    <div style="margin-bottom:20px;">
      <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#111;">
        🔔 Alerts & Recommendations
      </p>
      ${alertsHtml}
    </div>

    <p style="margin:0 0 16px;font-size:14px;color:#666;line-height:1.6;">
      Please review your spending and adjust your budget limits or expenses accordingly to stay on track.
    </p>

    <p style="margin:0;font-size:13px;color:#999;">
      Log in to VoiceyBill to view detailed breakdown by category and make adjustments.
    </p>
  `;

  return getBaseEmailTemplate({
    title: `Budget Alert for ${monthName} ${year}`,
    headerTitle: "Budget Alert",
    headerSubtitle: "Review your spending",
    headerLabel: "Alert",
    contentRowsHtml,
  });
};
