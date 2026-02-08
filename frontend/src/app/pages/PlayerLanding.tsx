import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { api } from '@/app/api/client';
import type { ClubListItem, ClubMemberSearchResult } from '@/app/api/types';
import { DEFAULT_PLAYER_ID } from '@/app/config';

export function PlayerLanding() {
  const navigate = useNavigate();

  // Club selection
  const [clubs, setClubs] = useState<ClubListItem[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<number | ''>('');
  const [clubsLoading, setClubsLoading] = useState(true);

  // Player search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ClubMemberSearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  // Manual ID fallback
  const [playerId, setPlayerId] = useState(String(DEFAULT_PLAYER_ID));

  // Load clubs on mount
  useEffect(() => {
    let active = true;
    api.getClubs().then((res) => {
      if (!active) return;
      setClubs(res.items);
      if (res.items.length === 1) {
        setSelectedClubId(res.items[0].id);
      }
      setClubsLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  // Debounced search
  useEffect(() => {
    if (!selectedClubId || searchQuery.trim().length < 1) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      api
        .searchClubMembers(selectedClubId as number, searchQuery.trim())
        .then((res) => setSearchResults(res.items))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedClubId, searchQuery]);

  const submitManual = () => {
    const id = Number(playerId);
    if (!Number.isFinite(id) || id <= 0) return;
    localStorage.setItem('lastPlayerId', String(id));
    navigate(`/players/${id}`);
  };

  const handlePlayerSelect = (_: unknown, value: ClubMemberSearchResult | null) => {
    if (!value) return;
    localStorage.setItem('lastPlayerId', String(value.playerId));
    navigate(`/players/${value.playerId}`);
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Find Your Profile
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select your club and search by name to load your stats.
          </Typography>

          <Stack spacing={2.5}>
            {/* Step 1: Club selector */}
            <TextField
              select
              label="Select your club"
              value={selectedClubId}
              onChange={(e) => {
                setSelectedClubId(Number(e.target.value));
                setSearchQuery('');
                setSearchResults([]);
              }}
              disabled={clubsLoading}
              InputProps={{
                startAdornment: clubsLoading ? (
                  <CircularProgress size={18} sx={{ mr: 1 }} />
                ) : undefined,
              }}
            >
              {clubs.map((club) => (
                <MenuItem key={club.id} value={club.id}>
                  {club.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Step 2: Player search */}
            <Autocomplete
              disabled={!selectedClubId}
              options={searchResults}
              getOptionLabel={(opt) => opt.name}
              filterOptions={(x) => x}
              loading={searching}
              onInputChange={(_, value) => setSearchQuery(value)}
              onChange={handlePlayerSelect}
              isOptionEqualToValue={(opt, val) => opt.playerId === val.playerId}
              noOptionsText={
                searchQuery.trim().length < 1 ? 'Start typing a name…' : 'No players found'
              }
              renderOption={(props, option) => (
                <li {...props} key={option.playerId}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Typography variant="body2">{option.name}</Typography>
                    {option.rating != null && (
                      <Typography variant="body2" color="text.secondary">
                        {option.rating}
                      </Typography>
                    )}
                  </Box>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search player by name"
                  placeholder={selectedClubId ? 'Type to search…' : 'Select a club first'}
                />
              )}
            />
          </Stack>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary">
              or enter Player ID directly
            </Typography>
          </Divider>

          <Stack direction="row" spacing={1.5}>
            <TextField
              label="Player ID"
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              inputMode="numeric"
              size="small"
              sx={{ flex: 1 }}
            />
            <Button variant="outlined" onClick={submitManual}>
              Load
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
