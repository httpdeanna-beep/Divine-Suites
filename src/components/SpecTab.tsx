/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Edit3, Check, RotateCcw, FileText, Download } from 'lucide-react';

interface SpecSection {
  id: string;
  title: string;
  paragraphs: string[];
}

interface SpecTabProps {
  specSections: SpecSection[];
  onUpdateSection: (sectionIndex: number, paragraphIndex: number, newValue: string) => void;
  onResetToDefault: () => void;
}

export default function SpecTab({ specSections, onUpdateSection, onResetToDefault }: SpecTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCell, setEditingCell] = useState<{ sectionIdx: number; paraIdx: number } | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleStartEdit = (sectionIdx: number, paraIdx: number, currentText: string) => {
    setEditingCell({ sectionIdx, paraIdx });
    setEditValue(currentText);
  };

  const handleSaveEdit = (sectionIdx: number, paraIdx: number) => {
    onUpdateSection(sectionIdx, paraIdx, editValue);
    setEditingCell(null);
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
  };

  // Simple highlight renderer
  const renderTextWithHighlights = (text: string) => {
    if (!searchTerm) return text;
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === searchTerm.toLowerCase() ? (
            <mark key={i} className="bg-yellow-100 text-slate-950 font-medium px-0.5">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const handleDownloadMarkdown = () => {
    let mdContent = `# DIVINE SUITES: CORE SYSTEM SPECIFICATION\n\n`;
    mdContent += `**Reference:** DS-PRD-2024-001 / CONFIDENTIAL\n`;
    mdContent += `**Date:** July 5, 2026\n\n`;
    mdContent += `---\n\n`;

    specSections.forEach((section) => {
      mdContent += `## ${section.id}. ${section.title}\n\n`;
      section.paragraphs.forEach((para) => {
        mdContent += `${para}\n\n`;
      });
      mdContent += `---\n\n`;
    });

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'divine-suites-specification.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 bg-white p-6 md:p-12 flex flex-col overflow-y-auto" id="spec-document-container">
      <div className="max-w-3xl mx-auto w-full flex flex-col h-full">
        
        {/* Document Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-8 select-none">
          <div className="flex flex-col">
            <h2 className="text-sm font-mono text-slate-400">DS-PRD-2024-001 / CORE SPECIFICATION</h2>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-none inline-block"></span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                VERIFIED RELEASE
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5">
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search specifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-slate-200 bg-slate-50 text-xs w-48 focus:outline-none focus:border-slate-800 focus:bg-white font-sans placeholder-slate-400 transition-all rounded-none"
              />
            </div>

            <button
              onClick={onResetToDefault}
              className="p-2 border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-all cursor-pointer bg-white rounded-none active:scale-95 flex items-center gap-1 text-xs"
              title="Reset specs to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset Default</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="p-2 border border-slate-800 bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer rounded-none active:scale-95 flex items-center gap-1.5 text-xs font-bold"
              title="Download Markdown spec document"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Markdown</span>
            </button>
          </div>
        </div>

        {/* Central Document Canvas */}
        <article className="flex-1 space-y-10">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-light tracking-tight text-slate-900 mb-2 font-sans uppercase">
              Divine Suites System Specification
            </h1>
            <p className="text-xs font-mono text-slate-400 tracking-wider">
              REVISION RELEASED: JULY 05, 2026 • AUTHORIZED FOR WORKSPACE BUILD
            </p>
          </header>

          <div className="space-y-10">
            {specSections.map((section, sectionIdx) => (
              <section key={section.id} className="group relative border-l-2 border-slate-100 hover:border-slate-800 pl-6 transition-all duration-300">
                <div className="absolute -left-[5px] top-1.5 w-2 h-2 bg-slate-200 group-hover:bg-slate-900 transition-colors" />
                
                <h3 className="text-sm font-mono uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-900 transition-colors mb-4 flex items-center gap-2">
                  <span className="font-bold text-slate-800">{section.id}.</span>
                  <span>{section.title}</span>
                </h3>

                <div className="space-y-5">
                  {section.paragraphs.map((para, paraIdx) => {
                    const isEditing = editingCell?.sectionIdx === sectionIdx && editingCell?.paraIdx === paraIdx;

                    return (
                      <div key={paraIdx} className="relative group/para p-2 -m-2 hover:bg-slate-50 transition-all duration-200">
                        {isEditing ? (
                          <div className="flex flex-col gap-2 mt-1">
                            <textarea
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              rows={5}
                              className="w-full text-sm leading-relaxed text-slate-700 bg-white border border-slate-400 p-3 focus:outline-none focus:border-slate-900 font-sans"
                            />
                            <div className="flex gap-2 self-end">
                              <button
                                onClick={handleCancelEdit}
                                className="px-3 py-1 text-xs border border-slate-200 text-slate-500 bg-white hover:bg-slate-100 font-bold tracking-wider uppercase cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEdit(sectionIdx, paraIdx)}
                                className="px-3 py-1 text-xs bg-slate-900 text-white hover:bg-slate-800 font-bold tracking-wider uppercase flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm md:text-base leading-relaxed text-slate-600 font-sans text-justify">
                              {renderTextWithHighlights(para)}
                            </p>

                            <button
                              onClick={() => handleStartEdit(sectionIdx, paraIdx, para)}
                              className="absolute top-2 right-2 opacity-0 group-hover/para:opacity-100 bg-white p-1.5 border border-slate-200 hover:border-slate-800 text-slate-500 hover:text-slate-900 transition-all cursor-pointer shadow-sm rounded-none flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold"
                              title="Edit this paragraph"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit Spec</span>
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </article>

        {/* Footer Page Indicators */}
        <div className="mt-16 pt-6 border-t border-slate-100 flex justify-between select-none text-[10px] uppercase font-bold tracking-widest text-slate-300">
          <div>Document Release: July 05, 2026</div>
          <div>DIVINE SUITES TECHNOLOGIES INC.</div>
          <div>Page 01 of 01</div>
        </div>
      </div>
    </div>
  );
}
