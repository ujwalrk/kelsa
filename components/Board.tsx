import { Grid } from '@mui/material'
import List from './List'

export default function Board() {
  return (
    <Grid container spacing={2} p={2}>
      <List title="To Do" items={['Welcome to Kelsa!']} />
      <List title="In Progress" items={[]} />
      <List title="Done" items={[]} />
    </Grid>
  )
}
