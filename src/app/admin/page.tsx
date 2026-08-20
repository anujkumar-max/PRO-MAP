'use client';

import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, Loader2, Download, Users, FolderKanban, Briefcase } from 'lucide-react';
import { importExcelData } from '@/lib/excel-import';
import { useDashboardStats } from '@/lib/hooks/useRealtimeData';
import * as xlsx from 'xlsx';
import { cn } from '@/lib/utils';

export default function AdminPage() {
  const { stats, loading, persons, projects, assignments } = useDashboardStats();
  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ projects: number; persons: number; assignments: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setError(null);
    try {
      const res = await importExcelData(file);
      setResult(res);
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleExport = () => {
    const wb = xlsx.utils.book_new();
    const personData = persons.map(p => ({
      'PRO-ID': p.proId,
      'Name': p.name,
      'Rank': p.rank,
      'Status': p.status
    }));
    const wsPersons = xlsx.utils.json_to_sheet(personData);
    xlsx.utils.book_append_sheet(wb, wsPersons, 'Persons');

    const projectData = projects.map(p => ({
      'Project': p.name,
      'Status': p.status,
      'DSP': p.hierarchy?.dsp || '',
      'CI': p.hierarchy?.ci || '',
      'SI': p.hierarchy?.si || ''
    }));
    const wsProjects = xlsx.utils.json_to_sheet(projectData);
    xlsx.utils.book_append_sheet(wb, wsProjects, 'Projects');

    xlsx.writeFile(wb, 'PRO-MAP-Export.xlsx');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Data Management</h1>
        <p className="text-slate-400">Import, export, and manage PRO-MAP system data.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
            <FolderKanban size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Total Projects</p>
            <p className="text-2xl font-bold text-white">{loading ? '...' : stats.totalProjects}</p>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Total Persons</p>
            <p className="text-2xl font-bold text-white">{loading ? '...' : stats.totalPersonnel}</p>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Total Assignments</p>
            <p className="text-2xl font-bold text-white">{loading ? '...' : assignments.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Import */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <FileSpreadsheet className="text-blue-400" />
            Import Excel Data
          </h2>
          
          <label 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors block",
              isDragActive ? "border-blue-500 bg-blue-500/10" : "border-slate-700 hover:border-slate-500 hover:bg-slate-800/50",
              file && "border-emerald-500/50 bg-emerald-500/5"
            )}
          >
            <input 
              type="file" 
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="hidden" 
            />
            {file ? (
              <div className="space-y-2">
                <FileSpreadsheet className="w-12 h-12 mx-auto text-emerald-400" />
                <p className="text-emerald-400 font-medium">{file.name}</p>
                <p className="text-slate-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div className="space-y-2">
                <UploadCloud className="w-12 h-12 mx-auto text-slate-400" />
                <p className="text-slate-300 font-medium">Drag & drop an Excel file here</p>
                <p className="text-slate-500 text-sm">or click to browse (.xlsx, .xls)</p>
              </div>
            )}
          </label>

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">
              Successfully imported {result.projects} projects, {result.persons} persons, and {result.assignments} assignments.
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={!file || importing}
            className="mt-6 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors flex justify-center items-center gap-2"
          >
            {importing ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                Importing...
              </>
            ) : (
              'Start Import'
            )}
          </button>
        </div>

        {/* Export & Manual Data */}
        <div className="space-y-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Download className="text-blue-400" />
              Export Data
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              Export all system data to an Excel file for backup or external analysis.
            </p>
            <button
              onClick={handleExport}
              disabled={loading}
              className="py-3 px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 border border-slate-700 hover:border-slate-600"
            >
              <Download className="w-5 h-5" />
              Export All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
