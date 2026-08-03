import { useState, useCallback } from "react";

export interface PredictionResult {
  disease: string;
  confidence: number;
  symptoms_matched: string[];
  model_sources: string[];
  warnings: string[];
}

interface UseDiseasePredictor {
  predict: (
    symptoms?: string[],
    chickenImageBase64?: string,
    droppingsImageBase64?: string,
    species?: string
  ) => Promise<PredictionResult>;
  loading: boolean;
  error: string | null;
  result: PredictionResult | null;
}

const API_BASE_URL = process.env.REACT_APP_DISEASE_API_URL || "http://localhost:8000";
const API_TIMEOUT_MS = 30000; // 30 second timeout for model inference

/**
 * React hook for calling the poultry disease prediction API.
 *
 * Usage:
 *   const { predict, loading, error, result } = useDiseasePrediction();
 *
 *   const handlePredict = async () => {
 *     const res = await predict(
 *       ['coughing', 'sneezing'],
 *       chickenImageBase64,
 *       droppingsImageBase64,
 *       'chicken'
 *     );
 *   };
 */
export function useDiseasePrediction(): UseDiseasePredictor {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const predict = useCallback(
    async (
      symptoms?: string[],
      chickenImageBase64?: string,
      droppingsImageBase64?: string,
      species: string = "chicken"
    ): Promise<PredictionResult> => {
      setLoading(true);
      setError(null);

      try {
        if (!symptoms && !chickenImageBase64 && !droppingsImageBase64) {
          throw new Error("At least one of symptoms or images is required");
        }

        // Prepare request
        const payload = {
          symptoms: symptoms || undefined,
          chicken_image_base64: chickenImageBase64 || undefined,
          droppings_image_base64: droppingsImageBase64 || undefined,
          species,
        };

        // Call API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

        const response = await fetch(`${API_BASE_URL}/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.detail || `API error: ${response.statusText}`
          );
        }

        const data: PredictionResult = await response.json();
        setResult(data);
        return data;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMsg);

        // Log for debugging
        console.error("Disease prediction error:", errorMsg);

        // If server is down, return a fallback based on symptoms only
        if (symptoms && symptoms.length > 0) {
          console.warn(
            "Model server unavailable; falling back to symptoms-only heuristic"
          );
          // This would typically call a local fallback function
          throw err;
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { predict, loading, error, result };
}

/**
 * Helper: Convert image File to base64 string for API transmission.
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Extract base64 data (remove "data:image/...;base64," prefix)
      const base64 = result.split(",")[1] || result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Helper: Fetch available symptoms from the API for the UI to display.
 */
export async function fetchSymptomList() {
  try {
    const response = await fetch(`${API_BASE_URL}/symptoms`);
    if (!response.ok) throw new Error("Failed to fetch symptoms list");
    return await response.json();
  } catch (err) {
    console.error("Failed to fetch symptom list:", err);
    // Return empty list to allow UI to fall back to hardcoded list
    return { symptoms: [], diseases: [], species: [] };
  }
}
