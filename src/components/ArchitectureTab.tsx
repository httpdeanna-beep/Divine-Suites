/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Cpu, ShieldCheck, Database, Layout, ArrowRight, Activity, Terminal, Code } from 'lucide-react';
import { SystemConfig } from '../types';

interface ArchitectureTabProps {
  config: SystemConfig;
}

interface ArchNode {
  id: string;
  name: string;
  category: string;
  icon: React.ComponentType<any>;
  description: string;
  x: number;
  y: number;
  details: {
    status: string;
    protocol: string;
    endpoints: string[];
    codeSnippet: string;
  };
}

export default function ArchitectureTab({ config }: ArchitectureTabProps) {
  const [selectedNode, setSelectedNode] = useState<string>('db');

  const nodes: ArchNode[] = [
    {
      id: 'client',
      name: 'Vite / React Client SPA',
      category: 'Presentation Layer',
      icon: Layout,
      description: 'Single Page Application written in React 19, styled with Tailwind CSS, and optimized with Motion animations. Communicates over HTTPS/WebSockets.',
      x: 30,
      y: 60,
      details: {
        status: 'Operational',
        protocol: 'HTTPS / WSS (WebSockets)',
        endpoints: ['GET /index.html', 'GET /assets/*', 'WSS /api/live-inventory'],
        codeSnippet: `// src/hooks/useInventory.ts\nimport { useState, useEffect } from 'react';\n\nexport function useLiveInventory() {\n  const [inventory, setInventory] = useState([]);\n  \n  useEffect(() => {\n    const ws = new WebSocket(\`\${process.env.APP_URL}/api/live-inventory\`);\n    ws.onmessage = (event) => {\n      const update = JSON.parse(event.data);\n      setInventory(update);\n    };\n    return () => ws.close();\n  }, []);\n  \n  return inventory;\n}`
      }
    },
    {
      id: 'gateway',
      name: 'Express HTTP API Gateway',
      category: 'Routing & Security',
      icon: ShieldCheck,
      description: 'Backend gateway served on Cloud Run. Restricts unauthorized CORS origins, coordinates security headers, and routes payload operations.',
      x: 100,
      y: 60,
      details: {
        status: 'Operational',
        protocol: 'HTTP/2 REST',
        endpoints: ['ANY /api/v1/*', 'OPTIONS /api/*'],
        codeSnippet: `// server.ts - Security Headers & Middleware\nimport express from 'express';\nimport cors from 'cors';\nimport helmet from 'helmet';\n\nconst app = express();\n\napp.use(helmet());\napp.use(cors({\n  origin: process.env.APP_URL,\n  credentials: true,\n  methods: ['GET', 'POST', 'PUT', 'DELETE']\n}));\napp.use(express.json());`
      }
    },
    {
      id: 'auth',
      name: config.authProvider,
      category: 'Identity Provider',
      icon: ShieldCheck,
      description: 'Handles token signature validation, user registration, and secure OIDC integration. Validates administrative RBAC credentials.',
      x: 100,
      y: 15,
      details: {
        status: 'Active Integration',
        protocol: 'OIDC / JWT (RS256)',
        endpoints: ['POST /api/auth/register', 'GET /api/auth/verify'],
        codeSnippet: `// server/middleware/auth.ts\nimport { Request, Response, NextFunction } from 'express';\nimport admin from 'firebase-admin'; \n\nexport async function validateToken(req: Request, res: Response, next: NextFunction) {\n  const token = req.headers.authorization?.split('Bearer ')[1];\n  if (!token) {\n    return res.status(401).json({ error: 'Token missing' });\n  }\n  try {\n    const decodedToken = await admin.auth().verifyIdToken(token);\n    req.user = decodedToken;\n    next();\n  } catch (error) {\n    res.status(403).json({ error: 'Token signatures mismatch' });\n  }\n}`
    }
    },
    {
      id: 'app',
      name: 'Dynamic Application Engine',
      category: 'Business Logic Layer',
      icon: Terminal,
      description: 'Core logic service written in TypeScript. Controls transactional locks for room allocation and schedules analytical jobs.',
      x: 170,
      y: 60,
      details: {
        status: 'Active',
        protocol: 'gRPC / Internal IPC',
        endpoints: ['POST /api/bookings', 'PUT /api/bookings/:id', 'GET /api/suites'],
        codeSnippet: `// server/controllers/booking.ts\nimport { db } from '../db';\nimport { bookings } from '../db/schema';\n\nexport async function handleNewBooking(req: Request, res: Response) {\n  // Atomic serializable transaction\n  await db.transaction(async (tx) => {\n    const { suiteId, checkIn, checkOut } = req.body;\n    const conflicts = await tx.select().from(bookings).where( /* query overlapping dates */ );\n    if (conflicts.length > 0) {\n      throw new Error('Inventory collision detected');\n    }\n    await tx.insert(bookings).values({ ...req.body });\n  });\n  res.status(201).json({ status: 'committed' });\n}`
      }
    },
    {
      id: 'ai',
      name: `AI Engine (${config.aiModel})`,
      category: 'Cognitive Analytics',
      icon: Cpu,
      description: `Predictive models utilizing @google/genai SDK to parse reservation datasets, forecast real-time occupancy metrics, and optimize dynamic rates.`,
      x: 170,
      y: 15,
      details: {
        status: 'Engaged',
        protocol: 'Google SDK over HTTPS',
        endpoints: ['POST /api/analytics/pricing', 'POST /api/analytics/forecast'],
        codeSnippet: `// server/services/gemini.ts\nimport { GoogleGenAI } from '@google/genai';\n\nconst ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });\n\nexport async function calculateDynamicRates(suiteData: any, marketMetrics: any) {\n  const prompt = \`Given suite \${suiteData.name}, base price \${suiteData.basePrice}, and demand \${marketMetrics.demandFactor}, calculate target price.\`;\n  const response = await ai.models.generateContent({\n    model: '${config.aiModel}',\n    contents: prompt,\n    config: { responseMimeType: 'application/json' }\n  });\n  return JSON.parse(response.text);\n}`
      }
    },
    {
      id: 'db',
      name: config.dbProvider,
      category: 'Data Persistence Layer',
      icon: Database,
      description: 'PostgreSQL instance running as standard Google Cloud SQL. Manages structural inventory records, operational metrics, and complete audit history.',
      x: 240,
      y: 60,
      details: {
        status: 'Synced (SSL Enforced)',
        protocol: 'Postgres Native (Port 5432)',
        endpoints: ['drizzle-kit migration push', 'gcloud sql connect'],
        codeSnippet: `// src/db/schema.ts\nimport { pgTable, uuid, varchar, integer, timestamp, date } from 'drizzle-orm/pg-core';\n\nexport const bookings = pgTable('bookings', {\n  id: uuid('id').primaryKey().defaultRandom(),\n  guestName: varchar('guest_name', { length: 256 }).notNull(),\n  suiteName: varchar('suite_name', { length: 256 }).notNull(),\n  checkIn: date('check_in').notNull(),\n  checkOut: date('check_out').notNull(),\n  totalPrice: integer('total_price').notNull(),\n  createdAt: timestamp('created_at').defaultNow()\n});`
      }
    }
  ];

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId);
  };

  const selectedNodeData = nodes.find(n => n.id === selectedNode) || nodes[5];

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-white" id="arch-tab-container">
      {/* Topology Map Panel */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200 overflow-y-auto">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Enterprise Blueprint
          </span>
          <h2 className="text-2xl font-light tracking-tight text-slate-900 uppercase">
            Interactive Topology Schematic
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
            Select any infrastructure module below to inspect its transaction endpoints, transport protocol specifications, security controls, and actual code-level implementation details.
          </p>
        </div>

        {/* Dynamic Interactive SVG Canvas */}
        <div className="my-8 relative flex items-center justify-center border border-slate-200 bg-slate-50 p-6 md:p-10 shadow-xs h-96 select-none">
          <svg className="w-full h-full max-w-xl" viewBox="0 0 280 120">
            <defs>
              {/* Grid pattern */}
              <pattern id="grid-arch" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(226,232,240,0.6)" strokeWidth="1" />
              </pattern>
              
              {/* Marker Arrows */}
              <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="rgba(15,23,42,0.4)" />
              </marker>
              
              <marker id="arrow-active" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
              </marker>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-arch)" />

            {/* Connecting lines between nodes */}
            {/* Client -> Gateway */}
            <line x1="50" y1="60" x2="80" y2="60" stroke="rgba(15,23,42,0.6)" strokeWidth="1.2" strokeDasharray={selectedNode === 'client' || selectedNode === 'gateway' ? '3,3' : 'none'} markerEnd="url(#arrow)" className={selectedNode === 'client' || selectedNode === 'gateway' ? 'stroke-emerald-500' : ''} />
            
            {/* Gateway -> Auth */}
            <path d="M 100 50 L 100 32" fill="none" stroke="rgba(15,23,42,0.6)" strokeWidth="1.2" markerEnd="url(#arrow)" className={selectedNode === 'auth' || selectedNode === 'gateway' ? 'stroke-emerald-500' : ''} />
            
            {/* Gateway -> App */}
            <line x1="120" y1="60" x2="150" y2="60" stroke="rgba(15,23,42,0.6)" strokeWidth="1.2" markerEnd="url(#arrow)" className={selectedNode === 'app' || selectedNode === 'gateway' ? 'stroke-emerald-500' : ''} />
            
            {/* App -> AI */}
            <path d="M 170 50 L 170 32" fill="none" stroke="rgba(15,23,42,0.6)" strokeWidth="1.2" markerEnd="url(#arrow)" className={selectedNode === 'ai' || selectedNode === 'app' ? 'stroke-emerald-500' : ''} />
            
            {/* App -> DB */}
            <line x1="190" y1="60" x2="220" y2="60" stroke="rgba(15,23,42,0.6)" strokeWidth="1.2" markerEnd="url(#arrow)" className={selectedNode === 'db' || selectedNode === 'app' ? 'stroke-emerald-500' : ''} />

            {/* Nodes group */}
            {nodes.map((node) => {
              const IconComponent = node.icon;
              const isSelected = selectedNode === node.id;
              
              return (
                <g 
                  key={node.id} 
                  transform={`translate(${node.x},${node.y})`}
                  className="cursor-pointer group"
                  onClick={() => handleNodeClick(node.id)}
                >
                  {/* Outer circle halo for hover */}
                  <circle 
                    cx="0" 
                    cy="0" 
                    r="15" 
                    fill="transparent" 
                    stroke={isSelected ? '#10b981' : 'transparent'} 
                    strokeWidth="1.5"
                    className="transition-all duration-300"
                  />
                  
                  {/* Main Node Background Box / diamond */}
                  <rect 
                    x="-10" 
                    y="-10" 
                    width="20" 
                    height="20" 
                    fill={isSelected ? '#0f172a' : '#ffffff'} 
                    stroke={isSelected ? '#10b981' : '#cbd5e1'} 
                    strokeWidth={isSelected ? '2' : '1.5'}
                    className="transition-all duration-300 group-hover:stroke-slate-900 group-hover:scale-105"
                    transform="rotate(45)"
                  />

                  {/* Icon component overlay */}
                  <g transform="translate(-5, -5)">
                    <IconComponent 
                      className={`w-2.5 h-2.5 transition-colors duration-300 ${
                        isSelected ? 'text-emerald-400' : 'text-slate-700 group-hover:text-slate-900'
                      }`} 
                    />
                  </g>

                  {/* Label */}
                  <text 
                    x="0" 
                    y="22" 
                    textAnchor="middle" 
                    className={`text-[6px] font-bold uppercase tracking-wider select-none pointer-events-none transition-colors duration-300 ${
                      isSelected ? 'fill-slate-900 font-extrabold' : 'fill-slate-500 group-hover:fill-slate-800'
                    }`}
                  >
                    {node.id.toUpperCase()}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Indicator label */}
          <div className="absolute top-4 left-4 flex items-center gap-2 text-[9px] font-bold text-slate-400 bg-white border border-slate-200 px-2 py-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 animate-pulse rounded-full" />
            <span>INTERACTIVE GRID</span>
          </div>
        </div>

        {/* Dynamic Topology Legends */}
        <div className="flex gap-4 items-center bg-slate-50 p-4 border border-slate-200 text-xs text-slate-500 font-sans">
          <Activity className="w-4 h-4 text-slate-800" />
          <p>
            This schematic shows the pipeline. Incoming data hits the <strong className="text-slate-800">Client SPA</strong>, maps onto the secure <strong className="text-slate-800">API Gateway</strong> validated by <strong className="text-slate-800">Identity Providers</strong>, routes to the <strong className="text-slate-800">Business Layer</strong>, triggers <strong className="text-slate-800">AI prediction</strong>, and executes transactions in the <strong className="text-slate-800">Database</strong>.
          </p>
        </div>
      </div>

      {/* Node Detail Inspector Drawer */}
      <div className="w-full md:w-96 border-t md:border-t-0 border-slate-200 flex flex-col bg-slate-50 overflow-y-auto" id="arch-node-inspector">
        {/* Node Header */}
        <div className="p-6 border-b border-slate-200 bg-white">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {selectedNodeData.category}
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
            <span>{selectedNodeData.name}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            {selectedNodeData.description}
          </p>
        </div>

        {/* Node Properties */}
        <div className="p-6 border-b border-slate-200 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                Transport Protocol
              </span>
              <span className="text-xs font-mono text-slate-800 bg-white border border-slate-150 px-2 py-0.5 mt-1 inline-block">
                {selectedNodeData.details.protocol}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                Module Status
              </span>
              <span className="text-xs font-mono text-emerald-600 bg-emerald-50 border border-emerald-150 px-2 py-0.5 mt-1 inline-block font-bold">
                {selectedNodeData.details.status}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Active Contract Endpoints
            </span>
            <div className="space-y-1">
              {selectedNodeData.details.endpoints.map((ep, idx) => (
                <div key={idx} className="text-[10px] font-mono text-slate-600 bg-slate-100 border border-slate-200 p-1 pl-2">
                  {ep}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Microcode Editor View */}
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Code className="w-3.5 h-3.5" />
              <span>Reference Specification Code</span>
            </span>
            <span className="text-[9px] font-mono text-slate-400">READONLY • TYPED</span>
          </div>

          <div className="flex-1 bg-slate-950 border border-slate-800 p-4 font-mono text-[10px] text-slate-300 overflow-x-auto overflow-y-auto whitespace-pre leading-relaxed select-text select-all">
            {selectedNodeData.details.codeSnippet}
          </div>
        </div>
      </div>
    </div>
  );
}
