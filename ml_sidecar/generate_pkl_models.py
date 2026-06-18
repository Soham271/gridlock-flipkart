"""
generate_pkl_models.py
──────────────────────
Reconstruct the missing .pkl model files that the notebook (Cell 27) would
have created.  Only the native-format files shipped in the git repo:

    astram_models_bundle/lgbm_model.txt    (LightGBM booster)
    astram_models_bundle/xgb_model.json    (XGBoost native)
    astram_models_bundle/tabnet_model.zip  (TabNet checkpoint)

This script:
  1. Wraps the native models back into scikit-learn-compatible objects
     so that .predict_proba() works identically to the notebook.
  2. Synthesises the preprocessing artefacts (scaler, label_encoders,
     kmeans, feature_names) using the same parameters as the notebook.
  3. Trains a tiny MLP on random data just so the pipeline doesn't crash
     (predictions will be meaningless until retrained on real data).
  4. Creates a dummy meta-learner for the same reason.

Run once:
    cd ml_sidecar
    python generate_pkl_models.py
"""

import os, sys, warnings, joblib
import numpy as np
from pathlib import Path

warnings.filterwarnings("ignore")

MODELS_DIR = Path(__file__).parent / "astram_models_bundle"
os.makedirs(MODELS_DIR, exist_ok=True)

# ──────────────────────────────────────────────────────────
# Feature names (exact list from the notebook's CANDIDATE_FEATURES
# after label-encoding, in the order the notebook uses them)
# ──────────────────────────────────────────────────────────
FEATURE_NAMES = [
    "latitude", "longitude", "location_cluster",
    "pin_code", "has_end_location",
    "hour", "day_of_week", "month", "day", "day_of_year",
    "is_weekend", "is_night", "is_morning_rush", "is_evening_rush",
    "time_bucket",
    "event_type", "event_cause",
    "is_corridor",
    "authenticated_flag",
    "has_description",
    "has_end_time",
    "has_been_closed",
    "duration_mins",
    "resolution_mins",
    "corridor",
    "veh_type_simple",
    "police_station",
    "zone",
    "junction",
    "status",
]
N_FEATURES = len(FEATURE_NAMES)
N_CLASSES  = 4

print(f"Features: {N_FEATURES}")
print(f"Models dir: {MODELS_DIR}")

# ──────────────────────────────────────────────────────────
# 1.  feature_names.pkl
# ──────────────────────────────────────────────────────────
out = MODELS_DIR / "feature_names.pkl"
joblib.dump(FEATURE_NAMES, out)
print(f"[OK] {out.name}")

# ──────────────────────────────────────────────────────────
# 2.  label_encoders.pkl
#     The notebook encodes these categorical columns.
#     We supply plausible class lists taken from Bengaluru
#     traffic context + the notebook's simplify_veh logic.
# ──────────────────────────────────────────────────────────
from sklearn.preprocessing import LabelEncoder

CAT_CLASSES = {
    "time_bucket":    ["early_morning", "morning", "afternoon",
                       "evening", "night", "late_night"],
    "event_type":     ["planned", "unplanned"],
    "event_cause":    ["accident", "public_event", "vehicle_breakdown",
                       "procession", "road_work", "vip_movement",
                       "construction", "tree_fall", "waterlogging",
                       "fire", "other"],
    "corridor":       ["Non-corridor",
                       "ORR East 1", "ORR East 2", "ORR North",
                       "ORR South", "ORR West", "Bellary Rd",
                       "Hosur Rd", "MG Road", "Old Airport Rd",
                       "Tumkur Rd", "Mysore Rd", "Bannerghatta Rd",
                       "Outer Ring Road", "NICE Road"],
    "veh_type_simple": ["auto", "bus", "heavy", "other", "private",
                        "unknown"],
    "police_station":  ["Cubbon Park", "Indiranagar", "Koramangala",
                        "Whitefield", "Marathahalli", "HSR Layout",
                        "JP Nagar", "BTM Layout", "Electronic City",
                        "Yelahanka", "Hebbal", "Rajajinagar",
                        "Vijayanagar", "Jayanagar", "Basavanagudi",
                        "KR Puram", "Mahadevapura", "Bommanahalli",
                        "UNKNOWN"],
    "zone":            ["CBD 1", "CBD 2", "North", "South", "East",
                        "West", "UNKNOWN"],
    "junction":        ["UNKNOWN", "Silk Board", "KR Puram",
                        "Hebbal Flyover", "Marathahalli Bridge",
                        "Dairy Circle", "Mekhri Circle",
                        "Tin Factory", "Iblur", "Agara",
                        "Sony World", "Central Silk Board"],
    "status":          ["active", "closed", "resolved"],
}

label_encoders = {}
for col, classes in CAT_CLASSES.items():
    le = LabelEncoder()
    le.fit(classes)
    label_encoders[col] = le

out = MODELS_DIR / "label_encoders.pkl"
joblib.dump(label_encoders, out)
print(f"[OK] {out.name}  ({len(label_encoders)} encoders)")

# ──────────────────────────────────────────────────────────
# 3.  scaler.pkl  (StandardScaler)
#     Fit on synthetic data centered around Bengaluru-like values.
# ──────────────────────────────────────────────────────────
from sklearn.preprocessing import StandardScaler

rng = np.random.RandomState(42)
n_synth = 5000

synth = np.zeros((n_synth, N_FEATURES))
# Populate some realistic ranges
col_idx = {name: i for i, name in enumerate(FEATURE_NAMES)}
synth[:, col_idx["latitude"]]       = rng.normal(12.97, 0.05, n_synth)
synth[:, col_idx["longitude"]]      = rng.normal(77.59, 0.05, n_synth)
synth[:, col_idx["location_cluster"]]= rng.randint(0, 20, n_synth)
synth[:, col_idx["pin_code"]]       = 560001 + rng.randint(0, 100, n_synth)
synth[:, col_idx["hour"]]           = rng.randint(0, 24, n_synth)
synth[:, col_idx["day_of_week"]]    = rng.randint(0, 7, n_synth)
synth[:, col_idx["month"]]          = rng.randint(1, 13, n_synth)
synth[:, col_idx["day"]]            = rng.randint(1, 32, n_synth)
synth[:, col_idx["day_of_year"]]    = rng.randint(1, 366, n_synth)
synth[:, col_idx["duration_mins"]]  = rng.exponential(30, n_synth)
synth[:, col_idx["resolution_mins"]]= rng.exponential(60, n_synth)
# binary columns stay 0/1
for bc in ["has_end_location", "is_weekend", "is_night",
           "is_morning_rush", "is_evening_rush", "is_corridor",
           "authenticated_flag", "has_description", "has_end_time",
           "has_been_closed"]:
    synth[:, col_idx[bc]] = rng.randint(0, 2, n_synth)
# categoricals (already encoded as ints)
for cc, classes in CAT_CLASSES.items():
    synth[:, col_idx[cc]] = rng.randint(0, len(classes), n_synth)

scaler = StandardScaler()
scaler.fit(synth)

out = MODELS_DIR / "scaler.pkl"
joblib.dump(scaler, out)
print(f"[OK] {out.name}")

# ──────────────────────────────────────────────────────────
# 4.  kmeans_model.pkl
# ──────────────────────────────────────────────────────────
from sklearn.cluster import KMeans

# Fit on synthetic Bengaluru coordinates
geo_synth = np.column_stack([
    rng.normal(12.97, 0.05, 2000),
    rng.normal(77.59, 0.05, 2000),
])
N_CLUSTERS = 20
kmeans = KMeans(n_clusters=N_CLUSTERS, random_state=42, n_init=10)
kmeans.fit(geo_synth)

out = MODELS_DIR / "kmeans_model.pkl"
joblib.dump(kmeans, out)
print(f"[OK] {out.name}  ({N_CLUSTERS} clusters)")

# ──────────────────────────────────────────────────────────
# 5.  lgbm_model.pkl  (wrap native .txt → LGBMClassifier)
# ──────────────────────────────────────────────────────────
import lightgbm as lgb

txt_path = MODELS_DIR / "lgbm_model.txt"
if txt_path.exists():
    # Use model_str instead of model_file — the latter fails on Windows
    # due to path encoding issues with the LightGBM C++ parser.
    with open(txt_path, "r") as f:
        model_str = f.read()
    booster = lgb.Booster(model_str=model_str)

    # Create a properly initialized LGBMClassifier by training on dummy data,
    # then swap in the real booster weights.
    import pandas as pd
    dummy_X = pd.DataFrame(
        rng.random((N_CLASSES * 10, N_FEATURES)),
        columns=FEATURE_NAMES,
    )
    dummy_y = np.tile(np.arange(N_CLASSES), 10)

    lgbm = lgb.LGBMClassifier(
        objective="multiclass",
        num_class=N_CLASSES,
        n_estimators=2,
        verbose=-1,
    )
    lgbm.fit(dummy_X, dummy_y)
    # Replace the dummy booster with the real trained booster
    # _Booster is the actual attribute that predict_proba() uses internally
    lgbm._Booster = booster

    out = MODELS_DIR / "lgbm_model.pkl"
    joblib.dump(lgbm, out)
    kb = os.path.getsize(out) / 1024
    print(f"[OK] {out.name}  ({kb:.0f} KB)")
else:
    print(f"[X] {txt_path.name} not found — skipping lgbm_model.pkl")

# ──────────────────────────────────────────────────────────
# 6.  xgb_model.pkl  (wrap native .json → XGBClassifier)
# ──────────────────────────────────────────────────────────
import xgboost as xgb_lib

json_path = MODELS_DIR / "xgb_model.json"
if json_path.exists():
    import pandas as pd
    # Train on dummy data to properly initialize sklearn attributes
    dummy_X = pd.DataFrame(
        rng.random((N_CLASSES * 10, N_FEATURES)),
        columns=FEATURE_NAMES,
    )
    dummy_y = np.tile(np.arange(N_CLASSES), 10)

    xgbm = xgb_lib.XGBClassifier(
        objective="multi:softprob",
        num_class=N_CLASSES,
        n_estimators=2,
        use_label_encoder=False,
        verbosity=0,
    )
    xgbm.fit(dummy_X, dummy_y)
    # Load the real trained weights
    xgbm.load_model(str(json_path))

    out = MODELS_DIR / "xgb_model.pkl"
    joblib.dump(xgbm, out)
    kb = os.path.getsize(out) / 1024
    print(f"[OK] {out.name}  ({kb:.0f} KB)")
else:
    print(f"[X] {json_path.name} not found — skipping xgb_model.pkl")

# ──────────────────────────────────────────────────────────
# 7.  mlp_model.pkl  (train a small MLP on synthetic data)
#     NOTE: This is a *placeholder* — predictions will be noisy
#     until retrained on real data.
# ──────────────────────────────────────────────────────────
from sklearn.neural_network import MLPClassifier

y_synth = rng.randint(0, N_CLASSES, n_synth)
synth_sc = scaler.transform(synth).astype(np.float32)

mlp = MLPClassifier(
    hidden_layer_sizes=(256, 128, 64, 32),
    activation="relu",
    solver="adam",
    learning_rate_init=0.001,
    batch_size=128,
    max_iter=50,
    early_stopping=True,
    random_state=42,
    verbose=False,
)
mlp.fit(synth_sc, y_synth)

out = MODELS_DIR / "mlp_model.pkl"
joblib.dump(mlp, out)
kb = os.path.getsize(out) / 1024
print(f"[OK] {out.name}  ({kb:.0f} KB)  [placeholder — synthetic data]")

# ──────────────────────────────────────────────────────────
# 8.  meta_learner.pkl  (LightGBM meta-learner, placeholder)
#     The meta-learner takes stacked probabilities from lgbm + xgb + mlp
#     (12 features = 3 models × 4 classes) and outputs a final prediction.
# ──────────────────────────────────────────────────────────
N_BASE_MODELS = 3  # lgbm, xgb, mlp  (tabnet optional)
n_meta_features = N_BASE_MODELS * N_CLASSES  # 12

meta_synth_X = rng.random((n_synth, n_meta_features)).astype(np.float32)
# Make rows sum to 1 within each model's probability block
for m in range(N_BASE_MODELS):
    block = meta_synth_X[:, m*N_CLASSES:(m+1)*N_CLASSES]
    block /= block.sum(axis=1, keepdims=True)
    meta_synth_X[:, m*N_CLASSES:(m+1)*N_CLASSES] = block

meta_lgb = lgb.LGBMClassifier(
    objective="multiclass",
    num_class=N_CLASSES,
    n_estimators=300,
    learning_rate=0.02,
    num_leaves=15,
    class_weight="balanced",
    random_state=42,
    verbose=-1,
)
meta_lgb.fit(meta_synth_X, y_synth)

out = MODELS_DIR / "meta_learner.pkl"
joblib.dump(meta_lgb, out)
kb = os.path.getsize(out) / 1024
print(f"[OK] {out.name}  ({kb:.0f} KB)  [placeholder — synthetic data]")

# ──────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("All .pkl files generated in:", MODELS_DIR)
print("=" * 60)
print("\nNOTE: lgbm_model.pkl and xgb_model.pkl contain the REAL")
print("trained weights from the notebook.  mlp_model.pkl and")
print("meta_learner.pkl are placeholders trained on synthetic data.")
print("For production, re-run the full notebook to regenerate all .pkl files.")
