import { test, expect } from "../../support/merged-fixtures";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

test.describe("Supabase resources API", () => {
  test.skip(
    !supabaseUrl || !supabaseKey,
    "Missing SUPABASE_URL and SUPABASE_ANON_KEY (or VITE_ equivalents)."
  );

  test.use({ configBaseUrl: supabaseUrl });

  const authHeaders = {
    apikey: supabaseKey || "",
    Authorization: `Bearer ${supabaseKey || ""}`
  };

  test("lists published resources", async ({ apiRequest }) => {
    const { status, body } = await apiRequest({
      method: "GET",
      path: "/rest/v1/resources?select=*&status=eq.published&order=created_at.desc",
      headers: authHeaders
    });

    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);

    for (const resource of body) {
      expect(resource.status).toBe("published");
    }
  });

  test("fetches a known resource by slug", async ({ apiRequest }) => {
    const { status, body } = await apiRequest({
      method: "GET",
      path: "/rest/v1/resources?select=*&slug=eq.fatigue-validation-guide&limit=1",
      headers: authHeaders
    });

    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(1);
    expect(body[0].slug).toBe("fatigue-validation-guide");
  });
});
