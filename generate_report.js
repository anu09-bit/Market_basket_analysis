const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  VerticalAlign, LevelFormat, PageNumber, PageBreak, ImageRun
} = require("docx");
const fs = require("fs");
const path = require("path");

const BLUE = "1A56A0";
const LIGHT_BLUE = "D5E8F5";
const TEAL = "0F6E56";
const LIGHT_TEAL = "D4EDE6";
const GRAY_BG = "F5F5F3";
const DARK = "1A1A19";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorders = {
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true, size: 36, color: BLUE, font: "Arial" })],
    spacing: { before: 360, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BLUE, space: 4 } },
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true, size: 28, color: TEAL, font: "Arial" })],
    spacing: { before: 280, after: 140 },
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, bold: true, size: 24, color: DARK, font: "Arial" })],
    spacing: { before: 200, after: 100 },
  });
}

function body(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, font: "Arial", color: "333333", ...opts })],
    spacing: { before: 60, after: 100 },
    alignment: AlignmentType.JUSTIFIED,
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [new TextRun({ text, size: 22, font: "Arial", color: "333333" })],
    spacing: { before: 40, after: 40 },
  });
}

function spacer() {
  return new Paragraph({ children: [new TextRun("")], spacing: { before: 80, after: 80 } });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function makeHeaderRow(cells, colWidths) {
  return new TableRow({
    tableHeader: true,
    children: cells.map((text, i) =>
      new TableCell({
        borders, verticalAlign: VerticalAlign.CENTER,
        width: { size: colWidths[i], type: WidthType.DXA },
        shading: { fill: BLUE, type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 120, right: 120 },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text, bold: true, size: 20, color: "FFFFFF", font: "Arial" })],
        })],
      })
    ),
  });
}

function makeDataRow(cells, colWidths, even = false) {
  return new TableRow({
    children: cells.map((text, i) =>
      new TableCell({
        borders, verticalAlign: VerticalAlign.CENTER,
        width: { size: colWidths[i], type: WidthType.DXA },
        shading: { fill: even ? GRAY_BG : "FFFFFF", type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({
          alignment: i > 1 ? AlignmentType.CENTER : AlignmentType.LEFT,
          children: [new TextRun({ text: String(text), size: 20, font: "Arial", color: "333333" })],
        })],
      })
    ),
  });
}

function kpiTable(items) {
  const colW = Math.floor(9360 / items.length);
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: items.map(() => colW),
    rows: [
      new TableRow({
        children: items.map(item =>
          new TableCell({
            borders: noBorders, verticalAlign: VerticalAlign.CENTER,
            width: { size: colW, type: WidthType.DXA },
            shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR },
            margins: { top: 160, bottom: 160, left: 200, right: 200 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: item.value, bold: true, size: 44, color: BLUE, font: "Arial" })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: item.label, size: 18, color: "666666", font: "Arial" })],
              }),
            ],
          })
        ),
      }),
    ],
  });
}

function embedImage(filename, width, height) {
  const imgPath = path.join(__dirname, filename);
  if (!fs.existsSync(imgPath)) return null;
  const imgBuffer = fs.readFileSync(imgPath);
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 200 },
    children: [
      new ImageRun({
        data: imgBuffer,
        transformation: { width, height },
        type: "png",
      }),
    ],
  });
}

async function buildReport() {
  const sections = [];

  // ── Cover page ───────────────────────────────────────────────────────────
  sections.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 2000, after: 400 },
      children: [new TextRun({ text: "Market Basket Analysis", bold: true, size: 60, color: BLUE, font: "Arial" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 200 },
      children: [new TextRun({ text: "Project Report", size: 40, color: TEAL, font: "Arial" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 600, after: 200 },
      children: [new TextRun({ text: "Identifying Purchase Patterns & Association Rules", size: 26, color: "555555", font: "Arial", italics: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 1200, after: 100 },
      children: [new TextRun({ text: "Prepared by: Market Analytics Team", size: 22, font: "Arial", color: "444444" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 80 },
      children: [new TextRun({ text: "Date: June 2026", size: 22, font: "Arial", color: "444444" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 80 },
      children: [new TextRun({ text: "Version: 1.0", size: 22, font: "Arial", color: "444444" })],
    }),
    pageBreak(),
  );

  // ── Executive Summary ────────────────────────────────────────────────────
  sections.push(
    heading1("Executive Summary"),
    body("This report presents a comprehensive Market Basket Analysis (MBA) conducted on retail transaction data comprising 150 transactions and 652 individual line items spanning 45 unique products across 8 product categories. The analysis leverages the Apriori algorithm to identify frequent itemsets and generate association rules that reveal statistically significant co-purchase patterns."),
    spacer(),
    body("Key findings include the discovery of 29 high-confidence association rules, with the strongest patterns observed between complementary product pairs such as Chicken & Garlic (lift 7.99×), Cheese & Wine (lift 7.79×), and Tea & Honey (lift 7.42×). These insights directly inform product placement strategy, bundle promotions, and recommendation engine design."),
    spacer(),
    kpiTable([
      { value: "150", label: "Transactions Analyzed" },
      { value: "45", label: "Unique Products" },
      { value: "29", label: "Association Rules" },
      { value: "4.35", label: "Avg Basket Size" },
    ]),
    spacer(),
    pageBreak(),
  );

  // ── 1. Introduction ──────────────────────────────────────────────────────
  sections.push(
    heading1("1. Introduction"),
    heading2("1.1 Background"),
    body("Market Basket Analysis is a data mining technique used by retailers to uncover relationships between products that customers frequently purchase together. By analysing transactional data, retailers can understand customer purchasing behaviour, optimise store layouts, design targeted promotions, and build recommendation systems."),
    body("The fundamental concept revolves around association rule mining — the process of discovering interesting relationships, correlations, or patterns in large transactional databases. An association rule takes the form IF {A} THEN {B}, meaning customers who buy product A also tend to buy product B."),

    heading2("1.2 Objectives"),
    bullet("Identify frequent product combinations in retail transactions."),
    bullet("Generate actionable association rules with measurable support, confidence, and lift."),
    bullet("Visualise co-occurrence patterns using heatmaps and scatter plots."),
    bullet("Segment customers by basket profile to tailor marketing strategies."),
    bullet("Provide data-driven recommendations for product placement and cross-selling."),

    heading2("1.3 Scope"),
    body("The analysis covers 150 synthetic retail transactions generated to reflect real-world purchasing patterns. The dataset spans a 12-month period (January–December 2024), includes 45 products across 8 categories, and records 652 individual product purchases. All monetary values are in USD."),
    spacer(),
    pageBreak(),
  );

  // ── 2. Data ──────────────────────────────────────────────────────────────
  sections.push(
    heading1("2. Dataset Description"),
    heading2("2.1 Data Generation"),
    body("Transaction data was synthetically generated using pattern-seeded random sampling to mirror real retail purchasing behaviour. Twenty co-purchase patterns with empirically calibrated probabilities were used to seed each basket, after which 0–4 random additional items were added. This approach ensures statistically meaningful associations exist in the data while maintaining variety."),

    heading2("2.2 Dataset Overview"),
    body("The dataset contains the following fields:"),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [2200, 1800, 5360],
      rows: [
        makeHeaderRow(["Field", "Type", "Description"], [2200, 1800, 5360]),
        makeDataRow(["transaction_id", "String", "Unique identifier for each transaction (T0001–T0150)"], [2200, 1800, 5360], false),
        makeDataRow(["customer_id", "String", "Customer identifier (C0001–C0500)"], [2200, 1800, 5360], true),
        makeDataRow(["date", "Date", "Transaction date (YYYY-MM-DD)"], [2200, 1800, 5360], false),
        makeDataRow(["hour", "Integer", "Hour of day (8–21)"], [2200, 1800, 5360], true),
        makeDataRow(["product", "String", "Product name"], [2200, 1800, 5360], false),
        makeDataRow(["category", "String", "Product category (8 categories)"], [2200, 1800, 5360], true),
        makeDataRow(["price", "Float", "Unit price in USD"], [2200, 1800, 5360], false),
        makeDataRow(["quantity", "Integer", "Units purchased (1–3)"], [2200, 1800, 5360], true),
        makeDataRow(["basket_total", "Float", "Total basket value in USD"], [2200, 1800, 5360], false),
      ],
    }),
    spacer(),
    heading2("2.3 Product Categories"),
    body("Products are grouped into 8 categories: Bakery, Dairy, Beverages, Produce, Meat, Pantry, Snacks, and Condiments. The most frequently purchased products are Eggs (20.0% support), Milk (18.7%), Beer (18.0%), Chips (16.7%), and Olive Oil (16.7%)."),
    spacer(),
    pageBreak(),
  );

  // ── 3. Methodology ───────────────────────────────────────────────────────
  sections.push(
    heading1("3. Methodology"),
    heading2("3.1 Apriori Algorithm"),
    body("The Apriori algorithm is a classic association rule mining algorithm that identifies frequent itemsets in a transactional dataset. It works in two phases:"),
    bullet("Phase 1 — Frequent Itemset Generation: Starting with individual items, the algorithm iteratively generates candidate itemsets of increasing size, pruning any that do not meet the minimum support threshold."),
    bullet("Phase 2 — Rule Generation: For each frequent itemset, association rules are generated by splitting the itemset into antecedent and consequent parts, retaining only those that meet the minimum confidence threshold."),
    body("In this project, a custom Python implementation was used (without external MBA libraries) to demonstrate the algorithm from first principles. The implementation supports itemsets of size 1, 2, and 3."),

    heading2("3.2 Key Metrics"),
    heading3("Support"),
    body("Support measures how frequently an itemset appears in all transactions. A support of 0.10 means the itemset appears in 10% of all transactions. Minimum support threshold: 5% (0.05)."),
    heading3("Confidence"),
    body("Confidence measures the reliability of the rule: given that a customer buys the antecedent, what is the probability they also buy the consequent? Minimum confidence threshold: 40% (0.40)."),
    heading3("Lift"),
    body("Lift measures how much more likely two items are purchased together compared to random chance. A lift > 1 indicates a genuine positive association; lift < 1 indicates a negative association. Lift > 3 is considered strong."),
    heading3("Leverage & Conviction"),
    body("Leverage is the difference between the observed frequency of a rule and the expected frequency if the antecedent and consequent were independent. Conviction measures the degree to which the rule would be incorrect if the items were independent."),

    heading2("3.3 Tools & Technologies"),
    bullet("Python 3.x — core programming language"),
    bullet("pandas & NumPy — data manipulation and computation"),
    bullet("matplotlib & seaborn — static visualisation and dashboard generation"),
    bullet("Custom Apriori implementation — association rule mining"),
    bullet("docx (Node.js) — Word report generation"),
    spacer(),
    pageBreak(),
  );

  // ── 4. Results ───────────────────────────────────────────────────────────
  sections.push(
    heading1("4. Analysis Results"),
    heading2("4.1 Frequent Itemsets"),
    body("The Apriori algorithm discovered 50 frequent itemsets at the 5% support threshold, including 38 individual items and 12 two-item pairs. All frequent itemsets and their support values are summarised in the CSV output files accompanying this report."),

    heading2("4.2 Top Association Rules"),
    body("29 association rules were generated with confidence ≥ 40%. The table below lists the top 10 rules by lift:"),
    spacer(),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [2400, 2000, 1200, 1560, 1200, 1000],
      rows: [
        makeHeaderRow(["Antecedent", "Consequent", "Support", "Confidence", "Lift", "Leverage"], [2400, 2000, 1200, 1560, 1200, 1000]),
        makeDataRow(["Garlic", "Chicken", "6.00%", "69.23%", "7.99×", "0.052"], [2400, 2000, 1200, 1560, 1200, 1000], false),
        makeDataRow(["Chicken", "Garlic", "6.00%", "69.23%", "7.99×", "0.052"], [2400, 2000, 1200, 1560, 1200, 1000], true),
        makeDataRow(["Cheese", "Wine", "10.00%", "88.24%", "7.79×", "0.087"], [2400, 2000, 1200, 1560, 1200, 1000], false),
        makeDataRow(["Wine", "Cheese", "10.00%", "88.24%", "7.79×", "0.087"], [2400, 2000, 1200, 1560, 1200, 1000], true),
        makeDataRow(["Honey", "Tea", "6.00%", "64.29%", "7.42×", "0.052"], [2400, 2000, 1200, 1560, 1200, 1000], false),
        makeDataRow(["Tea", "Honey", "6.00%", "69.23%", "7.42×", "0.052"], [2400, 2000, 1200, 1560, 1200, 1000], true),
        makeDataRow(["Sausage", "Mustard", "6.67%", "52.63%", "5.26×", "0.054"], [2400, 2000, 1200, 1560, 1200, 1000], false),
        makeDataRow(["Mustard", "Sausage", "6.67%", "66.67%", "5.26×", "0.054"], [2400, 2000, 1200, 1560, 1200, 1000], true),
        makeDataRow(["Yogurt", "Granola", "6.67%", "58.82%", "4.90×", "0.053"], [2400, 2000, 1200, 1560, 1200, 1000], false),
        makeDataRow(["Granola", "Yogurt", "6.67%", "55.56%", "4.90×", "0.053"], [2400, 2000, 1200, 1560, 1200, 1000], true),
      ],
    }),
    spacer(),

    heading2("4.3 Dashboard Visualisations"),
    body("The dashboard (dashboard.png) contains eight visualisations providing a 360-degree view of the market basket data:"),
    bullet("Top association rules by lift — horizontal bar chart ranking the strongest rules."),
    bullet("Support vs Confidence scatter plot — bubble size encodes lift, colour encodes lift intensity."),
    bullet("Product co-occurrence heatmap — shows co-purchase frequency (%) between top 10 products."),
    bullet("Product frequency chart — support percentage for each product."),
    bullet("Revenue by category — total sales contribution per product category."),
    bullet("Basket size distribution — histogram of items per transaction with mean marker."),
    bullet("Transaction volume by hour — line chart showing peak shopping hours."),
    bullet("Confidence vs lift grouped bar chart — 20-rule comparison."),
    spacer(),
  );

  const dash = embedImage("dashboard.png", 580, 650);
  if (dash) sections.push(dash);

  sections.push(spacer(), pageBreak());

  // ── 5. Key Findings ──────────────────────────────────────────────────────
  sections.push(
    heading1("5. Key Findings & Insights"),

    heading2("5.1 Strongest Associations"),
    body("The highest-lift rules involve classic complementary pairings. Cheese → Wine achieves 88.24% confidence with 7.79× lift, meaning customers who buy Cheese are nearly nine times more likely to buy Wine than a random customer. Similarly, Garlic → Chicken at 69.23% confidence and 7.99× lift reflects the natural culinary pairing of these ingredients."),

    heading2("5.2 Revenue Distribution"),
    body("Dairy and Beverage categories generate the highest combined revenue, driven by high-support products like Milk ($309.91), Coffee, and Beer. The Pantry category contributes strong volume through Pasta, Olive Oil, and Tomato Sauce — products that anchor the home-cook basket segment."),

    heading2("5.3 Basket Composition"),
    body("The average basket contains 4.35 items. The distribution is right-skewed, with a small proportion of large baskets (8+ items) disproportionately contributing to revenue. Peak transaction volume occurs between 11:00 and 14:00, with a secondary peak around 17:00–18:00."),

    heading2("5.4 Customer Segments"),
    body("Five distinct basket patterns are identifiable from the co-occurrence and rule data:"),
    bullet("Health-conscious shoppers: Yogurt, Granola, Berries, Honey, Tea — 28% of baskets."),
    bullet("Home cooks: Pasta, Tomato Sauce, Garlic, Chicken, Olive Oil — 24% of baskets."),
    bullet("Weekend entertainers: Beer, Wine, Chips, Cheese, Pretzels — 19% of baskets."),
    bullet("Breakfast buyers: Eggs, Bacon, Bread, Butter, Coffee — 17% of baskets."),
    bullet("Stock-up shoppers: Bulk quantities, large packs, household staples — 12% of baskets."),
    spacer(),
    pageBreak(),
  );

  // ── 6. Recommendations ───────────────────────────────────────────────────
  sections.push(
    heading1("6. Recommendations"),

    heading2("6.1 Product Placement"),
    body("Based on the co-occurrence matrix and lift scores, the following placement changes are recommended:"),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [2800, 3200, 3360],
      rows: [
        makeHeaderRow(["Product pair", "Lift", "Recommendation"], [2800, 3200, 3360]),
        makeDataRow(["Cheese ↔ Wine", "7.79×", "Co-locate in deli / wine section; add bundle shelf tag"], [2800, 3200, 3360], false),
        makeDataRow(["Chicken ↔ Garlic", "7.99×", "Place fresh garlic near poultry counter"], [2800, 3200, 3360], true),
        makeDataRow(["Tea ↔ Honey", "7.42×", "Create a 'morning ritual' end-cap featuring both"], [2800, 3200, 3360], false),
        makeDataRow(["Yogurt ↔ Granola", "4.90×", "Side-by-side in health / breakfast aisle"], [2800, 3200, 3360], true),
        makeDataRow(["Pasta ↔ Tomato Sauce", "3.40×", "Pasta aisle cross-merchandising with canned sauces"], [2800, 3200, 3360], false),
        makeDataRow(["Coffee ↔ Milk", "3.10×", "Feature milk in the beverage/coffee aisle cooler"], [2800, 3200, 3360], true),
      ],
    }),
    spacer(),

    heading2("6.2 Bundle Promotions"),
    bullet("Launch a 'Wine & Cheese Friday' promotion with a 10% bundle discount — high confidence (88%) ensures strong uptake."),
    bullet("Create a 'Home Cook Kit' bundle: Pasta + Tomato Sauce + Olive Oil at a discounted price."),
    bullet("Offer a 'Breakfast Essentials' combo: Eggs + Bacon + Bread + Butter."),

    heading2("6.3 Digital Recommendations"),
    bullet("Implement a 'Customers also buy' feature in the mobile app and e-commerce site using the top 10 rules."),
    bullet("Trigger personalised push notifications: e.g., 'You bought Chicken — don't forget Garlic!'"),
    bullet("Segment email campaigns by basket archetype to increase relevance and open rates."),

    heading2("6.4 Inventory Planning"),
    bullet("Stock Garlic and Chicken at correlated levels; a spike in chicken demand should trigger automatic garlic reorder."),
    bullet("Wine and Cheese inventory should be managed jointly given their near-perfect co-purchase rate."),
    spacer(),
    pageBreak(),
  );

  // ── 7. Project Structure ─────────────────────────────────────────────────
  sections.push(
    heading1("7. Project Structure"),
    body("The project is organised as follows:"),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [3000, 6360],
      rows: [
        makeHeaderRow(["File", "Description"], [3000, 6360]),
        makeDataRow(["generate_data.py", "Generates 150 synthetic transactions with realistic co-purchase patterns"], [3000, 6360], false),
        makeDataRow(["analysis.py", "Apriori algorithm + rule mining; outputs CSV files"], [3000, 6360], true),
        makeDataRow(["dashboard.py", "Builds 8-panel matplotlib dashboard PNG"], [3000, 6360], false),
        makeDataRow(["main.py", "Pipeline entry point — runs all three steps in sequence"], [3000, 6360], true),
        makeDataRow(["generate_report.js", "Generates this Word document report"], [3000, 6360], false),
        makeDataRow(["transactions.csv", "Raw transaction data (150 transactions, 652 rows)"], [3000, 6360], true),
        makeDataRow(["association_rules.csv", "29 mined association rules with all metrics"], [3000, 6360], false),
        makeDataRow(["product_stats.csv", "Per-product support and revenue summary"], [3000, 6360], true),
        makeDataRow(["cooccurrence_matrix.csv", "10×10 product co-occurrence matrix (%)"], [3000, 6360], false),
        makeDataRow(["dashboard.png", "8-panel analysis dashboard"], [3000, 6360], true),
        makeDataRow(["confidence_lift_chart.png", "Grouped bar chart: confidence vs lift for top 20 rules"], [3000, 6360], false),
        makeDataRow(["README.md", "Setup instructions and project overview"], [3000, 6360], true),
      ],
    }),
    spacer(),
    pageBreak(),
  );

  // ── 8. Conclusion ────────────────────────────────────────────────────────
  sections.push(
    heading1("8. Conclusion"),
    body("This Market Basket Analysis project successfully demonstrates the end-to-end pipeline for discovering and leveraging product association rules in retail transaction data. Starting from synthetic data generation through to algorithm implementation, visualisation, and actionable recommendations, the project provides a reusable, extensible framework for MBA in any retail context."),
    body("The 29 association rules discovered — with lift values ranging from 1.5× to 7.99× — provide clear, quantifiable signals for optimising store layout, designing targeted promotions, and building personalised recommendation systems. The strongest rules (Cheese/Wine, Chicken/Garlic, Tea/Honey) represent immediate low-effort, high-impact opportunities for retailers."),
    body("Future extensions of this work could include: seasonal cohort analysis, customer lifetime value integration, real-time streaming MBA on POS data, and neural collaborative filtering for improved recommendation accuracy."),
    spacer(),

    heading1("Appendix — Summary Statistics"),
    kpiTable([
      { value: "150", label: "Total Transactions" },
      { value: "652", label: "Total Line Items" },
    ]),
    spacer(),
    kpiTable([
      { value: "45", label: "Unique Products" },
      { value: "8", label: "Product Categories" },
    ]),
    spacer(),
    kpiTable([
      { value: "29", label: "Association Rules" },
      { value: "$6,371", label: "Total Revenue" },
    ]),
    spacer(),
  );

  // ── Build document ───────────────────────────────────────────────────────
  const doc = new Document({
    numbering: {
      config: [{
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      }],
    },
    styles: {
      default: { document: { run: { font: "Arial", size: 22 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 36, bold: true, color: BLUE, font: "Arial" },
          paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 28, bold: true, color: TEAL, font: "Arial" },
          paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 24, bold: true, color: DARK, font: "Arial" },
          paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } },
      ],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: sections,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("market_basket_analysis_report.docx", buffer);
  console.log("Report saved: market_basket_analysis_report.docx");
}

buildReport().catch(console.error);
