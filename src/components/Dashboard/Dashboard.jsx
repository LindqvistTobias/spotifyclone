import { Box } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import Home from '../../pages/Home';
import SideNav from '../SideNav/SideNav';
import { getAccessTokenFromStorage } from '../../utils/getAccessTokenFromStorage';
import { useEffect, useState } from 'react';
import Playlist from '../../pages/Playlist';
import Player from '../Player/Player';
import MobileNav from '../MobileNav/MobileNav';
import Library from '../../pages/Library';

const Dashboard = ({ spotifyApi }) => {
	const token = useState(getAccessTokenFromStorage());
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const onMount = async () => {
			await spotifyApi.setAccessToken(token);
			setLoading(false)
		};

		if (token) {
			onMount();
		}
	}, []);

	return (
		<Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
			<Box sx={{ flex: 1, overflowY: 'auto', display: 'flex' }}>
				{loading ? (
					'loading...'
				) : (
					<>
					<SideNav spotifyApi={spotifyApi} token={token} />
						<Routes>
							<Route path="/playlist/:id" element={<Playlist spotifyApi={spotifyApi} token={token} />} />
							<Route path="/library" element={<Library spotifyApi={spotifyApi} token={token} />} />
							<Route path="/" element={<Home />} />
						</Routes>						
					</>
				)}				
			</Box>
			{token && !loading && <Player spotifyApi={spotifyApi} />}
			<MobileNav />
		</Box>
	);
};

export default Dashboard;
