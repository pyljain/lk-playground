"use server";

export interface LakeraResponse {
    payload: {
        start: number;
        end: number;
        text: string;
        detector_type: string;
        labels?: string[];
    }[],
    breakdown: {
        detector_type: string;
        detected: boolean;
        policy_id: string;
        detector_id: string;
    }[],
}

export async function makeLakeraAPICall(promptType: string, prompt: string) : Promise<LakeraResponse> {
    const result = await fetch("https://api.lakera.ai/v2/guard", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.LAKERA_GUARD_API_KEY}`
        },
        body: JSON.stringify({
            messages: [
                { role: promptType, content: prompt }
            ],
            payload: true,
            breakdown: true
        })
    })

    const resultStruct = ((await result.json()) as LakeraResponse)
    console.log(resultStruct);
    return resultStruct;
}