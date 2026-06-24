export async function POST(request) {
  try {
    const body = await request.json();
    const { mode = "image", prompt = "", count = 1, aspectRatio = "1:1" } = body;

    // Simulate generation delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Map aspect ratio to dimensions
    const dimMap = {
      "1:1": { w: 800, h: 800 },
      "3:2": { w: 900, h: 600 },
      "2:3": { w: 600, h: 900 },
      "4:3": { w: 800, h: 600 },
      "3:4": { w: 600, h: 800 },
      "4:5": { w: 640, h: 800 },
      "5:4": { w: 800, h: 640 },
      "9:16": { w: 450, h: 800 },
      "16:9": { w: 800, h: 450 },
      "21:9": { w: 840, h: 360 },
      auto: { w: 800, h: 800 },
    };
    const dims = dimMap[aspectRatio] || dimMap["1:1"];

    const seed = Date.now();
    const results = Array.from({ length: count }, (_, i) => {
      const id = `gen-${seed}-${i}`;
      return {
        id,
        url: `https://picsum.photos/seed/${id}/${dims.w}/${dims.h}`,
        prompt,
        type: mode,
        aspectRatio,
        createdAt: new Date().toISOString(),
      };
    });

    return Response.json({ results });
  } catch (error) {
    return Response.json({ error: "Generation failed" }, { status: 500 });
  }
}
