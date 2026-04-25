import matplotlib.pyplot as plt
import numpy as np
import os

# Output setup
output_folder = r"C:\Users\itsge\Downloads\QRAG\Journal"
os.makedirs(output_folder, exist_ok=True)

# ==========================================
# 1. STYLE CONFIGURATION
# ==========================================
plt.style.use('seaborn-v0_8-whitegrid')
plt.rcParams.update({
    'font.family': 'serif',
    'font.serif': ['Times New Roman'],
    'font.size': 14,  # Increased base font
    'axes.labelsize': 16,  # Larger Axis Labels
    'axes.titlesize': 18,  # Larger Titles
    'xtick.labelsize': 14,  # Larger Ticks
    'ytick.labelsize': 14,
    'legend.fontsize': 14,
    'lines.linewidth': 2.5,
    'savefig.dpi': 300
})

# ==========================================
# DATA
# ==========================================
queries = [f'Q{i}' for i in range(1, 16)]
ar_classical = [0.6656, 0.8208, 0.6767, 0.6050, 0.6529, 0.7902, 0.6962, 0.7283, 0.6415, 0.7498, 0.6800, 0.7574, 0.6937,
                0.5250, 0.4834]
ar_quantum = [0.7214, 0.7362, 0.8500, 0.7357, 0.7094, 0.7222, 0.7781, 0.8695, 0.7965, 0.7175, 0.7811, 0.7574, 0.8199,
              0.5571, 0.6548]
advantages = np.array(ar_quantum) - np.array(ar_classical)

# Query 2 Data
q2_labels = ['Context\nRelevance', 'Answer\nFaithfulness', 'Answer\nRelevance']
q2_class = [0.33, 0.32, 0.82]
q2_quant = [0.25, 0.30, 0.73]

# Depth Data
depths = [1, 3, 3, 1, 1, 1, 1, 1, 1, 3, 3, 1, 1, 2, 2]


# ==========================================
# GRAPH GENERATION
# ==========================================

def plot_fig2_standard_bars():
    """
    Figure 2: Standard Side-by-Side Bar Chart
    Fixed: Uses native marker='*' instead of text glyph to prevent font errors.
    """
    print("Generating Figure 2...")
    fig, ax = plt.subplots(figsize=(14, 5))

    x = np.arange(len(queries))
    width = 0.35

    ax.bar(x - width / 2, ar_classical, width, label='Classical RAG', color='#bdc3c7', edgecolor='black')
    ax.bar(x + width / 2, ar_quantum, width, label='QRAG (Quantum)', color='#2c3e50', edgecolor='black')

    # Highlight big wins using scatter markers instead of text
    for i, val in enumerate(advantages):
        if val > 0.1:  # Gain > 10%
            # Plot a red star marker above the bar
            ax.scatter(x[i] + width / 2, ar_quantum[i] + 0.05, marker='*', s=150, color='#c0392b', zorder=10)

    ax.set_ylabel('Answer Relevance (0-1)')
    ax.set_title('Figure 2: Performance Comparison Across All Queries')
    ax.set_xticks(x)
    ax.set_xticklabels(queries)
    ax.set_ylim(0, 1.15)  # More headroom for stars
    ax.legend(loc='upper left')

    plt.tight_layout()
    plt.savefig(os.path.join(output_folder, 'figure2.png'), bbox_inches='tight')
    plt.close()


def plot_fig3_simple_group():
    """
    Figure 3: Linearity Trap
    Update: Significantly larger labels.
    """
    print("Generating Figure 3...")
    fig, ax = plt.subplots(figsize=(8, 7))  # Taller for better label spacing

    x = np.arange(len(q2_labels))
    width = 0.35

    ax.bar(x - width / 2, q2_class, width, label='Classical', color='#e74c3c', alpha=0.8, edgecolor='black')
    ax.bar(x + width / 2, q2_quant, width, label='Quantum', color='#27ae60', alpha=0.8, edgecolor='black')

    ax.set_ylabel('Metric Score', fontsize=18, fontweight='bold')
    ax.set_title('Figure 3: The "Linearity Trap" (Query 2)', fontsize=18, pad=15)

    ax.set_xticks(x)
    # HUGE labels for readability
    ax.set_xticklabels(q2_labels, fontsize=16, fontweight='bold')
    ax.tick_params(axis='y', labelsize=14)

    ax.set_ylim(0, 1.0)
    ax.legend(loc='upper left', fontsize=14)

    # Large annotation
    ax.annotate('High Score,\nWrong Fact', xy=(2 - width / 2, 0.82), xytext=(1.2, 0.9),
                arrowprops=dict(facecolor='black', shrink=0.05),
                fontsize=16, fontweight='bold', ha='center',
                bbox=dict(boxstyle="round,pad=0.3", fc="white", ec="black", alpha=0.8))

    plt.tight_layout()
    plt.savefig(os.path.join(output_folder, 'figure3.png'), bbox_inches='tight')
    plt.close()


def plot_fig4_scatter():
    """
    Figure 4: Depth Analysis (Visual 3 Upgrade)
    Update: Includes shaded error bounds for 1824-shot variance and high-res formatting.
    """
    print("Generating Figure 4 (Visual 3)...")
    fig, ax = plt.subplots(figsize=(10, 8))  # Slightly wider for better trendline visibility

    # 1. NEW DATA: You must replace this mock array with your actual 1824-shot standard deviations
    # These represent the variance margin (+/-) for each of the 15 queries
    variances = np.array([0.0175, 0.0181, 0.0142, 0.0166, 0.0171, 0.0155, 0.0148, 0.0132, 0.0159, 0.0177, 0.0145, 0.0162, 0.0138, 0.0180, 0.0165])

    # Jitter for scatter points
    rng = np.random.RandomState(42)
    x_jitter = np.array(depths) + rng.normal(0, 0.05, size=len(depths))

    # Scatter
    sc = ax.scatter(x_jitter, advantages, c=advantages, cmap='RdBu', s=150, edgecolor='black', vmin=-0.1, vmax=0.1,
                    zorder=3)

    # 2. TRENDLINE MATH
    z = np.polyfit(depths, advantages, 1)
    p = np.poly1d(z)

    # We need a smooth, sorted X-axis to draw the trendline and shading cleanly
    x_trend = np.linspace(1, 3, 100)
    y_trend = p(x_trend)
    ax.plot(x_trend, y_trend, "k--", label='Linear Trend', linewidth=3, zorder=2)

    # 3. SHADED ERROR BOUNDS
    # To shade the variance, we map the average variance at each complexity depth
    # Depth 1 variance avg, Depth 2 variance avg, Depth 3 variance avg
    depth_1_var = np.mean(variances[np.array(depths) == 1])
    depth_2_var = np.mean(variances[np.array(depths) == 2])
    depth_3_var = np.mean(variances[np.array(depths) == 3])

    # Create a continuous variance line matching the x_trend points
    interpolated_variance = np.interp(x_trend, [1, 2, 3], [depth_1_var, depth_2_var, depth_3_var])

    # Apply the shading
    ax.fill_between(x_trend,
                    y_trend - interpolated_variance,
                    y_trend + interpolated_variance,
                    color='#34495e', alpha=0.2, label='1824-Shot Variance ($1\sigma$)', zorder=1)

    # Baseline
    ax.axhline(0, color='gray', linestyle='-', linewidth=1.5, zorder=0)

    # Labels and Formatting
    ax.set_ylabel(r'Quantum Advantage ($\Delta$ AR)', fontsize=18, fontweight='bold')
    ax.set_xlabel('Syntactic Complexity', fontsize=18, fontweight='bold')
    ax.set_xticks([1, 2, 3])
    ax.set_xticklabels(['Local (1)', 'Functional (2)', 'Global (3)'], fontsize=16, fontweight='bold')
    ax.tick_params(axis='y', labelsize=14)
    ax.set_title('Figure 4: Syntactic Complexity vs. Quantum Advantage', fontsize=18, pad=15)

    # Legend
    ax.legend(loc='upper left', fontsize=14)

    # Annotations
    ax.text(2.9, 0.11, "Q11 (+10%)", fontsize=14, fontweight='bold', ha='right')
    ax.text(1.1, -0.09, "Q2 (Trap)", fontsize=14, fontweight='bold', ha='left', color='#c0392b')

    plt.tight_layout()
    plt.savefig(os.path.join(output_folder, 'figure4_upgraded.png'), bbox_inches='tight', dpi=300)
    plt.close()

if __name__ == "__main__":
    plot_fig2_standard_bars()
    plot_fig3_simple_group()
    plot_fig4_scatter()
    print("Graphs generated: Font bug fixed, Labels enlarged.")


