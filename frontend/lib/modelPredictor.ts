/**
 * Pure TypeScript inference engine for Keras Dense models.
 * Runs feedforward propagation including Batch Normalization, ReLU, and Softmax activations.
 */

export interface ModelWeights {
  layers: Array<{
    name: string;
    type: "Dense" | "BatchNormalization";
    weights?: number[][];
    biases?: number[];
    gamma?: number[];
    beta?: number[];
    moving_mean?: number[];
    moving_variance?: number[];
    epsilon?: number;
  }>;
  labels: Record<string, string>;
}

export function predictHandSign(
  input: number[],
  model: ModelWeights
): { label: string; confidence: number } | null {
  if (!input || input.length !== 63 || !model || !model.layers) {
    return null;
  }

  let x = [...input];

  const denseLayers = model.layers.filter((l) => l.type === "Dense");
  const lastDenseName = denseLayers[denseLayers.length - 1]?.name;

  for (const layer of model.layers) {
    if (layer.type === "Dense") {
      if (!layer.biases || !layer.weights) continue;
      const units = layer.biases.length;
      const nextX = new Array(units).fill(0);

      for (let j = 0; j < units; j++) {
        let sum = layer.biases[j];
        for (let i = 0; i < x.length; i++) {
          sum += x[i] * layer.weights[i][j];
        }

        // Apply activation function
        if (layer.name === lastDenseName) {
          // Softmax input (raw score)
          nextX[j] = sum;
        } else {
          // ReLU activation
          nextX[j] = Math.max(0, sum);
        }
      }
      x = nextX;
    } else if (layer.type === "BatchNormalization") {
      if (
        !layer.moving_mean ||
        !layer.moving_variance ||
        !layer.gamma ||
        !layer.beta ||
        layer.epsilon === undefined
      ) {
        continue;
      }
      const nextX = new Array(x.length).fill(0);

      for (let i = 0; i < x.length; i++) {
        const mean = layer.moving_mean[i];
        const variance = layer.moving_variance[i];
        const gamma = layer.gamma[i];
        const beta = layer.beta[i];
        const eps = layer.epsilon;

        // Batch Normalization Inference Equation:
        // y = gamma * (x - mean) / sqrt(variance + eps) + beta
        nextX[i] = gamma * ((x[i] - mean) / Math.sqrt(variance + eps)) + beta;
      }
      x = nextX;
    }
  }

  // Softmax activation on final output layer
  const max = Math.max(...x);
  const exps = x.map((v) => Math.exp(v - max));
  const sumExps = exps.reduce((a, b) => a + b, 0);
  const probabilities = exps.map((v) => (sumExps > 0 ? v / sumExps : 0));

  // Find class with highest probability
  let maxIdx = 0;
  let maxProb = 0;
  for (let i = 0; i < probabilities.length; i++) {
    if (probabilities[i] > maxProb) {
      maxProb = probabilities[i];
      maxIdx = i;
    }
  }

  const label = model.labels[String(maxIdx)] || "Unknown";
  return { label, confidence: maxProb };
}
