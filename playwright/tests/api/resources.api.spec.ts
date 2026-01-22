import { test, expect } from "../../support/merged-fixtures";

test.describe("Supabase resources API", () => {
  test("lists published resources", async ({ request }) => {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY;

    test.skip(!supabaseUrl || !supabaseKey, "Missing Supabase credentials");

    const response = await request.get(
      `${supabaseUrl}/rest/v1/resources?select=*&status=eq.published&order=created_at.desc`,
      {
        headers: {
          apikey: supabaseKey!,
          Authorization: `Bearer ${supabaseKey}`
        }
      }
    );

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);

    for (const resource of body) {
      expect(resource.status).toBe("published");
    }
  });

  test("fetches a known resource by slug", async ({ request }) => {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY;

    test.skip(!supabaseUrl || !supabaseKey, "Missing Supabase credentials");

    const response = await request.get(
      `${supabaseUrl}/rest/v1/resources?select=*&slug=eq.fatigue-validation-guide&limit=1`,
      {
        headers: {
          apikey: supabaseKey!,
          Authorization: `Bearer ${supabaseKey}`
        }
      }
    );

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(1);
    expect(body[0].slug).toBe("fatigue-validation-guide");
  });
});
