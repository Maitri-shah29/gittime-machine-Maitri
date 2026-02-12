"use client";

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { SemanticGraphData, SemanticNode, SemanticEdge } from '@/lib/semantic-analysis';

interface SemanticGraphProps {
    data: SemanticGraphData;
}

export function SemanticGraph({ data }: SemanticGraphProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [selectedNode, setSelectedNode] = useState<SemanticNode | null>(null);

    useEffect(() => {
        if (!wrapperRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            if (entries[0]) {
                const { width, height } = entries[0].contentRect;
                setDimensions({ width, height });
            }
        });

        resizeObserver.observe(wrapperRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        if (!data.nodes.length || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const { width, height } = dimensions;

        // Zoom behavior
        const g = svg.append("g");
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });

        svg.call(zoom);

        // Simulation
        const simulation = d3.forceSimulation<SemanticNode>(data.nodes)
            .force("link", d3.forceLink<SemanticNode, SemanticEdge>(data.links).id(d => d.id).distance(150))
            .force("charge", d3.forceManyBody().strength(-500))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide().radius(30));

        // Links
        const link = g.append("g")
            .attr("stroke", "#555")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(data.links)
            .join("line")
            .attr("stroke-width", 2);

        // Arrow marker
        svg.append("defs").selectAll("marker")
            .data(["sem-arrow"])
            .join("marker")
            .attr("id", "sem-arrow")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 25) // Offset for node radius
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", "#555");

        link.attr("marker-end", "url(#sem-arrow)");

        // Nodes
        const node = g.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("g")
            .data(data.nodes)
            .join("g")
            .call(d3.drag<SVGGElement, SemanticNode>()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended) as any)
            .on("click", (event, d) => {
                setSelectedNode(d);
                event.stopPropagation();
            });

        // Node Circle
        node.append("circle")
            .attr("r", 20)
            .attr("fill", d => {
                switch (d.type) {
                    case 'Service': return "#ef4444"; // red
                    case 'Model': return "#3b82f6"; // blue
                    case 'Utility': return "#f59e0b"; // orange
                    case 'Component': return "#10b981"; // green
                    case 'Page': return "#8b5cf6"; // purple
                    case 'File': return "#3b82f6"; // blue
                    default: return "#64748b"; // gray
                }
            });

        // Node Icon/Text
        node.append("text")
            .attr("dy", 4)
            .attr("text-anchor", "middle")
            .text(d => d.type[0])
            .style("fill", "white")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .style("pointer-events", "none");

        // Labels underneath
        const labels = g.append("g")
            .selectAll("text")
            .data(data.nodes)
            .join("text")
            .attr("dy", 35)
            .attr("text-anchor", "middle")
            .text(d => d.label)
            .style("font-size", "11px")
            .style("fill", "#ccc")
            .style("pointer-events", "none");

        // Tick
        simulation.on("tick", () => {
            link
                .attr("x1", d => (d.source as any).x)
                .attr("y1", d => (d.source as any).y)
                .attr("x2", d => (d.target as any).x)
                .attr("y2", d => (d.target as any).y);

            node
                .attr("transform", d => `translate(${(d as any).x},${(d as any).y})`);

            labels
                .attr("x", d => (d as any).x)
                .attr("y", d => (d as any).y);
        });

        // Drag functions
        function dragstarted(event: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event: any) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event: any) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        // Deselect on bg click
        svg.on("click", () => setSelectedNode(null));

        return () => {
            simulation.stop();
        };
    }, [data, dimensions]);

    return (
        <div className="flex h-[600px] border border-[#333] rounded-lg bg-[#1e1e1e] overflow-hidden">
            <div className="flex-1 relative" ref={wrapperRef}>
                <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="block w-full h-full" />

                {/* Legend */}
                <div className="absolute top-4 left-4 bg-background/80 backdrop-blur p-2 rounded border text-xs space-y-1">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> File</div>
                </div>
            </div>

            {/* Sidebar for details */}
            {selectedNode && (
                <div className="w-64 border-l border-[#333] p-4 bg-card/50 overflow-y-auto">
                    <h3 className="font-bold text-lg mb-2">{selectedNode.label}</h3>
                    <div className="inline-block px-2 py-1 rounded-full bg-primary/20 text-primary text-xs mb-4">
                        {selectedNode.type}
                    </div>

                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Description</h4>
                    <p className="text-sm mb-4">{selectedNode.description || "No description available."}</p>

                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Source Files</h4>
                    <ul className="text-xs space-y-1 list-disc pl-4 text-muted-foreground">
                        {selectedNode.fileSources?.map(f => (
                            <li key={f}>{f}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
