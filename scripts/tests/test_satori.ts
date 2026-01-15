import { Action } from "https://deno.land/x/grammy@v1.14.1/mod.ts";
import satori from "npm:satori@0.10.11";
import { Resvg } from "npm:@resvg/resvg-js@2.6.2";

// Dummy React-like element creator for Satori (since we don't have JSX transform set up in this raw script easily)
// We can use a simple object structure if we don't want to configure full JSX
function h(type: string, props: any, ...children: any[]) {
    return {
        type,
        props: {
            ...props,
            children: children.flat().map(child =>
                typeof child === "string" ? child : child
            )
        }
    };
}

async function run() {
    console.log("🎨 Loading Fonts...");
    // Fetch a font (Roboto) from unpkg (reliable raw access)
    const fontData = await fetch("https://unpkg.com/@fontsource/roboto@5.0.8/files/roboto-latin-400-normal.woff").then(res => res.arrayBuffer());
    const fontBoldData = await fetch("https://unpkg.com/@fontsource/roboto@5.0.8/files/roboto-latin-700-normal.woff").then(res => res.arrayBuffer());

    console.log(`✅ Loaded Font Regular: ${fontData.byteLength} bytes`);
    console.log(`✅ Loaded Font Bold: ${fontBoldData.byteLength} bytes`);

    console.log("🎨 Generating Satori SVG...");

    // Define the Markup (JSX-like structure)
    // We are simulating a "Hook Slide"
    const markup = {
        type: "div",
        props: {
            style: {
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "100%",
                backgroundImage: "url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80')", // Medical vague background
                backgroundSize: "cover",
                color: "white",
                fontFamily: "Roboto",
            },
            children: [
                // Overlay Gradient to make text pop
                {
                    type: "div",
                    props: {
                        style: {
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "linear-gradient(180deg, rgba(0,79,143,0.8) 0%, rgba(0,79,143,0.4) 100%)", // Corporate Blue Tint
                        }
                    }
                },
                // Content Container
                {
                    type: "div",
                    props: {
                        style: {
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "flex-start",
                            width: "100%",
                            height: "100%",
                            padding: "80px",
                            position: "relative", // Z-index above tint
                        },
                        children: [
                            // Headline
                            {
                                type: "h1",
                                props: {
                                    style: {
                                        fontSize: "80px",
                                        fontWeight: 700,
                                        marginBottom: "40px",
                                        lineHeight: "1.1",
                                        textShadow: "0 2px 10px rgba(0,0,0,0.3)"
                                    },
                                    children: "The New Standard in Medical Manufacturing"
                                }
                            },
                            // Subtext / Body
                            {
                                type: "p",
                                props: {
                                    style: {
                                        fontSize: "40px",
                                        fontWeight: 400,
                                        lineHeight: "1.4",
                                        opacity: 0.9,
                                        maxWidth: "80%"
                                    },
                                    children: "Precision engineering meets rapid scalability. Discover how we helped 50+ OEMs reduce time-to-market by 30% in 2025."
                                }
                            },
                            // Footer / Branding
                            {
                                type: "div",
                                props: {
                                    style: {
                                        position: "absolute",
                                        bottom: "60px",
                                        left: "80px",
                                        display: "flex",
                                        alignItems: "center",
                                        fontSize: "24px",
                                        opacity: 0.8
                                    },
                                    children: "LIFETREK MEDICAL | ISO 13485 CERTIFIED"
                                }
                            }
                        ]
                    }
                }
            ]
        }
    };

    const svg = await satori(
        markup,
        {
            width: 1080,
            height: 1080,
            fonts: [
                {
                    name: "Roboto",
                    data: fontData,
                    weight: 400,
                    style: "normal",
                },
                {
                    name: "Roboto",
                    data: fontBoldData,
                    weight: 700,
                    style: "normal",
                },
            ],
        }
    );

    console.log("🎨 Rendering PNG...");
    const resvg = new Resvg(svg, {
        fitTo: { mode: "width", value: 1080 },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    console.log("💾 Saving to satori_test_output.png...");
    await Deno.writeFile("satori_test_output.png", pngBuffer);
    console.log("✅ Done!");
}

run();
