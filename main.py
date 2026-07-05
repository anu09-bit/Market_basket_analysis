"""
main.py
Entry point — runs data generation, analysis, and dashboard in sequence.
"""

import os
import sys

def run():
    print("=" * 60)
    print("  MARKET BASKET ANALYSIS PIPELINE")
    print("=" * 60)

    print("\n[1/3] Generating transaction data...")
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    from generate_data import generate_transactions
    df = generate_transactions(150)
    df.to_csv("transactions.csv", index=False)
    print(f"      {df['transaction_id'].nunique()} transactions, {len(df)} line items saved.")

    print("\n[2/3] Running association rule mining...")
    from analysis import run_full_analysis
    rules, stats, cooc, txn_df = run_full_analysis()
    print(f"      {len(rules)} rules discovered.")

    print("\n[3/3] Building dashboard charts...")
    from dashboard import build_dashboard
    build_dashboard()

    print("\n" + "=" * 60)
    print("  Done! Output files:")
    files = [
        "transactions.csv",
        "association_rules.csv",
        "product_stats.csv",
        "cooccurrence_matrix.csv",
        "dashboard.png",
        "confidence_lift_chart.png",
    ]
    for f in files:
        size = os.path.getsize(f) if os.path.exists(f) else 0
        print(f"  • {f:<35} {size:>8,} bytes")
    print("=" * 60)

if __name__ == "__main__":
    run()
