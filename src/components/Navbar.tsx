import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { Member, TeamInvitation } from '../types';
import { TuwaiqLogo } from './TuwaiqLogo';
import {
  Compass,
  Users,
  UserPlus,
  Sparkles,
  Layers,
  BarChart3,
  Flame,
  Menu,
  X,
  Bell,
  CheckCircle2,
  ChevronDown,
  UserCheck,
  LogOut,
  LogIn,
  Shield,
} from 'lucide-react';

export type NavSection =
  | 'home'
  | 'find_match'
  | 'directory'
  | 'build_team'
  | 'team_generator'
  | 'skill_map'
  | 'my_teams'
  | 'organizer';

interface NavbarProps {
  currentSection: NavSection;
  onNavigate: (section: NavSection) => void;
  currentUser: Member | null;
  authUser?: User | null;
  allMembers?: Member[];
  onOpenProfileSetup: () => void;
  onOpenSignIn?: () => void;
  onSignOut?: () => void;
  pendingInvitations?: TeamInvitation[];
  pendingInvitesCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSection,
  onNavigate,
  currentUser,
  authUser,
  allMembers = [],
  onOpenProfileSetup,
  onOpenSignIn,
  onSignOut,
  pendingInvitations = [],
  pendingInvitesCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const pendingCount =
    typeof pendingInvitesCount === 'number'
      ? pendingInvitesCount
      : (pendingInvitations?.length || 0);

  const navItems: { id: NavSection; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'Home', icon: <Flame className="w-4 h-4" /> },
    { id: 'find_match', label: 'Find My Team', icon: <Sparkles className="w-4 h-4 text-pink-400" /> },
    { id: 'directory', label: 'Members', icon: <Users className="w-4 h-4 text-cyan-400" /> },
    { id: 'build_team', label: 'Build a Team', icon: <Layers className="w-4 h-4 text-emerald-400" /> },
    { id: 'team_generator', label: 'Team Generator', icon: <Compass className="w-4 h-4 text-yellow-400" /> },
    { id: 'skill_map', label: 'Skill Map', icon: <BarChart3 className="w-4 h-4 text-orange-400" /> },
    {
      id: 'my_teams',
      label: 'My Teams',
      icon: <Users className="w-4 h-4 text-purple-400" />,
      badge: pendingCount > 0 ? `${pendingCount}` : undefined,
    },
    { id: 'organizer', label: 'Track Insights', icon: <BarChart3 className="w-4 h-4 text-blue-400" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#120726]/90 backdrop-blur-xl border-b border-purple-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div
            className="cursor-pointer"
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
          >
            <TuwaiqLogo size="md" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#1a0c36]/80 p-1.5 rounded-2xl border border-purple-800/40">
            {navItems.map((item) => {
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => onNavigate(item.id)}
                  className={`relative px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/80 border border-purple-400/30'
                      : 'text-slate-300 hover:text-white hover:bg-purple-900/30'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="w-4 h-4 rounded-full bg-pink-500 text-white text-[10px] font-black flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Current User & Switcher */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Notification bell for invitations */}
            <button
              id="btn-nav-notifications"
              onClick={() => onNavigate('my_teams')}
              className="relative p-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 text-slate-300 hover:text-white transition-colors border border-purple-800/40"
              title="Team Invitations"
            >
              <Bell className="w-4 h-4" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-pink-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* User Switcher Dropdown or Sign In / Create Profile */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="btn-user-switcher"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-[#1d0e3b] hover:bg-[#27134d] border border-purple-800/50 transition-colors text-left"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-xl object-cover ring-1 ring-purple-400"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-left">
                    <div className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                      <span className="truncate max-w-[90px]">{currentUser.name.split(' ')[0]}</span>
                      <ChevronDown className="w-3 h-3 text-purple-300" />
                    </div>
                    <div className="text-[10px] text-purple-300/80 leading-none">
                      {currentUser.skillCategories[0] || 'Member'}
                    </div>
                  </div>
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-[#1b0d38] border border-purple-700/50 rounded-2xl shadow-2xl shadow-purple-950/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-purple-900/50">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Active Profile</p>
                      <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-cyan-300 truncate">{currentUser.major}</p>
                    </div>

                    <div className="p-2 space-y-1">
                      <button
                        id="btn-edit-my-profile"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUserDropdownOpen(false);
                          onOpenProfileSetup();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-purple-200 hover:bg-purple-900/50 flex items-center gap-2"
                      >
                        <UserCheck className="w-4 h-4 text-purple-400" />
                        <span>Edit Profile & Skills</span>
                      </button>

                      {onSignOut && (
                        <button
                          id="btn-sign-out"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUserDropdownOpen(false);
                            onSignOut();
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-950/40 flex items-center gap-2 border-t border-purple-900/40 mt-1 pt-2"
                        >
                          <LogOut className="w-4 h-4 text-rose-400" />
                          <span>Sign Out</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : authUser ? (
              <div className="relative flex items-center gap-2">
                <button
                  id="btn-nav-create-profile"
                  onClick={onOpenProfileSetup}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-bold shadow-md shadow-purple-950 flex items-center gap-1.5 transition-transform active:scale-95 border border-white/20"
                >
                  <UserPlus className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Complete Tuwaiq Profile</span>
                </button>

                {onSignOut && (
                  <button
                    id="btn-nav-signout-desktop"
                    onClick={onSignOut}
                    className="p-2 rounded-xl bg-purple-950/80 hover:bg-rose-950/60 text-purple-300 hover:text-rose-300 border border-purple-800/40 transition-colors"
                    title={`Signed in as ${authUser.email || 'user'}. Click to sign out.`}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="relative flex items-center gap-2">
                <button
                  id="btn-nav-create-profile"
                  onClick={onOpenProfileSetup}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-bold shadow-md shadow-purple-950 flex items-center gap-1.5 transition-transform active:scale-95 border border-white/20"
                >
                  <UserPlus className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Create Student Profile</span>
                </button>

                {onOpenSignIn && (
                  <button
                    id="btn-nav-signin"
                    onClick={onOpenSignIn}
                    className="px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900/80 text-purple-200 border border-purple-700/50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            )}

            {/* If user has an active profile, show quick edit button */}
            {currentUser && (
              <button
                id="btn-nav-edit-profile"
                onClick={onOpenProfileSetup}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-950/60 flex items-center gap-1.5 transition-transform active:scale-95"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              id="btn-nav-mobile-notifications"
              onClick={() => onNavigate('my_teams')}
              className="relative p-2 rounded-xl bg-purple-950 text-slate-300"
            >
              <Bell className="w-4 h-4" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-white text-[9px] font-black flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              id="btn-toggle-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-purple-950/80 text-white border border-purple-800/40"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#15092c] border-b border-purple-900/60 px-4 pt-2 pb-6 space-y-2">
          {/* Current user mobile summary */}
          {currentUser ? (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-950/50 border border-purple-800/40 mb-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-xl object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="text-sm font-bold text-white">{currentUser.name}</div>
                  <div className="text-xs text-purple-300">{currentUser.major}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenProfileSetup();
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-purple-800 text-purple-100 text-xs font-semibold hover:bg-purple-700"
                >
                  Edit
                </button>
                {onSignOut && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onSignOut();
                    }}
                    className="p-1.5 rounded-lg bg-rose-950/60 text-rose-300 hover:bg-rose-900/60"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : authUser ? (
            <div className="p-3 rounded-2xl bg-purple-950/50 border border-purple-800/40 mb-3 flex items-center justify-between gap-2">
              <div className="truncate mr-2">
                <div className="text-xs font-bold text-white truncate">
                  {authUser.displayName || authUser.email?.split('@')[0] || 'Authenticated User'}
                </div>
                <div className="text-[11px] text-cyan-300">Signed In • No profile yet</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenProfileSetup();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-xs font-bold"
                >
                  Complete Profile
                </button>
                {onSignOut && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onSignOut();
                    }}
                    className="p-1.5 rounded-lg bg-rose-950/60 text-rose-300 hover:bg-rose-900/60"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-purple-950/50 border border-purple-800/40 mb-3 flex items-center justify-between gap-2">
              <div>
                <div className="text-sm font-bold text-white">Guest Visitor</div>
                <div className="text-xs text-purple-300">Join the talent pool</div>
              </div>
              <div className="flex items-center gap-2">
                {onOpenSignIn && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenSignIn();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-purple-900/70 text-purple-200 border border-purple-700/50 text-xs font-semibold"
                  >
                    Sign In
                  </button>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenProfileSetup();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-xs font-bold"
                >
                  Create
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-3 rounded-xl text-left text-xs font-bold flex items-center justify-between ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-950/40 text-slate-300 hover:bg-purple-900/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full bg-pink-500 text-white text-[10px]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenProfileSetup();
            }}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold text-center flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New Profile</span>
          </button>
        </div>
      )}
    </header>
  );
};
