import React from 'react';

const QuantumResearchPage: React.FC = () => {
    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12 animate-in fade-in duration-500">

            {/* Header Section */}
            <section className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-purple-600 drop-shadow-sm">
                    QRAG: Resolving Syntactic Ambiguity via Quantum Classification
                </h1>
                <p className="text-[15px] text-text-muted max-w-3xl mx-auto font-medium">
                    Exploring the frontier of Natural Language Processing by integrating standard retrieval systems with Variational Quantum Classifiers (VQC).
                </p>
            </section>

            {/* Abstract & Intro */}
            <section className="bg-card rounded-3xl p-8 shadow-soft border border-medium-gray/30 hover:shadow-hover transition-shadow duration-300">
                <h2 className="text-2xl font-bold text-text-main mb-4 flex items-center gap-2">
                    <span className="bg-primary/10 text-primary p-2 rounded-lg">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </span>
                    The Challenge of Syntactic Ambiguity
                </h2>
                <div className="text-[15px] text-text-muted space-y-4 leading-relaxed">
                    <p>
                        Retrieval-Augmented Generation (RAG) mitigates factual hallucination in LLMs by coupling them with an external knowledge base. However, standard retrieval systems often struggle with <strong>syntactic ambiguities</strong> in high-context queries. Structural dependencies are general not accounted for in standard embedding models.
                    </p>
                    <p>
                        The QRAG architecture turns to Quantum Natural Language Processing (QNLP) to resolve these structural failures, leveraging the high-dimensional feature space of quantum processors (like the IBM 127-qubit quantum processor) to capture complex linguistic correlations that classical systems misinterpret.
                    </p>
                </div>
            </section>

            {/* Architecture / Flowchart */}
            <section className="bg-gradient-to-br from-slate-50 to-light-gray rounded-3xl p-8 shadow-inner border border-medium-gray/20">
                <h2 className="text-2xl font-bold text-text-main mb-6 text-center">The QRAG Framework Architecture</h2>
                <div className="flex flex-col items-center gap-6">
                    <div className="relative group overflow-hidden rounded-2xl shadow-colorful transition-transform hover:scale-[1.01] duration-300 bg-white p-4">
                        <img src="/quantum/flowchart.png" alt="QRAG Architecture Flowchart" className="max-w-xs md:max-w-sm h-auto rounded-lg mx-auto" />
                    </div>
                    <p className="text-[13px] text-text-muted text-center max-w-2xl">
                        <strong>The Hybrid Pipeline:</strong> Low-ambiguity queries follow a rapid classical path, while high-ambiguity structures trigger the quantum pipeline for structural disentanglement using CZ ansatz circuits.
                    </p>
                </div>
            </section>

            {/* The Farm-Fetching Paradigm */}
            <section className="grid md:grid-cols-2 gap-8">
                <div className="bg-card rounded-3xl p-8 shadow-soft border border-medium-gray/30 hover:-translate-y-1 transition-transform duration-300">
                    <h3 className="text-xl font-bold text-text-main mb-3">The Bike (Classical Heuristics)</h3>
                    <p className="text-[15px] text-text-muted">
                        Optimized for linear relationships and standardized keyword searches. Classical computers excel at simple information retrieval tasks (like fetching groceries from a local store), providing immense speed and efficiency for over 92% of standard queries.
                    </p>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 shadow-soft border border-indigo-100 hover:-translate-y-1 transition-transform duration-300">
                    <h3 className="text-xl font-bold text-indigo-900 mb-3">The Sports Car (Quantum Heuristics)</h3>
                    <p className="text-[15px] text-indigo-800/80">
                        For retrieving "exotic fruits" far away. Quantum computing navigates complex, non-linear linguistic structures via quantum entanglement. It doesn't choose a single path; it entangles entities with multiple objects simultaneously to resolve syntactic ambiguities reliably.
                    </p>
                </div>
            </section>

            {/* Evidence and Experiments */}
            <section className="space-y-10">
                <h2 className="text-3xl font-bold text-text-main text-center">Experimental Evidence</h2>

                <div className="grid lg:grid-cols-2 gap-10 items-center">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-semibold text-text-main">The Linearity Trap</h3>
                        <p className="text-[15px] text-text-muted">
                            Classical pipelines often fall victim to the "Linearity Trap," where keyword overlap forces a high but factually incorrect Answer Relevance. In our thematic correlation experiments, traditional heuristic systems heavily biased towards majority classes and failed to recognize the minority class semantics (like separating causation from sheer co-occurrence).
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-3xl shadow-soft border border-medium-gray/20 group hover:shadow-hover transition-all">
                        <img src="/quantum/figure3.png" alt="The Linearity Trap Comparison" className="w-full rounded-xl" />
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-10 items-center lg:flex-row-reverse">
                    <div className="order-2 lg:order-1 bg-white p-4 rounded-3xl shadow-soft border border-medium-gray/20 group hover:shadow-hover transition-all">
                        <img src="/quantum/figure2.png" alt="Quantum Advantage over Classical" className="w-full rounded-xl" />
                    </div>
                    <div className="space-y-4 order-1 lg:order-2">
                        <h3 className="text-2xl font-semibold text-text-main">The Viola Moment</h3>
                        <p className="text-[15px] text-text-muted">
                            When standard parsing fails due to prepositional or functional ambiguity ("We painted the wall with cracks"), the quantum pipeline delivers a massive advantage. We established a <strong>46% accuracy gain</strong> in resolving structural ambiguity via the Quantum Processing Unit (QPU) compared to classical parsers stuck in local attachment logic.
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-10 items-center">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-semibold text-text-main">Complexity vs Quantum Advantage</h3>
                        <p className="text-[15px] text-text-muted">
                            As syntactic depth increases, the "Quantum Advantage" gap steadily expands. The resource overhead of the QPU is justified only at higher depths of ambiguity. Our 15-adversarial-query challenge set definitively demonstrated that non-linear queries consistently perform better using quantum embeddings.
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-3xl shadow-soft border border-medium-gray/20 group hover:shadow-hover transition-all">
                        <img src="/quantum/figure4.png" alt="Complexity vs Advantage Graph" className="w-full rounded-xl" />
                    </div>
                </div>

            </section>

            {/* Conclusion */}
            <section className="bg-gradient-to-r from-primary to-accent text-white rounded-3xl p-10 shadow-colorful text-center space-y-4">
                <h2 className="text-3xl font-bold">Conclusion in the NISQ Era</h2>
                <p className="text-[15px] text-white/90 max-w-4xl mx-auto">
                    The utility of Quantum Natural Language Processing isn't about entirely replacing classical pipelines, but supplementing them as an expert processing layer tailored for non-linear, high-dimensional syntactic disambiguation. By adopting hybrid control architectures, we can achieve maximal semantic reliability.
                </p>
            </section>

        </div>
    );
};

export default QuantumResearchPage;
