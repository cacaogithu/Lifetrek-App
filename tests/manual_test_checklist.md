# Manual Test Checklist: LinkedIn Carousel Generator

## Core Functionality
- [ ] **Load Page**: Navigate to `/linkedin-carousel`. Verify page loads without errors.
- [ ] **Auth Check**: Ensure unauthorized users are redirected to `/admin/login`.
- [ ] **Generate Content (Single)**:
    1.  Enter Topic: "Test Topic".
    2.  Select Audience: "Quality Managers".
    3.  Enter Pain Point: "High defect rates".
    4.  Click "Generate Content Strategy".
    5.  Verify "Content generated!" toast appears.
    6.  Verify "Slides Content" panel on the left is populated.
    7.  Verify "Canvas" in the center shows the first slide.
- [ ] **Generate Content (Batch)**: *(If UI supports it, currently backend only)*.

## Design Editor
- [ ] **Slide Navigation**: Use Left/Right arrows to flip through slides.
- [ ] **Image Asset Usage**:
    1.  Click a slide with `type: hook`.
    2.  In "Design Assets" (Right Panel), click an image from the library.
    3.  Verify the slide background updates to the selected image.
- [ ] **Image Generation**: (Optional) Click "Generate" tab and "Regenerate Image". Verify new image loads.

## Persistence & Export
- [ ] **Save Project**: Click "Save Project". Refresh page. Go to "History" tab. Verify the project exists.
- [ ] **Load Project**: Click the saved project in History. Verify it loads back into the editor.
- [ ] **Export**:
    1.  Click "Export All".
    2.  Verify a ZIP file is downloaded.
    3.  Extract ZIP and verify it contains PNGs for each slide and a `caption.txt`.
