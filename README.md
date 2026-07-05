# Market_basket_analysis
# Market Basket Analysis

A complete Python pipeline for **Market Basket Analysis (MBA)** using a custom Apriori algorithm implementation. Generates synthetic retail transaction data, mines association rules, produces an 8-panel visualisation dashboard, and exports results to CSV and a Word report.

---

## Project Structure

```
market_basket_analysis/
├── main.py                          # Pipeline entry point (run this first)
├── generate_data.py                 # Synthetic transaction data generator
├── analysis.py                      # Apriori algorithm + rule mining
├── dashboard.py                     # 8-panel matplotlib dashboard
├── generate_report.js               # Word document report generator (Node.js)
│
├── transactions.csv                 # Generated: 150 transactions, 652 line items
├── association_rules.csv            # Generated: 29 association rules
├── product_stats.csv                # Generated: per-product support & revenue
├── cooccurrence_matrix.csv          # Generated: 10×10 co-occurrence matrix
│
├── dashboard.png                    # Generated: 8-panel dashboard image
├── confidence_lift_chart.png        # Generated: confidence vs lift bar chart
├── market_basket_analysis_report.docx  # Generated: full Word project report
│
└── README.md                        # This file
```

---

## Requirements

### Python

- Python 3.8+
- pandas
- numpy
- matplotlib
- seaborn

Install with:

```bash
pip install pandas numpy matplotlib seaborn
```

### Node.js (for Word report only)

- Node.js 16+
- docx package

Install with:

```bash
npm install -g docx
```

---

## Quick Start

### Step 1 — Run the full Python pipeline

```bash
python main.py
```

This runs all three stages in sequence:

1. **Data generation** — creates `transactions.csv` with 150 transactions
2. **Association rule mining** — runs Apriori and saves rules to CSV files
3. **Dashboard** — renders `dashboard.png` with 8 visualisations

### Step 2 — Generate the Word report (optional)

```bash
node generate_report.js
```

Produces `market_basket_analysis_report.docx` — a full project report with tables, KPI cards, and embedded dashboard image.

---

## Running individual scripts

You can also run each module independently:

```bash
# 1. Generate data only
python generate_data.py

# 2. Run analysis (requires transactions.csv)
python analysis.py

# 3. Build dashboard (requires CSV output files from analysis.py)
python dashboard.py
```

---

## Output Files

| File | Description |
|------|-------------|
| `transactions.csv` | Raw transaction data: 150 transactions, 652 rows, 9 columns |
| `association_rules.csv` | Mined rules with support, confidence, lift, leverage, conviction |
| `product_stats.csv` | Per-product transaction count, support %, and revenue |
| `cooccurrence_matrix.csv` | 10×10 product co-occurrence percentages |
| `dashboard.png` | 8-panel analysis dashboard (150 dpi) |
| `confidence_lift_chart.png` | Top-20 rules: confidence vs lift grouped bar chart |
| `market_basket_analysis_report.docx` | Full Word project report |

---

## Algorithm Details

### Apriori (custom implementation)

The `analysis.py` module implements Apriori from scratch without external MBA libraries:

1. **Frequent 1-itemsets** — count all individual items, keep those with support ≥ `min_support`
2. **Candidate generation** — combine frequent (k-1)-itemsets to form k-itemsets
3. **Pruning** — remove candidates where any subset is not frequent
4. **Rule generation** — for each frequent itemset of size ≥ 2, generate all possible antecedent/consequent splits and keep rules with confidence ≥ `min_confidence`

Default thresholds: `min_support = 0.05`, `min_confidence = 0.40`

### Key Metrics

| Metric | Formula | Meaning |
|--------|---------|---------|
| Support | freq(A∪B) / N | How often the pair appears |
| Confidence | freq(A∪B) / freq(A) | Probability B given A |
| Lift | Confidence / freq(B) | Strength vs random chance |
| Leverage | Support − freq(A)×freq(B) | Actual vs expected co-occurrence |
| Conviction | (1−freq(B)) / (1−Confidence) | Rule independence measure |

A **lift > 1** indicates a genuine positive association. Lift > 3 is considered strong.

---

## Dashboard Panels

The generated `dashboard.png` contains 8 panels:

1. **Top rules by lift** — horizontal bar chart of the 10 strongest rules
2. **Support vs Confidence scatter** — bubble size and colour encode lift
3. **Co-occurrence heatmap** — percentage co-purchase frequency matrix
4. **Product frequency** — support % for all products
5. **Revenue by category** — total revenue contribution per category
6. **Basket size distribution** — histogram with mean indicator
7. **Hourly transaction volume** — line chart of shopping patterns
8. **Confidence vs Lift bar** — grouped comparison for top 20 rules

---

## Customisation

### Change thresholds

In `analysis.py`, adjust:

```python
run_full_analysis(csv_path="transactions.csv")  # inside the function:
get_frequent_itemsets(transactions, min_support=0.05)   # lower = more rules
generate_rules(freq_itemsets, n, min_confidence=0.40)   # lower = more rules
```

### Use real data

Replace `transactions.csv` with your own data. The file needs at minimum these columns:

- `transaction_id` — unique transaction identifier
- `product` — product name

Then run `analysis.py` directly.

### Increase dataset size

In `main.py` or `generate_data.py`:

```python
df = generate_transactions(500)  # increase from 150 to any number
```

---

## Results Summary

From the 150-transaction dataset:

- **50** frequent itemsets discovered (support ≥ 5%)
- **29** association rules (confidence ≥ 40%)
- **Strongest rule**: Cheese → Wine (confidence 88.24%, lift 7.79×)
- **Highest lift**: Chicken ↔ Garlic (7.99×)
- **Average basket size**: 4.35 items
- **Total revenue**: $6,371.33

---

## License

MIT License. Free to use and adapt for educational and commercial purposes.
