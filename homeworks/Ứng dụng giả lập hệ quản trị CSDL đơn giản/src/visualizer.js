/**
 * visualizer.js — D3.js B-Tree Rendering & Animation Engine
 * Môn: DSA++ | UIT
 */

"use strict";

class BTreeVisualizer {
  constructor(containerId) {
    this.containerId = containerId;
    this.svg = null;
    this.g = null;        // Main group (zoomable)
    this.zoom = null;
    this.width = 0;
    this.height = 0;

    // Layout constants
    this.NODE_HEIGHT = 44;
    this.KEY_WIDTH = 80;
    this.KEY_PADDING = 8;
    this.LEVEL_HEIGHT = 110;
    this.MIN_SIBLING_GAP = 24;

    this._init();
  }

  _init() {
    const container = d3.select(`#${this.containerId}`);
    const rect = document.getElementById(this.containerId).getBoundingClientRect();
    this.width = rect.width || 800;
    this.height = rect.height || 480;

    this.svg = container
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .style('font-family', '"JetBrains Mono", "Fira Code", monospace');

    // Gradient defs
    const defs = this.svg.append('defs');
    this._addGradient(defs, 'nodeGrad', '#1e293b', '#0f172a');
    this._addGradient(defs, 'highlightGrad', '#d97706', '#b45309');
    this._addGradient(defs, 'foundGrad', '#16a34a', '#15803d');
    this._addGradient(defs, 'overflowGrad', '#dc2626', '#991b1b');
    this._addGradient(defs, 'splitGrad', '#7c3aed', '#5b21b6');

    // Zoom
    this.zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
      });
    this.svg.call(this.zoom);

    // Arrow marker
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .append('path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#94a3b8');

    this.g = this.svg.append('g').attr('class', 'tree-group');
  }

  _addGradient(defs, id, c1, c2) {
    const grad = defs.append('linearGradient')
      .attr('id', id)
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    grad.append('stop').attr('offset', '0%').attr('stop-color', c1);
    grad.append('stop').attr('offset', '100%').attr('stop-color', c2);
  }

  /**
   * Render cây từ một snapshot BTreeNode. Hỗ trợ highlight keys.
   * @param {BTreeNode} root
   * @param {string[]} highlightKeys - MSSV cần highlight
   * @param {string} frameType - loại animation frame
   */
  render(root, highlightKeys = [], frameType = 'default') {
    // Tính layout
    const layout = this._computeLayout(root);

    // Reset view (center)
    this.g.selectAll('*').remove();

    // Vẽ edges trước
    const edgesGroup = this.g.append('g').attr('class', 'edges');
    this._drawEdges(edgesGroup, layout.nodes);

    // Vẽ nodes
    const nodesGroup = this.g.append('g').attr('class', 'nodes');
    this._drawNodes(nodesGroup, layout.nodes, highlightKeys, frameType);

    // Center view
    this._centerView(layout);
  }

  /**
   * Animated transition từ frame A sang frame B.
   */
  renderAnimated(root, highlightKeys = [], frameType = 'default', duration = 600) {
    const layout = this._computeLayout(root);

    // Edges
    const edgesGroup = this.g.select('.edges').empty()
      ? this.g.append('g').attr('class', 'edges')
      : this.g.select('.edges');
    edgesGroup.selectAll('*').remove();
    this._drawEdges(edgesGroup, layout.nodes);

    // Nodes (với transition)
    let nodesGroup = this.g.select('.nodes');
    if (nodesGroup.empty()) nodesGroup = this.g.append('g').attr('class', 'nodes');

    const existing = nodesGroup.selectAll('.btree-node')
      .data(layout.nodes, d => d.id);

    // Exit
    existing.exit()
      .transition().duration(duration / 2)
      .attr('opacity', 0)
      .remove();

    // Enter
    const entering = existing.enter()
      .append('g')
      .attr('class', 'btree-node')
      .attr('transform', d => `translate(${d.x - this._nodeWidth(d) / 2},${d.y})`)
      .attr('opacity', 0);

    entering.transition().duration(duration)
      .attr('opacity', 1);

    this._renderNodeContent(entering, highlightKeys, frameType, true);

    // Update
    existing.transition().duration(duration)
      .attr('transform', d => `translate(${d.x - this._nodeWidth(d) / 2},${d.y})`);

    this._renderNodeContent(existing, highlightKeys, frameType, false);

    this._centerView(layout);
  }

  // ── Layout computation ─────────────────────────────────────────────────────

  _computeLayout(root) {
    // BFS để tính toán vị trí tất cả nodes
    const nodes = [];
    const queue = [{ node: root, level: 0, parent: null, childIdx: 0 }];
    const levelNodes = {};

    while (queue.length > 0) {
      const { node, level, parent, childIdx } = queue.shift();
      const w = this._nodeWidth(node);
      const item = {
        id: node.id,
        keys: [...node.keys],
        isLeaf: node.isLeaf,
        level,
        width: w,
        x: 0, // sẽ tính sau
        y: level * this.LEVEL_HEIGHT + 30,
        parent,
        children: [],
        childrenRefs: node.children,
      };
      nodes.push(item);
      if (parent) parent.children.push(item);

      if (!levelNodes[level]) levelNodes[level] = [];
      levelNodes[level].push(item);

      for (let i = 0; i < node.children.length; i++) {
        queue.push({ node: node.children[i], level: level + 1, parent: item, childIdx: i });
      }
    }

    // Tính x theo bottom-up
    const maxLevel = Math.max(...Object.keys(levelNodes).map(Number));
    for (let lv = maxLevel; lv >= 0; lv--) {
      const lvNodes = levelNodes[lv] || [];
      if (lv === maxLevel) {
        // Leaf level: place evenly
        let x = 0;
        for (const n of lvNodes) {
          n.x = x + n.width / 2;
          x += n.width + this.MIN_SIBLING_GAP;
        }
      } else {
        for (const n of lvNodes) {
          if (n.children.length === 0) {
            // Node không có con (leaf ở level không phải maxLevel)
            continue;
          }
          const firstChild = n.children[0];
          const lastChild = n.children[n.children.length - 1];
          n.x = (firstChild.x + lastChild.x) / 2;
        }
      }
    }

    // Nếu root chưa có x (tree chỉ có root)
    if (nodes.length > 0 && nodes[0].x === 0) {
      nodes[0].x = (nodes[0].width) / 2;
    }

    // Shift toàn bộ để không bị âm
    const minX = Math.min(...nodes.map(n => n.x - n.width / 2));
    if (minX < 20) {
      const shift = 20 - minX;
      for (const n of nodes) n.x += shift;
    }

    return { nodes };
  }

  _nodeWidth(node) {
    const keys = node.keys || node;
    const count = Array.isArray(keys) ? keys.length : 0;
    return Math.max(count, 1) * (this.KEY_WIDTH + this.KEY_PADDING) + this.KEY_PADDING;
  }

  // ── Drawing ──────────────────────────────────────────────────────────────────────

  _drawEdges(group, nodes) {
    for (const node of nodes) {
      for (let ci = 0; ci < node.children.length; ci++) {
        const child = node.children[ci];
        const x1 = node.x;
        const y1 = node.y + this.NODE_HEIGHT;
        const x2 = child.x;
        const y2 = child.y;

        // Vẽ cạnh cong (Bezier)
        group.append('path')
          .attr('d', `M ${x1} ${y1} C ${x1} ${(y1 + y2) / 2}, ${x2} ${(y1 + y2) / 2}, ${x2} ${y2}`)
          .attr('fill', 'none')
          .attr('stroke', '#334155')
          .attr('stroke-width', 1.5)
          .attr('marker-end', 'url(#arrowhead)');

        // Nhãn số thứ tự nánh (P0, P1, ...) — giữa đoạn nối 2 node
        const labelX = (x1 + x2) / 2;
        const labelY = (y1 + y2) / 2;

        group.append('circle')
          .attr('cx', labelX).attr('cy', labelY)
          .attr('r', 10)
          .attr('fill', '#0c1a2e')
          .attr('stroke', '#2d4f7c')
          .attr('stroke-width', 1);

        group.append('text')
          .attr('x', labelX).attr('y', labelY + 4)
          .attr('text-anchor', 'middle')
          .attr('fill', '#64748b')
          .attr('font-size', '9px')
          .attr('font-weight', '700')
          .attr('font-family', '"JetBrains Mono", monospace')
          .text(`P${ci}`);
      }
    }
  }

  _drawNodes(group, nodes, highlightKeys, frameType) {
    const nodeGs = group.selectAll('.btree-node')
      .data(nodes, d => d.id)
      .enter()
      .append('g')
      .attr('class', 'btree-node')
      .attr('transform', d => `translate(${d.x - d.width / 2},${d.y})`);

    this._renderNodeContent(nodeGs, highlightKeys, frameType, true);
  }

  _renderNodeContent(sel, highlightKeys, frameType, isNew) {
    sel.each(function(d) {
      const g = d3.select(this);
      g.selectAll('*').remove();

      const nw = d.width;
      const nh = 44;

      // Kiểm tra node này có liên quan đến frame hiện tại không
      const nodeActive = d.keys.length > 0 && d.keys.some(k => highlightKeys.includes(k));

      // Xác định màu border + glow dựa trên frameType
      let borderColor  = '#475569';
      let strokeWidth  = 1.5;
      let glowFilter   = 'none';

      if (nodeActive) {
        switch (frameType) {
          case 'traverse':
            borderColor = '#38bdf8'; strokeWidth = 2.5;
            glowFilter = 'drop-shadow(0 0 6px #38bdf8)';
            break;
          case 'compare': case 'scan':
            borderColor = '#f59e0b'; strokeWidth = 2.5;
            glowFilter = 'drop-shadow(0 0 6px #f59e0b)';
            break;
          case 'found': case 'done': case 'insert-leaf':
            borderColor = '#22c55e'; strokeWidth = 2.5;
            glowFilter = 'drop-shadow(0 0 8px #22c55e)';
            break;
          case 'overflow': case 'delete-leaf':
            borderColor = '#ef4444'; strokeWidth = 2.5;
            glowFilter = 'drop-shadow(0 0 8px #ef4444)';
            break;
          case 'split': case 'merge': case 'merge-trigger':
            borderColor = '#a855f7'; strokeWidth = 2.5;
            glowFilter = 'drop-shadow(0 0 8px #a855f7)';
            break;
          case 'borrow-sibling': case 'borrow-left': case 'borrow-right':
            borderColor = '#06b6d4'; strokeWidth = 2.5;
            glowFilter = 'drop-shadow(0 0 6px #06b6d4)';
            break;
          default:
            borderColor = '#60a5fa'; strokeWidth = 2;
            glowFilter = 'drop-shadow(0 0 4px #60a5fa)';
        }
      }

      // Shadow
      g.append('rect')
        .attr('x', 2).attr('y', 2)
        .attr('width', nw).attr('height', nh)
        .attr('rx', 8).attr('ry', 8)
        .attr('fill', 'rgba(0,0,0,0.4)');

      // Node background + border
      g.append('rect')
        .attr('x', 0).attr('y', 0)
        .attr('width', nw).attr('height', nh)
        .attr('rx', 8).attr('ry', 8)
        .attr('fill', 'url(#nodeGrad)')
        .attr('stroke', borderColor)
        .attr('stroke-width', strokeWidth)
        .style('filter', glowFilter);

      const keyW = 80;
      const keyH = 36;
      const keyPad = 4;

      for (let i = 0; i < d.keys.length; i++) {
        const kx = i * (keyW + keyPad) + keyPad;
        const ky = (nh - keyH) / 2;
        const key = d.keys[i];
        const isHL = highlightKeys.includes(key);

        // Màu key cell — node active dùng màu nhạt hơn để thấy nền node
        let fillColor  = '#1e3a5f';
        let strokeColor = '#3b82f6';
        let textColor  = '#93c5fd';

        if (isHL) {
          switch (frameType) {
            case 'traverse':
              // Toàn node được highlight → key cells dùng teal nhẹ
              fillColor = '#0c2d4a'; strokeColor = '#38bdf8'; textColor = '#7dd3fc';
              break;
            case 'compare': case 'scan':
              fillColor = '#78350f'; strokeColor = '#f59e0b'; textColor = '#fcd34d';
              break;
            case 'found': case 'done': case 'insert-leaf':
              fillColor = '#14532d'; strokeColor = '#22c55e'; textColor = '#86efac';
              break;
            case 'overflow': case 'delete-leaf':
              fillColor = '#7f1d1d'; strokeColor = '#ef4444'; textColor = '#fca5a5';
              break;
            case 'split': case 'merge': case 'merge-trigger':
              fillColor = '#4c1d95'; strokeColor = '#a855f7'; textColor = '#d8b4fe';
              break;
            case 'borrow-sibling': case 'borrow-left': case 'borrow-right':
              fillColor = '#164e63'; strokeColor = '#06b6d4'; textColor = '#a5f3fc';
              break;
            default:
              fillColor = '#1e3a5f'; strokeColor = '#60a5fa'; textColor = '#bfdbfe';
          }
        }

        // Key cell background
        g.append('rect')
          .attr('x', kx).attr('y', ky)
          .attr('width', keyW).attr('height', keyH)
          .attr('rx', 4).attr('ry', 4)
          .attr('fill', fillColor)
          .attr('stroke', strokeColor)
          .attr('stroke-width', isHL ? 2 : 1)
          .style('cursor', 'pointer')
          .on('click', function(event) {
            event.stopPropagation();
            if (window.onKeyClick) window.onKeyClick(key);
          });

        // Separator
        if (i < d.keys.length - 1) {
          g.append('line')
            .attr('x1', kx + keyW + keyPad / 2).attr('y1', 6)
            .attr('x2', kx + keyW + keyPad / 2).attr('y2', nh - 6)
            .attr('stroke', '#334155').attr('stroke-width', 1);
        }

        // Key text
        g.append('text')
          .attr('x', kx + keyW / 2)
          .attr('y', ky + keyH / 2 + 5)
          .attr('text-anchor', 'middle')
          .attr('fill', textColor)
          .attr('font-size', '10.5px')
          .attr('font-weight', isHL ? '700' : '500')
          .text(key)
          .style('cursor', 'pointer')
          .on('click', function(event) {
            event.stopPropagation();
            if (window.onKeyClick) window.onKeyClick(key);
          });
      }

      // Level badge
      g.append('text')
        .attr('x', nw - 5).attr('y', -5)
        .attr('text-anchor', 'end')
        .attr('fill', nodeActive ? borderColor : '#475569')
        .attr('font-size', '9px')
        .text(d.isLeaf ? 'leaf' : `L${d.level}`);
    });
  }

  _centerView(layout) {
    if (!layout.nodes.length) return;
    const xs = layout.nodes.map(n => n.x);
    const ys = layout.nodes.map(n => n.y);
    const minX = Math.min(...xs) - 50;
    const maxX = Math.max(...xs) + 100;
    const minY = Math.min(...ys) - 30;
    const maxY = Math.max(...ys) + this.NODE_HEIGHT + 50;

    const treeW = maxX - minX;
    const treeH = maxY - minY;

    const scaleX = this.width / treeW;
    const scaleY = this.height / treeH;
    const scale = Math.min(scaleX, scaleY, 1.2);

    const tx = (this.width - treeW * scale) / 2 - minX * scale;
    const ty = (this.height - treeH * scale) / 2 - minY * scale;

    this.svg.transition().duration(400)
      .call(this.zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
  }
}

window.BTreeVisualizer = BTreeVisualizer;
