
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env')
const envConfig = dotenv.parse(fs.readFileSync(envPath))

const SUPABASE_URL = envConfig.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = envConfig.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase credentials in .env')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function generateFirstPost() {
    console.log('🚀 Triggering First Post Generation...')

    const payload = {
        action: "generate_new",
        topic: "Lifetrek Medical Launch & Vision",
        targetAudience: "Medical Device OEMs, R&D Engineers, Procurement Managers",
        painPoint: "Finding reliable, scalable, and compliant medical device contract manufacturing partners.",
        desiredOutcome: "A seamless partnership with a manufacturer that offers massive capacity, ISO 13485 quality, and engineering expertise.",
        proofPoints: "New state-of-the-art facility, ISO 13485 certification, experienced engineering team.",
        ctaAction: "Partner with Lifetrek Medical for your next project.",
        format: "single-image",
        profileType: "company",
        // Prompting for specific visual elements
        additionalInstructions: "The image should be a 'Hero Photo' of a modern factory exterior or high-tech manufacturing floor. Headline should be bold and about 'Vision' or 'Arrival'."
    }

    const { data, error } = await supabase.functions.invoke('generate-linkedin-carousel', {
        body: payload,
    })

    if (error) {
        console.error('❌ Error triggering function:', error)
        if (error instanceof Error && 'context' in error) {
            try {
                const errContext = (error as any).context as Response;
                const errBody = await errContext.text();
                console.error('❌ Error Body:', errBody);
            } catch (e) {
                console.error('Failed to read error body', e);
            }
        }
        return
    }

    console.log('✅ Generation successful!')
    console.log('Response:', JSON.stringify(data, null, 2))

    // Optionally, we could save the result to the DB here if the function doesn't do it automatically.
    // The function implementation shows it returns the carousel object but relies on a separate step or the caller to save it?
    // Let's re-read the function code quickly.
    // The function returns generated content but doesn't seem to INSERT into the DB itself?
    // Wait, I need to check if the function inserts.
    // Reading `supabase/functions/generate-linkedin-carousel/index.ts` again...
    // It returns `new Response(JSON.stringify({ carousel: { ... } }))`.
    // It does NOT appear to insert into the `linkedin_carousels` table. 
    // The python script `create_intro_post.py` handles the insertion.

    // So I need to insert it here!
}

async function generateAndSave() {
    await generateFirstPostWithSave()
}

async function generateFirstPostWithSave() {
    console.log('🚀 Triggering First Post Generation...')

    const payload = {
        action: "generate_new",
        topic: "Lifetrek Medical Launch & Vision",
        targetAudience: "Medical Device OEMs, R&D Engineers",
        painPoint: "Need for scalable, high-quality manufacturing capacity",
        desiredOutcome: "Reliable partnership with massive capacity",
        proofPoints: "ISO 13485, New Facility, Expert Team",
        ctaAction: "Partner with us",
        format: "single-image",
        profileType: "company"
    }

    // 1. Generate Content via Edge Function
    console.log('1. Calling Edge Function...')
    const { data: generatedData, error: fnError } = await supabase.functions.invoke('generate-linkedin-carousel', {
        body: payload,
    })

    if (fnError) {
        console.error('❌ Error triggering function:', fnError)
        if (fnError instanceof Error && 'context' in fnError) {
            try {
                const errContext = (fnError as any).context as Response;
                const errBody = await errContext.text();
                console.error('❌ Error Body:', errBody);
            } catch (e) {
                console.error('Failed to read error body', e);
            }
        }
        return
    }

    if (!generatedData || !generatedData.carousel) {
        console.error('❌ No carousel data returned:', generatedData)
        return
    }

    const carousel = generatedData.carousel
    console.log('✅ Content Generated.')

    // 2. Save to Supabase
    console.log('2. Saving to Supabase...')

    const slideData = carousel.slides.map((s: any, index: number) => ({
        ...s,
        image_url: carousel.imageUrls[index] || ""
    }))

    // 1b. Fetch a valid User ID (needed for admin_user_id constraint)
    let userId: string;
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });

    if (userError) {
        console.error("❌ Error listing users:", userError);
        return;
    }

    if (!userData || userData.users.length === 0) {
        console.log("⚠️ No users found. Creating a dummy admin user...");
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: 'admin@lifetrek.ai',
            password: 'password123',
            email_confirm: true
        });
        if (createError || !newUser.user) {
            console.error("❌ Failed to create dummy user:", createError);
            return;
        }
        userId = newUser.user.id;
        console.log(`✅ Created dummy user: ${userId}`);
    } else {
        userId = userData.users[0].id;
        console.log(`ℹ️ Found existing user: ${userId}`);
    }

    const dbPayload = {
        admin_user_id: userId,
        topic: carousel.topic,
        target_audience: payload.targetAudience,
        pain_point: payload.painPoint,
        desired_outcome: payload.desiredOutcome,
        proof_points: payload.proofPoints,
        cta_action: payload.ctaAction,
        // status: 'draft', // Column missing in DB
        format: carousel.format,
        profile_type: carousel.profileType || 'company',
        slides: slideData,
        caption: carousel.caption,
        image_urls: carousel.imageUrls,
        generation_settings: { model: 'gpt-4o-mini', note: 'Generated via script' }
    }

    const { data: savedData, error: dbError } = await supabase
        .from('linkedin_carousels')
        .insert(dbPayload)
        .select()

    if (dbError) {
        console.error('❌ Error saving to DB:', dbError)
    } else {
        console.log(`✅ Post saved! ID: ${savedData[0].id}`)
    }
}

generateAndSave()
