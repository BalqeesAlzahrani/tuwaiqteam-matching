import React, { useMemo, useState } from 'react';
import { Member, Team } from '../types';
import { Shield, Users, Layers, Trash2, Search, AlertTriangle } from 'lucide-react';

interface AdminDashboardProps {
  members: Member[];
  teams: Team[];
  onDeleteMember: (member: Member) => Promise<void>;
  onDeleteTeam: (team: Team) => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  members,
  teams,
  onDeleteMember,
  onDeleteTeam,
}) => {
  const [tab, setTab] = useState<'members' | 'teams'>('members');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const q = search.trim().toLowerCase();

  const filteredMembers = useMemo(
    () =>
      members.filter(
        (m) =>
          !q ||
          m.name?.toLowerCase().includes(q) ||
          m.contact?.email?.toLowerCase().includes(q) ||
          m.major?.toLowerCase().includes(q)
      ),
    [members, q]
  );

  const filteredTeams = useMemo(
    () => teams.filter((t) => !q || t.name?.toLowerCase().includes(q)),
    [teams, q]
  );

  const confirmAndRun = async (id: string, message: string, action: () => Promise<void>) => {
    if (!window.confirm(message)) return;
    setBusyId(id);
    try {
      await action();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center gap-3">
        <span className="p-2.5 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
          <Shield className="w-5 h-5" />
        </span>
        <div>
          <h2 className="text-2xl font-extrabold text-white">Admin Dashboard</h2>
          <p className="text-xs text-purple-300">
            Manage all member profiles and teams. Deletions are permanent.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1a0c36]/80 border border-purple-800/40 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs text-purple-300">
            <Users className="w-4 h-4 text-cyan-400" /> Profiles
          </div>
          <div className="text-3xl font-black text-white mt-1">{members.length}</div>
        </div>
        <div className="bg-[#1a0c36]/80 border border-purple-800/40 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs text-purple-300">
            <Layers className="w-4 h-4 text-emerald-400" /> Teams
          </div>
          <div className="text-3xl font-black text-white mt-1">{teams.length}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-[#1a0c36]/80 p-1.5 rounded-2xl border border-purple-800/40">
          {(['members', 'teams'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === t
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-purple-900/30'
              }`}
            >
              {t === 'members' ? 'Profiles' : 'Teams'}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or major…"
            className="w-full bg-[#1a0c36]/80 border border-purple-800/40 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-purple-400/60 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      <div className="bg-[#1a0c36]/80 border border-purple-800/40 rounded-2xl overflow-hidden">
        {tab === 'members' && (
          <ul className="divide-y divide-purple-900/40">
            {filteredMembers.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">{m.name}</div>
                  <div className="text-xs text-purple-300 truncate">
                    {[m.major, m.contact?.email].filter(Boolean).join(' • ')}
                  </div>
                  {!m.ownerUid && (
                    <div className="text-[11px] text-amber-300 flex items-center gap-1 mt-0.5">
                      <AlertTriangle className="w-3 h-3" /> No owner account linked
                    </div>
                  )}
                </div>
                <button
                  disabled={busyId === m.id}
                  onClick={() =>
                    confirmAndRun(
                      m.id,
                      `Delete the profile of "${m.name}"? This cannot be undone.`,
                      () => onDeleteMember(m)
                    )
                  }
                  className="shrink-0 px-3 py-2 rounded-xl bg-rose-950/60 text-rose-300 hover:bg-rose-900/60 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </li>
            ))}
            {filteredMembers.length === 0 && (
              <li className="p-6 text-center text-sm text-purple-300">No profiles found.</li>
            )}
          </ul>
        )}

        {tab === 'teams' && (
          <ul className="divide-y divide-purple-900/40">
            {filteredTeams.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">{t.name}</div>
                  <div className="text-xs text-purple-300">
                    {t.members?.length || 0} member{(t.members?.length || 0) === 1 ? '' : 's'}
                  </div>
                </div>
                <button
                  disabled={busyId === t.id}
                  onClick={() =>
                    confirmAndRun(
                      t.id,
                      `Delete the team "${t.name}"? This cannot be undone.`,
                      () => onDeleteTeam(t)
                    )
                  }
                  className="shrink-0 px-3 py-2 rounded-xl bg-rose-950/60 text-rose-300 hover:bg-rose-900/60 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </li>
            ))}
            {filteredTeams.length === 0 && (
              <li className="p-6 text-center text-sm text-purple-300">No teams found.</li>
            )}
          </ul>
        )}
      </div>
    </section>
  );
};
