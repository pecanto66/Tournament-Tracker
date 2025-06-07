
"use client";

import type { Group, Team, Player, PlayerPosition, Match, MatchResult } from '@/types/tournament';
import { playerPositions, playerPositionTranslations, matchResults, matchResultTranslations, goalOptions } from '@/types/tournament';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Users, Shield, UserPlus, Trash2, Edit3, Save, XCircle, Swords, Target, Trophy as TrophyIcon, Download, RefreshCcw, Upload, Printer } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

// Define a type for scorers that includes team and group context
type ScorerInfo = Player & { teamName: string; groupName?: string };


export function GroupManager() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [tournamentScorer, setTournamentScorer] = useState<ScorerInfo | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effect to load data from localStorage on component mount
  useEffect(() => {
    const savedGroups = localStorage.getItem('tournamentGroups');
    if (savedGroups) {
      try {
        const parsedGroups = JSON.parse(savedGroups);
        // Basic validation for loaded groups
        if (Array.isArray(parsedGroups) && parsedGroups.every(group => group.id && group.name && Array.isArray(group.teams) && Array.isArray(group.matches))) {
          setGroups(parsedGroups);
        } else {
          console.error("Invalid data structure in localStorage. Resetting.");
          localStorage.removeItem('tournamentGroups');
        }
      } catch (error) {
        console.error("Failed to parse groups from localStorage:", error);
        localStorage.removeItem('tournamentGroups'); // Clear corrupted data
      }
    }
  }, []);

  // Effect to save data to localStorage whenever groups change
  // and to update the tournament scorer
  useEffect(() => {
    localStorage.setItem('tournamentGroups', JSON.stringify(groups));

    let topScorer: ScorerInfo | null = null;
    let maxGoals = -1;

    groups.forEach(group => {
      group.teams.forEach(team => {
        team.players.forEach(player => {
          if (player.goals > maxGoals) {
            maxGoals = player.goals;
            topScorer = { ...player, teamName: team.name, groupName: group.name };
          } else if (player.goals === maxGoals && player.goals > 0) {
            if (topScorer && typeof topScorer.name === 'string' && typeof player.name === 'string') {
                 if (!topScorer.name.includes(player.name)) {
                    topScorer.name += ` & ${player.name}`;
                 }
            } else {
                 topScorer = { ...player, teamName: team.name, groupName: group.name };
            }
          }
        });
      });
    });
    if (maxGoals === 0 && topScorer) { 
        setTournamentScorer(null);
    } else {
        setTournamentScorer(topScorer);
    }

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
        const newTeam: Team = { id: crypto.randomUUID(), name: teamName, players: [], points: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0 };
        return { ...group, teams: [...group.teams, newTeam] };
      }
      return group;
    }));
    toast({ title: "نجاح", description: `تمت إضافة الفريق "${teamName}".` });
  };

  const handleDeleteTeam = (groupId: string, teamId: string) => {
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        const teamToDelete = group.teams.find(t => t.id === teamId);
        if (!teamToDelete) return group;

        const updatedTeams = group.teams.filter(t => t.id !== teamId);
        const updatedMatches = group.matches.filter(m => m.teamAId !== teamId && m.teamBId !== teamId);
        
        const finalTeams = updatedTeams.map(team => {
          let points = 0;
          let goalsFor = 0;
          let goalsAgainst = 0;

          updatedMatches.forEach(match => {
            if (match.teamAId === team.id && match.teamAResult) {
              if (match.teamAResult === 'Win') points += 3;
              if (match.teamAResult === 'Draw') points += 1;
              goalsFor += match.teamAScoreActual ?? 0;
              goalsAgainst += match.teamBScoreActual ?? 0;
            } else if (match.teamBId === team.id && match.teamAResult) {
              if (match.teamAResult === 'Loss') points += 3; 
              if (match.teamAResult === 'Draw') points += 1;
              goalsFor += match.teamBScoreActual ?? 0;
              goalsAgainst += match.teamAScoreActual ?? 0;
            }
          });
          return { ...team, points, goalsFor, goalsAgainst, goalDifference: goalsFor - goalsAgainst };
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
              teamAScoreActual: 0,
              teamBScoreActual: 0,
            });
          }
        }
        toast({ title: "نجاح", description: "تم إنشاء المباريات بنجاح." });
        return { ...group, matches: newMatches };
      }
      return group;
    }));
  };

  const handleUpdateMatchResult = (
    groupId: string, 
    matchId: string, 
    teamAResult: MatchResult, 
    teamAScoreActualInput?: number, 
    teamBScoreActualInput?: number
  ) => {
    setGroups(prevGroups => prevGroups.map(group => {
        if (group.id === groupId) {
            const updatedMatches = group.matches.map(match => {
                if (match.id === matchId) {
                    return { 
                        ...match, 
                        teamAResult, 
                        teamAScoreActual: teamAScoreActualInput ?? match.teamAScoreActual, 
                        teamBScoreActual: teamBScoreActualInput ?? match.teamBScoreActual 
                    };
                }
                return match;
            });

            const updatedTeams = group.teams.map(team => {
                let points = 0;
                let goalsFor = 0;
                let goalsAgainst = 0;

                updatedMatches.forEach(m => {
                    const teamAScores = m.teamAScoreActual ?? 0;
                    const teamBScores = m.teamBScoreActual ?? 0;

                    if (m.teamAId === team.id && m.teamAResult) {
                        if (m.teamAResult === 'Win') points += 3;
                        else if (m.teamAResult === 'Draw') points += 1;
                        goalsFor += teamAScores;
                        goalsAgainst += teamBScores;
                    } else if (m.teamBId === team.id && m.teamAResult) {
                        if (m.teamAResult === 'Loss') points += 3; 
                        else if (m.teamAResult === 'Draw') points += 1;
                        goalsFor += teamBScores;
                        goalsAgainst += teamAScores;
                    }
                });
                return { ...team, points, goalsFor, goalsAgainst, goalDifference: goalsFor - goalsAgainst };
            });
            toast({ title: "نجاح", description: "تم تحديث نتيجة المباراة." });
            return { ...group, matches: updatedMatches, teams: updatedTeams };
        }
        return group;
    }));
  };

  const handleBackupData = () => {
    try {
      const dataStr = JSON.stringify(groups, null, 2); // Pretty print JSON
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
      const exportFileDefaultName = `tournament_backup_${new Date().toISOString().slice(0,10)}.json`;
  
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      document.body.appendChild(linkElement); // Required for Firefox
      linkElement.click();
      document.body.removeChild(linkElement); // Clean up
      toast({ title: "نجاح", description: "تم تصدير البيانات بنجاح." });
    } catch (error) {
      console.error("Failed to backup data:", error);
      toast({ title: "خطأ", description: "فشل تصدير البيانات.", variant: "destructive" });
    }
  };

  const handleResetData = () => {
    setGroups([]);
    setNewGroupName('');
    setTournamentScorer(null);
    toast({ title: "نجاح", description: "تمت إعادة تعيين جميع بيانات البطولة.", variant: "default" });
  };

  const handleImportTrigger = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast({ title: "خطأ", description: "لم يتم تحديد أي ملف.", variant: "destructive" });
      return;
    }

    if (file.type !== "application/json") {
      toast({ title: "خطأ", description: "الرجاء تحديد ملف JSON صالح.", variant: "destructive" });
      if (event.target) event.target.value = ''; // Reset file input
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text === 'string') {
          const importedGroups = JSON.parse(text) as Group[];
          // Basic validation for the imported structure
          if (Array.isArray(importedGroups) && 
              importedGroups.every(group => 
                typeof group.id === 'string' && 
                typeof group.name === 'string' && 
                Array.isArray(group.teams) && 
                Array.isArray(group.matches) &&
                group.teams.every(team => 
                    typeof team.id === 'string' &&
                    typeof team.name === 'string' &&
                    Array.isArray(team.players) &&
                    typeof team.points === 'number' &&
                    team.players.every(player => 
                        typeof player.id === 'string' &&
                        typeof player.name === 'string' &&
                        typeof player.goals === 'number' &&
                        playerPositions.includes(player.position)
                    )
                ) &&
                group.matches.every(match =>
                    typeof match.id === 'string' &&
                    typeof match.teamAId === 'string' &&
                    typeof match.teamBId === 'string' 
                )
              )
            ) {
            setGroups(importedGroups);
            toast({ title: "نجاح", description: "تم استيراد البيانات بنجاح." });
          } else {
            throw new Error("ملف JSON ببنية بيانات غير صالحة.");
          }
        } else {
          throw new Error("فشل قراءة محتوى الملف.");
        }
      } catch (error: any) {
        console.error("Failed to import data:", error);
        toast({ title: "خطأ", description: `فشل استيراد البيانات. ${error.message || "تأكد من أن الملف بالتنسيق الصحيح."}`, variant: "destructive" });
      } finally {
          if(event.target) event.target.value = ''; // Reset file input to allow re-upload of same file
      }
    };
    reader.onerror = () => {
      toast({ title: "خطأ", description: "فشل قراءة الملف.", variant: "destructive" });
      if(event.target) event.target.value = ''; // Reset file input
    };
    reader.readAsText(file);
  };

  const handlePrintData = () => {
    window.print();
    toast({ title: "طباعة", description: "تم إرسال البيانات إلى نافذة الطباعة." });
  };


  return (
    <div className="space-y-8">
      {/* Tournament Scorer Card */}
      <Card className="shadow-lg border-primary border-2">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center gap-2">
            <TrophyIcon className="w-7 h-7 text-accent" /> هداف البطولة
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tournamentScorer && tournamentScorer.goals > 0 ? (
            <p className="text-lg">
              <strong className="text-accent">{tournamentScorer.name}</strong>
              {tournamentScorer.teamName && ` (${tournamentScorer.teamName}`}
              {tournamentScorer.groupName && `, ${tournamentScorer.groupName})`}
              {!tournamentScorer.groupName && tournamentScorer.teamName && ')'}
              <span className="mx-2">-</span>
              {tournamentScorer.goals} أهداف
            </p>
          ) : (
            <p className="text-lg text-muted-foreground">لم يسجل أي لاعب أهدافًا بعد.</p>
          )}
        </CardContent>
      </Card>

      {/* Data Management Card */}
      <Card className="shadow-lg border-primary border-2">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center gap-2">
             إدارة بيانات البطولة
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelected} 
            accept=".json" 
            className="hidden" 
            id="import-file-input"
          />
          <Button onClick={handleImportTrigger} variant="outline">
            <Upload className="ml-2 h-5 w-5" /> استيراد بيانات
          </Button>
          <Button onClick={handleBackupData} variant="outline">
            <Download className="ml-2 h-5 w-5" /> تصدير كل البيانات
          </Button>
          <Button onClick={handlePrintData} variant="outline">
            <Printer className="ml-2 h-5 w-5" /> طباعة كل البيانات
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <RefreshCcw className="ml-2 h-5 w-5" /> إعادة تعيين كل البيانات
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
              <AlertDialogHeader>
                <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
                <AlertDialogDescription>
                  سيؤدي هذا الإجراء إلى حذف جميع بيانات البطولة بشكل دائم (المجموعات، الفرق، اللاعبون، والمباريات). لا يمكن التراجع عن هذا الإجراء.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetData}>
                  نعم، قم بإعادة التعيين
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>


      {/* Create New Group Card */}
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
  onUpdateMatchResult: (groupId: string, matchId: string, teamAResult: MatchResult, teamAScoreActual?: number, teamBScoreActual?: number) => void;
  onDeleteGroup: (groupId: string) => void;
}

function GroupCard({ group, onAddTeam, onDeleteTeam, onAddPlayer, onDeletePlayer, onUpdatePlayer, onGenerateMatches, onUpdateMatchResult, onDeleteGroup }: GroupCardProps) {
  const [newTeamName, setNewTeamName] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPosition, setNewPlayerPosition] = useState<PlayerPosition>("Center Forward");
  
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [currentTeamAScore, setCurrentTeamAScore] = useState<number>(0);
  const [currentTeamBScore, setCurrentTeamBScore] = useState<number>(0);


  const { toast } = useToast();

  const handleAddTeamSubmit = () => {
    onAddTeam(group.id, newTeamName);
    setNewTeamName('');
  };
  
  const handleAddPlayerSubmit = (teamId: string) => {
    onAddPlayer(group.id, teamId, newPlayerName, newPlayerPosition);
    setNewPlayerName('');
    setNewPlayerPosition("Center Forward"); 
  };

  const getTeamName = (teamId: string) => group.teams.find(t => t.id === teamId)?.name || 'فريق غير معروف';

  const sortedTeams = useMemo(() => {
    return [...group.teams].sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      if (b.goalDifference !== a.goalDifference) {
        return (b.goalDifference ?? 0) - (a.goalDifference ?? 0);
      }
      return (b.goalsFor ?? 0) - (a.goalsFor ?? 0);
    });
  }, [group.teams]);

  const groupScorer = useMemo(() => {
    let scorer: ScorerInfo | null = null;
    let maxGoals = -1;
    group.teams.forEach(team => {
      team.players.forEach(player => {
        if (player.goals > maxGoals) {
          maxGoals = player.goals;
          scorer = { ...player, teamName: team.name };
        } else if (player.goals === maxGoals && player.goals > 0) {
            if (scorer && typeof scorer.name === 'string' && typeof player.name === 'string') {
                 if (!scorer.name.includes(player.name)) {
                    scorer.name += ` & ${player.name}`;
                 }
            } else {
                 scorer = { ...player, teamName: team.name };
            }
        }
      });
    });
    return maxGoals === 0 ? null : scorer;
  }, [group.teams]);

  const handleMatchScoreEdit = (match: Match) => {
    setEditingMatchId(match.id);
    setCurrentTeamAScore(match.teamAScoreActual ?? 0);
    setCurrentTeamBScore(match.teamBScoreActual ?? 0);
  };

  const handleMatchScoreSave = (matchId: string, teamAResult: MatchResult | undefined) => {
    if(teamAResult === undefined) {
        const match = group.matches.find(m => m.id === matchId);
        if (!match) return;

        let newTeamAResult: MatchResult;
        if (currentTeamAScore > currentTeamBScore) {
            newTeamAResult = "Win";
        } else if (currentTeamAScore < currentTeamBScore) {
            newTeamAResult = "Loss";
        } else {
            newTeamAResult = "Draw";
        }
        onUpdateMatchResult(group.id, matchId, newTeamAResult, currentTeamAScore, currentTeamBScore);
    } else {
        onUpdateMatchResult(group.id, matchId, teamAResult, currentTeamAScore, currentTeamBScore);
    }
    setEditingMatchId(null);
  };


  return (
    <Card className="shadow-xl flex flex-col h-full border-accent">
      <CardHeader className="bg-accent/10">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-headline text-accent flex items-center gap-2">
              <Users className="w-7 h-7" /> {group.name}
            </CardTitle>
            {groupScorer && groupScorer.goals > 0 && (
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                <Target className="w-4 h-4 text-primary" />
                <strong>هداف المجموعة:</strong> {groupScorer.name} ({groupScorer.teamName}) - {groupScorer.goals} أهداف
              </p>
            )}
             {(!groupScorer || groupScorer.goals === 0) && (
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    لم يسجل أي لاعب أهدافًا في هذه المجموعة بعد.
                </p>
            )}
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80">
                    <Trash2 className="w-5 h-5" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
              <AlertDialogHeader>
                <AlertDialogTitle>هل أنت متأكد من حذف المجموعة {group.name}؟</AlertDialogTitle>
                <AlertDialogDescription>
                  سيؤدي هذا الإجراء إلى حذف المجموعة وجميع الفرق واللاعبين والمباريات المرتبطة بها بشكل دائم. لا يمكن التراجع عن هذا الإجراء.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDeleteGroup(group.id)}>
                  نعم، قم بالحذف
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6 flex-grow">
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
        
        {sortedTeams.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-3 text-primary flex items-center gap-2"><Shield className="w-6 h-6" /> الفرق ({sortedTeams.length})</h3>
            <div className="space-y-4">
              {sortedTeams.map((team, index) => (
                <Card key={team.id} className="bg-background/50 p-4 rounded-lg shadow">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-lg font-semibold text-foreground flex items-center">
                      <span className="text-accent font-bold text-xl mr-2">{index + 1}.</span>
                      {team.name} 
                      <span className="text-sm text-muted-foreground mx-1">-</span> 
                      <span className="text-primary font-bold">{team.points} نقاط</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        (له: {team.goalsFor ?? 0}, عليه: {team.goalsAgainst ?? 0}, الفرق: {team.goalDifference ?? 0})
                      </span>
                    </h4>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent dir="rtl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>هل أنت متأكد من حذف الفريق {team.name}؟</AlertDialogTitle>
                            <AlertDialogDescription>
                              سيؤدي هذا الإجراء إلى حذف الفريق وجميع لاعبيه والمباريات المرتبطة به بشكل دائم. لا يمكن التراجع عن هذا الإجراء.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDeleteTeam(group.id, team.id)}>
                              نعم، قم بالحذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                  </div>
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value={`players-${team.id}`}>
                      <AccordionTrigger className="text-primary hover:text-primary/80">
                        <Users className="ml-2 h-5 w-5" /> اللاعبون ({team.players.length})
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 space-y-3">
                        {team.players.length > 0 ? team.players.map(player => (
                          <div key={player.id} className="flex items-center gap-2 p-2 border rounded-md bg-muted/20">
                            <span className="flex-grow font-medium text-sm">{player.name}</span>
                            <Select 
                              value={player.position}
                              onValueChange={(newPos) => onUpdatePlayer(group.id, team.id, player.id, newPos as PlayerPosition, undefined)}
                            >
                              <SelectTrigger className="w-[140px] text-xs h-8"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {playerPositions.map(pos => <SelectItem key={pos} value={pos} className="text-xs">{playerPositionTranslations[pos]}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <Label htmlFor={`goals-${player.id}`} className="text-xs sr-only">أهداف</Label>
                            <Select
                              value={String(player.goals)}
                              onValueChange={(newGoals) => onUpdatePlayer(group.id, team.id, player.id, undefined, parseInt(newGoals))}
                            >
                              <SelectTrigger className="w-[70px] text-xs h-8"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {goalOptions.map(g => <SelectItem key={g} value={String(g)} className="text-xs">{g}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <Button variant="ghost" size="icon" onClick={() => onDeletePlayer(group.id, team.id, player.id)} className="text-destructive hover:text-destructive/80 w-8 h-8">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )) : <p className="text-xs text-muted-foreground">لا يوجد لاعبون في هذا الفريق.</p>}
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
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium text-foreground">{getTeamName(match.teamAId)}</span>
                    <span className="text-muted-foreground mx-1">vs</span>
                    <span className="font-medium text-foreground">{getTeamName(match.teamBId)}</span>
                     <Button variant="ghost" size="icon" onClick={() => editingMatchId === match.id ? setEditingMatchId(null) : handleMatchScoreEdit(match)} className="text-primary hover:text-primary/80 w-7 h-7">
                        {editingMatchId === match.id ? <XCircle className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                    </Button>
                  </div>

                  {editingMatchId === match.id ? (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label htmlFor={`scoreA-${match.id}`} className="text-xs whitespace-nowrap">أهداف {getTeamName(match.teamAId)}:</Label>
                            <Input 
                                id={`scoreA-${match.id}`} 
                                type="number" 
                                value={currentTeamAScore} 
                                onChange={(e) => setCurrentTeamAScore(parseInt(e.target.value) < 0 ? 0 : parseInt(e.target.value))} 
                                className="w-16 h-8 text-xs" 
                                min="0"
                            />
                             <Label htmlFor={`scoreB-${match.id}`} className="text-xs whitespace-nowrap">أهداف {getTeamName(match.teamBId)}:</Label>
                             <Input 
                                id={`scoreB-${match.id}`} 
                                type="number" 
                                value={currentTeamBScore} 
                                onChange={(e) => setCurrentTeamBScore(parseInt(e.target.value) < 0 ? 0 : parseInt(e.target.value))} 
                                className="w-16 h-8 text-xs" 
                                min="0"
                            />
                        </div>
                        <Button onClick={() => handleMatchScoreSave(match.id, undefined)} size="sm" className="w-full">
                            <Save className="ml-2 h-4 w-4" /> حفظ النتيجة
                        </Button>
                    </div>
                  ) : (
                    <>
                      <div className="text-xs text-muted-foreground">
                        النتيجة: {getTeamName(match.teamAId)} {match.teamAScoreActual ?? 0} - {match.teamBScoreActual ?? 0} {getTeamName(match.teamBId)}
                      </div>
                      {match.teamAResult && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          <p>({matchResultTranslations[match.teamAResult]} لـ {getTeamName(match.teamAId)})</p>
                          <p>نقاط {getTeamName(match.teamAId)}: {match.teamAResult === 'Win' ? 3 : match.teamAResult === 'Draw' ? 1 : 0}</p>
                          <p>نقاط {getTeamName(match.teamBId)}: {match.teamAResult === 'Loss' ? 3 : match.teamAResult === 'Draw' ? 1 : 0}</p>
                        </div>
                      )}
                      {!match.teamAResult && <p className="text-xs text-muted-foreground mt-1">لم يتم تسجيل نتيجة المباراة بعد.</p>}
                    </>
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

