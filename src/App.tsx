/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, ChangeEvent, useEffect } from 'react';
import axios from 'axios';
import {
  Button,
  Container,
  TextField,
  IconButton,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Box,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, MonetizationOn as BitcoinIcon } from '@mui/icons-material';

interface Task {
  id: number;
  name: string;
  completed: boolean;
}

interface BitcoinData {
  USD: { rate_float: number };
  GBP: { rate_float: number };
  EUR: { rate_float: number };
}

function App() {
  const [showBitcoinModal, setShowBitcoinModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [data, setData] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [task, setTask] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [bitcoinData, setBitcoinData] = useState<BitcoinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBitcoinPrice = async () => {
      try {
        const response = await axios.get('https://api.coindesk.com/v1/bpi/currentprice.json');
        setBitcoinData(response.data.bpi);
        setLoading(false);
      } catch (error) {
        setError('Ошибка загрузки данных');
        setLoading(false);
      }
    };

    fetchBitcoinPrice();
    const interval = setInterval(fetchBitcoinPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(data));
  }, [data]);

  const addTask = () => {
    if (!task.trim()) {
      setShowTaskModal(true);
      return;
    }

    if (editId !== null) {
      setData(data.map((t) => (t.id === editId ? { ...t, name: task } : t)));
      setEditId(null);
    } else {
      setData([...data, { id: Date.now(), name: task, completed: false }]);
    }

    setTask('');
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTask(e.target.value);
  };

  const deleteTask = (id: number) => {
    setData(data.filter((t) => t.id !== id));
  };

  const editTask = (id: number) => {
    const toEdit = data.find((t) => t.id === id);
    if (toEdit) {
      setTask(toEdit.name);
      setEditId(id);
    }
  };

  const toggleTask = (id: number) => {
    setData(data.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  return (
    <Container maxWidth="sm">
      <Box textTransform={'uppercase'} display="flex" justifyContent="space-between" alignItems="center" mt={4} mb={2}>
        <Typography variant="h4" fontWeight={700}>To-Do List</Typography>
        <Button
          variant="contained"
          color="success"
          startIcon={<BitcoinIcon />}
          onClick={() => setShowBitcoinModal(true)}
        >
          Курс Биткоина
        </Button>
      </Box>

      {/* Ввод новой задачи */}
      <Box display="flex" mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          label="Введите задачу"
          color="secondary"
          value={task}
          onChange={handleInputChange}
        />
        <Button variant="contained" color="secondary" onClick={addTask} sx={{ ml: 2}}>
          {editId ? 'Обновить' : 'Добавить'}
        </Button>
      </Box>

      {/* Список задач */}
      <List>
        {data.map((t) => (
          <ListItem key={t.id} divider>
            <Switch checked={t.completed} onChange={() => toggleTask(t.id)} color='secondary'/>
            <ListItemText primary={t.name} sx={{ textDecoration: t.completed ? 'line-through' : 'none' }} />
            <ListItemSecondaryAction>
              <IconButton onClick={() => editTask(t.id)} color="primary">
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => deleteTask(t.id)} color="error">
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      {/* Модальное окно курса биткоина */}
      <Dialog open={showBitcoinModal} onClose={() => setShowBitcoinModal(false)}>
        <DialogTitle>Курс Биткоина</DialogTitle>
        <DialogContent>
          {loading ? (
            <Typography>Загрузка...</Typography>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <>
              <Typography>
                <strong>USD:</strong> ${bitcoinData?.USD.rate_float.toFixed(2)}
              </Typography>
              <Typography>
                <strong>GBP:</strong> £{bitcoinData?.GBP.rate_float.toFixed(2)}
              </Typography>
              <Typography>
                <strong>EUR:</strong> €{bitcoinData?.EUR.rate_float.toFixed(2)}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBitcoinModal(false)} color="secondary">Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Модальное окно ошибки */}
      <Dialog open={showTaskModal} onClose={() => setShowTaskModal(false)}>
        <DialogTitle>Ошибка</DialogTitle>
        <DialogContent>
          <Typography>Вы должны ввести текст задачи!</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTaskModal(false)} color="secondary">
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default App;
