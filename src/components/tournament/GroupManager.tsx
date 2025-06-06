"use client";

import type { Group, Team, Player, Match, PlayerPosition, MatchResult } from '@/types/tournament';
import { playerPositions, playerPositionTranslations, matchResults, matchResultTranslations, goalOptions } from '@/types/tournament';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Users, Shield, UserPlus, Trash2, Edit3, Save, XCircle, Swords, Target } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";


export function GroupManager() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const { toast } = useToast();

  // Effect to load data from localStorage on component mount
  useEffect(() => {
    const savedGroups = localStorage.getItem('tournamentGroups');
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups));
    }
  }, []);

  // Effect to save data to localStorage whenever groups change
  useEffect(() => {
    localStorage.setItem('tournamentGroups', JSON.stringify(groups));
  }, [groups]);


  const handleAddGroup = () => {
    if (!newGroupName.trim()) {
      toast({ title: "خطأ", description: "الرجاء إدخال اسم للمجموعة.", variant: "destructive" });
      return;
    }
    const newGroup: Group = {
      id: crypto.randomUUID(),
      name: newGroupName,
      teams: [],
      matches: [],
    };
    setGroups(prev => [...prev, newGroup]);
    setNewGroupName('');
    toast({ title: "نجاح", description: `تمت إضافة المجموعة "${newGroupName}" بنجاح.` });
  };

  const handleDeleteGroup = (groupId: string) => {
    setGroups(prev => prev.filter(g => g.id !== groupId));
    toast({ title: "نجاح", description: "تم حذف المجموعة." });
  };

  const handleAddTeam = (groupId: string, teamName: string) => {
    if (!teamName.trim()) {
      toast({ title: "خطأ", description: "الرجاء إدخال اسم للفريق.", variant: "destructive" });
      return;
    }
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        if (group.teams.find(t => t.name.toLowerCase() === teamName.toLowerCase())) {
          toast({ title: "خطأ", description: `الفريق "${teamName}" موجود بالفعل في هذه المجموعة.`, variant: "destructive" });
          return group;
        }
        const newTeam: Team = { id: crypto.randomUUID(), name: teamName, players: [], points: 0 };
        return { ...group, teams: [...group.teams, newTeam] };
      }
      return group;
    }));
    toast({ title: "نجاح", description: `تمت إضافة الفريق "${teamName}".` });
  };

  const handleDeleteTeam = (groupId: string, teamId: string) => {
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        const updatedTeams = group.teams.filter(t => t.id !== teamId);
        // Also remove matches involving this team
        const updatedMatches = group.matches.filter(m => m.teamAId !== teamId && m.teamBId !== teamId);
        // Recalculate points for all teams in the group
        const finalTeams = updatedTeams.map(team => {
          let newPoints = 0;
          updatedMatches.forEach(match => {
            if (match.teamAId === team.id && typeof match.teamAScore === 'number') newPoints += match.teamAScore;
            if (match.teamBId === team.id && typeof match.teamBScore === 'number') newPoints += match.teamBScore;
          });
          return { ...team, points: newPoints };
        });
        return { ...group, teams: finalTeams, matches: updatedMatches };
      }
      return group;
    }));
    toast({ title: "نجاح", description: "تم حذف الفريق والمباريات المرتبطة به." });
  };


  const handleAddPlayer = (groupId: string, teamId: string, playerName: string, position: PlayerPosition) => {
     if (!playerName.trim()) {
      toast({ title: "خطأ", description: "الرجاء إدخال اسم اللاعب.", variant: "destructive" });
      return;
    }
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          teams: group.teams.map(team => {
            if (team.id === teamId) {
              if (team.players.find(p => p.name.toLowerCase() === playerName.toLowerCase())) {
                 toast({ title: "خطأ", description: `اللاعب "${playerName}" موجود بالفعل في هذا الفريق.`, variant: "destructive" });
                 return team;
              }
              const newPlayer: Player = { id: crypto.randomUUID(), name: playerName, position, goals: 0 };
              return { ...team, players: [...team.players, newPlayer] };
            }
            return team;
          })
        };
      }
      return group;
    }));
    toast({ title: "نجاح", description: `تمت إضافة اللاعب "${playerName}".` });
  };

  const handleDeletePlayer = (groupId: string, teamId: string, playerId: string) => {
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          teams: group.teams.map(team => {
            if (team.id === teamId) {
              return { ...team, players: team.players.filter(p => p.id !== playerId) };
            }
            return team;
          })
        };
      }
      return group;
    }));
    toast({ title: "نجاح", description: "تم حذف اللاعب." });
  };

  const handleUpdatePlayer = (groupId: string, teamId: string, playerId: string, newPosition?: PlayerPosition, newGoals?: number) => {
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          teams: group.teams.map(team => {
            if (team.id === teamId) {
              return {
                ...team,
                players: team.players.map(player => {
                  if (player.id === playerId) {
                    return { 
                      ...player, 
                      position: newPosition !== undefined ? newPosition : player.position,
                      goals: newGoals !== undefined ? newGoals : player.goals
                    };
                  }
                  return player;
                })
              };
            }
            return team;
          })
        };
      }
      return group;
    }));
  };

  const handleGenerateMatches = (groupId: string) => {
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        if (group.teams.length < 2) {
          toast({ title: "خطأ", description: "تحتاج إلى فريقين على الأقل لإنشاء المباريات.", variant: "destructive" });
          return group;
        }
        const newMatches: Match[] = [];
        for (let i = 0; i < group.teams.length; i++) {
          for (let j = i + 1; j < group.teams.length; j++) {
            newMatches.push({
              id: crypto.randomUUID(),
              teamAId: group.teams[i].id,
              teamBId: group.teams[j].id,
            });
          }
        }
        toast({ title: "نجاح", description: "تم إنشاء المباريات بنجاح." });
        return { ...group, matches: newMatches };
      }
      return group;
    }));
  };

  const handleUpdateMatchResult = (groupId: string, matchId: string, teamAResult: MatchResult) => {
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        let teamAScore = 0;
        let teamBScore = 0;

        if (teamAResult === "Win") { teamAScore = 3; teamBScore = 0; }
        else if (teamAResult === "Draw") { teamAScore = 1; teamBScore = 1; }
        else if (teamAResult === "Loss") { teamAScore = 0; teamBScore = 3; }

        const updatedMatches = group.matches.map(match =>
          match.id === matchId ? { ...match, teamAResult, teamAScore, teamBScore } : match
        );

        const updatedTeams = group.teams.map(team => {
          let newPoints = 0;
          updatedMatches.forEach(m => {
            if (m.teamAId === team.id && typeof m.teamAScore === 'number') newPoints += m.teamAScore;
            if (m.teamBId === team.id && typeof m.teamBScore === 'number') newPoints += m.teamBScore;
          });
          return { ...team, points: newPoints };
        });
        toast({ title: "نجاح", description: "تم تحديث نتيجة المباراة." });
        return { ...group, matches: updatedMatches, teams: updatedTeams };
      }
      return group;
    }));
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-primary border-2">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center gap-2">
            <PlusCircle className="w-7 h-7" /> إنشاء مجموعة جديدة
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 items-end">
          <div className="flex-grow">
            <Label htmlFor="new-group-name" className="text-muted-foreground">اسم المجموعة</Label>
            <Input
              id="new-group-name"
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="مثال: المجموعة أ"
              className="mt-1"
            />
          </div>
          <Button onClick={handleAddGroup} className="bg-primary hover:bg-primary/90">
            <PlusCircle className="ml-2 h-5 w-5" /> إضافة مجموعة
          </Button>
        </CardContent>
      </Card>

      {groups.length === 0 && (
        <Card className="text-center py-10">
          <CardContent>
            <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">لا توجد مجموعات حتى الآن.</p>
            <p className="text-sm text-muted-foreground">ابدأ بإضافة مجموعة جديدة أعلاه!</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map(group => (
          <GroupCard
            key={group.id}
            group={group}
            onAddTeam={handleAddTeam}
            onDeleteTeam={handleDeleteTeam}
            onAddPlayer={handleAddPlayer}
            onDeletePlayer={handleDeletePlayer}
            onUpdatePlayer={handleUpdatePlayer}
            onGenerateMatches={handleGenerateMatches}
            onUpdateMatchResult={handleUpdateMatchResult}
            onDeleteGroup={handleDeleteGroup}
          />
        ))}
      </div>
    </div>
  );
}

interface GroupCardProps {
  group: Group;
  onAddTeam: (groupId: string, teamName: string) => void;
  onDeleteTeam: (groupId: string, teamId: string) => void;
  onAddPlayer: (groupId: string, teamId: string, playerName: string, position: PlayerPosition) => void;
  onDeletePlayer: (groupId: string, teamId: string, playerId: string) => void;
  onUpdatePlayer: (groupId: string, teamId: string, playerId: string, newPosition?: PlayerPosition, newGoals?: number) => void;
  onGenerateMatches: (groupId: string) => void;
  onUpdateMatchResult: (groupId: string, matchId: string, teamAResult: MatchResult) => void;
  onDeleteGroup: (groupId: string) => void;
}

function GroupCard({ group, onAddTeam, onDeleteTeam, onAddPlayer, onDeletePlayer, onUpdatePlayer, onGenerateMatches, onUpdateMatchResult, onDeleteGroup }: GroupCardProps) {
  const [newTeamName, setNewTeamName] = useState('');
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPosition, setNewPlayerPosition] = useState<PlayerPosition>("Center Forward");
  const { toast } = useToast();

  const handleAddTeamSubmit = () => {
    onAddTeam(group.id, newTeamName);
    setNewTeamName('');
  };
  
  const handleAddPlayerSubmit = (teamId: string) => {
    onAddPlayer(group.id, teamId, newPlayerName, newPlayerPosition);
    setNewPlayerName('');
  };

  const getTeamName = (teamId: string) => group.teams.find(t => t.id === teamId)?.name || 'فريق غير معروف';

  return (
    <Card className="shadow-xl flex flex-col h-full border-accent">
      <CardHeader className="bg-accent/10">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-headline text-accent flex items-center gap-2">
            <Users className="w-7 h-7" /> {group.name}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => onDeleteGroup(group.id)} className="text-destructive hover:text-destructive/80">
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6 flex-grow">
        {/* Add Team Section */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="add-team">
            <AccordionTrigger className="text-lg font-semibold text-primary hover:text-primary/80">
                <UserPlus className="ml-2 h-5 w-5" /> إضافة فريق جديد
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <div className="flex gap-2 items-end p-1">
                <div className="flex-grow">
                  <Label htmlFor={`team-name-${group.id}`} className="text-muted-foreground">اسم الفريق</Label>
                  <Input id={`team-name-${group.id}`} value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder="اسم الفريق" className="mt-1" />
                </div>
                <Button onClick={handleAddTeamSubmit} size="sm" className="bg-primary hover:bg-primary/90"><PlusCircle className="ml-1 h-4 w-4" />إضافة</Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        {/* Teams List */}
        {group.teams.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-3 text-primary flex items-center gap-2"><Shield className="w-6 h-6" /> الفرق ({group.teams.length})</h3>
            <div className="space-y-4">
              {group.teams.map(team => (
                <Card key={team.id} className="bg-background/50 p-4 rounded-lg shadow">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-lg font-semibold text-foreground">{team.name} - <span className="text-accent font-bold">{team.points} نقاط</span></h4>
                    <Button variant="ghost" size="icon" onClick={() => onDeleteTeam(group.id, team.id)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value={`players-${team.id}`}>
                      <AccordionTrigger className="text-primary hover:text-primary/80">
                        <Users className="ml-2 h-5 w-5" /> اللاعبون ({team.players.length})
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 space-y-3">
                        {team.players.map(player => (
                          <div key={player.id} className="flex items-center gap-2 p-2 border rounded-md bg-muted/20">
                            <span className="flex-grow font-medium text-sm">{player.name}</span>
                            <Select 
                              value={player.position}
                              onValueChange={(newPos) => onUpdatePlayer(group.id, team.id, player.id, newPos as PlayerPosition, undefined)}
                            >
                              <SelectTrigger className="w-[180px] text-xs h-8"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {playerPositions.map(pos => <SelectItem key={pos} value={pos} className="text-xs">{playerPositionTranslations[pos]}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <Select
                              value={String(player.goals)}
                              onValueChange={(newGoals) => onUpdatePlayer(group.id, team.id, player.id, undefined, parseInt(newGoals))}
                            >
                              <SelectTrigger className="w-[80px] text-xs h-8"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {goalOptions.map(g => <SelectItem key={g} value={String(g)} className="text-xs">{g}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <Button variant="ghost" size="icon" onClick={() => onDeletePlayer(group.id, team.id, player.id)} className="text-destructive hover:text-destructive/80 w-8 h-8">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                        <div className="flex gap-2 items-end pt-2 border-t mt-3">
                          <Input value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} placeholder="اسم اللاعب" className="flex-grow text-sm h-9" />
                          <Select value={newPlayerPosition} onValueChange={(pos) => setNewPlayerPosition(pos as PlayerPosition)}>
                            <SelectTrigger className="w-[150px] text-xs h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {playerPositions.map(pos => <SelectItem key={pos} value={pos} className="text-xs">{playerPositionTranslations[pos]}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <Button onClick={() => handleAddPlayerSubmit(team.id)} size="sm" className="bg-primary hover:bg-primary/90 h-9"><PlusCircle className="ml-1 h-4 w-4" />إضافة لاعب</Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </Card>
              ))}
            </div>
          </div>
        )}
        {group.teams.length === 0 && <p className="text-muted-foreground text-sm">لم تتم إضافة أي فرق إلى هذه المجموعة بعد.</p>}

        <Separator className="my-6" />

        {/* Matches Section */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-semibold text-primary flex items-center gap-2"><Swords className="w-6 h-6" /> المباريات</h3>
            {group.teams.length >= 2 && group.matches.length === 0 && (
              <Button onClick={() => onGenerateMatches(group.id)} size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <PlusCircle className="ml-2 h-4 w-4" /> إنشاء المباريات
              </Button>
            )}
          </div>
          {group.matches.length > 0 ? (
            <div className="space-y-3">
              {group.matches.map(match => (
                <Card key={match.id} className="p-3 bg-background/50 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{getTeamName(match.teamAId)}</span>
                    <span className="text-muted-foreground">مقابل</span>
                    <span className="font-medium text-foreground">{getTeamName(match.teamBId)}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground whitespace-nowrap">نتيجة {getTeamName(match.teamAId)}:</Label>
                    <Select
                      value={match.teamAResult}
                      onValueChange={(res) => onUpdateMatchResult(group.id, match.id, res as MatchResult)}
                    >
                      <SelectTrigger className="flex-grow h-9 text-xs">
                        <SelectValue placeholder="اختر النتيجة" />
                      </SelectTrigger>
                      <SelectContent>
                        {matchResults.map(res => <SelectItem key={res} value={res} className="text-xs">{matchResultTranslations[res]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {match.teamAResult && (
                    <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
                      <p>نقاط {getTeamName(match.teamAId)}: <span className="font-bold text-accent">{match.teamAScore}</span></p>
                      <p>نقاط {getTeamName(match.teamBId)}: <span className="font-bold text-accent">{match.teamBScore}</span></p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              {group.teams.length < 2 ? "أضف فريقين على الأقل لإنشاء المباريات." : "لم يتم إنشاء المباريات بعد."}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
         <p className="text-xs text-muted-foreground w-full text-center">مجموعة: {group.name}</p>
      </CardFooter>
    </Card>
  );
}

