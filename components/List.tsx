import { Card, CardContent, Typography, Button, Stack } from '@mui/material'

export default function List({ title, items }: { title: string, items: string[] }) {
  return (
    <Card sx={{ minWidth: 250, backgroundColor: '#f3e8ff' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <Stack spacing={1}>
          {items.map((item, i) => (
            <Card key={i} sx={{ p: 1, bgcolor: 'white' }}>
              {item}
            </Card>
          ))}
          <Button variant="text">+ Add card</Button>
        </Stack>
      </CardContent>
    </Card>
  )
}
