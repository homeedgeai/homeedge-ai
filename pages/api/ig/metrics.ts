// pages/api/ig/metrics.ts
import type { NextApiRequest, NextApiResponse } from "next";

const GRAPH = "https://graph.facebook.com/v21.0";
const IG_USER_ID = process.env.IG_USER_ID!;
const PAGE_LONG_LIVED_TOKEN = process.env.FB_PAGE_LONG_TOKEN!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Followers
    const profileRes = await fetch(
      `${GRAPH}/${IG_USER_ID}?fields=followers_count&access_token=${PAGE_LONG_LIVED_TOKEN}`
    ).then(r => r.json());

    // Insights
    const metrics = ["impressions", "reach", "profile_views"].join(",");
    const since = sinceDays(30);
    const insightsRes = await fetch(
      `${GRAPH}/${IG_USER_ID}/insights?metric=${metrics}&period=day&since=${since}&access_token=${PAGE_LONG_LIVED_TOKEN}`
    ).then(r => r.json());

    const totals: Record<string, number> = {};
    (insightsRes?.data || []).forEach((m: any) => {
      totals[m.name] = (m.values || []).reduce((sum: number, v: any) => sum + (v.value || 0), 0);
    });

    res.status(200).json({
      platform: "instagram",
      views: totals.impressions || 0,
      reach: totals.reach || 0,
      profileViews: totals.profile_views || 0,
      followers: profileRes?.followers_count || 0,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Instagram metrics fetch failed" });
  }
}

function sinceDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return Math.floor(d.getTime() / 1000);
}
