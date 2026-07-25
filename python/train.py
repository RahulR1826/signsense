#!/usr/bin/env python3
"""Train a hand-sign classifier from MediaPipe landmark JSON files.

This pipeline automatically discovers label folders under the project dataset
folder, loads every valid landmark sample, creates a feature matrix and label
vector, trains a TensorFlow/Keras classifier, evaluates it on a held-out test
set, and saves the trained model plus the label mapping used for inference.
"""

from __future__ import annotations

import json
import logging
import sys
from pathlib import Path
from typing import Any

import numpy as np

try:
    from sklearn.metrics import (
        accuracy_score,
        classification_report,
        confusion_matrix,
        f1_score,
        precision_score,
        recall_score,
    )
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import LabelEncoder
except ImportError as exc:  # pragma: no cover - import guard for runtime
    raise SystemExit(
        "scikit-learn is required. Install dependencies from python/requirements.txt"
    ) from exc

try:
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
except ImportError as exc:  # pragma: no cover - import guard for runtime
    raise SystemExit(
        "matplotlib is required. Install dependencies from python/requirements.txt"
    ) from exc

try:
    from tensorflow import keras
except ImportError as exc:  # pragma: no cover - import guard for runtime
    raise SystemExit(
        "TensorFlow is required. Install dependencies from python/requirements.txt"
    ) from exc


ROOT_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = ROOT_DIR / "dataset"
MODEL_DIR = Path(__file__).resolve().parent / "model"

logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
logger = logging.getLogger("signsense.training")


def discover_label_dirs(dataset_dir: Path) -> list[Path]:
    """Return sorted label directories under the dataset root."""
    label_dirs = [path for path in dataset_dir.iterdir() if path.is_dir()]
    if not label_dirs:
        raise FileNotFoundError(f"No label folders were found under {dataset_dir}")
    return sorted(label_dirs)


def print_progress_bar(index: int, total: int, prefix: str = "Loading") -> None:
    """Print a simple terminal progress bar."""
    bar_length = 30
    filled = int(round(bar_length * index / max(total, 1)))
    bar = "#" * filled + "-" * (bar_length - filled)
    sys.stdout.write(f"\r{prefix}: [{bar}] {index}/{total}")
    sys.stdout.flush()
    if index >= total:
        sys.stdout.write("\n")


def extract_landmarks(payload: dict[str, Any]) -> list[float] | None:
    """Extract landmark values from a JSON payload.

    The project stores landmarks as a flat list under the "data" field. The
    function also tolerates alternative field names so that minor schema shifts
    do not break the training pipeline.
    """
    for key in ("data", "landmarks", "features", "vector"):
        value = payload.get(key)
        if isinstance(value, list):
            flat_values = np.asarray(value, dtype=np.float32).reshape(-1)
            if flat_values.size > 0:
                return flat_values.tolist()
    return None


def load_dataset(dataset_dir: Path) -> tuple[np.ndarray, np.ndarray, list[str]]:
    """Load all valid landmark samples and labels from the dataset tree."""
    label_dirs = discover_label_dirs(dataset_dir)
    logger.info("Discovered %d label folder(s): %s", len(label_dirs), ", ".join(path.name for path in label_dirs))

    features: list[np.ndarray] = []
    labels: list[str] = []
    skipped_files = 0

    total_files = 0
    for label_dir in label_dirs:
        total_files += len(list(label_dir.glob("*.json")))

    processed_files = 0
    for label_dir in label_dirs:
        label_name = label_dir.name
        sample_files = sorted(label_dir.glob("*.json"))
        if not sample_files:
            logger.warning("Label folder '%s' does not contain any JSON samples; skipping it.", label_name)
            continue

        for sample_path in sample_files:
            processed_files += 1
            print_progress_bar(processed_files, total_files, prefix="Loading dataset")
            try:
                with sample_path.open("r", encoding="utf-8") as handle:
                    payload = json.load(handle)
            except (json.JSONDecodeError, OSError) as exc:
                logger.warning("Skipping corrupted file %s: %s", sample_path, exc)
                skipped_files += 1
                continue

            landmarks = extract_landmarks(payload)
            if landmarks is None:
                logger.warning("Skipping %s because no landmark values were found.", sample_path)
                skipped_files += 1
                continue

            landmark_vector = np.asarray(landmarks, dtype=np.float32).reshape(-1)
            if landmark_vector.size != 63:
                logger.warning(
                    "Skipping %s because landmark size %d does not match the expected 63 values.",
                    sample_path,
                    landmark_vector.size,
                )
                skipped_files += 1
                continue

            if not np.isfinite(landmark_vector).all():
                logger.warning("Skipping %s because it contains non-finite values.", sample_path)
                skipped_files += 1
                continue

            features.append(landmark_vector)
            labels.append(label_name)

    if not features:
        raise ValueError("No valid landmark samples were found. Please check the dataset format.")

    logger.info("Loaded %d valid sample(s) from %d file(s).", len(features), len(features) + skipped_files)
    if skipped_files:
        logger.warning("Skipped %d corrupted or invalid file(s).", skipped_files)

    X = np.vstack(features).astype(np.float32)
    y = np.asarray(labels, dtype=object)
    return X, y, [path.name for path in label_dirs]


def encode_labels(labels: np.ndarray) -> tuple[np.ndarray, LabelEncoder]:
    """Encode string labels with sklearn LabelEncoder and return encoded targets."""
    encoder = LabelEncoder()
    encoded = encoder.fit_transform(labels)
    return encoded, encoder


def save_label_mapping(encoder: LabelEncoder, output_path: Path) -> None:
    """Save the label order to JSON so inference code can reconstruct class names."""
    mapping = {str(index): label for index, label in enumerate(encoder.classes_.tolist())}
    with output_path.open("w", encoding="utf-8") as handle:
        json.dump(mapping, handle, indent=2)


def build_model(input_dim: int, num_classes: int) -> keras.Model:
    """Create a compact dense neural network for landmark classification."""
    model = keras.Sequential(
        [
            keras.layers.Input(shape=(input_dim,)),
            keras.layers.Dense(128, activation="relu"),
            keras.layers.BatchNormalization(),
            keras.layers.Dropout(0.3),
            keras.layers.Dense(64, activation="relu"),
            keras.layers.BatchNormalization(),
            keras.layers.Dropout(0.2),
            keras.layers.Dense(num_classes, activation="softmax"),
        ],
        name="hand_sign_classifier",
    )
    model.compile(
        optimizer="adam",
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def split_dataset(
    X: np.ndarray,
    y: np.ndarray,
) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Split data into train, validation, and test sets using sklearn."""
    stratify = y if len(np.unique(y)) > 1 and np.unique(y).size >= 3 else None
    X_train, X_temp, y_train, y_temp = train_test_split(
        X,
        y,
        test_size=0.30,
        random_state=42,
        stratify=stratify,
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp,
        y_temp,
        test_size=0.50,
        random_state=42,
        stratify=None if stratify is None else y_temp,
    )
    return X_train, X_val, X_test, y_train, y_val, y_test


def preprocess_features(
    X_train: np.ndarray,
    X_val: np.ndarray,
    X_test: np.ndarray,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Pass through the raw MediaPipe coordinates without extra scaling.

    MediaPipe landmarks are already normalized to [0.0, 1.0] by width/height.
    Keeping features raw guarantees compatibility with predictor.py,
    which performs predictions on raw landmark arrays directly.
    """
    logger.info("Preprocessing complete: using raw MediaPipe normalized landmarks directly.")
    return X_train.copy(), X_val.copy(), X_test.copy()


def plot_training_curves(history: Any, accuracy_output_path: Path, loss_output_path: Path) -> None:
    """Save separate accuracy and loss history plots."""
    accuracy_fig, ax_accuracy = plt.subplots(figsize=(6, 4))
    ax_accuracy.plot(history.history["accuracy"], label="Training accuracy")
    ax_accuracy.plot(history.history["val_accuracy"], label="Validation accuracy")
    ax_accuracy.set_title("Training and Validation Accuracy")
    ax_accuracy.set_xlabel("Epoch")
    ax_accuracy.set_ylabel("Accuracy")
    ax_accuracy.legend()
    accuracy_fig.tight_layout()
    accuracy_fig.savefig(accuracy_output_path, dpi=200)
    plt.close(accuracy_fig)

    loss_fig, ax_loss = plt.subplots(figsize=(6, 4))
    ax_loss.plot(history.history["loss"], label="Training loss")
    ax_loss.plot(history.history["val_loss"], label="Validation loss")
    ax_loss.set_title("Training and Validation Loss")
    ax_loss.set_xlabel("Epoch")
    ax_loss.set_ylabel("Loss")
    ax_loss.legend()
    loss_fig.tight_layout()
    loss_fig.savefig(loss_output_path, dpi=200)
    plt.close(loss_fig)


def plot_confusion_matrix(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    labels: list[str],
    output_path: Path,
) -> None:
    """Save a confusion matrix plot for evaluation."""
    class_indices = list(range(len(labels)))
    cm = confusion_matrix(y_true, y_pred, labels=class_indices)
    fig, ax = plt.subplots(figsize=(7, 6))
    im = ax.imshow(cm, interpolation="nearest", cmap="Blues")
    fig.colorbar(im, ax=ax)

    ax.set_title("Confusion Matrix")
    ax.set_xlabel("Predicted label")
    ax.set_ylabel("True label")
    ax.set_xticks(class_indices)
    ax.set_xticklabels(labels, rotation=45, ha="right")
    ax.set_yticks(class_indices)
    ax.set_yticklabels(labels)

    for row in range(cm.shape[0]):
        for col in range(cm.shape[1]):
            ax.text(col, row, cm[row, col], ha="center", va="center", color="black")

    fig.tight_layout()
    fig.savefig(output_path, dpi=200)
    plt.close(fig)


def train_model() -> None:
    """Execute the full training workflow."""
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    logger.info("Loading dataset from %s", DATASET_DIR)
    X, y, _available_labels = load_dataset(DATASET_DIR)

    if X.shape[0] < 6:
        raise ValueError("At least 6 samples are required to train a meaningful model.")

    logger.info("Encoding labels with LabelEncoder")
    encoded_y, encoder = encode_labels(y)
    save_label_mapping(encoder, MODEL_DIR / "labels.json")

    X_train, X_val, X_test, y_train, y_val, y_test = split_dataset(X, encoded_y)
    X_train_scaled, X_val_scaled, X_test_scaled = preprocess_features(X_train, X_val, X_test)

    num_classes = len(encoder.classes_)
    input_dim = X_train_scaled.shape[1]
    model = build_model(input_dim=input_dim, num_classes=num_classes)

    checkpoint_path = MODEL_DIR / "hand_sign_model.h5"
    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=12,
            restore_best_weights=True,
        ),
        keras.callbacks.ModelCheckpoint(
            str(checkpoint_path),
            monitor="val_loss",
            save_best_only=True,
            verbose=1,
        ),
    ]

    logger.info("Training classifier with %d classes and %d input features", num_classes, input_dim)
    history = model.fit(
        X_train_scaled,
        y_train,
        validation_data=(X_val_scaled, y_val),
        epochs=80,
        batch_size=32,
        callbacks=callbacks,
        verbose=1,
    )

    for epoch_idx, (train_loss, val_loss, train_acc, val_acc) in enumerate(
        zip(
            history.history["loss"],
            history.history["val_loss"],
            history.history["accuracy"],
            history.history["val_accuracy"],
        ),
        start=1,
    ):
        logger.info(
            "Epoch %d | Train Loss: %.4f | Val Loss: %.4f | Train Acc: %.4f | Val Acc: %.4f",
            epoch_idx,
            train_loss,
            val_loss,
            train_acc,
            val_acc,
        )

    test_loss, test_accuracy = model.evaluate(X_test_scaled, y_test, verbose=0)
    logger.info("Test Loss: %.4f", test_loss)
    logger.info("Test Accuracy: %.4f", test_accuracy)

    y_pred = np.argmax(model.predict(X_test_scaled, verbose=0), axis=1)
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    recall = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)

    logger.info("Test Accuracy: %.4f", accuracy)
    logger.info("Precision: %.4f", precision)
    logger.info("Recall: %.4f", recall)
    logger.info("F1 Score: %.4f", f1)
    logger.info("Classification Report:\n%s", classification_report(y_test, y_pred, target_names=encoder.classes_, digits=4))

    plot_training_curves(
        history,
        MODEL_DIR / "training_accuracy.png",
        MODEL_DIR / "training_loss.png",
    )
    plot_confusion_matrix(
        y_test,
        y_pred,
        encoder.classes_.tolist(),
        MODEL_DIR / "confusion_matrix.png",
    )

    logger.info("Training artifacts saved in %s", MODEL_DIR)


if __name__ == "__main__":
    train_model()
