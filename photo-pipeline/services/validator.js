const { HfInference } = require("@huggingface/inference");
require('dotenv').config();

// Initialize the Hugging Face Inference client with your token
const hf = new HfInference(process.env.HF_API_TOKEN);

// We'll use a popular and effective zero-shot classification model
const MODEL_NAME = "openai/clip-vit-large-patch14";

// Set a minimum confidence score for the validation to pass.
// This prevents weak matches. (e.g., 0.8 means 80% confidence)
const CONFIDENCE_THRESHOLD = 0.80;

/**
 * Validates if a photo matches the provided labels using a zero-shot ML model.
 * @param {Buffer} photoBuffer - The photo file content as a buffer.
 * @param {string} labels - Comma-separated string of labels (e.g., "cat,animal,pet").
 * @returns {Promise<boolean>} - True if the top-scoring label from the model is one of the
 *                               provided labels and meets the confidence threshold.
 */
async function validate(photoBuffer, labels) {
    console.log(`[ML Validator] Validating photo against labels: ${labels}`);

    if (!labels || labels.trim() === '') {
        console.error("[ML Validator] No labels provided for validation.");
        return false;
    }

    // The model expects an array of candidate labels.
    const candidateLabels = labels.split(',').map(label => label.trim());

    try {
        const response = await hf.zeroShotImageClassification({
            model: MODEL_NAME,
            inputs: {
                image: photoBuffer,
            },
            parameters: {
                candidate_labels: candidateLabels,
            },
        });

        console.log("[ML Validator] Model response:", response);

        // Check if the response is valid and has at least one result
        if (!response || response.length === 0) {
            console.error("[ML Validator] Received an empty or invalid response from the model.");
            return false;
        }

        // The response is an array of labels sorted by score, highest first.
        const topPrediction = response[0];

        // Check if the highest-scoring label is one of the labels the user provided
        // and if its score is above our confidence threshold.
        if (candidateLabels.includes(topPrediction.label) && topPrediction.score >= CONFIDENCE_THRESHOLD) {
            console.log(`[ML Validator] Validation PASSED. Top match: '${topPrediction.label}' with score ${topPrediction.score}.`);
            return true;
        } else {
            console.log(`[ML Validator] Validation FAILED. Top match '${topPrediction.label}' with score ${topPrediction.score} did not meet criteria.`);
            return false;
        }

    } catch (error) {
        console.error("[ML Validator] Error during Hugging Face API call:", error);
        // In case of an API error, we fail the validation to be safe.
        return false;
    }
}

module.exports = { validate };