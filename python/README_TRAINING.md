# SignSense Training Pipeline

## Dataset organization

The training script looks for label folders directly under the project-level dataset folder.
Each folder name becomes a class label, so the pipeline automatically discovers classes such as A, B, C, and so on.

Example structure:

```text
project/
├── dataset/
│   ├── A/
│   │   └── *.json
│   ├── B/
│   │   └── *.json
│   └── Z/
│       └── *.json
└── python/
    ├── train.py
    └── model/
```

Each JSON file must contain a landmark vector. The training pipeline expects a flat list of 63 numeric values, matching the MediaPipe hand landmark format used by the project.

## How to train

1. Install the Python dependencies:

```bash
pip install -r python/requirements.txt
```

2. Run the training script:

```bash
python python/train.py
```

3. The script will save the trained model and related artifacts in the python/model folder.

## How to retrain

Re-running the script will overwrite the existing model artifacts and retrain the classifier from the current dataset contents.

## Expected output files

The script saves:

- python/model/hand_sign_model.h5
- python/model/labels.json
- python/model/training_accuracy.png
- python/model/training_loss.png
- python/model/confusion_matrix.png

## Common errors

- No label folders found: verify that the dataset folder contains one subfolder per class.
- Invalid or corrupted JSON: the script skips those files and logs a warning.
- Wrong landmark size: each sample must contain exactly 63 values.
- Missing TensorFlow or scikit-learn: install the dependencies listed in python/requirements.txt.
