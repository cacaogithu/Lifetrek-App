
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeContent() {
  console.log('🔍 Starting Content Analysis...');

  const { data: carousels, error } = await supabase
    .from('linkedin_carousels')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching carousels:', error);
    return;
  }

  console.log(`📊 Found ${carousels.length} carousels (including single-image posts).`);

  const report = {
    total: carousels.length,
    by_status: {},
    by_profile: {},
    data_quality_issues: [],
    first_post_analysis: null
  };

  carousels.forEach((c, index) => {
    // Status counts
    const status = c.status || 'unknown';
    report.by_status[status] = (report.by_status[status] || 0) + 1;

    // Profile counts
    const profile = c.profile_type || 'unknown';
    report.by_profile[profile] = (report.by_profile[profile] || 0) + 1;

    // Data Quality Checks
    if (!c.slides || (Array.isArray(c.slides) && c.slides.length === 0)) {
        report.data_quality_issues.push(`ID ${c.id}: Missing slides`);
    }
    if (!c.image_urls || (Array.isArray(c.image_urls) && c.image_urls.length === 0)) {
        report.data_quality_issues.push(`ID ${c.id}: Missing image_urls`);
    }

    // First Post Analysis (index 0)
    if (index === 0) {
        report.first_post_analysis = {
            id: c.id,
            topic: c.topic,
            created_at: c.created_at,
            slides_count: c.slides?.length,
            image_count: c.image_urls?.length,
            caption_preview: c.caption ? c.caption.substring(0, 100) + '...' : 'N/A',
            raw_data: c
        };
    }
  });

  // Output Report
  // Access execution folder one level up from scripts
  const executionDir = path.join(process.cwd(), 'execution');
  if (!fs.existsSync(executionDir)){
      fs.mkdirSync(executionDir);
  }
  
  const reportPath = path.join(executionDir, 'CONTENT_AUDIT.md');
  const mdContent = `# Content Audit Report

**Date:** ${new Date().toISOString()}
**Total Records:** ${report.total}

## 📊 Distribution
### By Status
\`\`\`json
${JSON.stringify(report.by_status, null, 2)}
\`\`\`

### By Profile Type
\`\`\`json
${JSON.stringify(report.by_profile, null, 2)}
\`\`\`

## 🚨 Data Quality Issues
${report.data_quality_issues.length > 0 ? report.data_quality_issues.map(i => `- ${i}`).join('\n') : "No major structure issues found."}

## 🔍 First Post Analysis
**ID:** \`${report.first_post_analysis?.id}\`
**Topic:** ${report.first_post_analysis?.topic}
**Created:** ${report.first_post_analysis?.created_at}

### Issues Detected (Automated)
- [${report.first_post_analysis?.image_count > 0 ? 'x' : ' '}] Has Images (Count: ${report.first_post_analysis?.image_count})
- [${report.first_post_analysis?.slides_count > 0 ? 'x' : ' '}] Has Slides (Count: ${report.first_post_analysis?.slides_count})

### Raw Record (First Post)
\`\`\`json
${JSON.stringify(report.first_post_analysis?.raw_data, null, 2)}
\`\`\`
`;

  fs.writeFileSync(reportPath, mdContent);
  console.log(`✅ Audit report saved to: ${reportPath}`);
}

analyzeContent().catch(console.error);
