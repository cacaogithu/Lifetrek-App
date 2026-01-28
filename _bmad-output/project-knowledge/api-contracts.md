# API Contracts (Supabase Edge Functions)

Each function is deployed as a serverless endpoint.

## Endpoints

### `send-contact-email`
- **Purpose**: Sends email notifications when a contact form is submitted.
- **Trigger**: HTTP POST (or Database Webhook).
- **Auth**: Public/Anon (Verify logic in config).

### `chat`
- **Purpose**: AI Chatbot backend.
- **Trigger**: HTTP POST.
- **Integration**: OpenAI API.

### `generate-linkedin-carousel`
- **Purpose**: Generates LinkedIn content (Text + Image Prompts) using AI.
- **Auth**: Authenticated (Requires Service Role or User JWT).
- **Inputs**: `topic`, `tone`, `profileType` (Company vs Salesperson).

### `analyze-product-image`
- **Purpose**: Computervision analysis of uploaded product photos.
- **Integration**: OpenAI Vision API / Custom Model.

### `enhance-product-image`
- **Purpose**: GenAI enhancement of product photos for marketing.

### `research-company`
- **Purpose**: Fetches company data for enrichment.
- **Integration**: External Data APIs (e.g., Unipile, LinkedIn).

### `send-calculator-report`
- **Purpose**: Emails ROI/Lead Score reports to users.
- **Trigger**: Post-calculation form submission.

### `sales-engineer-agent`
- **Purpose**: Autonomous sales agent logic.

## Common Headers
- `Authorization`: Bearer `SUPABASE_ANON_KEY` or `USER_JWT`.
- `Content-Type`: `application/json`.

## Error Handling
Standard HTTP codes:
- `200`: Success.
- `400`: Bad Request (Validation).
- `500`: Internal Server Error (Function crash/Timeout).
