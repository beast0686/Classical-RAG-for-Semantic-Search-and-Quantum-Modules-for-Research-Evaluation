import matplotlib.pyplot as plt
import numpy as np
from math import pi

# --- CONFIGURATION FOR "ACADEMIC/MATH" LOOK ---
# Standardizing fonts for IEEE style
plt.rcParams.update({
    "font.family": "serif",
    "font.serif": ["Times New Roman"],
    "font.size": 12,
    "axes.labelsize": 12,
    "axes.titlesize": 14,
    "xtick.labelsize": 10,
    "ytick.labelsize": 10,
    "mathtext.fontset": "cm",  # Computer Modern (TeX-like)
})


def plot_viola_moments():
    """
    Graph A: Clustered Bar Chart
    Improved visibility for value labels.
    """
    labels = ['Flying Planes\n(Syntactic)', 'Book on Shelf\n(PP Attachment)', 'Letter to Editor\n(Structural)']

    classical_scores = [0.3314, 0.4162, 0.2591]
    quantum_scores = [0.6220, 0.5574, 0.4935]

    x = np.arange(len(labels))
    width = 0.35

    fig, ax = plt.subplots(figsize=(8, 6))  # Slightly taller for better spacing
    rects1 = ax.bar(x - width / 2, classical_scores, width, label='Classical RAG', color='#e0e0e0', alpha=1.0,
                    edgecolor='black', hatch='//')
    rects2 = ax.bar(x + width / 2, quantum_scores, width, label='QRAG (Quantum)', color='#3b5998', alpha=1.0,
                    edgecolor='black')

    # Math-heavy labels
    ax.set_ylabel(r'Answer Faithfulness ($\mathcal{F}$)')
    ax.set_title(r'Fig. 1: The Viola Moment: $\Delta_{\mathcal{F}}$ in Ambiguous Queries', pad=20)
    ax.set_xticks(x)
    ax.set_xticklabels(labels)

    # Increase Y-limit to make room for text on top bars
    ax.set_ylim(0, 0.85)

    ax.legend(loc='upper left')
    ax.grid(axis='y', linestyle='--', alpha=0.5)

    # Add text annotations with padding
    def autolabel(rects):
        for rect in rects:
            height = rect.get_height()
            ax.annotate(f'{height:.2f}',
                        xy=(rect.get_x() + rect.get_width() / 2, height),
                        xytext=(0, 5),  # 5 points vertical offset
                        textcoords="offset points",
                        ha='center', va='bottom', fontsize=10, weight='bold')

    autolabel(rects1)
    autolabel(rects2)

    plt.tight_layout()
    plt.savefig('graph_viola_moments_fixed.png', dpi=300)
    plt.show()


def plot_linearity_trap():
    """
    Graph B: Radar Chart
    FIXED: Overlapping labels pushed out using padding.
    """
    categories = [r'Context Relevance ($R_c$)', r'Answer Faithfulness ($\mathcal{F}$)', r'Answer Relevance ($R_a$)']
    classical_values = [0.2912, 0.3314, 0.5250]
    quantum_values = [0.3443, 0.6220, 0.5571]

    N = len(categories)

    # Compute angle for each axis
    angles = [n / float(N) * 2 * pi for n in range(N)]
    angles += angles[:1]  # Close the loop

    classical_values += classical_values[:1]
    quantum_values += quantum_values[:1]

    fig, ax = plt.subplots(figsize=(7, 7), subplot_kw={'projection': 'polar'})

    # Draw one axe per variable + labels
    # KEY FIX: 'pad=30' pushes the labels away from the chart to prevent overlap
    plt.xticks(angles[:-1], categories, color='black', size=11)
    ax.tick_params(axis='x', pad=30)

    # Draw ylabels (radial grid)
    # KEY FIX: Moved radial labels to 45 degrees so they don't block the vertical axis
    ax.set_rlabel_position(45)
    plt.yticks([0.2, 0.4, 0.6, 0.8], ["0.2", "0.4", "0.6", "0.8"], color="grey", size=9)
    plt.ylim(0, 0.75)

    # Plot Classical
    ax.plot(angles, classical_values, linewidth=1.5, linestyle='--', label='Classical Baseline', color='#d62728')
    ax.fill(angles, classical_values, '#d62728', alpha=0.1)

    # Plot Quantum
    ax.plot(angles, quantum_values, linewidth=2.5, linestyle='-', label='Quantum-Enhanced', color='#1f77b4')
    ax.fill(angles, quantum_values, '#1f77b4', alpha=0.15)

    plt.title(r'Fig. 2: Metric Expansion for Query $q_{amb}$', y=1.1)
    plt.legend(loc='upper right', bbox_to_anchor=(0.1, 0.1))

    plt.tight_layout()
    plt.savefig('graph_linearity_trap_fixed.png', dpi=300)
    plt.show()


def plot_farm_fetching_cost():
    """
    Graph C: Scatter Plot
    Improved label placement.
    """
    x_bike = [0.012, 0.015, 0.010, 0.011]
    y_bike = [0.02, -0.01, 0.00, 0.01]

    x_car = [6.95, 5.52, 5.24, 7.51]
    y_car = [0.2906, 0.1412, 0.2344, 0.15]

    fig, ax = plt.subplots(figsize=(9, 5))

    ax.scatter(x_bike, y_bike, c='#d62728', marker='x', s=120, linewidth=2, label=r'Classical "Bike" ($\delta(q)=0$)')
    ax.scatter(x_car, y_car, c='#1f77b4', marker='o', s=120, edgecolors='black',
               label=r'Quantum "Sports Car" ($\delta(q)=1$)')

    ax.set_xscale('log')
    ax.set_xlabel(r'Processing Latency $t$ (seconds) [Log Scale]')
    ax.set_ylabel(r'Faithfulness Gain $\Delta_{\mathcal{F}}$')
    ax.set_title(r'Fig. 3: The Utility Threshold: Latency vs. Fidelity', pad=15)

    # Adjusted annotations to not overlap with markers
    ax.text(0.012, 0.06, "Low Latency\nNo Advantage", fontsize=10, color='#d62728', ha='center', fontweight='bold')
    ax.text(6.0, 0.08, "High Latency\nQuantum Advantage", fontsize=10, color='#1f77b4', ha='center', fontweight='bold')

    ax.axhline(0, color='black', linewidth=0.8, linestyle='--')

    ax.legend(loc='upper left')
    ax.grid(True, which="both", ls="-", alpha=0.2)

    # Force margins so points aren't on the edge
    ax.margins(x=0.1, y=0.1)

    plt.tight_layout()
    plt.savefig('graph_farm_fetching_fixed.png', dpi=300)
    plt.show()


if __name__ == "__main__":
    plot_viola_moments()
    plot_linearity_trap()
    plot_farm_fetching_cost()