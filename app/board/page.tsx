"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useBoardStore } from "../../store/boardStore";
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogActions,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/navigation";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

// Import the new wrapper - assuming this is correct as per previous fix
import DndContextWrapper from '../../components/DndContextWrapper';

const DEFAULT_LISTS = [
  { name: "To Do" },
  { name: "In Progress" },
  { name: "Done" },
];

export default function BoardPage() {
  const { board, lists, cards, setBoard, setLists, setCards } = useBoardStore();
  const [loading, setLoading] = useState(true);
  const [newList, setNewList] = useState("");
  const [newCard, setNewCard] = useState<{ [key: string]: string }>({});
  const [user, setUser] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [premium, setPremium] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const router = useRouter();
  const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY;
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', id: '' });
  const [showAddColumnInput, setShowAddColumnInput] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingColumnName, setEditingColumnName] = useState("");

  // Fetch user and board data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      setUser(user);
      let isPremium = user.user_metadata?.premium;
      if (isPremium === undefined) {
        isPremium = false;
      }
      setPremium(isPremium);
      let { data: boards } = await supabase.from("boards").select("*").eq("user_id", user.id);
      if (!boards || boards.length === 0) {
        const { data: newBoard } = await supabase.from("boards").insert([{ name: "My First Board", user_id: user.id }]).select().single();
        setBoard(newBoard);
        boards = [newBoard];
      } else {
        setBoard(boards[0]);
      }
      const boardId = boards[0].id;
      let { data: lists } = await supabase.from("lists").select("*").eq("board_id", boardId).order("position");
      if (!lists || lists.length === 0) {
        const { data: defaultLists } = await supabase.from("lists").insert(
          DEFAULT_LISTS.map((l, i) => ({ name: l.name, board_id: boardId, position: i }))
        ).select();
        lists = defaultLists;
      }
      setLists(lists || []);
      const { data: cards } = await supabase.from("cards").select("*").in("list_id", (lists || []).map(l => l.id)).order("position");
      setCards(cards || []);
      setLoading(false);
    };
    fetchData();
  }, [setBoard, setLists, setCards]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleUpgradeRoute = () => {
    setPaywallOpen(false);
    router.push('/upgrade');
  };

  const handleAddList = async () => {
    if (!premium && lists.length >= 3) {
      setPaywallOpen(true);
      router.push('/upgrade');
      return;
    }
    if (!newList.trim() || !board) return;
    const position = lists.length;
    const { data: list } = await supabase.from("lists").insert([{ name: newList, board_id: board.id, position }]).select().single();
    setLists([...lists, list]);
    setNewList("");
    setShowAddColumnInput(false);
  };

  const handleAddCard = async (listId: string) => {
    if (!newCard[listId]?.trim()) return;
    const position = cards.filter((c: any) => c.list_id === listId).length;
    const { data: card } = await supabase.from("cards").insert([{ content: newCard[listId], list_id: listId, position }]).select().single();
    setCards([...cards, card]);
    setNewCard({ ...newCard, [listId]: "" });
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    if (result.type === 'COLUMN') {
      const { source, destination } = result;
      if (source.index === destination.index) return;
      const newLists = Array.from(lists);
      const [removed] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, removed);
      setLists(newLists);
      if (board && board.id) {
        for (let i = 0; i < newLists.length; i++) {
          await supabase.from('lists').update({ position: i }).eq('id', newLists[i].id);
        }
        const { data: updatedLists } = await supabase
          .from('lists')
          .select('*')
          .eq('board_id', board.id)
          .order('position');
        setLists(updatedLists || []);
      }
      return;
    }
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    setSaving(true);
    const cardIdx = cards.findIndex((c: any) => c.id === draggableId);
    const card = cards[cardIdx];
    const updatedCard = { ...card, list_id: destination.droppableId, position: destination.index };
    let newCards = cards.filter((c: any) => c.id !== draggableId);
    const destCards = newCards.filter((c: any) => c.list_id === destination.droppableId);
    newCards = [
      ...newCards.filter((c: any) => c.list_id !== destination.droppableId),
      ...destCards.slice(0, destination.index),
      updatedCard,
      ...destCards.slice(destination.index)
    ];
    setCards(newCards);
    try {
      await supabase.from('cards').update({
        list_id: destination.droppableId,
        position: destination.index,
      }).eq('id', draggableId);
      const { data: updatedCards } = await supabase.from('cards').select('*').in('list_id', lists.map((l: any) => l.id)).order('position');
      setCards(updatedCards || []);
    } catch (e) {
      setCards(cards);
    }
    setSaving(false);
  };

  const handleEditColumn = (col: any) => {
    setEditingColumnId(col.id);
    setEditingColumnName(col.name);
  };

  const handleSaveColumnName = async (col: any) => {
    if (editingColumnName.trim() && editingColumnName !== col.name) {
      await supabase.from('lists').update({ name: editingColumnName }).eq('id', col.id);
      setLists(lists.map((l: any) => l.id === col.id ? { ...l, name: editingColumnName } : l));
    }
    setEditingColumnId(null);
    setEditingColumnName("");
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>;

  return (
    <Box sx={{ bgcolor: "#fafaff", minHeight: "100vh" }}>
      {/* Top bar */}
      <Box display="flex" alignItems="center" justifyContent="space-between" px={4} py={2} sx={{ borderBottom: "1px solid #eee" }}>
        <Box
          sx={{
            bgcolor: '#fff',
            borderRadius: 2,
            px: 2,
            py: 1,
            cursor: 'pointer',
            display: 'inline-block',
            fontWeight: 700,
            fontSize: 24,
            color: 'primary.main',
            letterSpacing: 1,
            userSelect: 'none',
          }}
          onClick={() => router.push('/')}
        >
          Kelsa
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body1" fontWeight={600}>{board?.name}</Typography>
          {saving && <CircularProgress size={16} sx={{ ml: 1 }} />}
          <Tooltip title={user?.email || "User"}>
            <IconButton onClick={handleMenuOpen} sx={{ bgcolor: "#eee", width: 40, height: 40 }}>
              <Avatar sx={{ bgcolor: "#a78bfa" }}>{user?.email?.[0]?.toUpperCase() || "U"}</Avatar>
            </IconButton>
          </Tooltip>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem disabled>
              {user?.email}
            </MenuItem>
            <Divider />
            {!premium && (
              <MenuItem onClick={() => { handleMenuClose(); router.push('/upgrade'); }}>
                Upgrade
              </MenuItem>
            )}
            <MenuItem onClick={async () => { handleMenuClose(); await handleLogout(); }}>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      {/* Board columns */}
      <DndContextWrapper onDragEnd={onDragEnd}>
        <Box display="flex" gap={3} px={4} py={4}>
          {lists
            .sort((a: any, b: any) => a.position - b.position)
            .map((list: any) => ( // Removed idx here, not directly used in Droppable structure
              // The Droppable's render prop provides 'provided' and 'snapshot'
              <Droppable droppableId={list.id} type="CARD" key={list.id}>
                {(provided, snapshot) => ( // <-- Corrected: function as children
                  <Paper
                    // Apply ref and props directly to the element representing the droppable area
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      p: 2,
                      width: 320,
                      bgcolor: '#f3f0fa',
                      display: 'flex',
                      flexDirection: 'column',
                      minHeight: 500,
                      position: 'relative',
                    }}
                  >
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {editingColumnId === list.id ? (
                          <TextField
                            value={editingColumnName}
                            onChange={e => setEditingColumnName(e.target.value)}
                            onBlur={() => handleSaveColumnName(list)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveColumnName(list);
                              if (e.key === 'Escape') { setEditingColumnId(null); setEditingColumnName(""); }
                            }}
                            size="small"
                            autoFocus
                            sx={{ fontWeight: 700, fontSize: 16, bgcolor: '#fff', borderRadius: 1, minWidth: 120 }}
                          />
                        ) : (
                          <Typography
                            variant="subtitle1"
                            fontWeight={700}
                            sx={{ cursor: 'pointer' }}
                            onClick={() => handleEditColumn(list)}
                          >
                            {list.name}
                          </Typography>
                        )}
                        <Typography variant="caption">{cards.filter((c: any) => c.list_id === list.id).length}</Typography>
                      </Box>
                      <IconButton
                        size="small"
                        sx={{ color: '#aaa' }}
                        onClick={() => setDeleteDialog({ open: true, type: 'column', id: list.id })}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* This Box is now part of the Droppable's children */}
                    <Box flex={1} mt={2}>
                      {cards
                        .filter((card: any) => card.list_id === list.id)
                        .sort((a: any, b: any) => a.position - b.position)
                        .map((card: any, cardIdx: number) => (
                          // Draggable also expects a function as children
                          <Draggable draggableId={card.id} index={cardIdx} key={card.id}>
                            {(provided, snapshot) => ( // <-- Corrected: function as children
                              <Paper
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                sx={{ p: 1.5, mb: 1.5, bgcolor: "#fff", position: 'relative' }}
                              >
                                <Box display="flex" alignItems="center">
                                  <span {...provided.dragHandleProps} style={{ cursor: 'grab', display: 'flex', alignItems: 'center', marginRight: 8 }}>
                                    <DragIndicatorIcon fontSize="small" sx={{ color: '#bdbdbd' }} />
                                  </span>
                                  <Box flex={1}>{card.content}</Box>
                                  <IconButton
                                    size="small"
                                    sx={{ color: '#aaa' }}
                                    onClick={() => setDeleteDialog({ open: true, type: 'card', id: card.id })}
                                  >
                                    <CloseIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Paper>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder} {/* This placeholder must be inside the Droppable's child function */}
                    </Box>
                    <Box mt="auto">
                      <TextField
                        size="small"
                        placeholder="Add a card"
                        value={newCard[list.id] || ""}
                        onChange={e => setNewCard({ ...newCard, [list.id]: e.target.value })}
                        onKeyDown={e => e.key === "Enter" && handleAddCard(list.id)}
                        fullWidth
                        sx={{ bgcolor: "#fff", borderRadius: 1 }}
                      />
                      <Button onClick={() => handleAddCard(list.id)} sx={{ mt: 1, textTransform: "none" }} startIcon={<AddIcon />} fullWidth>
                        Add a card
                      </Button>
                    </Box>
                  </Paper>
                )}
              </Droppable>
            ))}
          {/* Add list placeholder for non-premium users */}
          <Paper sx={{ p: 2, width: 320, bgcolor: showAddColumnInput ? "#f3f0fa" : "#e9e6f7", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 500, cursor: !showAddColumnInput && (!premium && lists.length >= 3) ? 'pointer' : 'default', border: !showAddColumnInput && (!premium && lists.length >= 3) ? '2px dashed #a78bfa' : undefined }}
            onClick={() => {
              if (!premium && lists.length >= 3) {
                router.push('/upgrade');
              } else if (!showAddColumnInput) {
                setShowAddColumnInput(true);
              }
            }}
          >
            {showAddColumnInput ? (
              <>
                <TextField
                  size="small"
                  placeholder="Column name"
                  value={newList}
                  onChange={e => setNewList(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAddList()}
                  fullWidth
                  sx={{ bgcolor: "#fff", borderRadius: 1 }}
                  autoFocus
                />
                <Button onClick={handleAddList} sx={{ mt: 2, textTransform: "none" }} variant="contained" fullWidth>
                  Add Column
                </Button>
                <Button onClick={() => { setShowAddColumnInput(false); setNewList(""); }} sx={{ mt: 1, textTransform: "none" }} fullWidth>
                  Cancel
                </Button>
              </>
            ) : (
              <Button startIcon={<AddIcon />} sx={{ textTransform: "none" }} fullWidth>
                Add a column
              </Button>
            )}
          </Paper>
        </Box>
      </DndContextWrapper>
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, type: '', id: '' })}>
        <DialogTitle>
          {deleteDialog.type === 'card'
            ? 'Delete this card?'
            : 'Delete this column and all its cards?'}
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, type: '', id: '' })}>Cancel</Button>
          <Button
            color="error"
            onClick={async () => {
              if (deleteDialog.type === 'card') {
                await supabase.from('cards').delete().eq('id', deleteDialog.id);
                setCards(cards.filter((c) => c.id !== deleteDialog.id));
              } else if (deleteDialog.type === 'column') {
                await supabase.from('cards').delete().eq('list_id', deleteDialog.id);
                await supabase.from('lists').delete().eq('id', deleteDialog.id);
                setLists(lists.filter((l) => l.id !== deleteDialog.id));
                setCards(cards.filter((c) => c.list_id !== deleteDialog.id));
              }
              setDeleteDialog({ open: false, type: '', id: '' });
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}