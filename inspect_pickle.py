import joblib

# Load the pickle file
artifact = joblib.load("model/nearby_deals_model.pkl")

# Check the type and contents
print("Type of artifact:", type(artifact))

if isinstance(artifact, dict):
    print("Keys in dict:", list(artifact.keys()))
    for key, value in artifact.items():
        print(f"{key}: {type(value)}")
        if hasattr(value, 'shape'):
            print(f"  Shape: {value.shape}")
else:
    print("Artifact is not a dict")
    print("Type:", type(artifact))
