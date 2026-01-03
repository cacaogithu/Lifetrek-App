# Manual Testing Guide - Admin Chatbot & LinkedIn Carousel

## 🔧 Prerequisites

Before testing, ensure:
1. Supabase Edge Functions are deployed:
   ```bash
   supabase functions deploy admin-support-agent
   supabase functions deploy generate-linkedin-carousel
   ```
2. Environment variables are set in Supabase:
   - `LOVABLE_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. You have admin user credentials

---

## 🤖 Admin Support Chatbot Testing

### Setup
1. Login to admin account at `/admin/login`
2. Navigate to any admin page (e.g., `/admin`)
3. Look for the blue floating button in the bottom-right corner

### Test Cases

#### Test 1: Chatbot Visibility (Role-Based Access)
**Objective**: Verify chatbot only appears for admin users

**Steps**:
1. Login as admin user → Should see floating chatbot button
2. Logout and view public pages → Should NOT see chatbot button
3. Login as non-admin user → Should NOT see chatbot button

**Expected**: Chatbot button visible only to authenticated admin users

---

#### Test 2: Basic Interaction
**Objective**: Verify chatbot UI and basic response

**Steps**:
1. Click the blue floating button (bottom-right)
2. Chatbot should open with welcome message
3. Read the welcome message - should list admin features
4. Type "Hello" and send
5. Wait for response

**Expected**:
- Clean, professional UI with blue gradient header
- Welcome message appears immediately
- Response within 2-3 seconds
- Response is contextual and helpful

---

#### Test 3: RAG - Recent Leads Query
**Objective**: Test RAG retrieval of real-time lead data

**Test Queries**:
1. "What are the recent leads?"
2. "Show me the last 5 leads"
3. "What's the status of our leads?"
4. "How many new leads do we have?"

**Expected Response Should Include**:
- Actual lead names from the database
- Current status (new, contacted, in_progress, etc.)
- Lead scores
- Company names
- Project types

**Validation**:
- Compare chatbot response with actual data in `/admin` leads table
- Data should match current database state (not static examples)

---

#### Test 4: RAG - Lead Pipeline Stats
**Objective**: Verify chatbot can provide pipeline analytics

**Test Queries**:
1. "How many leads are in progress?"
2. "What's our lead pipeline distribution?"
3. "Show me lead stats by status"
4. "How many leads are new vs contacted?"

**Expected Response Should Include**:
- Actual counts for each status (new, contacted, in_progress, quoted, closed, rejected)
- Total lead count
- Should match the analytics dashboard data

---

#### Test 5: RAG - Blog Performance
**Objective**: Test blog data retrieval

**Test Queries**:
1. "What are our recent blog posts?"
2. "Which blog posts have the most views?"
3. "Show me published vs draft posts"
4. "What's the most recent blog post?"

**Expected Response Should Include**:
- Actual blog titles from database
- View counts
- Published status (published/draft)
- Blog post slugs/URLs

**Validation**:
- Check `/admin/blog` and compare with chatbot response
- View counts should be accurate

---

#### Test 6: Admin Feature Guidance
**Objective**: Test static knowledge base responses

**Test Queries**:
1. "How do I assign a lead to myself?"
2. "What's the difference between status and priority?"
3. "How do I create a blog post?"
4. "Where can I find the LinkedIn carousel tool?"
5. "How do I export lead data?"

**Expected Response Should Include**:
- Step-by-step instructions
- Specific page URLs (/admin/blog, /admin/linkedin-carousel, etc.)
- Best practices
- Clear, actionable guidance

---

#### Test 7: Multi-Turn Conversation
**Objective**: Test conversation context retention

**Conversation Flow**:
1. "Show me recent leads"
2. (After response) "What's the highest priority one?"
3. (After response) "How should I follow up with them?"

**Expected**:
- Chatbot maintains context across messages
- References previous responses
- Provides relevant follow-up information

---

#### Test 8: Edge Cases & Error Handling

**Test Queries**:
1. Empty message → Should not send
2. Very long message (500+ characters) → Should handle gracefully
3. Special characters: "Test with émojis 🎉 and symbols @#$%"
4. Questions outside scope: "What's the weather?" → Should redirect to admin topics

**Expected**:
- No crashes or errors
- Appropriate error messages if API fails
- Graceful handling of unexpected input

---

## 📊 LinkedIn Carousel Testing

### Setup
1. Navigate to `/admin/linkedin-carousel`
2. Ensure you're logged in as admin

### Test Cases

#### Test 1: Basic Carousel Generation (Value Post)
**Objective**: Generate a complete carousel with RAG

**Steps**:
1. Fill in form:
   - Topic: "ISO 13485 Certification for Medical Devices"
   - Target Audience: "Quality Managers at Orthopedic OEMs"
   - Pain Point: "Struggling with supplier compliance audits"
   - Desired Outcome: "Reduce audit failures and gain supply chain confidence"
   - Proof Points: "ISO 13485:2016, ANVISA, 30+ years experience"
   - CTA: "Download our Quality Assurance Guide"
   - Post Type: "Value Post" (educational)
   - Number of Carousels: 1
   - Want Images: Yes
2. Click "Generate"
3. Wait for streaming process

**Expected Behavior**:
- **Strategist Phase**: Loading indicator "Strategist consultando KB..."
- **Copywriter Phase**: "Copywriter refinando..."
- **Designer Phase**: "Designer gerando visuais..." (if images enabled)
- **Progress Updates**: Real-time step completion messages
- **Final Result**: Complete carousel with:
  - 5-8 slides (hook, content, CTA)
  - Professional headlines (under 10 words)
  - Concise body text (under 25 words)
  - Generated images (1080x1080, branded)

**Validation**:
- Check if machine names appear (Citizen M32, ZEISS Contura, etc.)
- Verify brand tone is "engineer-to-engineer", not salesy
- Images should have text burned in (not overlaid)
- CTA should be low-friction for value posts

---

#### Test 2: RAG Product Context Integration
**Objective**: Verify RAG fetches product images from database

**Steps**:
1. Generate carousel with topic related to existing products:
   - Topic: "Precision Orthopedic Screws Manufacturing"
   - Include proof points that match products in DB
2. Monitor console logs (browser dev tools)
3. Check generated slides

**Expected**:
- Console should show: "📸 [CONTEXT] Loaded X product images for strategist"
- Slides should reference specific products from database
- Asset context should be visible in strategist notes
- If using "asset" background type, should fetch from `content_assets` table

**Validation**:
- Open browser console and check for RAG logs
- Verify product names/categories mentioned in carousel match database
- Check if any slides use existing assets (vs generated images)

---

#### Test 3: Commercial Post vs Value Post
**Objective**: Test different post types

**Test A - Value Post**:
- Topic: "5 Common Medical Device Manufacturing Mistakes"
- Post Type: "Value"
- Expected tone: Educational, informative, helpful
- CTA: Low-friction (download guide, read article)

**Test B - Commercial Post**:
- Topic: "Premium CNC Machining for Orthopedic Implants"
- Post Type: "Commercial"
- Expected tone: Confident, direct, results-focused
- CTA: Stronger (request quote, schedule call)

**Validation**:
- Compare tone and language between the two
- Commercial should be bolder, more promotional
- Value should be educational, Harvard Business Review style

---

#### Test 4: Batch Mode (Multiple Carousels)
**Objective**: Generate 3 carousel variants simultaneously

**Steps**:
1. Fill form with:
   - Topic: "Cleanroom Medical Manufacturing"
   - Number of Carousels: 3
   - Want Images: No (faster testing)
2. Generate

**Expected**:
- System generates 3 distinct strategic angles
- Different hooks/headlines for each variant
- User can choose the best option
- All 3 should be complete and unique

**Validation**:
- Check that all 3 carousels have different hook slides
- Verify strategic differentiation (not just rewording)

---

#### Test 5: End-to-End with Images
**Objective**: Full workflow with image generation

**Steps**:
1. Generate carousel with images enabled
2. Monitor image generation progress
3. Wait for completion (may take 2-3 minutes)
4. Download/export carousel

**Expected**:
- Images generated in batches (concurrency = 5)
- Progress indicator shows "X/Y images complete"
- All images should be 1080x1080 square
- Images should have text burned in (headline + body)
- Lifetrek branding visible on images

**Validation**:
- Check image quality and text readability
- Verify all slides have images (if generation successful)
- Images should match slide content thematically

---

#### Test 6: Streaming Response
**Objective**: Verify real-time streaming updates

**Steps**:
1. Start carousel generation
2. Watch for SSE (Server-Sent Events) updates
3. Monitor step transitions

**Expected Events** (in order):
1. `step: strategist, status: active`
2. `preview: {agent: "strategist", content: "..."}`
3. `step: strategist, status: done`
4. `strategist_result: {...}`
5. `step: analyst, status: active`
6. `step: analyst, status: done`
7. `analyst_result: {...}`
8. `step: images, status: active` (if images enabled)
9. `image_progress: {completed: X, total: Y}`
10. `step: images, status: done`
11. `complete: {carousel}`

**Validation**:
- No hanging/frozen states
- Each step completes before next begins
- Error handling if any step fails

---

#### Test 7: Error Scenarios

**Test Cases**:
1. **Missing Required Fields**: Submit without topic → Should show validation error
2. **API Rate Limit**: Generate many carousels rapidly → Should handle 429 error gracefully
3. **Network Interruption**: Kill network mid-generation → Should show error message
4. **Invalid Input**: Extremely long topic (1000+ chars) → Should truncate or reject

**Expected**:
- User-friendly error messages (not technical stack traces)
- Clear guidance on how to fix the issue
- No crashes or white screens

---

## 📝 Performance Benchmarks

### Admin Chatbot
- **First Response Time**: < 3 seconds
- **RAG Data Fetch**: < 500ms
- **Subsequent Responses**: < 2 seconds

### LinkedIn Carousel
- **Text Only (1 carousel)**: 5-10 seconds
- **With Images (1 carousel, 6 slides)**: 30-45 seconds
- **Batch Mode (3 carousels, no images)**: 15-20 seconds
- **Full Generation (3 carousels + images)**: 60-90 seconds

---

## 🐛 Known Issues & Limitations

### Admin Chatbot
- RAG limited to last 10 leads (by design for context window)
- May not have info on very recent changes (< 1 minute old due to caching)

### LinkedIn Carousel
- Image generation can fail silently (check for empty imageUrl)
- Concurrent image generation limited to 5 at a time (to avoid rate limits)
- Very long topics may be truncated

---

## ✅ Success Criteria

### Admin Chatbot
- ✅ Appears only for admin users
- ✅ Provides real-time data from database
- ✅ Answers admin-specific questions accurately
- ✅ Maintains conversation context
- ✅ Handles errors gracefully

### LinkedIn Carousel
- ✅ Generates complete carousels with proper structure
- ✅ Uses RAG to fetch product/asset context
- ✅ Different tone for value vs commercial posts
- ✅ Images generated correctly with burned-in text
- ✅ Streaming updates work smoothly
- ✅ Batch mode produces distinct variants

---

## 📞 Support

If issues are found during testing:
1. Check browser console for errors
2. Check Supabase logs for edge function errors
3. Verify environment variables are set correctly
4. Ensure database tables have data (leads, blogs, products)

---

**Last Updated**: 2026-01-03
**Testing Version**: v1.0 (Admin Chatbot + LinkedIn Carousel with RAG)
