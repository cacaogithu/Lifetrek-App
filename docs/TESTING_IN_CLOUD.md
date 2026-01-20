# Testing in Lovable Cloud

Since `test_api_response.py` is a Python script on your local machine, you cannot "upload" it to Lovable to run. However, you can run it **locally** but target the **Cloud** environment.

## Option 1: Run Python Test against Cloud API

1.  **Deploy your changes** to Lovable (Push to GitHub).
2.  **Get your Cloud Credentials** from the Lovable/Supabase Dashboard:
    -   `Project URL` (e.g., `https://your-project.supabase.co`)
    -   `Anon Key` (Public key)
3.  **Run the script** with cloud variables:

```bash
API_URL="https://your-project.supabase.co/functions/v1/generate-linkedin-carousel" \
SUPABASE_ANON_KEY="your-cloud-anon-key" \
python3 tests/e2e/test_api_response.py
```

*Note: This will use the Real AI Backend in the cloud (consuming credits), not the mock one.*

## Option 2: Prompting Lovable (The Agent)

You can copy and paste these prompts directly into the Lovable chat to have it handle the deployment and verification for you.

### Prompt 1: Deploy & Verify Function Health
Use this to ensure the code changes (migrations + edge function) are working correctly in production.

> "I have merged a PR that fixes Supabase migrations (idempotency) and updates the `generate-linkedin-carousel` function.
>
> Please **deploy these changes** to the live environment. After deployment, **verify the `generate-linkedin-carousel` function** by checking:
> 1. Are there any errors in the Edge Function logs?
> 2. Can you trigger a test invocation ensuring the `LOVABLE_API_KEY` is correctly picked up (not the mock one)?
> 3. Confirm that the migration for `content_templates` and `admin_users` was applied successfully without 'relation already exists' errors."

### Prompt 2: Optimize Carousel Content
Use this if you want Lovable to improve the *quality* of the AI generation, now that the *infrastructure* is fixed.

> "Now that the `generate-linkedin-carousel` function is working, I want to **optimize the output quality**.
>
> Please review the `SYSTEM_PROMPT` in `supabase/functions/generate-linkedin-carousel/functions_logic.ts` (or `index.ts`) and:
> 1. Improve the instructions for 'Hooks' to be more viral/engaging.
> 2. Ensure the 'Voice and Tone' strictly enforces short, punchy sentences (under 20 words).
> 3. Add a rule to formatted output: The 'slides' content should always include a standardized 'Intro' and 'Outro' slide structure.
>
> Apply these changes and deploy."

### Prompt 3: Cloud-Native Testing
Use this if you want Lovable to create a robust testing suite inside the cloud project itself.

> "Please create a **Deno test suite** in `supabase/functions/tests/carousel_test.ts`.
> The test should:
> 1. invoke the `generate-linkedin-carousel` function using a real payload.
> 2. Assert that the returned JSON contains a `carousels` array.
> 3. Validate that each slide has a 'headline' and 'body'.
>
> Once created, please run this test in the CI/CD pipeline to ensure no regressions."
