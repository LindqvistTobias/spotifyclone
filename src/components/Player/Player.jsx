import { Box, Grid, Typography, Avatar } from '@mui/material';
import React, { useEffect, useState } from 'react';
import PlayerControls from '../PlayerControls/PlayerControls';
import PlayerVolume from '../PlayerVolume/PlayerVolume';
import PlayerOverlay from '../PlayerOverlay/PlayerOverlay';
import { getAccessTokenFromStorage } from '../../utils/getAccessTokenFromStorage';

const Player = ({ spotifyApi }) => {
	const [localPlayer, setLocalPlayer] = useState(null);
	const [is_paused, setIsPaused] = useState(false);
	const [current_track, setCurrentTrack] = useState(null);
	const [device, setDevice] = useState(null);
	const [duration, setDuration] = useState(null);
	const [progress, setProgress] = useState(null);
	const [active, setActive] = useState(null);
	const [playerOverlayIsOpen, setPlayerOverlayIsOpen] = useState(false);

	useEffect(() => {
		const token = getAccessTokenFromStorage();
		const script = document.createElement('script');
		script.src = 'https://sdk.scdn.co/spotify-player.js';
		script.async = true;

		document.body.appendChild(script);

		window.onSpotifyWebPlaybackSDKReady = () => {
			const player = new window.Spotify.Player({
				name: 'Lokwave Player',
				getOAuthToken: (cb) => {
					cb(token);
				},
				volume: 0.5
			});

			player.addListener('ready', ({ device_id }) => {
				console.log('Ready with Device ID', device_id);
				setDevice(device_id);
				setLocalPlayer(player);
			});

			player.addListener('not_ready', ({ device_id }) => {
				console.log('Device ID has gone offline', device_id);
			});

			player.addListener('player_state_changed', (state) => {
				if (!state || !state.track_window?.current_track) {
					return;
				}				

				const duration = state.track_window.current_track.duration_ms / 1000;
				const progress = state.position / 1000;
				setDuration(duration);
				setProgress(progress);
				setCurrentTrack(state.track_window.current_track);
				setIsPaused(state.paused);
				

				player.getCurrentState().then((state) => {
					!state ? setActive(false) : setActive(true);
				});
			});

			setLocalPlayer(player);
			player.connect();
		};
	}, []);

	useEffect(() => {
		if (!localPlayer) return;
		async function connect() {
			await localPlayer.connect();
		}

		connect();
		return () => {
			localPlayer.disconnect();
		};
	}, [localPlayer]);

	
	useEffect(() => {
		const transferMyPlayback = async () => {
			if (device) {
				await spotifyApi.transferMyPlayback([device], true);
			}
		};
		const getDeviceFromApi = async () => {
			await spotifyApi.getMyDevices();
		};
		getDeviceFromApi();
		transferMyPlayback();
	}, [device, spotifyApi]);

	return (
		<Box>
			<Grid
				onClick={() => setPlayerOverlayIsOpen((prevState) => !prevState)}
				container
				px={3}
				sx={{
					backgroundColor: 'background.paper',
					height: 100,
					cursor: { xs: 'pointer', md: 'auto' },
					width: '100%',
					borderTop: '1px solid #292929'
				}}
			>
				<Grid xs={12} md={4} item sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
					<Avatar
						src={current_track?.album.images[0].url}
						alt={current_track?.album.name}
						variant="square"
						sx={{ width: 56, height: 56, marginRight: 2 }}
					/>
					<Box>
						<Typography sx={{ color: 'text.primary', fontSize: 14 }}>{current_track?.name}</Typography>
						<Typography sx={{ color: 'text.secondary', fontSize: 10 }}>
							{current_track?.artists[0].name}
						</Typography>
					</Box>
				</Grid>
				<Grid
					sx={{
						display: { xs: 'none', md: 'flex' },
						justifyContent: 'center',
						alignItems: 'center'
					}}
					md={4}
					item
				>
					{active ? (
						<PlayerControls
							progress={progress}
							is_paused={is_paused}
							duration={duration}
							player={localPlayer}
						/>
					) : (
						<Box>Please transfer Playback</Box>
					)}
				</Grid>
				<Grid
					xs={6}
					md={4}
					item
					sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'flex-end' }}
				>
					<PlayerVolume player={localPlayer} />
				</Grid>
			</Grid>
			<PlayerOverlay
				playerOverlayIsOpen={playerOverlayIsOpen}
				closeOverlay={() => setPlayerOverlayIsOpen(false)}
				progress={progress}
				is_paused={is_paused}
				duration={duration}
				player={localPlayer}
				current_track={current_track}
				active={active}
			/>
		</Box>
	);
};

export default Player;
