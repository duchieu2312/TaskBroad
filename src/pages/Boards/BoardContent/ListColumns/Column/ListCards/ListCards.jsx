/* eslint-disable react/prop-types */
import Box from "@mui/material/Box";
import Card from "./Card/Card";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

function ListCards({ cards }) {
	return (
		<SortableContext items={cards?.map(c => c._id)} strategy={verticalListSortingStrategy}>
			<Box sx={{
				padding: '0 5px',
				margin: '0 5px',
				display: 'flex',
				flexDirection: 'column',
				gap: 1,
				overflowX: 'hidden',
				overflowY: 'auto',
				maxHeight: (theme) => `calc(${theme.taskbroad.boardContentHeight} - ${theme.spacing(5)} - ${theme.taskbroad.columnHeaderHeight} - ${theme.taskbroad.columnFooterHeight})`,
				'&::-webkit-scrollbar-thumb': {
					backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#9c27b0' : '#000'),
					borderRadius: '8px'
				},
				'&::-webkit-scrollbar-thumb:hover': {
					backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#8e44ad' : '#57606f')
				}
			}}>
				{cards?.map(card => <Card key={card._id} card={card} />)}
			</Box>
		</SortableContext>
	)
}

export default ListCards
