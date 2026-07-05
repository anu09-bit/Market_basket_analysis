"""
dashboard.py
Market Basket Analysis — Static Dashboard
Generates a multi-panel PNG dashboard with 8 visualisations.
"""

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import matplotlib.gridspec as gridspec
import seaborn as sns
from collections import Counter

# ── Palette ─────────────────────────────────────────────────────────────────
BLUE   = "#2a78d6"
TEAL   = "#1baf7a"
AMBER  = "#eda100"
CORAL  = "#D85A30"
PURPLE = "#7F77DD"
GRAY   = "#888780"
COLORS = [BLUE, TEAL, AMBER, CORAL, PURPLE, GRAY, "#e24b4a", "#1d9e75"]

sns.set_theme(style="whitegrid", palette=COLORS)
plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "axes.spines.top": False,
    "axes.spines.right": False,
    "axes.titlesize": 11,
    "axes.titleweight": "bold",
    "axes.labelsize": 9,
    "xtick.labelsize": 8,
    "ytick.labelsize": 8,
    "figure.facecolor": "#fafaf9",
    "axes.facecolor": "#fafaf9",
})


def load_data():
    rules   = pd.read_csv("association_rules.csv")
    stats   = pd.read_csv("product_stats.csv")
    cooc    = pd.read_csv("cooccurrence_matrix.csv", index_col=0)
    txn_df  = pd.read_csv("transactions.csv")
    return rules, stats, cooc, txn_df


def plot_top_rules(ax, rules, n=10):
    top = rules.head(n).copy()
    labels = [f"{r.antecedent} → {r.consequent}" for _, r in top.iterrows()]
    colors = [BLUE if v < 2 else TEAL if v < 3 else AMBER for v in top["lift"]]
    bars = ax.barh(labels[::-1], top["lift"].values[::-1], color=colors[::-1], height=0.6)
    ax.axvline(1, color=GRAY, linewidth=0.8, linestyle="--", alpha=0.6)
    for bar, val in zip(bars, top["lift"].values[::-1]):
        ax.text(bar.get_width() + 0.03, bar.get_y() + bar.get_height()/2,
                f"{val:.2f}×", va="center", fontsize=7.5, color="#444")
    ax.set_xlabel("Lift")
    ax.set_title("Top association rules by lift")
    ax.set_xlim(0, top["lift"].max() * 1.18)


def plot_scatter(ax, rules):
    sc = ax.scatter(rules["support"], rules["confidence"],
                    c=rules["lift"], cmap="YlOrRd",
                    s=rules["lift"] * 18, alpha=0.75, edgecolors="white", linewidths=0.4)
    plt.colorbar(sc, ax=ax, label="Lift", shrink=0.85)
    ax.set_xlabel("Support")
    ax.set_ylabel("Confidence")
    ax.set_title("Support vs confidence (bubble = lift)")


def plot_heatmap(ax, cooc):
    top = cooc.iloc[:10, :10]
    mask = np.eye(len(top), dtype=bool)
    sns.heatmap(top, ax=ax, cmap="Blues", mask=mask, annot=True, fmt=".0f",
                linewidths=0.5, linecolor="white",
                annot_kws={"size": 7}, cbar_kws={"shrink": 0.8})
    ax.set_title("Product co-occurrence (% of transactions)")
    ax.tick_params(axis="x", rotation=45)
    ax.tick_params(axis="y", rotation=0)


def plot_product_freq(ax, stats, n=15):
    top = stats.head(n)
    bars = ax.bar(top["product"], top["support"] * 100, color=BLUE, width=0.6)
    ax.set_ylabel("Support (%)")
    ax.set_title("Product frequency (support %)")
    ax.tick_params(axis="x", rotation=45)
    for bar in bars:
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.3,
                f"{bar.get_height():.1f}%", ha="center", fontsize=6.5)


def plot_category_revenue(ax, txn_df):
    rev = txn_df.copy()
    rev["revenue"] = rev["price"] * rev["quantity"]
    cat_rev = rev.groupby("category")["revenue"].sum().sort_values(ascending=True)
    ax.barh(cat_rev.index, cat_rev.values, color=TEAL, height=0.55)
    ax.set_xlabel("Total Revenue ($)")
    ax.set_title("Revenue by product category")
    for i, v in enumerate(cat_rev.values):
        ax.text(v + 10, i, f"${v:,.0f}", va="center", fontsize=7.5)
    ax.set_xlim(0, cat_rev.max() * 1.2)


def plot_basket_size_dist(ax, txn_df):
    sizes = txn_df.groupby("transaction_id")["product"].nunique()
    ax.hist(sizes, bins=range(1, sizes.max() + 2), color=AMBER, edgecolor="white",
            linewidth=0.6, align="left", rwidth=0.75)
    ax.axvline(sizes.mean(), color=CORAL, linewidth=1.5, linestyle="--",
               label=f"Mean = {sizes.mean():.1f}")
    ax.set_xlabel("Basket size (# items)")
    ax.set_ylabel("Transactions")
    ax.set_title("Basket size distribution")
    ax.legend(fontsize=8)


def plot_hourly_transactions(ax, txn_df):
    hourly = txn_df.groupby("hour")["transaction_id"].nunique()
    ax.fill_between(hourly.index, hourly.values, alpha=0.25, color=PURPLE)
    ax.plot(hourly.index, hourly.values, color=PURPLE, linewidth=2, marker="o", markersize=4)
    ax.set_xlabel("Hour of day")
    ax.set_ylabel("# Transactions")
    ax.set_title("Transaction volume by hour")
    ax.set_xticks(range(8, 22))


def plot_confidence_lift(ax, rules):
    top = rules.head(20)
    x = np.arange(len(top))
    w = 0.38
    b1 = ax.bar(x - w/2, top["confidence"] * 100, width=w, color=BLUE, label="Confidence (%)")
    b2 = ax.bar(x + w/2, top["lift"] * 20, width=w, color=TEAL, label="Lift × 20")
    ax.set_xticks(x)
    labels = [f"{r.antecedent[:8]}→{r.consequent[:8]}" for _, r in top.iterrows()]
    ax.set_xticklabels(labels, rotation=55, ha="right", fontsize=6)
    ax.set_title("Confidence vs lift — top 20 rules")
    ax.legend(fontsize=8)


def build_dashboard():
    rules, stats, cooc, txn_df = load_data()

    fig = plt.figure(figsize=(20, 22), facecolor="#fafaf9")
    fig.suptitle("Market Basket Analysis — Dashboard",
                 fontsize=18, fontweight="bold", color="#1a1a19", y=0.98)

    gs = gridspec.GridSpec(4, 2, figure=fig, hspace=0.52, wspace=0.32,
                           left=0.07, right=0.96, top=0.95, bottom=0.04)

    ax1 = fig.add_subplot(gs[0, 0]); plot_top_rules(ax1, rules)
    ax2 = fig.add_subplot(gs[0, 1]); plot_scatter(ax2, rules)
    ax3 = fig.add_subplot(gs[1, :]); plot_heatmap(ax3, cooc)
    ax4 = fig.add_subplot(gs[2, 0]); plot_product_freq(ax4, stats)
    ax5 = fig.add_subplot(gs[2, 1]); plot_category_revenue(ax5, txn_df)
    ax6 = fig.add_subplot(gs[3, 0]); plot_basket_size_dist(ax6, txn_df)
    ax7 = fig.add_subplot(gs[3, 1]); plot_hourly_transactions(ax7, txn_df)

    out = "dashboard.png"
    fig.savefig(out, dpi=150, bbox_inches="tight", facecolor="#fafaf9")
    plt.close(fig)
    print(f"Saved dashboard → {out}")

    # Second figure: confidence/lift grouped bar
    fig2, ax = plt.subplots(figsize=(14, 5), facecolor="#fafaf9")
    plot_confidence_lift(ax, rules)
    fig2.tight_layout()
    fig2.savefig("confidence_lift_chart.png", dpi=150, bbox_inches="tight", facecolor="#fafaf9")
    plt.close(fig2)
    print("Saved confidence_lift_chart.png")


if __name__ == "__main__":
    build_dashboard()
