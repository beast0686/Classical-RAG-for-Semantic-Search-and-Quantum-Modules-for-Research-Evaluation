import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { GraphNode, GraphEdge } from '../../api/query';

type Props = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelectDocument?: (docId: string) => void;
};

type D3Node = d3.SimulationNodeDatum & {
  id: string;
  label: string;
  group: string;
  score?: number;
};

type D3Link = {
  source: D3Node;
  target: D3Node;
  relation?: string;
};

const GraphPanel: React.FC<Props> = ({ nodes, edges, onSelectDocument }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const simulationRef = useRef<d3.Simulation<D3Node, D3Link> | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || nodes.length === 0) {
      return;
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight; // dynamic height based on container

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('overflow', 'hidden');

    // Prepare data with initial random positioning for better spread
    const d3Nodes: D3Node[] = nodes.map((n) => ({
      id: n.id,
      label: n.label,
      group: n.group,
      score: n.score,
      x: width * 0.2 + Math.random() * width * 0.6, // Random position within 60% of width
      y: height * 0.2 + Math.random() * height * 0.6, // Random position within 60% of height
    }));

    const nodeMap = new Map(d3Nodes.map((n) => [n.id, n]));

    const d3Links: D3Link[] = edges
      .map((e) => {
        const source = nodeMap.get(e.from);
        const target = nodeMap.get(e.to);
        if (source && target) {
          return {
            source,
            target,
            relation: e.relation,
          } as D3Link;
        }
        return null;
      })
      .filter((l): l is D3Link => l !== null && l !== undefined);

    // Color scale for node groups - bright colorful palette
    const groupColors: Record<string, string> = {
      Document: '#A855F7', // bright purple
      Person: '#3B82F6', // bright blue
      Organization: '#10B981', // bright green
      Technology: '#FB923C', // bright orange
      Inferred: '#EC4899', // bright pink
      Center: '#06B6D4', // bright cyan
    };

    const getNodeColor = (group: string) => groupColors[group] || '#6366F1';

    // Create force simulation with wide spread layout
    const simulation = d3
      .forceSimulation<D3Node>(d3Nodes)
      .force(
        'link',
        d3
          .forceLink<D3Node, D3Link>(d3Links)
          .id((d) => d.id)
          .distance(Math.max(100, Math.min(width, height) * 0.15)) // Responsive distance based on space
          .strength(0.4), // Slightly increased to maintain connections
      )
      .force('charge', d3.forceManyBody().strength(-400)) // Doubled repulsion for wider spread
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.1))
      .force('collision', d3.forceCollide().radius(35)) // Increased collision radius
      .force('x', d3.forceX(width / 2).strength(0.01)) // Reduced centering force for wider spread
      .force('y', d3.forceY(height / 2).strength(0.01))
      .force('radial', d3.forceRadial(Math.min(width, height) * 0.35, width / 2, height / 2).strength(0.05))
      .alphaDecay(0.05) // Slower decay for smoother animation
      .alphaMin(0.001) // Lower minimum alpha to allow settling
      .velocityDecay(0.4); // Add velocity decay to prevent excessive movement

    simulationRef.current = simulation;

    // Create arrow markers for directed edges
    svg
      .append('defs')
      .selectAll('marker')
      .data(['end'])
      .enter()
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#CBD5F5');

    // Draw links
    const link = svg
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(d3Links)
      .enter()
      .append('line')
      .attr('stroke', '#CBD5F5')
      .attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#arrowhead)')
      .style('opacity', 0.6);

    // Draw link labels
    const linkLabels = svg
      .append('g')
      .attr('class', 'link-labels')
      .selectAll('text')
      .data(d3Links.filter((d) => d.relation))
      .enter()
      .append('text')
      .attr('font-size', '10px')
      .attr('fill', '#6B7280')
      .text((d) => d.relation || '')
      .style('pointer-events', 'none')
      .style('opacity', 0.7);

    // Draw nodes
    const node = svg
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(d3Nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(
        d3
          .drag<SVGGElement, D3Node>()
          .on('start', (event, d) => {
            if (!event.active && simulation.alpha() < 0.05) {
              simulation.alphaTarget(0.05).restart();
            }
            d.fx = d.x ?? width / 2;
            d.fy = d.y ?? height / 2;
          })
          .on('drag', (event, d) => {
            // Get mouse position relative to SVG
            const [x, y] = d3.pointer(event, svgRef.current);
            // Constrain to bounds with minimal padding for wider spread
            const padding = 15;
            d.fx = Math.max(padding, Math.min(width - padding, x));
            d.fy = Math.max(padding, Math.min(height - padding, y));
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            // Keep node fixed at dragged position
            const padding = 15;
            if (d.fx !== null && d.fx !== undefined) {
              d.fx = Math.max(padding, Math.min(width - padding, d.fx));
            }
            if (d.fy !== null && d.fy !== undefined) {
              d.fy = Math.max(padding, Math.min(height - padding, d.fy));
            }
          }),
      )
      .on('click', (event, d) => {
        event.stopPropagation();

        // Toggle selection state
        const isCurrentlySelected = selectedNode === d.id;
        const newSelectedNode = isCurrentlySelected ? null : d.id;
        setSelectedNode(newSelectedNode);

        // Handle selection visual effects directly with D3
        if (newSelectedNode) {
          // Highlight selected node and its connections
          svg.selectAll('.nodes g')
            .style('opacity', (nodeData: any) => {
              const isSelected = nodeData.id === newSelectedNode;
              const isConnected = d3Links.some(l =>
                (l.source.id === newSelectedNode && l.target.id === nodeData.id) ||
                (l.target.id === newSelectedNode && l.source.id === nodeData.id)
              );
              return isSelected || isConnected ? 1 : 0.3;
            });

          svg.selectAll('.links line')
            .style('opacity', (linkData: any) =>
              linkData.source.id === newSelectedNode || linkData.target.id === newSelectedNode ? 1 : 0.2);
        } else {
          // Reset all to default appearance
          svg.selectAll('.nodes g').style('opacity', 1);
          svg.selectAll('.links line').style('opacity', 0.6);
        }

        // Handle document selection callback
        if (d.id.startsWith('doc_') && onSelectDocument) {
          const docId = d.id.replace('doc_', '');
          onSelectDocument(docId);
        }
      });

    // Add circles for nodes
    node
      .append('circle')
      .attr('r', 8)
      .attr('fill', (d) => getNodeColor(d.group))
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .style('transition', 'all 0.2s ease-in-out')
      .style('opacity', 1);

    // Add labels for nodes
    node
      .append('text')
      .text((d) => d.label.length > 15 ? `${d.label.substring(0, 15)}...` : d.label)
      .attr('font-size', '10px')
      .attr('dx', 12)
      .attr('dy', 4)
      .attr('fill', '#0F172A')
      .style('pointer-events', 'none')
      .style('opacity', 0.8);

    // Tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'graph-tooltip')
      .style('position', 'absolute')
      .style('padding', '8px 12px')
      .style('background', 'rgba(15, 23, 42, 0.95)')
      .style('color', '#FFFFFF')
      .style('border-radius', '6px')
      .style('font-size', '10px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 1000);

    node
      .on('mouseover', (event, d) => {
        // Direct D3 visual effects without simulation restart
        const currentNode = d3.select(event.currentTarget);

        // Smooth hover effect on the current circle
        currentNode.select('circle')
          .transition()
          .duration(150)
          .attr('r', 12)
          .style('stroke-width', 3);

        // Dim other nodes and highlight connections
        svg.selectAll('.nodes g')
          .style('opacity', (nodeData: any) => nodeData.id === d.id ? 1 : 0.3);

        // Highlight connected links
        svg.selectAll('.links line')
          .style('opacity', (linkData: any) =>
            linkData.source.id === d.id || linkData.target.id === d.id ? 1 : 0.2);

        // Show relevant link labels
        svg.selectAll('.link-labels text')
          .style('opacity', (linkData: any) =>
            linkData.source.id === d.id || linkData.target.id === d.id ? 1 : 0);

        // Show tooltip
        tooltip
          .style('opacity', 1)
          .html(`<strong>${d.label}</strong><br/>${d.group}${d.score ? `<br/>Score: ${d.score.toFixed(3)}` : ''}`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`);
      })
      .on('mousemove', (event) => {
        tooltip.style('left', `${event.pageX + 10}px`).style('top', `${event.pageY - 10}px`);
      })
      .on('mouseout', (event) => {
        // Reset circle appearance
        d3.select(event.currentTarget).select('circle')
          .transition()
          .duration(150)
          .attr('r', 8)
          .style('stroke-width', 2);

        // Reset all opacities to default
        svg.selectAll('.nodes g').style('opacity', 1);
        svg.selectAll('.links line').style('opacity', 0.6);
        svg.selectAll('.link-labels text').style('opacity', 0.7);

        // Hide tooltip
        tooltip.style('opacity', 0);
      });

    // Update positions on simulation tick with boundary constraints
    simulation.on('tick', () => {
      // Constrain nodes to bounds with minimal padding for wider spread
      const padding = 15;
      d3Nodes.forEach((d) => {
        if (d.fx === null || d.fx === undefined) {
          d.x = Math.max(padding, Math.min(width - padding, d.x ?? width / 2));
        }
        if (d.fy === null || d.fy === undefined) {
          d.y = Math.max(padding, Math.min(height - padding, d.y ?? height / 2));
        }
      });

      link
        .attr('x1', (d) => d.source.x ?? 0)
        .attr('y1', (d) => d.source.y ?? 0)
        .attr('x2', (d) => d.target.x ?? 0)
        .attr('y2', (d) => d.target.y ?? 0);

      linkLabels
        .attr('x', (d) => {
          const src = d.source;
          const tgt = d.target;
          return src && tgt && src.x !== undefined && tgt.x !== undefined ? (src.x + tgt.x) / 2 : 0;
        })
        .attr('y', (d) => {
          const src = d.source;
          const tgt = d.target;
          return src && tgt && src.y !== undefined && tgt.y !== undefined ? (src.y + tgt.y) / 2 : 0;
        });

      node.attr('transform', (d) => {
        const x = d.x ?? width / 2;
        const y = d.y ?? height / 2;
        return `translate(${x},${y})`;
      });
    });

    // Handle window resize with debouncing
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      if (!containerRef.current) return;

      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const newWidth = containerRef.current!.clientWidth;
        const newHeight = containerRef.current!.clientHeight;
        svg.attr('width', newWidth).attr('height', newHeight).attr('viewBox', `0 0 ${newWidth} ${newHeight}`);
        simulation.force('center', d3.forceCenter(newWidth / 2, newHeight / 2).strength(0.1));
        simulation.force('x', d3.forceX(newWidth / 2).strength(0.01));
        simulation.force('y', d3.forceY(newHeight / 2).strength(0.01));
        simulation.force('radial', d3.forceRadial(Math.min(newWidth, newHeight) * 0.35, newWidth / 2, newHeight / 2).strength(0.05));
        if (simulation.alpha() < 0.1) {
          simulation.alpha(0.1).restart();
        }
      }, 150);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      simulation.stop();
      d3.select('body').selectAll('.graph-tooltip').remove();
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [nodes, edges, onSelectDocument]);

  // Node type colors for legend - bright colorful palette
  const nodeTypeColors = {
    Document: '#A855F7', // bright purple
    Person: '#3B82F6', // bright blue
    Organization: '#10B981', // bright green
    Technology: '#FB923C', // bright orange
    Inferred: '#EC4899', // bright pink
    Center: '#06B6D4' // bright cyan
  };

  // Get unique node types from current nodes for legend
  const uniqueNodeTypes = [...new Set(nodes.map(node => node.group))];

  return (
    <section className="glass-card flex h-full flex-col rounded-2xl border border-slate-100 bg-card/80 p-4 shadow-soft">
      <header className="mb-2 flex items-center justify-between gap-2 flex-shrink-0">
        <div className="flex-1">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Knowledge Graph</h2>
        </div>

        {/* Legend */}
        {nodes.length > 0 && (
          <div className="flex flex-col gap-1">
            {/*<div className="text-xs font-medium text-slate-600 mb-1">Legend</div>*/}
            <div className="flex flex-wrap gap-2">
              {uniqueNodeTypes.map((nodeType) => (
                <div key={nodeType} className="flex items-center gap-1">
                  <div
                    className="w-3 h-3 rounded-full border border-white"
                    style={{ backgroundColor: nodeTypeColors[nodeType as keyof typeof nodeTypeColors] || '#CBD5F5' }}
                  />
                  <span className="text-xs text-slate-600">{nodeType}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      <div ref={containerRef} className="mt-2 flex-1 w-full rounded-xl border border-slate-100 bg-slate-50 overflow-hidden relative">
        {nodes.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-text-muted">No graph data available. Run a query to see the knowledge graph.</p>
          </div>
        ) : (
          <svg ref={svgRef} className="w-full h-full block" style={{ touchAction: 'none' }} />
        )}
      </div>
    </section>
  );
};

export default GraphPanel;
