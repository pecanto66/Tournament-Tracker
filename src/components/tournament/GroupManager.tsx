
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
import { PlusCircle, Users, UserPlus, Trash2, Edit3, Save, XCircle, Swords, Target, Trophy as TrophyIcon, Download, RefreshCcw, Upload, Printer, ListOrdered, CloudUpload } from 'lucide-react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';


type ScorerInfo = Player & { teamName: string; groupName?: string };

const calculateTeamStats = (teams: Team[], matches: Match[]): Team[] => {
  return teams.map(team => {
    let points = 0;
    let played = 0;
    let won = 0;
    let drawn = 0;
    let lost = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    matches.forEach(match => {
      if (!match.teamAResult && (match.teamAScoreActual === undefined || match.teamBScoreActual === undefined)) return;

      const teamAScore = match.teamAScoreActual ?? 0;
      const teamBScore = match.teamBScoreActual ?? 0;
      let currentMatchTeamAResult = match.teamAResult;

      if(match.teamAScoreActual !== undefined && match.teamBScoreActual !== undefined) {
        if (teamAScore > teamBScore) currentMatchTeamAResult = 'Win';
        else if (teamAScore < teamBScore) currentMatchTeamAResult = 'Loss';
        else currentMatchTeamAResult = 'Draw';
      }


      if (match.teamAId === team.id) {
        if(currentMatchTeamAResult !== undefined) played++;
        goalsFor += teamAScore;
        goalsAgainst += teamBScore;
        if (currentMatchTeamAResult === 'Win') {
          points += 3;
          won++;
        } else if (currentMatchTeamAResult === 'Draw') {
          points += 1;
          drawn++;
        } else if (currentMatchTeamAResult === 'Loss') { 
          lost++;
        }
      } else if (match.teamBId === team.id) {
         if(currentMatchTeamAResult !== undefined) played++;
        goalsFor += teamBScore;
        goalsAgainst += teamAScore;
        if (currentMatchTeamAResult === 'Loss') { 
          points += 3;
          won++;
        } else if (currentMatchTeamAResult === 'Draw') {
          points += 1;
          drawn++;
        } else if (currentMatchTeamAResult === 'Win') {
          lost++;
        }
      }
    });
    return {
      ...team,
      points,
      played,
      won,
      drawn,
      lost,
      goalsFor,
      goalsAgainst,
      goalDifference: goalsFor - goalsAgainst,
    };
  });
};


export function GroupManager() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [tournamentScorer, setTournamentScorer] = useState<ScorerInfo | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, loading: authLoading } = useAuth();
  const dataLoadedRef = useRef(false); 
  const [isSavingToCloud, setIsSavingToCloud] = useState(false);

  const FIRESTORE_COLLECTION_NAME = "fnuc5TtzvSUS7TcIYztscye7TrP2";


  // Load data effect
  useEffect(() => {
    const loadData = async () => {
      if (authLoading) return; // Wait for auth state to be determined

      if (user) {
        // Try loading from Firestore first
        const userDocRef = doc(db, FIRESTORE_COLLECTION_NAME, user.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data && data.tournamentGroupsData && Array.isArray(data.tournamentGroupsData)) {
              let parsedGroups = data.tournamentGroupsData as Group[];
              // Apply migration/validation similar to localStorage loading
              parsedGroups = parsedGroups.map(group => ({
                ...group,
                id: group.id || crypto.randomUUID(),
                name: group.name || "Groupe sans nom",
                teams: Array.isArray(group.teams) ? group.teams.map(team => ({
                  ...team,
                  id: team.id || crypto.randomUUID(),
                  name: team.name || "Équipe sans nom",
                  players: Array.isArray(team.players) ? team.players.map(player => ({
                    ...player,
                    id: player.id || crypto.randomUUID(),
                    name: player.name || "Joueur sans nom",
                    position: player.position || "Center Forward",
                    goals: typeof player.goals === 'number' ? player.goals : 0,
                  })) : [],
                  points: typeof team.points === 'number' ? team.points : 0,
                  played: typeof team.played === 'number' ? team.played : 0,
                  won: typeof team.won === 'number' ? team.won : 0,
                  drawn: typeof team.drawn === 'number' ? team.drawn : 0,
                  lost: typeof team.lost === 'number' ? team.lost : 0,
                  goalsFor: typeof team.goalsFor === 'number' ? team.goalsFor : 0,
                  goalsAgainst: typeof team.goalsAgainst === 'number' ? team.goalsAgainst : 0,
                  goalDifference: typeof team.goalDifference === 'number' ? team.goalDifference : 0,
                })) : [],
                matches: Array.isArray(group.matches) ? group.matches.map(match => ({
                    ...match,
                    id: match.id || crypto.randomUUID(),
                    teamAScoreActual: match.teamAScoreActual ?? 0,
                    teamBScoreActual: match.teamBScoreActual ?? 0,
                })) : [],
              }));
              setGroups(parsedGroups.map(group => ({
                ...group,
                teams: calculateTeamStats(group.teams, group.matches)
              })));
              toast({ title: "Info", description: "Données chargées depuis le cloud." });
              dataLoadedRef.current = true;
              return; // Data loaded from Firestore, skip localStorage
            }
          }
        } catch (error) {
          console.error("Error loading data from Firestore:", error);
          toast({ title: "Erreur Cloud", description: "Impossible de charger les données depuis le cloud. Vérification du stockage local.", variant: "destructive" });
        }
      }

      // Fallback to localStorage if no user or Firestore load failed/empty
      const savedGroups = localStorage.getItem('tournamentGroups');
      if (savedGroups) {
        try {
          let parsedGroups = JSON.parse(savedGroups) as Group[];
          if (Array.isArray(parsedGroups)) {
            parsedGroups = parsedGroups.map(group => ({
              ...group,
              id: group.id || crypto.randomUUID(),
              name: group.name || "Groupe sans nom",
              teams: Array.isArray(group.teams) ? group.teams.map(team => ({
                ...team,
                id: team.id || crypto.randomUUID(),
                name: team.name || "Équipe sans nom",
                players: Array.isArray(team.players) ? team.players.map(player => ({
                  ...player,
                  id: player.id || crypto.randomUUID(),
                  name: player.name || "Joueur sans nom",
                  position: player.position || "Center Forward",
                  goals: typeof player.goals === 'number' ? player.goals : 0,
                })) : [],
                points: typeof team.points === 'number' ? team.points : 0,
                played: typeof team.played === 'number' ? team.played : 0,
                won: typeof team.won === 'number' ? team.won : 0,
                drawn: typeof team.drawn === 'number' ? team.drawn : 0,
                lost: typeof team.lost === 'number' ? team.lost : 0,
                goalsFor: typeof team.goalsFor === 'number' ? team.goalsFor : 0,
                goalsAgainst: typeof team.goalsAgainst === 'number' ? team.goalsAgainst : 0,
                goalDifference: typeof team.goalDifference === 'number' ? team.goalDifference : 0,
              })) : [],
              matches: Array.isArray(group.matches) ? group.matches.map(match => ({
                  ...match,
                  id: match.id || crypto.randomUUID(),
                  teamAScoreActual: match.teamAScoreActual ?? 0,
                  teamBScoreActual: match.teamBScoreActual ?? 0,
              })) : [],
            }));
            
            const validatedGroups = parsedGroups.filter(group => group.id && group.name && Array.isArray(group.teams) && Array.isArray(group.matches));
            if (validatedGroups.length === parsedGroups.length) {
               setGroups(validatedGroups.map(group => ({
                  ...group,
                  teams: calculateTeamStats(group.teams, group.matches)
               })));
            } else {
              console.error("Invalid data structure in localStorage after migration. Resetting.");
              localStorage.removeItem('tournamentGroups');
            }
          } else {
            console.error("Invalid data structure in localStorage. Resetting.");
            localStorage.removeItem('tournamentGroups');
          }
        } catch (error) {
          console.error("Failed to parse or migrate groups from localStorage:", error);
          localStorage.removeItem('tournamentGroups'); 
        }
      }
      dataLoadedRef.current = true;
    };

    loadData();
  }, [user, authLoading, toast]);


  // Save to localStorage and update scorer effect
  useEffect(() => {
    if (!dataLoadedRef.current) return; 

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
      toast({ title: "Erreur", description: "Veuillez entrer un nom pour le groupe.", variant: "destructive" });
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
    toast({ title: "Succès", description: `Le groupe "${newGroupName}" a été ajouté.` });
  };

  const handleDeleteGroup = (groupId: string) => {
    setGroups(prev => prev.filter(g => g.id !== groupId));
    toast({ title: "Succès", description: "Le groupe a été supprimé." });
  };

  const handleAddTeam = (groupId: string, teamName: string) => {
    if (!teamName.trim()) {
      toast({ title: "Erreur", description: "Veuillez entrer un nom pour l'équipe.", variant: "destructive" });
      return;
    }
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        if (group.teams.find(t => t.name.toLowerCase() === teamName.toLowerCase())) {
          toast({ title: "Erreur", description: `L'équipe "${teamName}" existe déjà dans ce groupe.`, variant: "destructive" });
          return group;
        }
        const newTeam: Team = { 
          id: crypto.randomUUID(), 
          name: teamName, 
          players: [], 
          points: 0, 
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0, 
          goalsAgainst: 0, 
          goalDifference: 0 
        };
        const updatedTeams = [...group.teams, newTeam];
        return { ...group, teams: calculateTeamStats(updatedTeams, group.matches) };
      }
      return group;
    }));
    toast({ title: "Succès", description: `L'équipe "${teamName}" a été ajoutée.` });
  };

  const handleDeleteTeam = (groupId: string, teamId: string) => {
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        const teamToDelete = group.teams.find(t => t.id === teamId);
        if (!teamToDelete) return group;

        const remainingTeams = group.teams.filter(t => t.id !== teamId);
        const updatedMatches = group.matches.filter(m => m.teamAId !== teamId && m.teamBId !== teamId);
        
        const finalTeamsWithStats = calculateTeamStats(remainingTeams, updatedMatches);
        return { ...group, teams: finalTeamsWithStats, matches: updatedMatches };
      }
      return group;
    }));
    toast({ title: "Succès", description: "L'équipe et ses matchs associés ont été supprimés." });
  };


  const handleAddPlayer = (groupId: string, teamId: string, playerName: string, position: PlayerPosition) => {
     if (!playerName.trim()) {
      toast({ title: "Erreur", description: "Veuillez entrer un nom pour le joueur.", variant: "destructive" });
      return;
    }
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          teams: group.teams.map(team => {
            if (team.id === teamId) {
              if (team.players.find(p => p.name.toLowerCase() === playerName.toLowerCase())) {
                 toast({ title: "Erreur", description: `Le joueur "${playerName}" existe déjà dans cette équipe.`, variant: "destructive" });
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
    toast({ title: "Succès", description: `Le joueur "${playerName}" a été ajouté.` });
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
    toast({ title: "Succès", description: "Le joueur a été supprimé." });
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
          toast({ title: "Erreur", description: "Il faut au moins deux équipes pour générer des matchs.", variant: "destructive" });
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
        const teamsWithResetStats = calculateTeamStats(group.teams, newMatches);
        toast({ title: "Succès", description: "Les matchs ont été générés." });
        return { ...group, matches: newMatches, teams: teamsWithResetStats };
      }
      return group;
    }));
  };

  const handleUpdateMatchResult = (
    groupId: string, 
    matchId: string, 
    teamAResultInput: MatchResult,
    teamAScoreActualInput?: number, 
    teamBScoreActualInput?: number
  ) => {
    setGroups(prevGroups => prevGroups.map(group => {
        if (group.id === groupId) {
            const updatedMatches = group.matches.map(match => {
                if (match.id === matchId) {
                    let result = teamAResultInput; 
                    const newTeamAScore = teamAScoreActualInput ?? match.teamAScoreActual ?? 0;
                    const newTeamBScore = teamBScoreActualInput ?? match.teamBScoreActual ?? 0;

                    if (teamAScoreActualInput !== undefined && teamBScoreActualInput !== undefined) {
                        if (newTeamAScore > newTeamBScore) result = 'Win';
                        else if (newTeamAScore < newTeamBScore) result = 'Loss';
                        else result = 'Draw';
                    }
                    return { 
                        ...match, 
                        teamAResult: result, 
                        teamAScoreActual: newTeamAScore, 
                        teamBScoreActual: newTeamBScore
                    };
                }
                return match;
            });

            const updatedTeamsWithStats = calculateTeamStats(group.teams, updatedMatches);
            toast({ title: "Succès", description: "Le résultat du match a été mis à jour." });
            return { ...group, matches: updatedMatches, teams: updatedTeamsWithStats };
        }
        return group;
    }));
  };

  const handleBackupData = () => {
    try {
      const dataStr = JSON.stringify(groups, null, 2); 
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
      const exportFileDefaultName = `tournament_backup_${new Date().toISOString().slice(0,10)}.json`;
  
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      document.body.appendChild(linkElement); 
      linkElement.click();
      document.body.removeChild(linkElement); 
      toast({ title: "Succès", description: "Données exportées vers un fichier." });
    } catch (error) {
      console.error("Failed to backup data:", error);
      toast({ title: "Erreur", description: "Échec de l'exportation des données.", variant: "destructive" });
    }
  };

  const handleSaveToFirestore = async () => {
    if (!user) {
      toast({ title: "Erreur", description: "Vous devez être connecté pour sauvegarder sur le cloud.", variant: "destructive" });
      return;
    }
    setIsSavingToCloud(true);
    try {
      const userDocRef = doc(db, FIRESTORE_COLLECTION_NAME, user.uid);
      await setDoc(userDocRef, { tournamentGroupsData: groups });
      toast({ title: "Succès", description: "Données sauvegardées sur le cloud !" });
    } catch (error) {
      console.error("Error saving data to Firestore:", error);
      toast({ title: "Erreur Cloud", description: "Échec de la sauvegarde des données sur le cloud.", variant: "destructive" });
    } finally {
      setIsSavingToCloud(false);
    }
  };

  const handleResetData = () => {
    setGroups([]);
    setNewGroupName('');
    setTournamentScorer(null);
    localStorage.removeItem('tournamentGroups'); 
    toast({ title: "Succès", description: "Toutes les données du tournoi ont été réinitialisées (localement).", variant: "default" });
  };

  const handleImportTrigger = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast({ title: "Erreur", description: "Aucun fichier sélectionné.", variant: "destructive" });
      return;
    }

    if (file.type !== "application/json") {
      toast({ title: "Erreur", description: "Veuillez sélectionner un fichier JSON valide.", variant: "destructive" });
      if (event.target) event.target.value = ''; 
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text === 'string') {
          let importedGroups = JSON.parse(text) as Group[];
          if (Array.isArray(importedGroups)) {
             importedGroups = importedGroups.map(group => ({ 
                ...group,
                id: group.id || crypto.randomUUID(),
                name: group.name || "Groupe sans nom",
                teams: Array.isArray(group.teams) ? group.teams.map(team => ({
                  ...team,
                  id: team.id || crypto.randomUUID(),
                  name: team.name || "Équipe sans nom",
                  players: Array.isArray(team.players) ? team.players.map(player =>({
                    ...player,
                    id: player.id || crypto.randomUUID(),
                    name: player.name || "Joueur sans nom",
                    position: player.position || "Center Forward",
                    goals: typeof player.goals === 'number' ? player.goals : 0,
                  })) : [],
                  points: typeof team.points === 'number' ? team.points : 0,
                  played: typeof team.played === 'number' ? team.played : 0,
                  won: typeof team.won === 'number' ? team.won : 0,
                  drawn: typeof team.drawn === 'number' ? team.drawn : 0,
                  lost: typeof team.lost === 'number' ? team.lost : 0,
                  goalsFor: typeof team.goalsFor === 'number' ? team.goalsFor : 0,
                  goalsAgainst: typeof team.goalsAgainst === 'number' ? team.goalsAgainst : 0,
                  goalDifference: typeof team.goalDifference === 'number' ? team.goalDifference : 0,
                })) : [],
                matches: Array.isArray(group.matches) ? group.matches.map(match => ({
                    ...match,
                    id: match.id || crypto.randomUUID(),
                    teamAScoreActual: match.teamAScoreActual ?? 0,
                    teamBScoreActual: match.teamBScoreActual ?? 0,
                })) : [],
            }));
            
            const validatedGroups = importedGroups.filter(group => 
              group.id && group.name && Array.isArray(group.teams) && Array.isArray(group.matches) &&
              group.teams.every(team => 
                  team.id && team.name && Array.isArray(team.players) &&
                  typeof team.points === 'number' &&
                  typeof team.played === 'number' &&
                  typeof team.won === 'number' &&
                  typeof team.drawn === 'number' &&
                  typeof team.lost === 'number' &&
                  typeof team.goalsFor === 'number' &&
                  typeof team.goalsAgainst === 'number' &&
                  typeof team.goalDifference === 'number' &&
                  team.players.every(player => 
                      player.id && player.name && typeof player.goals === 'number' && playerPositions.includes(player.position)
                  )
              ) &&
              group.matches.every(match => match.id && match.teamAId && match.teamBId)
            );

            if (validatedGroups.length === importedGroups.length) {
                setGroups(validatedGroups.map(group => ({
                    ...group,
                    teams: calculateTeamStats(group.teams, group.matches)
                })));
                toast({ title: "Succès", description: "Données importées depuis le fichier avec succès." });
            } else {
                throw new Error("Fichier JSON avec une structure de données invalide après traitement.");
            }
          } else {
            throw new Error("Fichier JSON avec une structure de données invalide.");
          }
        } else {
          throw new Error("Échec de la lecture du contenu du fichier.");
        }
      } catch (error: any) {
        console.error("Failed to import data:", error);
        toast({ title: "Erreur", description: `Échec de l'importation des données. ${error.message || "Assurez-vous que le fichier est au bon format."}`, variant: "destructive" });
      } finally {
          if(event.target) event.target.value = ''; 
      }
    };
    reader.onerror = () => {
      toast({ title: "Erreur", description: "Échec de la lecture du fichier.", variant: "destructive" });
      if(event.target) event.target.value = ''; 
    };
    reader.readAsText(file);
  };

  const handlePrintData = () => {
    window.print();
    toast({ title: "Impression", description: "Données envoyées à la fenêtre d'impression." });
  };


  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-primary border-2">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center gap-2">
            <TrophyIcon className="w-7 h-7 text-accent" /> Meilleur Buteur du Tournoi
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
              {tournamentScorer.goals} buts
            </p>
          ) : (
            <p className="text-lg text-muted-foreground">Aucun joueur n'a encore marqué de buts.</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg border-primary border-2 no-print">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center gap-2">
             Gestion des Données du Tournoi
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelected} 
            accept=".json" 
            className="hidden" 
            id="import-file-input"
          />
          <Button onClick={handleImportTrigger} variant="outline" className="w-full">
            <Upload className="ml-2 h-5 w-5" /> Importer depuis un fichier
          </Button>
          <Button onClick={handleBackupData} variant="outline" className="w-full">
            <Download className="ml-2 h-5 w-5" /> Exporter vers un fichier
          </Button>
          {user && (
            <Button onClick={handleSaveToFirestore} variant="outline" className="w-full" disabled={isSavingToCloud || authLoading}>
              <CloudUpload className="ml-2 h-5 w-5" /> 
              {isSavingToCloud ? "Sauvegarde..." : "Sauvegarder sur le Cloud"}
            </Button>
          )}
          <Button onClick={handlePrintData} variant="outline" className="w-full">
            <Printer className="ml-2 h-5 w-5" /> Imprimer toutes les données
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full md:col-span-1"> {/* Adjusted col-span */}
                <RefreshCcw className="ml-2 h-5 w-5" /> Réinitialiser les données locales
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action supprimera toutes les données du tournoi stockées localement (groupes, équipes, joueurs et matchs). Cette action ne peut pas être annulée. Les données sauvegardées sur le cloud (si vous êtes connecté et avez sauvegardé) ne seront pas affectées par cette action.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetData}>
                  Oui, réinitialiser localement
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>


      <Card className="shadow-lg border-primary border-2 no-print">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center gap-2">
            <PlusCircle className="w-7 h-7" /> Créer un nouveau groupe
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 items-end">
          <div className="flex-grow">
            <Label htmlFor="new-group-name" className="text-muted-foreground">Nom du groupe</Label>
            <Input
              id="new-group-name"
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Exemple: Groupe A"
              className="mt-1"
            />
          </div>
          <Button onClick={handleAddGroup} className="bg-primary hover:bg-primary/90">
            <PlusCircle className="ml-2 h-5 w-5" /> Ajouter groupe
          </Button>
        </CardContent>
      </Card>

      {groups.length === 0 && dataLoadedRef.current && (
        <Card className="text-center py-10">
          <CardContent>
            <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">Aucun groupe pour le moment.</p>
            <p className="text-sm text-muted-foreground">Commencez par ajouter un nouveau groupe ci-dessus ou importez des données !</p>
          </CardContent>
        </Card>
      )}
       {!dataLoadedRef.current && (
         <Card className="text-center py-10">
          <CardContent>
             <p className="text-xl text-muted-foreground">Chargement des données...</p>
          </CardContent>
        </Card>
       )}


      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
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

  const getTeamName = (teamId: string) => group.teams.find(t => t.id === teamId)?.name || 'Équipe inconnue';

  const sortedTeams = useMemo(() => {
    return [...group.teams].sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      if (b.goalDifference !== a.goalDifference) {
        return b.goalDifference - a.goalDifference;
      }
      if (b.goalsFor !== a.goalsFor) {
        return b.goalsFor - a.goalsFor;
      }
      return a.name.localeCompare(b.name); 
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

  const handleMatchScoreSave = (matchId: string) => {
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
                <strong>Meilleur buteur du groupe:</strong> {groupScorer.name} ({groupScorer.teamName}) - {groupScorer.goals} buts
              </p>
            )}
             {(!groupScorer || groupScorer.goals === 0) && (
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    Aucun joueur n'a encore marqué de buts dans ce groupe.
                </p>
            )}
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80 no-print">
                    <Trash2 className="w-5 h-5" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer le groupe {group.name} ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action supprimera définitivement le groupe ainsi que toutes les équipes, joueurs et matchs associés. Cette action ne peut pas être annulée.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDeleteGroup(group.id)}>
                  Oui, supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6 flex-grow">
        <Accordion type="single" collapsible className="w-full no-print">
          <AccordionItem value="add-team">
            <AccordionTrigger className="text-lg font-semibold text-primary hover:text-primary/80">
                <UserPlus className="ml-2 h-5 w-5" /> Ajouter une nouvelle équipe
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <div className="flex gap-2 items-end p-1">
                <div className="flex-grow">
                  <Label htmlFor={`team-name-${group.id}`} className="text-muted-foreground">Nom de l'équipe</Label>
                  <Input id={`team-name-${group.id}`} value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder="Nom de l'équipe" className="mt-1" />
                </div>
                <Button onClick={handleAddTeamSubmit} size="sm" className="bg-primary hover:bg-primary/90"><PlusCircle className="ml-1 h-4 w-4" />Ajouter</Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        {sortedTeams.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mt-6 mb-3 text-primary flex items-center gap-2">
              <ListOrdered className="w-6 h-6" /> Classement du Groupe
            </h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30px] text-center">#</TableHead>
                    <TableHead className="text-right min-w-[120px]">Équipe</TableHead>
                    <TableHead className="text-center">Pts</TableHead>
                    <TableHead className="text-center">J</TableHead>
                    <TableHead className="text-center">G</TableHead>
                    <TableHead className="text-center">N</TableHead>
                    <TableHead className="text-center">P</TableHead>
                    <TableHead className="text-center">BP</TableHead>
                    <TableHead className="text-center">BC</TableHead>
                    <TableHead className="text-center">Diff</TableHead>
                    <TableHead className="text-center no-print w-[80px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTeams.map((team, index) => (
                    <TableRow key={team.id}>
                      <TableCell className="text-center font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium text-right">{team.name}</TableCell>
                      <TableCell className="text-center font-bold">{team.points}</TableCell>
                      <TableCell className="text-center">{team.played}</TableCell>
                      <TableCell className="text-center">{team.won}</TableCell>
                      <TableCell className="text-center">{team.drawn}</TableCell>
                      <TableCell className="text-center">{team.lost}</TableCell>
                      <TableCell className="text-center">{team.goalsFor}</TableCell>
                      <TableCell className="text-center">{team.goalsAgainst}</TableCell>
                      <TableCell className="text-center">{team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}</TableCell>
                      <TableCell className="text-center no-print">
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80 w-8 h-8">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent dir="rtl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer l'équipe {team.name} ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action supprimera définitivement l'équipe ainsi que tous ses joueurs et matchs associés. Cette action ne peut pas être annulée.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDeleteTeam(group.id, team.id)}>
                                  Oui, supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
        {group.teams.length === 0 && <p className="text-muted-foreground text-sm mt-4">Aucune équipe n'a encore été ajoutée à ce groupe.</p>}

        {sortedTeams.length > 0 && (
            <div className="mt-6">
            <h3 className="text-xl font-semibold mb-3 text-primary flex items-center gap-2 no-print">
                <Users className="w-6 h-6" /> Gérer les joueurs des équipes
            </h3>
            <Accordion type="single" collapsible className="w-full">
                {sortedTeams.map((team) => (
                    <AccordionItem value={`players-${team.id}-${group.id}`} key={`players-${team.id}-${group.id}`} className="mb-2 border rounded-lg shadow-sm bg-background/30">
                         <AccordionTrigger className="text-primary hover:text-primary/80 text-base font-semibold px-4 py-3 no-print">
                            <div className="flex items-center gap-2">
                                {team.name} - Joueurs ({team.players.length})
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 px-4 pb-4 space-y-3">
                            {team.players.length > 0 ? team.players.map(player => (
                            <div key={player.id} className="flex items-center gap-2 p-2 border rounded-md bg-muted/20">
                                <span className="flex-grow font-medium text-sm">{player.name}</span>
                                
                                <Select 
                                value={player.position}
                                onValueChange={(newPos) => onUpdatePlayer(group.id, team.id, player.id, newPos as PlayerPosition, undefined)}
                                >
                                <SelectTrigger className="w-[140px] text-xs h-8 no-print"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {playerPositions.map(pos => <SelectItem key={pos} value={pos} className="text-xs">{playerPositionTranslations[pos]}</SelectItem>)}
                                </SelectContent>
                                </Select>
                                <span className="print-only-inline text-xs w-[140px]">{playerPositionTranslations[player.position]}</span>

                                <Select
                                value={String(player.goals)}
                                onValueChange={(newGoals) => onUpdatePlayer(group.id, team.id, player.id, undefined, parseInt(newGoals))}
                                >
                                <SelectTrigger className="w-[70px] text-xs h-8 no-print"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {goalOptions.map(g => <SelectItem key={g} value={String(g)} className="text-xs">{g}</SelectItem>)}
                                </SelectContent>
                                </Select>
                                <span className="print-only-inline text-xs w-[70px]">{player.goals} buts</span>
                                
                                <Button variant="ghost" size="icon" onClick={() => onDeletePlayer(group.id, team.id, player.id)} className="text-destructive hover:text-destructive/80 w-8 h-8 no-print">
                                <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                            )) : <p className="text-xs text-muted-foreground">Aucun joueur dans cette équipe.</p>}
                            <div className="flex gap-2 items-end pt-2 border-t mt-3 no-print">
                            <Input value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} placeholder="Nom du joueur" className="flex-grow text-sm h-9" />
                            <Select value={newPlayerPosition} onValueChange={(pos) => setNewPlayerPosition(pos as PlayerPosition)}>
                                <SelectTrigger className="w-[150px] text-xs h-9"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                {playerPositions.map(pos => <SelectItem key={pos} value={pos} className="text-xs">{playerPositionTranslations[pos]}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Button onClick={() => handleAddPlayerSubmit(team.id)} size="sm" className="bg-primary hover:bg-primary/90 h-9"><PlusCircle className="ml-1 h-4 w-4" />Ajouter joueur</Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
            </div>
        )}


        <Separator className="my-6" />

        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-semibold text-primary flex items-center gap-2"><Swords className="w-6 h-6" /> Matchs</h3>
            {group.teams.length >= 2 && group.matches.length === 0 && (
              <Button onClick={() => onGenerateMatches(group.id)} size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground no-print">
                <PlusCircle className="ml-2 h-4 w-4" /> Générer les matchs
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
                     <Button variant="ghost" size="icon" onClick={() => editingMatchId === match.id ? setEditingMatchId(null) : handleMatchScoreEdit(match)} className="text-primary hover:text-primary/80 w-7 h-7 no-print">
                        {editingMatchId === match.id ? <XCircle className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                    </Button>
                  </div>

                  {editingMatchId === match.id ? (
                    <div className="space-y-2 no-print">
                        <div className="flex items-center gap-2">
                            <Label htmlFor={`scoreA-${match.id}`} className="text-xs whitespace-nowrap">Buts {getTeamName(match.teamAId)}:</Label>
                            <Input 
                                id={`scoreA-${match.id}`} 
                                type="number" 
                                value={currentTeamAScore} 
                                onChange={(e) => setCurrentTeamAScore(Math.max(0, parseInt(e.target.value)))} 
                                className="w-16 h-8 text-xs" 
                                min="0"
                            />
                             <Label htmlFor={`scoreB-${match.id}`} className="text-xs whitespace-nowrap">Buts {getTeamName(match.teamBId)}:</Label>
                             <Input 
                                id={`scoreB-${match.id}`} 
                                type="number" 
                                value={currentTeamBScore} 
                                onChange={(e) => setCurrentTeamBScore(Math.max(0, parseInt(e.target.value)))} 
                                className="w-16 h-8 text-xs" 
                                min="0"
                            />
                        </div>
                        <Button onClick={() => handleMatchScoreSave(match.id)} size="sm" className="w-full">
                            <Save className="ml-2 h-4 w-4" /> Enregistrer le score
                        </Button>
                    </div>
                  ) : (
                    <div className="match-score-display">
                      <div className="text-xs text-muted-foreground">
                        Score: {getTeamName(match.teamAId)} {match.teamAScoreActual ?? 0} - {match.teamBScoreActual ?? 0} {getTeamName(match.teamBId)}
                      </div>
                      {match.teamAResult ? (
                        <div className="mt-1 text-xs text-muted-foreground">
                          <p>({matchResultTranslations[match.teamAResult]} pour {getTeamName(match.teamAId)})</p>
                          <p>Points {getTeamName(match.teamAId)}: {match.teamAResult === 'Win' ? 3 : match.teamAResult === 'Draw' ? 1 : 0}</p>
                          <p>Points {getTeamName(match.teamBId)}: {match.teamAResult === 'Loss' ? 3 : match.teamAResult === 'Draw' ? 1 : 0}</p>
                        </div>
                      ): (
                        <p className="text-xs text-muted-foreground mt-1">Le score du match n'a pas encore été enregistré.</p>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              {group.teams.length < 2 ? "Ajoutez au moins deux équipes pour générer des matchs." : "Aucun match n'a encore été généré."}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
         <p className="text-xs text-muted-foreground w-full text-center">Groupe: {group.name}</p>
      </CardFooter>
    </Card>
  );
}
