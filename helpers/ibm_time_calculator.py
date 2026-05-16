import os
import matplotlib.pyplot as plt
from qiskit import QuantumCircuit
from qiskit.circuit import Parameter
from qiskit_ibm_runtime import QiskitRuntimeService
from qiskit.visualization import plot_gate_map
import os

# Force Python to add the standard Windows Graphviz path
# Note: Check if your installation is in "Program Files" or "Program Files (x86)"
os.environ["PATH"] += os.pathsep + 'C:/Program Files/Graphviz/bin'
# Configure IEEE-style high-contrast formatting for matplotlib
plt.style.use('seaborn-v0_8-whitegrid')
plt.rcParams.update({
    'font.family': 'serif',
    'axes.titlesize': 14,
    'figure.autolayout': True
})

# ==========================================
# AUTHENTICATION CONFIGURATION
# ==========================================
# Replace 'YOUR_IBM_TOKEN_HERE' with your actual IBM Quantum API key.
# You can get this from https://quantum.ibm.com/account
IBM_API_TOKEN = os.getenv("IBM_KEY")


def authenticate_ibm():
    print("Authenticating with IBM Quantum...")
    try:
        # Save the account to disk (overwrite if a previous one exists)
        QiskitRuntimeService.save_account(
            channel="ibm_quantum_platform",
            token=IBM_API_TOKEN,
            overwrite=True
        )
        service = QiskitRuntimeService()
        print("Authentication successful.")
        return service
    except Exception as e:
        print(f"CRITICAL ERROR during authentication: {e}")
        print("Please verify your API token.")
        exit(1)


# ==========================================
# FIGURE 4: Parameterized Quantum Circuit (PQC)
# ==========================================
def generate_pqc_schematic():
    print("\n--- Generating Figure 4: PQC Topology ---")

    # Initialize a 5-qubit circuit for the filtered DAG:
    # ['horse', 'raced', 'past', 'barn', 'fell']
    qc = QuantumCircuit(5)

    # Define parameters for the semantic encoding phase
    theta = [Parameter(f'θ_{i}') for i in range(5)]

    # 1. Semantic Encoding Layer (Ry gates mapping to Hilbert Space)
    for i in range(5):
        qc.ry(theta[i], i)

    qc.barrier()

    # 2. Syntactic Entanglement Layer (CZ gates binding the topology)
    qc.cz(0, 1)  # Entangling 'horse' and 'raced'
    qc.cz(1, 2)  # Entangling 'raced' and 'past'
    qc.cz(2, 3)  # Entangling 'past' and 'barn'
    qc.cz(0, 4)  # Entangling 'horse' and 'fell' (Resolving the long-range dependency)

    # Render and save the vector graphic
    fig = qc.draw(output='mpl', style='iqp', scale=1.2, fold=-1)
    filename = '../quantum/graphs/Figure_4_QRAG_PQC_Schematic.png'
    fig.savefig(filename, format='png', bbox_inches='tight')
    print(f"Saved successfully: {filename}")
    plt.close(fig)


# ==========================================
# FIGURE 5: Disjoint Sub-Topology Mapping
# ==========================================
def generate_hardware_topology(service):
    print("\n--- Generating Figure 5: Hardware Topology on ibm_fez ---")

    try:
        backend = service.backend('ibm_fez')
        print(f"Successfully connected to hardware backend: {backend.name}")
    except Exception as e:
        print(f"Failed to connect to ibm_fez: {e}")
        exit(1)

    # Active execution zones (N <= 7 logical qubits per group)
    active_zones = {
        'Group 1': [0, 1, 2],
        'Group 2': [14, 15, 16, 17, 18, 19],
        'Group 3': [27, 28, 29, 30, 31],
        'Group 4': [41, 42, 43, 44, 45, 46],
        'Group 5': [53, 54, 55, 56, 57, 58]
    }

    # Flatten active arrays
    active_qubits = [q for group in active_zones.values() for q in group]

    # 1-Qubit physical buffers isolating the execution zones
    buffer_qubits = [3, 13, 20, 26, 32, 40, 47, 52, 59]

    # Color map for the 127-qubit lattice
    qubit_colors = []
    for i in range(backend.num_qubits):
        if i in active_qubits:
            qubit_colors.append('#1f77b4')  # Blue: Active QRAG Circuit
        elif i in buffer_qubits:
            qubit_colors.append('#d62728')  # Red: 1-Qubit Isolation Buffer
        else:
            qubit_colors.append('#e0e0e0')  # Gray: Inactive Background

    # Plot the gate map directly from the physical backend coupling map
    fig, ax = plt.subplots(figsize=(16, 10), dpi=300)

    # Disable title within the plot itself to allow LaTeX to handle captioning
    plot_gate_map(
        backend,
        ax=ax,
        qubit_size=28,
        # Removed line_color and line_width to bypass Qiskit heavy-hex KeyError bug
        qubit_color=qubit_colors,
        font_color='white'
    )
    filename = '../quantum/graphs/Figure_5_Hardware_Topology_ibm_fez.png'
    fig.savefig(filename, format='png', bbox_inches='tight')
    print(f"Saved successfully: {filename}")
    plt.close(fig)


# ==========================================
# EXECUTION
# ==========================================
if __name__ == "__main__":
    print("Initializing QRAG Visualization Pipeline...")
    service = authenticate_ibm()
    generate_pqc_schematic()
    generate_hardware_topology(service)
    print("\nPipeline Complete. Vector graphics are ready for manuscript inclusion.")