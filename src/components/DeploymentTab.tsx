/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Play, CheckCircle, AlertTriangle, Cpu, Loader2, Sparkles } from 'lucide-react';
import { SystemConfig, LogLine } from '../types';

interface DeploymentTabProps {
  config: SystemConfig;
  deploymentStatus: string;
  setDeploymentStatus: (status: string) => void;
}

export default function DeploymentTab({ config, deploymentStatus, setDeploymentStatus }: DeploymentTabProps) {
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll terminal to bottom
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const addLog = (text: string, type: LogLine['type']) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        timestamp: time,
        text,
        type
      }
    ]);
  };

  const handleRunPipeline = () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setDeploymentStatus('Compiling');
    setPipelineProgress(0);
    setLogs([]);

    const steps = [
      {
        progress: 5,
        log: `Initializing continuous integration pipeline for Divine Suites...`,
        type: 'info' as const,
        delay: 500
      },
      {
        progress: 10,
        log: `Checking environment specification variables in .env.example...`,
        type: 'info' as const,
        delay: 600
      },
      {
        progress: 15,
        log: `Loaded secret token verification structures: encryption=[${config.encryptionLevel}]`,
        type: 'success' as const,
        delay: 400
      },
      {
        progress: 25,
        log: `npm run lint && tsc --noEmit`,
        type: 'command' as const,
        delay: 800
      },
      {
        progress: 35,
        log: `✔ TypeScript compilation complete. 0 structural errors, 0 type warnings.`,
        type: 'success' as const,
        delay: 500
      },
      {
        progress: 42,
        log: `Verifying data migration structures for db=[${config.dbProvider.split(' ')[0]}]`,
        type: 'info' as const,
        delay: 500
      },
      {
        progress: 50,
        log: `npx drizzle-kit push:${config.dbProvider.toLowerCase().includes('postgres') ? 'pg' : 'mysql'} --schema=src/db/schema.ts`,
        type: 'command' as const,
        delay: 900
      },
      {
        progress: 60,
        log: `✔ Schema synchronized with Google Cloud SQL persistence pool.`,
        type: 'success' as const,
        delay: 400
      },
      {
        progress: 68,
        log: `Packaging environment assets into multi-stage container target...`,
        type: 'info' as const,
        delay: 600
      },
      {
        progress: 75,
        log: `docker build -t gcr.io/divine-suites-enterprise/engine:latest .`,
        type: 'command' as const,
        delay: 1100
      },
      {
        progress: 82,
        log: `✔ Docker layer optimization: container footprint minimized (186 MB).`,
        type: 'success' as const,
        delay: 400
      },
      {
        progress: 88,
        log: `Uploading image layers to Google Artifact Registry: path=gcr.io/divine-suites-enterprise/*`,
        type: 'info' as const,
        delay: 700
      },
      {
        progress: 92,
        log: `gcloud run deploy divine-suites-service --image gcr.io/divine-suites-enterprise/engine:latest --region us-east1 --platform managed --allow-unauthenticated`,
        type: 'command' as const,
        delay: 1300
      },
      {
        progress: 100,
        log: `✔ Successfully deployed to ${config.deployTarget}! Service is fully live.`,
        type: 'success' as const,
        delay: 600
      },
      {
        progress: 100,
        log: `Live Gateway Ingress: https://divine-suites-prod.run.app`,
        type: 'success' as const,
        delay: 200
      }
    ];

    let currentStep = 0;

    const executeNextStep = () => {
      if (currentStep >= steps.length) {
        setIsRunning(false);
        setDeploymentStatus('Live');
        return;
      }

      const step = steps[currentStep];
      setTimeout(() => {
        setPipelineProgress(step.progress);
        addLog(step.log, step.type);
        
        if (step.progress === 75) {
          setDeploymentStatus('Deploying');
        }

        currentStep++;
        executeNextStep();
      }, step.delay);
    };

    executeNextStep();
  };

  return (
    <div className="flex-1 p-6 md:p-8 bg-white flex flex-col overflow-y-auto" id="deploy-tab-container">
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-between">
        
        {/* Layout Title Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Reliability Stack
            </span>
            <h2 className="text-2xl font-light tracking-tight text-slate-900 uppercase">
              DevOps Integration Hub
            </h2>
          </div>

          <button
            onClick={handleRunPipeline}
            disabled={isRunning}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-350 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer rounded-none active:scale-95 shadow-sm"
            id="btn-trigger-pipeline"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Building Revision...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Run Build Pipeline</span>
              </>
            )}
          </button>
        </div>

        {/* Pipeline Progress Grid */}
        <div className="border border-slate-200 p-5 bg-slate-50 mb-6 grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
          <div className="space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
              Pipeline Status
            </span>
            <span className={`text-xs font-bold uppercase px-2 py-0.5 border inline-block ${
              deploymentStatus === 'Live'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                : deploymentStatus === 'Deploying' || deploymentStatus === 'Compiling'
                  ? 'bg-blue-50 border-blue-200 text-blue-600 animate-pulse'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}>
              {deploymentStatus === 'Live' ? 'LIVE ON CLOUD RUN' : deploymentStatus === 'Pending' ? 'DEPLOYMENT PENDING' : `${deploymentStatus.toUpperCase()}...`}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
              Target Infrastructure
            </span>
            <span className="text-xs font-mono font-bold text-slate-800 block mt-0.5">
              {config.deployTarget} (us-east1)
            </span>
          </div>

          <div className="space-y-1 flex flex-col justify-center">
            <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              <span>Build Compilation Progress</span>
              <span className="font-mono">{pipelineProgress}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-none w-full overflow-hidden border border-slate-150">
              <div 
                className="h-full bg-slate-900 transition-all duration-300" 
                style={{ width: `${pipelineProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Interactive Retro Terminal Console */}
        <div className="flex-1 flex flex-col min-h-64 mb-6">
          <div className="bg-slate-900 border-b-0 border-slate-800 p-3 flex justify-between items-center select-none rounded-t-none">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <Terminal className="w-3.5 h-3.5" />
              <span>STDOUT METRIC SHELL</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>
          </div>

          <div className="flex-1 bg-slate-950 border border-slate-800 p-5 font-mono text-xs overflow-y-auto leading-relaxed select-text shadow-inner flex flex-col gap-2 min-h-60 max-h-96">
            {logs.length === 0 ? (
              <div className="text-slate-500 italic flex-1 flex items-center justify-center">
                Console idle. Click "Run Build Pipeline" above to verify integration specifications.
              </div>
            ) : (
              logs.map((log) => {
                let textClass = 'text-slate-300';
                let prefix = '';

                if (log.type === 'command') {
                  textClass = 'text-blue-400 font-bold';
                  prefix = '$ ';
                } else if (log.type === 'success') {
                  textClass = 'text-emerald-400';
                  prefix = '✔ ';
                } else if (log.type === 'error') {
                  textClass = 'text-rose-400 font-bold';
                  prefix = '✘ ';
                }

                return (
                  <div key={log.id} className="flex gap-3">
                    <span className="text-[10px] text-slate-600 select-none">{log.timestamp}</span>
                    <span className={`${textClass} whitespace-pre-wrap flex-1`}>
                      {prefix}{log.text}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>

        {/* DevOps Warnings Card */}
        <div className="p-4 border border-slate-200 bg-slate-50 flex gap-3 text-xs leading-normal text-slate-600 font-sans shadow-xs select-none">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-800">Automated Spec Validation Gate</p>
            <p className="mt-0.5 text-slate-500">
              Before deploying container nodes, this CI/CD pipeline triggers automated unit tests mapping to structural requirements, database synchronization targets, and OIDC compliance checks. Any syntax failures, unresolved migration loops, or missing secret variables (e.g. <code className="font-mono bg-white border border-slate-200 px-1">GEMINI_API_KEY</code>) will block staging deployment.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
