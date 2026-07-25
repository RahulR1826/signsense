#!/usr/bin/env python3
import os
import json
import numpy as np
from pathlib import Path
from tensorflow import keras

def export():
    root = Path(__file__).resolve().parent.parent
    model_path = root / "python" / "model" / "hand_sign_model.h5"
    labels_path = root / "python" / "model" / "labels.json"
    
    if not model_path.exists():
        print(f"Model file {model_path} not found. Please train the model first.")
        return
        
    model = keras.models.load_model(str(model_path))
    print("Model loaded successfully.")
    
    # We will export the layers
    exported_layers = []
    
    for i, layer in enumerate(model.layers):
        layer_type = type(layer).__name__
        print(f"Processing layer {i}: {layer.name} ({layer_type})")
        
        layer_data = {
            "name": layer.name,
            "type": layer_type
        }
        
        weights = layer.get_weights()
        if not weights:
            # Dropout etc. has no weights
            continue
            
        if "Dense" in layer_type:
            # Dense weights shape: (input_dim, units), bias shape: (units,)
            w = weights[0].tolist() # list of lists
            b = weights[1].tolist() # list
            layer_data["weights"] = w
            layer_data["biases"] = b
            exported_layers.append(layer_data)
            
        elif "BatchNormalization" in layer_type:
            # BatchNormalization weights: gamma, beta, moving_mean, moving_variance
            # Check length: can be 4
            gamma = weights[0].tolist()
            beta = weights[1].tolist()
            moving_mean = weights[2].tolist()
            moving_variance = weights[3].tolist()
            epsilon = float(layer.epsilon)
            
            layer_data["gamma"] = gamma
            layer_data["beta"] = beta
            layer_data["moving_mean"] = moving_mean
            layer_data["moving_variance"] = moving_variance
            layer_data["epsilon"] = epsilon
            exported_layers.append(layer_data)
            
    # Load labels mapping
    labels = {}
    if labels_path.exists():
        with open(labels_path, "r", encoding="utf-8") as f:
            labels = json.load(f)
            
    output_dir = root / "public" / "model"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    output_path = output_dir / "model_weights.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({
            "layers": exported_layers,
            "labels": labels
        }, f, indent=2)
        
    print(f"Model weights successfully exported to {output_path}")

if __name__ == "__main__":
    export()
