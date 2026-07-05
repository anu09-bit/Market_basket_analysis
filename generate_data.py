"""
generate_data.py
Generates synthetic retail transaction data for Market Basket Analysis.
Produces 100+ unique transactions with realistic purchasing patterns.
"""

import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

random.seed(42)
np.random.seed(42)

PRODUCTS = {
    "Bakery":     ["Bread", "Butter", "Croissant", "Bagel", "Muffin", "Baguette"],
    "Dairy":      ["Milk", "Cheese", "Yogurt", "Cream", "Eggs", "Butter"],
    "Beverages":  ["Coffee", "Tea", "Orange Juice", "Beer", "Wine", "Soda"],
    "Produce":    ["Avocado", "Banana", "Tomato", "Garlic", "Lemon", "Spinach"],
    "Meat":       ["Chicken", "Bacon", "Salmon", "Ground Beef", "Sausage"],
    "Pantry":     ["Pasta", "Tomato Sauce", "Olive Oil", "Rice", "Cereal", "Honey"],
    "Snacks":     ["Chips", "Salsa", "Granola", "Pretzels", "Popcorn", "Nuts"],
    "Condiments": ["Ketchup", "Mustard", "Mayonnaise", "Hot Sauce", "Soy Sauce"],
}

ALL_PRODUCTS = [p for cat in PRODUCTS.values() for p in cat]

# Define association patterns (realistic co-purchases)
PATTERNS = [
    (["Bread", "Butter"], 0.80),
    (["Pasta", "Tomato Sauce"], 0.78),
    (["Coffee", "Milk"], 0.75),
    (["Chips", "Salsa"], 0.72),
    (["Beer", "Chips"], 0.70),
    (["Yogurt", "Granola"], 0.74),
    (["Eggs", "Bacon"], 0.76),
    (["Wine", "Cheese"], 0.71),
    (["Avocado", "Lemon"], 0.65),
    (["Tea", "Honey"], 0.68),
    (["Cereal", "Milk"], 0.80),
    (["Chicken", "Garlic"], 0.69),
    (["Salmon", "Lemon"], 0.66),
    (["Pasta", "Olive Oil"], 0.60),
    (["Beer", "Pretzels"], 0.64),
    (["Bread", "Eggs"], 0.55),
    (["Coffee", "Croissant"], 0.67),
    (["Tomato", "Olive Oil"], 0.58),
    (["Ground Beef", "Tomato Sauce"], 0.62),
    (["Sausage", "Mustard"], 0.60),
]

def generate_basket():
    """Generate a realistic basket using pattern-based seeding."""
    basket = set()
    # Pick 1-3 patterns to anchor the basket
    n_patterns = random.choices([1, 2, 3], weights=[0.4, 0.4, 0.2])[0]
    chosen = random.sample(PATTERNS, min(n_patterns, len(PATTERNS)))
    for items, prob in chosen:
        if random.random() < prob:
            basket.update(items)
    # Add 0-4 random extra items
    n_extra = random.randint(0, 4)
    extras = random.sample(ALL_PRODUCTS, n_extra)
    basket.update(extras)
    # Ensure basket has at least 2 items
    while len(basket) < 2:
        basket.add(random.choice(ALL_PRODUCTS))
    return list(basket)

def generate_transactions(n=150):
    """Generate n transaction records."""
    records = []
    base_date = datetime(2024, 1, 1)
    customer_ids = [f"C{str(i).zfill(4)}" for i in range(1, 501)]

    for i in range(n):
        txn_id = f"T{str(i+1).zfill(4)}"
        customer = random.choice(customer_ids)
        date = base_date + timedelta(days=random.randint(0, 364))
        hour = random.choices(range(8, 22), weights=[2,3,4,5,6,8,8,7,6,5,4,3,3,2])[0]
        basket = generate_basket()
        total = round(sum(random.uniform(1.5, 12.0) for _ in basket), 2)
        for product in basket:
            # find category
            cat = next((c for c, prods in PRODUCTS.items() if product in prods), "Other")
            records.append({
                "transaction_id": txn_id,
                "customer_id": customer,
                "date": date.strftime("%Y-%m-%d"),
                "hour": hour,
                "product": product,
                "category": cat,
                "price": round(random.uniform(1.5, 12.0), 2),
                "quantity": random.choices([1, 2, 3], weights=[0.7, 0.2, 0.1])[0],
                "basket_total": total,
            })
    return pd.DataFrame(records)

if __name__ == "__main__":
    df = generate_transactions(150)
    df.to_csv("transactions.csv", index=False)
    n_txn = df["transaction_id"].nunique()
    print(f"Generated {len(df)} rows across {n_txn} transactions.")
    print(df.head())
