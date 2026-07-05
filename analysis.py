"""
analysis.py
Market Basket Analysis — Apriori algorithm implementation + rule mining.
Computes support, confidence, and lift for all frequent itemsets.
"""

import pandas as pd
import numpy as np
from itertools import combinations
from collections import defaultdict


def load_transactions(csv_path="transactions.csv"):
    df = pd.read_csv(csv_path)
    grouped = df.groupby("transaction_id")["product"].apply(list)
    return grouped.reset_index(drop=True)


def get_frequent_itemsets(transactions, min_support=0.05):
    """Apriori algorithm — returns frequent 1,2,3-itemsets with support."""
    n = len(transactions)
    item_counts = defaultdict(int)

    for txn in transactions:
        for item in set(txn):
            item_counts[frozenset([item])] += 1

    freq = {k: v / n for k, v in item_counts.items() if v / n >= min_support}
    all_freq = dict(freq)
    current = list(freq.keys())

    for size in range(2, 4):
        candidates = set()
        for a, b in combinations(current, 2):
            union = a | b
            if len(union) == size:
                candidates.add(union)

        counts = defaultdict(int)
        for txn in transactions:
            txn_set = set(txn)
            for cand in candidates:
                if cand.issubset(txn_set):
                    counts[cand] += 1

        freq = {k: v / n for k, v in counts.items() if v / n >= min_support}
        all_freq.update(freq)
        current = list(freq.keys())
        if not current:
            break

    return all_freq, n


def generate_rules(freq_itemsets, n_transactions, min_confidence=0.4):
    """Generate association rules from frequent itemsets."""
    rules = []
    pairs = [(k, v) for k, v in freq_itemsets.items() if len(k) >= 2]

    for itemset, support in pairs:
        items = list(itemset)
        for r in range(1, len(items)):
            for antecedent in combinations(items, r):
                ant = frozenset(antecedent)
                con = itemset - ant
                if not con:
                    continue
                ant_support = freq_itemsets.get(ant, 0)
                if ant_support == 0:
                    continue
                confidence = support / ant_support
                con_support = freq_itemsets.get(con, 0)
                lift = confidence / con_support if con_support > 0 else 0

                if confidence >= min_confidence:
                    rules.append({
                        "antecedent": ", ".join(sorted(ant)),
                        "consequent": ", ".join(sorted(con)),
                        "support": round(support, 4),
                        "confidence": round(confidence, 4),
                        "lift": round(lift, 4),
                        "leverage": round(support - ant_support * con_support, 4),
                        "conviction": round((1 - con_support) / (1 - confidence), 4) if confidence < 1 else 999,
                    })

    rules_df = pd.DataFrame(rules).drop_duplicates()
    rules_df = rules_df.sort_values("lift", ascending=False).reset_index(drop=True)
    return rules_df


def compute_product_stats(df):
    """Per-product frequency and average basket size."""
    txn_count = df["transaction_id"].nunique()
    freq = df.groupby("product")["transaction_id"].nunique().reset_index()
    freq.columns = ["product", "txn_count"]
    freq["support"] = (freq["txn_count"] / txn_count).round(4)
    freq["revenue"] = df.groupby("product").apply(
        lambda x: (x["price"] * x["quantity"]).sum()
    ).values
    freq = freq.sort_values("support", ascending=False)
    return freq


def compute_cooccurrence(transactions, top_n=12):
    """Build co-occurrence matrix for top N products."""
    from collections import Counter
    all_items = [item for txn in transactions for item in txn]
    top_products = [item for item, _ in Counter(all_items).most_common(top_n)]

    n = len(transactions)
    matrix = pd.DataFrame(0, index=top_products, columns=top_products)
    for txn in transactions:
        txn_set = set(txn) & set(top_products)
        for a, b in combinations(txn_set, 2):
            matrix.loc[a, b] += 1
            matrix.loc[b, a] += 1
    for p in top_products:
        matrix.loc[p, p] = sum(1 for t in transactions if p in t)

    # Convert to percentages
    return (matrix / n * 100).round(1)


def run_full_analysis(csv_path="transactions.csv"):
    df = pd.read_csv(csv_path)
    transactions = df.groupby("transaction_id")["product"].apply(list).tolist()

    print(f"Transactions: {len(transactions)}")
    freq_itemsets, n = get_frequent_itemsets(transactions, min_support=0.05)
    print(f"Frequent itemsets: {len(freq_itemsets)}")

    rules = generate_rules(freq_itemsets, n, min_confidence=0.4)
    print(f"Association rules: {len(rules)}")

    product_stats = compute_product_stats(df)
    cooc = compute_cooccurrence(transactions)

    rules.to_csv("association_rules.csv", index=False)
    product_stats.to_csv("product_stats.csv", index=False)
    cooc.to_csv("cooccurrence_matrix.csv")

    print("Saved: association_rules.csv, product_stats.csv, cooccurrence_matrix.csv")
    print("\nTop 10 rules by lift:")
    print(rules[["antecedent", "consequent", "support", "confidence", "lift"]].head(10).to_string(index=False))
    return rules, product_stats, cooc, df


if __name__ == "__main__":
    run_full_analysis()
