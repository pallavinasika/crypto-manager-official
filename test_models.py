import os
import sys
import pandas as pd
import numpy as np
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

try:
    from ai_models.predictor import CryptoPricePredictor
    
    def generate_mock_data(days=365):
        """Internal helper to generate synthetic price data for testing."""
        dates = pd.date_range(end=pd.Timestamp.now(), periods=days)
        prices = np.cumsum(np.random.randn(days) * 2) + 500
        return pd.DataFrame({
            "date": dates.strftime("%Y-%m-%d"),
            "price": prices.astype(float),
            "total_volume": (np.random.rand(days) * 1e9).astype(float),
            "market_cap": (prices * 1e7).astype(float)
        })

    print("--- AI Model Performance Report ---")
    
    # Generate test data for evaluation
    coins = ["bitcoin", "ethereum", "solana"]
    datasets = {coin: generate_mock_data() for coin in coins}
    predictor = CryptoPricePredictor()
    
    for coin in coins:
        print(f"\nCoin: {coin.upper()}")
        df = datasets[coin]
        
        # Force a retrain for this demo so we can definitely see metrics
        try:
            print(f"  Training models for {coin} stats...")
            predictor.train_random_forest(df, coin)
            predictor.train_linear_regression(df, coin)
            
            result = predictor.ensemble_predict(df, coin, days_ahead=7)
            if "error" not in result:
                print(f"  Current Price: ${result['current_price']:,.2f}")
                print(f"  7-Day Forecast: ${result['predicted_price_final']:,.2f}")
                print(f"  Model Performance (R2 Score: 1.0 is Perfect):")
                
                metrics = result.get("model_metrics", {})
                for model_name, m in metrics.items():
                    if m:
                        print(f"    - {model_name:18}: R2={m['r2_score']:.4f}, MAE=${m['mae']:.2f}")
            else:
                print(f"  Error: {result['error']}")
        except Exception as e:
            print(f"  Failed to analyze {coin}: {e}")

except Exception as e:
    print(f"Script Error: {e}")
