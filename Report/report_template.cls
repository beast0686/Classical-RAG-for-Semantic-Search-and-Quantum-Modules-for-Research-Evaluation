\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{report_template}[2024/02/14 My Custom Report Class]

\LoadClass[12pt]{report}

\RequirePackage{fancyhdr}
\RequirePackage{float}
\RequirePackage{lipsum}
\RequirePackage{mathptmx}
\RequirePackage{titlesec}
\RequirePackage{url}
\RequirePackage[left=1.5in, right=1in, top=1in, bottom=1in]{geometry}

\RequirePackage[titles]{tocloft}
\setlength{\cftbeforesecskip}{0.5pt}
\setlength{\cftbeforesubsecskip}{0.1pt}

\renewcommand{\rmdefault}{ptm}
\renewcommand{\sfdefault}{phv}
\renewcommand{\ttdefault}{pcr}

\renewcommand{\bibname}{References}

\newcommand{\ProjectName}{Classical RAG for Semantic Search and Quantum Modules for Research Evaluation}

% Redefining the chapter headings
\fancyhf{}
\fancyhead[L]{\ProjectName}
\fancyfoot[L]{B.E/Dept. CSE/BNMIT}
\fancyfoot[C]{\thepage}
\fancyfoot[R]{2025-26}

\makeatletter
% Redefine plain page style
\renewcommand{\headrule}{\hrule height 1.5pt \vspace{2pt}\hrule height 0.5pt}
\renewcommand{\footrule}{\hrule height 0.25pt \vspace{1.5pt}\hrule height 1pt}
\setlength{\headheight}{20.0pt}
\addtolength{\topmargin}{-4.0pt}
\setlength{\emergencystretch}{10pt}

% Renaming headers for TOC, LOF, and LOT
\renewcommand{\contentsname}{\hfill{\centering Table of Contents}\hfill}
\renewcommand{\listfigurename}{\hfill{\centering List of Figures}\hfill}
\renewcommand{\listtablename}{\hfill{\centering List of Tables}\hfill}

\renewcommand{\baselinestretch}{1.5}

\makeatother
\pagestyle{fancy}

% Redefining the chapter headings
\setcounter{tocdepth}{1}
\titlespacing*{\chapter}{0pt}{-0.75in}{20pt}
\titleformat{\chapter}[display]
  {\normalfont\huge\bfseries}
  {\MakeUppercase\chaptertitlename\ \thechapter}
  {18pt}
  {\Huge\centering\MakeUppercase}

\titleformat{\section}{\fontsize{16}{18}\bfseries}{\thesection}{16pt}{}
\titleformat{\subsection}{\fontsize{14}{16}\bfseries}{\thesubsection}{14pt}{}

\endinput

