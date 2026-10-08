'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { TeamData, TeamMember, DEFAULT_TEAM_DATA, PinColor } from '@/lib/teamTypes';

interface TeamEditorProps {
  onOpenMediaPicker: (onSelect: (url: string) => void) => void;
}

const PIN_COLORS: { label: string; value: PinColor; hex: string }[] = [
  { label: 'Purple (Generative)', value: 'purple', hex: '#7C5CFC' },
  { label: 'Dark / Zinc (Direction)', value: 'dark', hex: '#27272A' },
  { label: 'Blue (3D & Research)', value: 'blue', hex: '#2563EB' },
  { label: 'Pink (Finishing)', value: 'pink', hex: '#F43F5E' },
  { label: 'Orange (Founder)', value: 'orange', hex: '#FF5C26' },
];

export default function TeamEditor({ onOpenMediaPicker }: TeamEditorProps) {
  const [teamData, setTeamData] = useState<TeamData>(DEFAULT_TEAM_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [newTagInput, setNewTagInput] = useState('');

  // Load team data
  useEffect(() => {
    fetch('/api/studio/team', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.founder) {
          setTeamData(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load team data:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Save & Publish
  const handleSaveAndPublish = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const res = await fetch('/api/studio/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData),
      });

      if (res.ok) {
        setSaveStatus({
          type: 'success',
          message: 'TEAM content successfully updated and published to the live site!',
        });
        setTimeout(() => setSaveStatus(null), 5000);
      } else {
        const err = await res.json().catch(() => ({}));
        setSaveStatus({
          type: 'error',
          message: `Publish failed: ${err.error || res.statusText || 'Server error'}`,
        });
      }
    } catch (e: any) {
      setSaveStatus({
        type: 'error',
        message: `Publish request failed: ${e?.message || 'Network error'}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default
  const handleResetToDefaults = () => {
    if (confirm('Are you sure you want to reset all Team page content back to the initial default values?')) {
      setTeamData(DEFAULT_TEAM_DATA);
      setSaveStatus({
        type: 'success',
        message: 'Reset to initial defaults. Click "Save & Publish" to push to live site.',
      });
    }
  };

  // Founder Tag Management
  const handleAddExpertiseTag = () => {
    if (!newTagInput.trim()) return;
    setTeamData((prev) => ({
      ...prev,
      founder: {
        ...prev.founder,
        expertise: [...prev.founder.expertise, newTagInput.trim()],
      },
    }));
    setNewTagInput('');
  };

  const handleRemoveExpertiseTag = (index: number) => {
    setTeamData((prev) => ({
      ...prev,
      founder: {
        ...prev.founder,
        expertise: prev.founder.expertise.filter((_, i) => i !== index),
      },
    }));
  };

  // Team Member Management
  const handleAddMember = () => {
    const nextIdx = teamData.members.length + 1;
    const nextId = String(nextIdx + 1).padStart(2, '0');
    const newMember: TeamMember = {
      id: nextId,
      name: 'Team Member',
      role: 'Creative Specialist',
      ref: `BENCH // ${String(nextIdx).padStart(2, '0')}`,
      department: 'Visual Studio',
      hasPin: true,
      pinColor: 'purple',
      tag: 'IN PROGRESS',
      bg: '#F5F2FF',
      textColor: '#6D28D9',
      borderColor: '#DDD6FE',
      rotationClass: 'rotate-0 sm:rotate-[1.0deg] lg:translate-y-2 hover:rotate-0 hover:translate-y-0',
      note: '✎ visual production',
      image: '',
    };
    setTeamData((prev) => ({
      ...prev,
      members: [...prev.members, newMember],
    }));
  };

  const handleRemoveMember = (index: number) => {
    const member = teamData.members[index];
    if (confirm(`Are you sure you want to remove ${member.name} (${member.role})?`)) {
      setTeamData((prev) => ({
        ...prev,
        members: prev.members.filter((_, i) => i !== index),
      }));
    }
  };

  const handleMoveMember = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= teamData.members.length) return;
    const newMembers = [...teamData.members];
    const temp = newMembers[index];
    newMembers[index] = newMembers[targetIndex];
    newMembers[targetIndex] = temp;
    setTeamData((prev) => ({
      ...prev,
      members: newMembers,
    }));
  };

  const handleUpdateMember = (index: number, updates: Partial<TeamMember>) => {
    setTeamData((prev) => {
      const newMembers = [...prev.members];
      newMembers[index] = { ...newMembers[index], ...updates };
      return { ...prev, members: newMembers };
    });
  };

  if (isLoading) {
    return (
      <div className="p-10 max-w-5xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-zinc-400 text-sm">
          <span className="w-4 h-4 border-2 border-[#8B7CFF] border-t-transparent rounded-full animate-spin"></span>
          <span>Loading TEAM editor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-12">
      {/* ─────────────────────────────────────────────────────────────
          HEADER & PUBLISH BAR
      ───────────────────────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#8B7CFF]/10 text-[#8B7CFF] text-[10px] font-mono font-bold tracking-wider uppercase mb-2">
            GROTON STUDIO // PAGE CMS
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">TEAM Editor</h2>
          <p className="text-zinc-500 mt-1 text-sm">
            Manage the public /team creative board, founder details, team member cards, and careers CTA.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <a
            href="/team"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            View Live Page ↗
          </a>
          <button
            onClick={handleSaveAndPublish}
            disabled={isSaving}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-[#8B7CFF] hover:bg-[#7a6ce0] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#8B7CFF]/20"
          >
            {isSaving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Publishing...</span>
              </>
            ) : (
              'Save & Publish'
            )}
          </button>
        </div>
      </header>

      {/* STATUS TOAST NOTIFICATION */}
      {saveStatus && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
            saveStatus.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
              : 'bg-red-950/60 border-red-800/80 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="font-bold">{saveStatus.type === 'success' ? '✓' : '⚠'}</span>
            <span>{saveStatus.message}</span>
          </div>
          <button
            onClick={() => setSaveStatus(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. PAGE HERO / INTRO SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#8B7CFF] uppercase">SECTION 01</span>
            <h3 className="text-xl font-bold text-white">Board Header & Introduction</h3>
          </div>
          <span className="text-xs font-mono text-zinc-500">[ /team Header ]</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
              Category Badge
            </label>
            <input
              type="text"
              value={teamData.intro?.badge || 'THE COLLECTIVE'}
              onChange={(e) =>
                setTeamData((prev) => ({
                  ...prev,
                  intro: { ...prev.intro, badge: e.target.value },
                }))
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#8B7CFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
              Main Heading
            </label>
            <input
              type="text"
              value={teamData.intro?.heading || 'The people behind the visual system.'}
              onChange={(e) =>
                setTeamData((prev) => ({
                  ...prev,
                  intro: { ...prev.intro, heading: e.target.value },
                }))
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#8B7CFF]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
              Supporting Subtitle / Description
            </label>
            <textarea
              rows={2}
              value={teamData.intro?.description || ''}
              onChange={(e) =>
                setTeamData((prev) => ({
                  ...prev,
                  intro: { ...prev.intro, description: e.target.value },
                }))
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#8B7CFF]"
            />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. FOUNDER / DEEPAK KUMAWAT SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#FF5C26] uppercase">PRIMARY FEATURE</span>
            <h3 className="text-xl font-bold text-white">Founder Profile (Deepak Kumawat)</h3>
          </div>
          <span className="text-xs font-mono text-[#FF5C26] bg-[#FF5C26]/10 px-2 py-0.5 rounded border border-[#FF5C26]/20">
            PIN: ORANGE (3D)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Founder Image Preview & Actions */}
          <div className="md:col-span-4 flex flex-col gap-3">
            <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Profile Image
            </label>
            <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center p-3 text-center">
              {teamData.founder.image ? (
                <>
                  <Image
                    src={teamData.founder.image}
                    alt={teamData.founder.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2 text-[8px] font-mono bg-black/60 text-white px-1.5 py-0.5 rounded">
                    FOUNDER
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-4">
                  <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 mb-2">
                    <svg className="w-5 h-5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <circle cx="12" cy="12" r="8" strokeDasharray="2 2" />
                      <line x1="12" y1="4" x2="12" y2="20" strokeDasharray="1 2" />
                      <line x1="4" y1="12" x2="20" y2="12" strokeDasharray="1 2" />
                    </svg>
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 font-bold">
                    EDITORIAL PLACEHOLDER
                  </span>
                  <span className="text-[10px] text-zinc-500 mt-1 font-mono">
                    PORTRAIT / DK
                  </span>
                  <span className="text-[9px] text-zinc-600 mt-0.5">
                    (Currently using hand-drawn contact sheet)
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  onOpenMediaPicker((url) => {
                    setTeamData((prev) => ({
                      ...prev,
                      founder: { ...prev.founder, image: url },
                    }));
                  })
                }
                className="flex-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>{teamData.founder.image ? 'Replace Image' : 'Select Image'}</span>
              </button>
              {teamData.founder.image && (
                <button
                  type="button"
                  onClick={() =>
                    setTeamData((prev) => ({
                      ...prev,
                      founder: { ...prev.founder, image: '' },
                    }))
                  }
                  className="px-3 py-2 bg-red-950/40 hover:bg-red-900/50 text-red-400 border border-red-800/40 text-xs font-medium rounded-lg transition-colors"
                  title="Revert to hand-drawn contact sheet placeholder"
                >
                  Reset
                </button>
              )}
            </div>
            {teamData.founder.image && (
              <p className="text-[10px] font-mono text-zinc-500 truncate break-all">
                {teamData.founder.image}
              </p>
            )}
          </div>

          {/* Founder Profile Fields */}
          <div className="md:col-span-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={teamData.founder.name}
                  onChange={(e) =>
                    setTeamData((prev) => ({
                      ...prev,
                      founder: { ...prev.founder, name: e.target.value },
                    }))
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#8B7CFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
                  Position / Designation
                </label>
                <input
                  type="text"
                  value={teamData.founder.position}
                  onChange={(e) =>
                    setTeamData((prev) => ({
                      ...prev,
                      founder: { ...prev.founder, position: e.target.value },
                    }))
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#8B7CFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
                  Badge / Tag
                </label>
                <input
                  type="text"
                  value={teamData.founder.tag || '✦ SELECTED DIRECTION'}
                  onChange={(e) =>
                    setTeamData((prev) => ({
                      ...prev,
                      founder: { ...prev.founder, tag: e.target.value },
                    }))
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#8B7CFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={teamData.founder.email}
                  onChange={(e) =>
                    setTeamData((prev) => ({
                      ...prev,
                      founder: { ...prev.founder, email: e.target.value },
                    }))
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#8B7CFF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
                Founder Bio / Description
              </label>
              <textarea
                rows={4}
                value={teamData.founder.bio}
                onChange={(e) =>
                  setTeamData((prev) => ({
                    ...prev,
                    founder: { ...prev.founder, bio: e.target.value },
                  }))
                }
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#8B7CFF] leading-relaxed"
              />
            </div>

            {/* Directorial Focus Tags */}
            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
                Directorial Focus / Expertise Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {teamData.founder.expertise.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-800/80 border border-zinc-700 text-zinc-200 text-xs rounded-full"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExpertiseTag(i)}
                      className="text-zinc-400 hover:text-red-400 font-bold ml-0.5"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add expertise tag (e.g. Visual Synthesis)..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddExpertiseTag();
                    }
                  }}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8B7CFF]"
                />
                <button
                  type="button"
                  onClick={handleAddExpertiseTag}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors"
                >
                  Add Tag
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
                  Studio Name Credit
                </label>
                <input
                  type="text"
                  value={teamData.founder.studioName || 'Grafly Studio / GROTON AI'}
                  onChange={(e) =>
                    setTeamData((prev) => ({
                      ...prev,
                      founder: { ...prev.founder, studioName: e.target.value },
                    }))
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#8B7CFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
                  Pencil Annotation Note
                </label>
                <input
                  type="text"
                  value={teamData.founder.focusNote || '✎ core pipeline'}
                  onChange={(e) =>
                    setTeamData((prev) => ({
                      ...prev,
                      founder: { ...prev.founder, focusNote: e.target.value },
                    }))
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#8B7CFF]"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. TEAM MEMBER CARDS (REPEATABLE MANAGEMENT SYSTEM)
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800/80 pb-4">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#8B7CFF] uppercase">SECTION 02</span>
            <h3 className="text-xl font-bold text-white">
              Team Member Cards ({teamData.members.length})
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Repeatable pinned cards linked by hand-drawn editorial connector lines.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddMember}
            className="px-4 py-2 bg-[#8B7CFF]/15 hover:bg-[#8B7CFF]/25 text-[#8B7CFF] border border-[#8B7CFF]/30 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>+ Add Team Member</span>
          </button>
        </div>

        <div className="space-y-6">
          {teamData.members.map((member, index) => {
            const pinColorInfo = PIN_COLORS.find((p) => p.value === member.pinColor) || PIN_COLORS[0];
            return (
              <div
                key={member.id || index}
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 md:p-6 transition-all duration-200 hover:border-zinc-700"
              >
                {/* Card Top Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-[#8B7CFF] bg-[#8B7CFF]/10 px-2.5 py-1 rounded">
                      CARD {String(index + 1).padStart(2, '0')} // {member.ref || `BENCH // ${member.id}`}
                    </span>
                    <span
                      className="w-3 h-3 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: pinColorInfo.hex }}
                      title={`Pin color: ${member.pinColor}`}
                    />
                    <span className="text-xs font-mono text-zinc-400">
                      {member.name} — {member.role}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveMember(index, 'up')}
                      className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-zinc-300 text-xs font-mono rounded border border-zinc-800"
                      title="Move card up"
                    >
                      ↑ Move Up
                    </button>
                    <button
                      type="button"
                      disabled={index === teamData.members.length - 1}
                      onClick={() => handleMoveMember(index, 'down')}
                      className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-zinc-300 text-xs font-mono rounded border border-zinc-800"
                      title="Move card down"
                    >
                      ↓ Move Down
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(index)}
                      className="px-2.5 py-1 bg-red-950/40 hover:bg-red-900/60 text-red-400 text-xs font-mono rounded border border-red-900/40"
                      title="Remove card"
                    >
                      ✕ Remove
                    </button>
                  </div>
                </div>

                {/* Card Detail Content */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Photo area */}
                  <div className="md:col-span-3 flex flex-col gap-2.5">
                    <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                      Card Image
                    </label>
                    <div className="relative aspect-[4/5] w-full rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 flex flex-col items-center justify-center p-2 text-center">
                      {member.image ? (
                        <>
                          <Image
                            src={member.image}
                            alt={member.name}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-1.5 left-1.5 text-[7px] font-mono bg-black/60 text-white px-1 py-0.5 rounded">
                            {member.id}
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-2">
                          <svg className="w-5 h-5 text-zinc-600 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="8" strokeDasharray="2 2" strokeWidth={1.5} />
                          </svg>
                          <span className="font-mono text-[8px] uppercase tracking-wider text-zinc-400 font-bold">
                            PLACEHOLDER
                          </span>
                          <span className="text-[8px] text-zinc-600 font-mono mt-0.5">
                            {member.ref}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onOpenMediaPicker((url) => {
                            handleUpdateMember(index, { image: url });
                          })
                        }
                        className="flex-1 px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded transition-colors text-center"
                      >
                        {member.image ? 'Replace' : 'Select'}
                      </button>
                      {member.image && (
                        <button
                          type="button"
                          onClick={() => handleUpdateMember(index, { image: '' })}
                          className="px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/50 text-red-400 border border-red-800/40 text-xs rounded transition-colors"
                          title="Reset to placeholder"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                        Name
                      </label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => handleUpdateMember(index, { name: e.target.value })}
                        placeholder="e.g. Anonymous or Full Name"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#8B7CFF]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                        Role / Designation
                      </label>
                      <input
                        type="text"
                        value={member.role}
                        onChange={(e) => handleUpdateMember(index, { role: e.target.value })}
                        placeholder="e.g. Generative Art & AI"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#8B7CFF]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                        Bench Reference / Category
                      </label>
                      <input
                        type="text"
                        value={member.ref || ''}
                        onChange={(e) => handleUpdateMember(index, { ref: e.target.value })}
                        placeholder="e.g. BENCH // 01"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#8B7CFF]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                        Status / Tag Label
                      </label>
                      <input
                        type="text"
                        value={member.tag || ''}
                        onChange={(e) => handleUpdateMember(index, { tag: e.target.value })}
                        placeholder="e.g. IN PROGRESS, DIRECTION, EXPLORE, FINISHING"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#8B7CFF]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                        Hand-Drawn Note
                      </label>
                      <input
                        type="text"
                        value={member.note || ''}
                        onChange={(e) => handleUpdateMember(index, { note: e.target.value })}
                        placeholder="e.g. ✎ diffusion models"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#8B7CFF]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                        3D Pushpin Color
                      </label>
                      <select
                        value={member.pinColor || 'purple'}
                        onChange={(e) =>
                          handleUpdateMember(index, { pinColor: e.target.value as PinColor })
                        }
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#8B7CFF]"
                      >
                        {PIN_COLORS.map((pc) => (
                          <option key={pc.value} value={pc.value}>
                            {pc.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id={`pin-toggle-${index}`}
                        checked={member.hasPin !== false}
                        onChange={(e) => handleUpdateMember(index, { hasPin: e.target.checked })}
                        className="rounded border-zinc-800 text-[#8B7CFF] focus:ring-0"
                      />
                      <label htmlFor={`pin-toggle-${index}`} className="text-xs text-zinc-300 select-none">
                        Attach 3D Pushpin (uncheck to use paper tape clip)
                      </label>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}

          {teamData.members.length === 0 && (
            <div className="p-8 text-center border border-dashed border-zinc-800 rounded-xl text-zinc-500 text-xs">
              No team member cards present. Click &quot;+ Add Team Member&quot; to add one.
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. JOIN OUR TEAM (CAREERS & COLLABORATIONS) SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#8B7CFF] uppercase">SECTION 03</span>
            <h3 className="text-xl font-bold text-white">Join Our Team (Recruitment Banner)</h3>
          </div>
          <span className="text-xs font-mono text-zinc-500">[ /team Bottom CTA ]</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
              Badge / Eyebrow
            </label>
            <input
              type="text"
              value={teamData.join?.badge || 'CAREERS & COLLABORATIONS'}
              onChange={(e) =>
                setTeamData((prev) => ({
                  ...prev,
                  join: { ...prev.join, badge: e.target.value },
                }))
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#8B7CFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
              Heading
            </label>
            <input
              type="text"
              value={teamData.join?.heading || 'Join Our Team'}
              onChange={(e) =>
                setTeamData((prev) => ({
                  ...prev,
                  join: { ...prev.join, heading: e.target.value },
                }))
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#8B7CFF]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
              Supporting Description
            </label>
            <textarea
              rows={3}
              value={teamData.join?.description || ''}
              onChange={(e) =>
                setTeamData((prev) => ({
                  ...prev,
                  join: { ...prev.join, description: e.target.value },
                }))
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#8B7CFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
              CTA Button Text
            </label>
            <input
              type="text"
              value={teamData.join?.ctaText || 'Join Our Team'}
              onChange={(e) =>
                setTeamData((prev) => ({
                  ...prev,
                  join: { ...prev.join, ctaText: e.target.value },
                }))
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#8B7CFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
              WhatsApp Number (Country + Phone)
            </label>
            <input
              type="text"
              value={teamData.join?.whatsappNumber || '916378083205'}
              onChange={(e) =>
                setTeamData((prev) => ({
                  ...prev,
                  join: { ...prev.join, whatsappNumber: e.target.value },
                }))
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#8B7CFF]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
              Pre-filled WhatsApp Message Template
            </label>
            <textarea
              rows={5}
              value={teamData.join?.whatsappMessage || ''}
              onChange={(e) =>
                setTeamData((prev) => ({
                  ...prev,
                  join: { ...prev.join, whatsappMessage: e.target.value },
                }))
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#8B7CFF] font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
              Optional Direct CTA URL Override (leave blank for WhatsApp)
            </label>
            <input
              type="text"
              placeholder="e.g. https://wa.me/... or /contact"
              value={teamData.join?.ctaUrl || ''}
              onChange={(e) =>
                setTeamData((prev) => ({
                  ...prev,
                  join: { ...prev.join, ctaUrl: e.target.value },
                }))
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#8B7CFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
              CTA Subtext / Note
            </label>
            <input
              type="text"
              value={teamData.join?.subtext || 'Direct Inquiry via WhatsApp'}
              onChange={(e) =>
                setTeamData((prev) => ({
                  ...prev,
                  join: { ...prev.join, subtext: e.target.value },
                }))
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#8B7CFF]"
            />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          BOTTOM ACTIONS
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-zinc-800">
        <button
          type="button"
          onClick={handleResetToDefaults}
          className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs font-medium rounded-lg transition-colors"
        >
          Reset All Fields to Defaults
        </button>

        <div className="flex items-center gap-3">
          <a
            href="/team"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-lg text-xs font-medium transition-colors"
          >
            View Live Page ↗
          </a>
          <button
            onClick={handleSaveAndPublish}
            disabled={isSaving}
            className="px-8 py-3 bg-[#8B7CFF] hover:bg-[#7a6ce0] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-[#8B7CFF]/20"
          >
            {isSaving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Publishing to Live Site...</span>
              </>
            ) : (
              'Save & Publish Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
