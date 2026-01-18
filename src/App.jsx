import { useState, useEffect } from 'react'
import { 
  Plus, Minus, Wallet, TrendingUp, Hash, DollarSign, 
  Pencil, Trash2, X, Download, Settings, FileText,
  ChevronLeft, ChevronRight, Calendar, LayoutDashboard,
  Receipt, PiggyBank, Target, Moon, Sun, Search,
  ArrowUpRight, ArrowDownRight, Filter, MoreVertical, Menu,
  Repeat, Play, Pause, FileDown, Clock, AlertCircle,
  LogOut, RefreshCw, Check, Cloud, CloudOff
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, Area, AreaChart } from 'recharts'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval, subMonths, addMonths, parseISO, subWeeks, getDay, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { supabase, isSupabaseConfigured } from './lib/supabase'
import Auth from './Auth'

// Categorías iniciales de GASTOS
const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Alimentación', emoji: '🍔', color: '#ef4444' },
  { id: 2, name: 'Vivienda', emoji: '🏠', color: '#f59e0b' },
  { id: 3, name: 'Transporte', emoji: '🚌', color: '#3b82f6' },
  { id: 4, name: 'Salud', emoji: '🏥', color: '#10b981' },
  { id: 5, name: 'Pareja', emoji: '👫', color: '#ec4899' },
  { id: 6, name: 'Educación', emoji: '🎓', color: '#8b5cf6' },
  { id: 7, name: 'Tecnología', emoji: '💻', color: '#06b6d4' },
  { id: 8, name: 'Finanzas', emoji: '💵', color: '#22c55e' },
  { id: 9, name: 'Suscripciones', emoji: '📺', color: '#f97316' },
  { id: 10, name: 'Ocio', emoji: '🎉', color: '#a855f7' },
  { id: 11, name: 'Familia', emoji: '👨‍👩‍👧', color: '#14b8a6' },
  { id: 12, name: 'Otros', emoji: '📦', color: '#6b7280' },
]

// Categorías de INGRESOS
const DEFAULT_INCOME_CATEGORIES = [
  { id: 101, name: 'Salario Mensual', emoji: '💰', color: '#22c55e' },
  { id: 102, name: 'Comisiones HKA', emoji: '🏢', color: '#10b981' },
  { id: 103, name: 'Comisiones Extra', emoji: '💵', color: '#14b8a6' },
  { id: 104, name: 'Camarones', emoji: '🦐', color: '#f59e0b' },
  { id: 105, name: 'Proyectos Personales', emoji: '🚀', color: '#8b5cf6' },
]

// Datos de ejemplo
const SAMPLE_EXPENSES = [
  { id: 1, description: 'Escritorio para monitor', amount: 114.71, categoryId: 7, date: '2026-01-15', type: 'gasto' },
  { id: 2, description: 'Fonda almuerzo', amount: 4.65, categoryId: 1, date: '2026-01-15', type: 'gasto' },
  { id: 3, description: 'Fonda cena', amount: 5.15, categoryId: 1, date: '2026-01-15', type: 'gasto' },
  { id: 4, description: 'Pago de mi data', amount: 31.37, categoryId: 9, date: '2026-01-16', type: 'gasto' },
  { id: 5, description: 'YouTube Premium', amount: 1.70, categoryId: 9, date: '2026-01-16', type: 'gasto' },
  { id: 6, description: 'Traslado de mini', amount: 12.00, categoryId: 3, date: '2026-01-16', type: 'gasto' },
  { id: 7, description: 'Fonda', amount: 5.00, categoryId: 1, date: '2026-01-17', type: 'gasto' },
  { id: 8, description: 'Uber al trabajo', amount: 8.50, categoryId: 3, date: '2026-01-14', type: 'gasto' },
  { id: 9, description: 'Netflix', amount: 15.99, categoryId: 9, date: '2026-01-10', type: 'gasto' },
  { id: 10, description: 'Farmacia', amount: 25.00, categoryId: 4, date: '2026-01-12', type: 'gasto' },
  { id: 11, description: 'Salario Enero', amount: 1500.00, categoryId: 101, date: '2026-01-05', type: 'ingreso' },
  { id: 12, description: 'Comisión proyecto web', amount: 200.00, categoryId: 105, date: '2026-01-10', type: 'ingreso' },
]

// Presupuestos de ejemplo
const DEFAULT_BUDGETS = [
  { id: 1, categoryId: 1, limit: 200 },
  { id: 2, categoryId: 3, limit: 100 },
  { id: 3, categoryId: 9, limit: 50 },
  { id: 4, categoryId: 7, limit: 150 },
]

// Recurrentes de ejemplo
const DEFAULT_RECURRING = [
  { id: 1, description: 'Netflix', amount: 15.99, categoryId: 9, type: 'gasto', dayOfMonth: 15, active: true, lastProcessed: null },
  { id: 2, description: 'Salario Mensual', amount: 1500, categoryId: 101, type: 'ingreso', dayOfMonth: 1, active: true, lastProcessed: null },
  { id: 3, description: 'Internet', amount: 45, categoryId: 9, type: 'gasto', dayOfMonth: 20, active: true, lastProcessed: null },
  { id: 4, description: 'Gym', amount: 30, categoryId: 4, type: 'gasto', dayOfMonth: 5, active: false, lastProcessed: null },
]

// Metas de ejemplo
const DEFAULT_GOALS = [
  { id: 1, name: 'Fondo de emergencia', targetAmount: 1000, currentAmount: 450, emoji: '🛡️', deadline: '2026-06-01', deposits: [
    { id: 1, amount: 200, date: '2026-01-01', note: 'Depósito inicial' },
    { id: 2, amount: 250, date: '2026-01-15', note: 'Ahorro quincenal' },
  ]},
  { id: 2, name: 'Vacaciones', targetAmount: 2000, currentAmount: 800, emoji: '✈️', deadline: '2026-12-01', deposits: [] },
  { id: 3, name: 'Laptop nueva', targetAmount: 1500, currentAmount: 200, emoji: '💻', deadline: '2026-08-01', deposits: [] },
]

function App() {
  // Authentication state
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState('idle') // idle, syncing, synced, error
  const [dataLoaded, setDataLoaded] = useState(false)
  
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const [currentView, setCurrentView] = useState('dashboard')
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('expenses')
    return saved ? JSON.parse(saved) : SAMPLE_EXPENSES
  })
  
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('categories')
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES
  })

  const [incomeCategories, setIncomeCategories] = useState(() => {
    const saved = localStorage.getItem('incomeCategories')
    return saved ? JSON.parse(saved) : DEFAULT_INCOME_CATEGORIES
  })
  
  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem('budgets')
    return saved ? JSON.parse(saved) : DEFAULT_BUDGETS
  })
  
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('goals')
    return saved ? JSON.parse(saved) : DEFAULT_GOALS
  })

  const [recurring, setRecurring] = useState(() => {
    const saved = localStorage.getItem('recurring')
    return saved ? JSON.parse(saved) : DEFAULT_RECURRING
  })

  const [savedReports, setSavedReports] = useState(() => {
    const saved = localStorage.getItem('savedReports')
    return saved ? JSON.parse(saved) : []
  })

  const [lastReportReminder, setLastReportReminder] = useState(() => {
    return localStorage.getItem('lastReportReminder') || null
  })
  
  const [showModal, setShowModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showIncomeCategories, setShowIncomeCategories] = useState(false)
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showRecurringModal, setShowRecurringModal] = useState(false)
  const [editingRecurring, setEditingRecurring] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedGoalForDeposit, setSelectedGoalForDeposit] = useState(null)
  const [editingExpense, setEditingExpense] = useState(null)
  const [editingGoal, setEditingGoal] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState('distribution')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterType, setFilterType] = useState('all')
  
  // Form states
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    categoryId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'gasto'
  })
  
  const [budgetForm, setBudgetForm] = useState({ categoryId: '', limit: '' })
  const [goalForm, setGoalForm] = useState({ name: '', targetAmount: '', currentAmount: '', emoji: '🎯', deadline: '' })
  const [depositForm, setDepositForm] = useState({ amount: '', note: '' })
  const [newCategory, setNewCategory] = useState({ name: '', emoji: '📦' })
  const [newIncomeCategory, setNewIncomeCategory] = useState({ name: '', emoji: '💵' })
  const [recurringForm, setRecurringForm] = useState({
    description: '',
    amount: '',
    categoryId: '',
    type: 'gasto',
    dayOfMonth: '1',
    active: true
  })

  // ==================== AUTHENTICATION & SYNC ====================
  
  // Check authentication on mount
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setAuthLoading(false)
      return
    }
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserData(session.user.id)
      }
      setAuthLoading(false)
    })
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user && !dataLoaded) {
        loadUserData(session.user.id)
      }
    })
    
    return () => subscription.unsubscribe()
  }, [])
  
  // Load user data from Supabase
  const loadUserData = async (userId) => {
    if (!isSupabaseConfigured()) return
    
    setSyncStatus('syncing')
    try {
      // Load user_data from Supabase
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading data:', error)
        setSyncStatus('error')
        return
      }
      
      if (data) {
        // Load data from Supabase
        if (data.expenses) setExpenses(data.expenses)
        if (data.categories) setCategories(data.categories)
        if (data.income_categories) setIncomeCategories(data.income_categories)
        if (data.budgets) setBudgets(data.budgets)
        if (data.goals) setGoals(data.goals)
        if (data.recurring) setRecurring(data.recurring)
        if (data.saved_reports) setSavedReports(data.saved_reports)
        showToast('Datos sincronizados correctamente', 'success')
      } else {
        // First time user - create entry with current local data
        await saveUserData(userId)
      }
      
      setDataLoaded(true)
      setSyncStatus('synced')
    } catch (err) {
      console.error('Error loading data:', err)
      setSyncStatus('error')
    }
  }
  
  // Save user data to Supabase
  const saveUserData = async (userId = user?.id) => {
    if (!isSupabaseConfigured() || !userId) return
    
    setSyncStatus('syncing')
    try {
      const { error } = await supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          expenses,
          categories,
          income_categories: incomeCategories,
          budgets,
          goals,
          recurring,
          saved_reports: savedReports,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
      
      if (error) {
        console.error('Error saving data:', error)
        setSyncStatus('error')
        return
      }
      
      setSyncStatus('synced')
    } catch (err) {
      console.error('Error saving data:', err)
      setSyncStatus('error')
    }
  }
  
  // Auto-save to Supabase when data changes (debounced)
  useEffect(() => {
    if (!user || !dataLoaded) return
    
    const timeoutId = setTimeout(() => {
      saveUserData()
    }, 2000) // Debounce 2 seconds
    
    return () => clearTimeout(timeoutId)
  }, [expenses, categories, incomeCategories, budgets, goals, recurring, savedReports, user, dataLoaded])
  
  // Logout function
  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut()
    }
    setUser(null)
    setDataLoaded(false)
    // Keep local data after logout
  }
  
  // Handle login success
  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser)
    loadUserData(loggedInUser.id)
  }

  // Theme effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  // Guardar en localStorage (backup local)
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses))
  }, [expenses])
  
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories))
  }, [categories])

  useEffect(() => {
    localStorage.setItem('incomeCategories', JSON.stringify(incomeCategories))
  }, [incomeCategories])

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets))
  }, [budgets])

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals))
  }, [goals])

  useEffect(() => {
    localStorage.setItem('recurring', JSON.stringify(recurring))
  }, [recurring])

  useEffect(() => {
    localStorage.setItem('savedReports', JSON.stringify(savedReports))
  }, [savedReports])

  useEffect(() => {
    if (lastReportReminder) {
      localStorage.setItem('lastReportReminder', lastReportReminder)
    }
  }, [lastReportReminder])

  // Procesar recurrentes al cargar la app
  useEffect(() => {
    processRecurring()
  }, [])

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Filtrar gastos del mes seleccionado
  const monthExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date)
    return isWithinInterval(expDate, {
      start: startOfMonth(selectedMonth),
      end: endOfMonth(selectedMonth)
    })
  })

  // Separar gastos e ingresos del mes
  const monthOnlyExpenses = monthExpenses.filter(exp => exp.type === 'gasto')
  const monthOnlyIncome = monthExpenses.filter(exp => exp.type === 'ingreso')

  // Estadísticas
  const totalExpenses = expenses.filter(e => e.type === 'gasto').reduce((sum, exp) => sum + exp.amount, 0)
  const totalIncome = expenses.filter(e => e.type === 'ingreso').reduce((sum, exp) => sum + exp.amount, 0)
  const monthTotalExpenses = monthOnlyExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  const monthTotalIncome = monthOnlyIncome.reduce((sum, exp) => sum + exp.amount, 0)
  const monthBalance = monthTotalIncome - monthTotalExpenses
  const transactionCount = monthExpenses.length
  const averageExpense = monthOnlyExpenses.length > 0 ? monthTotalExpenses / monthOnlyExpenses.length : 0
  
  // Comparación con mes anterior
  const lastMonth = subMonths(selectedMonth, 1)
  const lastMonthExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date)
    return isWithinInterval(expDate, {
      start: startOfMonth(lastMonth),
      end: endOfMonth(lastMonth)
    }) && exp.type === 'gasto'
  })
  const lastMonthTotal = lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  const monthChange = lastMonthTotal > 0 ? ((monthTotalExpenses - lastMonthTotal) / lastMonthTotal * 100) : 0

  // Categoría más usada del mes (solo gastos)
  const categoryTotals = monthOnlyExpenses.reduce((acc, exp) => {
    acc[exp.categoryId] = (acc[exp.categoryId] || 0) + exp.amount
    return acc
  }, {})
  
  const topCategoryId = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0]
  const topCategory = categories.find(c => c.id === Number(topCategoryId))

  // Datos para el gráfico de distribución
  const chartData = categories
    .map(cat => ({
      name: cat.name,
      value: categoryTotals[cat.id] || 0,
      color: cat.color,
      emoji: cat.emoji
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value)

  // Datos para comparación mensual
  const getMonthlyComparison = () => {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(new Date(), i)
      const monthExps = expenses.filter(exp => {
        const expDate = new Date(exp.date)
        return isWithinInterval(expDate, {
          start: startOfMonth(month),
          end: endOfMonth(month)
        })
      })
      const gastos = monthExps.filter(e => e.type === 'gasto').reduce((sum, exp) => sum + exp.amount, 0)
      const ingresos = monthExps.filter(e => e.type === 'ingreso').reduce((sum, exp) => sum + exp.amount, 0)
      months.push({
        name: format(month, 'MMM', { locale: es }),
        gastos,
        ingresos
      })
    }
    return months
  }

  // Filtrar transacciones para vista de transacciones
  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || exp.categoryId === Number(filterCategory)
    const matchesType = filterType === 'all' || exp.type === filterType
    return matchesSearch && matchesCategory && matchesType
  }).sort((a, b) => new Date(b.date) - new Date(a.date))

  // Obtener todas las categorías (gastos + ingresos)
  const getAllCategories = () => [...categories, ...incomeCategories]
  const getCategoryById = (id) => getAllCategories().find(c => c.id === id)

  // Handlers
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.description || !formData.amount || !formData.categoryId) {
      showToast('Por favor completa todos los campos', 'error')
      return
    }

    if (editingExpense) {
      setExpenses(prev => prev.map(exp => 
        exp.id === editingExpense.id 
          ? { ...exp, ...formData, amount: parseFloat(formData.amount), categoryId: Number(formData.categoryId) }
          : exp
      ))
      showToast(formData.type === 'ingreso' ? 'Ingreso actualizado' : 'Gasto actualizado')
    } else {
      const newExpense = {
        id: Date.now(),
        ...formData,
        amount: parseFloat(formData.amount),
        categoryId: Number(formData.categoryId)
      }
      setExpenses(prev => [newExpense, ...prev])
      showToast(formData.type === 'ingreso' ? 'Ingreso registrado' : 'Gasto registrado')
    }
    
    closeModal()
  }

  const handleEdit = (expense) => {
    setEditingExpense(expense)
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      categoryId: expense.categoryId.toString(),
      date: expense.date,
      type: expense.type
    })
    setShowModal(true)
  }

  const handleDelete = (id) => {
    if (confirm('¿Estás seguro de eliminar este gasto?')) {
      setExpenses(prev => prev.filter(exp => exp.id !== id))
      showToast('Gasto eliminado')
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingExpense(null)
    setFormData({
      description: '',
      amount: '',
      categoryId: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      type: 'gasto'
    })
  }

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      showToast('Ingresa un nombre para la categoría', 'error')
      return
    }
    
    const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#06b6d4', '#22c55e']
    const newCat = {
      id: Date.now(),
      name: newCategory.name.trim(),
      emoji: newCategory.emoji || '📦',
      color: colors[Math.floor(Math.random() * colors.length)]
    }
    
    setCategories(prev => [...prev, newCat])
    setNewCategory({ name: '', emoji: '📦' })
    showToast('Categoría añadida')
  }

  const handleDeleteCategory = (id) => {
    const hasExpenses = expenses.some(exp => exp.categoryId === id)
    if (hasExpenses) {
      showToast('No puedes eliminar una categoría con gastos asociados', 'error')
      return
    }
    
    setCategories(prev => prev.filter(cat => cat.id !== id))
    showToast('Categoría eliminada')
  }

  const handleAddIncomeCategory = () => {
    if (!newIncomeCategory.name.trim()) {
      showToast('Ingresa un nombre para la categoría', 'error')
      return
    }
    
    const colors = ['#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6']
    const newCat = {
      id: Date.now(),
      name: newIncomeCategory.name.trim(),
      emoji: newIncomeCategory.emoji || '💵',
      color: colors[Math.floor(Math.random() * colors.length)]
    }
    
    setIncomeCategories(prev => [...prev, newCat])
    setNewIncomeCategory({ name: '', emoji: '💵' })
    showToast('Categoría de ingreso añadida')
  }

  const handleDeleteIncomeCategory = (id) => {
    const hasExpenses = expenses.some(exp => exp.categoryId === id)
    if (hasExpenses) {
      showToast('No puedes eliminar una categoría con ingresos asociados', 'error')
      return
    }
    
    setIncomeCategories(prev => prev.filter(cat => cat.id !== id))
    showToast('Categoría eliminada')
  }

  const handleAddBudget = () => {
    if (!budgetForm.categoryId || !budgetForm.limit) {
      showToast('Completa todos los campos', 'error')
      return
    }
    
    const exists = budgets.find(b => b.categoryId === Number(budgetForm.categoryId))
    if (exists) {
      setBudgets(prev => prev.map(b => 
        b.categoryId === Number(budgetForm.categoryId) 
          ? { ...b, limit: parseFloat(budgetForm.limit) }
          : b
      ))
    } else {
      setBudgets(prev => [...prev, {
        id: Date.now(),
        categoryId: Number(budgetForm.categoryId),
        limit: parseFloat(budgetForm.limit)
      }])
    }
    
    setBudgetForm({ categoryId: '', limit: '' })
    setShowBudgetModal(false)
    showToast('Presupuesto guardado')
  }

  const handleDeleteBudget = (id) => {
    setBudgets(prev => prev.filter(b => b.id !== id))
    showToast('Presupuesto eliminado')
  }

  const handleAddGoal = () => {
    if (!goalForm.name || !goalForm.targetAmount) {
      showToast('Completa los campos requeridos', 'error')
      return
    }
    
    if (editingGoal) {
      setGoals(prev => prev.map(g => 
        g.id === editingGoal.id 
          ? { ...g, ...goalForm, targetAmount: parseFloat(goalForm.targetAmount), currentAmount: parseFloat(goalForm.currentAmount) || 0 }
          : g
      ))
      showToast('Meta actualizada')
    } else {
      setGoals(prev => [...prev, {
        id: Date.now(),
        ...goalForm,
        targetAmount: parseFloat(goalForm.targetAmount),
        currentAmount: parseFloat(goalForm.currentAmount) || 0,
        deposits: []
      }])
      showToast('Meta creada')
    }
    
    setGoalForm({ name: '', targetAmount: '', currentAmount: '', emoji: '🎯', deadline: '' })
    setEditingGoal(null)
    setShowGoalModal(false)
  }

  const handleOpenDeposit = (goal) => {
    setSelectedGoalForDeposit(goal)
    setDepositForm({ amount: '', note: '' })
    setShowDepositModal(true)
  }

  const handleAddDeposit = () => {
    if (!depositForm.amount || parseFloat(depositForm.amount) <= 0) {
      showToast('Ingresa un monto válido', 'error')
      return
    }

    const amount = parseFloat(depositForm.amount)
    const newDeposit = {
      id: Date.now(),
      amount,
      date: format(new Date(), 'yyyy-MM-dd'),
      note: depositForm.note || 'Depósito'
    }

    setGoals(prev => prev.map(g => 
      g.id === selectedGoalForDeposit.id 
        ? { 
            ...g, 
            currentAmount: g.currentAmount + amount,
            deposits: [...(g.deposits || []), newDeposit]
          }
        : g
    ))

    setShowDepositModal(false)
    setSelectedGoalForDeposit(null)
    setDepositForm({ amount: '', note: '' })
    showToast(`$${amount.toFixed(2)} agregados a "${selectedGoalForDeposit.name}"`)
  }

  const handleWithdrawFromGoal = (goal, amount) => {
    if (amount > goal.currentAmount) {
      showToast('No puedes retirar más de lo ahorrado', 'error')
      return
    }

    const withdrawDeposit = {
      id: Date.now(),
      amount: -amount,
      date: format(new Date(), 'yyyy-MM-dd'),
      note: 'Retiro'
    }

    setGoals(prev => prev.map(g => 
      g.id === goal.id 
        ? { 
            ...g, 
            currentAmount: g.currentAmount - amount,
            deposits: [...(g.deposits || []), withdrawDeposit]
          }
        : g
    ))

    showToast(`$${amount.toFixed(2)} retirados de "${goal.name}"`)
  }

  const handleEditGoal = (goal) => {
    setEditingGoal(goal)
    setGoalForm({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      emoji: goal.emoji,
      deadline: goal.deadline || ''
    })
    setShowGoalModal(true)
  }

  const handleDeleteGoal = (id) => {
    if (confirm('¿Eliminar esta meta?')) {
      setGoals(prev => prev.filter(g => g.id !== id))
      showToast('Meta eliminada')
    }
  }

  // ========== RECURRING HANDLERS ==========
  
  // Procesar recurrentes pendientes del mes actual
  const processRecurring = () => {
    const today = new Date()
    const currentMonth = format(today, 'yyyy-MM')
    const currentDay = today.getDate()
    
    let processedCount = 0
    const updatedRecurring = []
    const newTransactions = []

    recurring.forEach(rec => {
      const lastProcessedMonth = rec.lastProcessed ? rec.lastProcessed.substring(0, 7) : null
      
      // Si está activo, el día ya pasó (o es hoy), y no se ha procesado este mes
      if (rec.active && rec.dayOfMonth <= currentDay && lastProcessedMonth !== currentMonth) {
        // Crear la transacción
        const transactionDate = format(new Date(today.getFullYear(), today.getMonth(), rec.dayOfMonth), 'yyyy-MM-dd')
        newTransactions.push({
          id: Date.now() + Math.random(),
          description: rec.description,
          amount: rec.amount,
          categoryId: rec.categoryId,
          date: transactionDate,
          type: rec.type,
          fromRecurring: rec.id
        })
        
        // Marcar como procesado
        updatedRecurring.push({ ...rec, lastProcessed: currentMonth })
        processedCount++
      } else {
        updatedRecurring.push(rec)
      }
    })

    if (processedCount > 0) {
      setRecurring(updatedRecurring)
      setExpenses(prev => [...newTransactions, ...prev])
      setTimeout(() => {
        showToast(`${processedCount} transacción(es) recurrente(s) procesada(s)`)
      }, 500)
    }
  }

  const handleAddRecurring = () => {
    if (!recurringForm.description || !recurringForm.amount || !recurringForm.categoryId) {
      showToast('Por favor completa todos los campos', 'error')
      return
    }

    if (editingRecurring) {
      setRecurring(prev => prev.map(r => 
        r.id === editingRecurring.id 
          ? { 
              ...r, 
              ...recurringForm, 
              amount: parseFloat(recurringForm.amount),
              categoryId: Number(recurringForm.categoryId),
              dayOfMonth: Number(recurringForm.dayOfMonth)
            }
          : r
      ))
      showToast('Recurrente actualizado')
    } else {
      const newRecurring = {
        id: Date.now(),
        ...recurringForm,
        amount: parseFloat(recurringForm.amount),
        categoryId: Number(recurringForm.categoryId),
        dayOfMonth: Number(recurringForm.dayOfMonth),
        lastProcessed: null
      }
      setRecurring(prev => [...prev, newRecurring])
      showToast(recurringForm.type === 'ingreso' ? 'Ingreso recurrente creado' : 'Gasto recurrente creado')
    }

    closeRecurringModal()
  }

  const handleEditRecurring = (rec) => {
    setEditingRecurring(rec)
    setRecurringForm({
      description: rec.description,
      amount: rec.amount.toString(),
      categoryId: rec.categoryId.toString(),
      type: rec.type,
      dayOfMonth: rec.dayOfMonth.toString(),
      active: rec.active
    })
    setShowRecurringModal(true)
  }

  const handleToggleRecurring = (id) => {
    setRecurring(prev => prev.map(r => 
      r.id === id ? { ...r, active: !r.active } : r
    ))
    const rec = recurring.find(r => r.id === id)
    showToast(rec?.active ? 'Recurrente pausado' : 'Recurrente activado')
  }

  const handleDeleteRecurring = (id) => {
    if (confirm('¿Eliminar este recurrente?')) {
      setRecurring(prev => prev.filter(r => r.id !== id))
      showToast('Recurrente eliminado')
    }
  }

  const closeRecurringModal = () => {
    setShowRecurringModal(false)
    setEditingRecurring(null)
    setRecurringForm({
      description: '',
      amount: '',
      categoryId: '',
      type: 'gasto',
      dayOfMonth: '1',
      active: true
    })
  }

  // Calcular totales de recurrentes
  const recurringStats = {
    totalGastos: recurring.filter(r => r.type === 'gasto' && r.active).reduce((sum, r) => sum + r.amount, 0),
    totalIngresos: recurring.filter(r => r.type === 'ingreso' && r.active).reduce((sum, r) => sum + r.amount, 0),
    activeCount: recurring.filter(r => r.active).length,
    pausedCount: recurring.filter(r => !r.active).length
  }

  const exportToCSV = () => {
    const headers = ['Fecha', 'Descripción', 'Categoría', 'Monto', 'Tipo']
    const rows = (currentView === 'transactions' ? filteredExpenses : monthExpenses).map(exp => {
      const cat = categories.find(c => c.id === exp.categoryId)
      return [
        exp.date,
        exp.description,
        cat?.name || 'Sin categoría',
        exp.amount.toFixed(2),
        exp.type
      ]
    })
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `gastos_${format(selectedMonth, 'yyyy-MM')}.csv`
    link.click()
    
    showToast('Archivo exportado correctamente')
  }

  // ========== REPORT FUNCTIONS ==========
  
  // Verificar si necesita recordatorio (cada lunes)
  const needsReportReminder = () => {
    const today = new Date()
    const dayOfWeek = getDay(today) // 0 = domingo, 1 = lunes
    
    if (dayOfWeek !== 1) return false // Solo lunes
    
    const todayStr = format(today, 'yyyy-MM-dd')
    if (lastReportReminder === todayStr) return false // Ya se mostró hoy
    
    return true
  }

  // Generar datos para el reporte
  const generateReportData = (type, customStartDate = null, customEndDate = null) => {
    const today = new Date()
    let startDate, endDate, periodName
    
    if (type === 'weekly') {
      startDate = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 })
      endDate = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 })
      periodName = `Semana ${format(startDate, 'dd MMM', { locale: es })} - ${format(endDate, 'dd MMM yyyy', { locale: es })}`
    } else if (type === 'monthly') {
      startDate = startOfMonth(subMonths(today, 1))
      endDate = endOfMonth(subMonths(today, 1))
      periodName = format(startDate, 'MMMM yyyy', { locale: es })
    } else if (type === 'current-month') {
      startDate = startOfMonth(today)
      endDate = today
      periodName = format(startDate, 'MMMM yyyy', { locale: es }) + ' (parcial)'
    } else if (type === 'custom' && customStartDate && customEndDate) {
      startDate = parseISO(customStartDate)
      endDate = parseISO(customEndDate)
      periodName = `${format(startDate, 'dd MMM', { locale: es })} - ${format(endDate, 'dd MMM yyyy', { locale: es })}`
    }

    // Filtrar transacciones del período
    const periodExpenses = expenses.filter(exp => {
      const expDate = parseISO(exp.date)
      return isWithinInterval(expDate, { start: startDate, end: endDate })
    })

    // Calcular totales
    const gastos = periodExpenses.filter(e => e.type === 'gasto')
    const ingresos = periodExpenses.filter(e => e.type === 'ingreso')
    const totalGastos = gastos.reduce((sum, e) => sum + e.amount, 0)
    const totalIngresos = ingresos.reduce((sum, e) => sum + e.amount, 0)
    const balance = totalIngresos - totalGastos

    // Gastos por categoría
    const gastosPorCategoria = {}
    gastos.forEach(exp => {
      const cat = getCategoryById(exp.categoryId)
      const catName = cat?.name || 'Sin categoría'
      if (!gastosPorCategoria[catName]) {
        gastosPorCategoria[catName] = { total: 0, count: 0, emoji: cat?.emoji || '📦' }
      }
      gastosPorCategoria[catName].total += exp.amount
      gastosPorCategoria[catName].count++
    })

    // Ingresos por categoría
    const ingresosPorCategoria = {}
    ingresos.forEach(exp => {
      const cat = getCategoryById(exp.categoryId)
      const catName = cat?.name || 'Sin categoría'
      if (!ingresosPorCategoria[catName]) {
        ingresosPorCategoria[catName] = { total: 0, count: 0, emoji: cat?.emoji || '💰' }
      }
      ingresosPorCategoria[catName].total += exp.amount
      ingresosPorCategoria[catName].count++
    })

    // Top 5 gastos
    const topGastos = [...gastos].sort((a, b) => b.amount - a.amount).slice(0, 5)

    return {
      type,
      periodName,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      totalGastos,
      totalIngresos,
      balance,
      transactionCount: periodExpenses.length,
      gastosPorCategoria,
      ingresosPorCategoria,
      topGastos,
      allTransactions: periodExpenses
    }
  }

  // Generar PDF
  const generatePDF = (reportData) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    
    // Header
    doc.setFillColor(124, 58, 237)
    doc.rect(0, 0, pageWidth, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.text('SpendSmart', 14, 20)
    doc.setFontSize(12)
    doc.text(`Reporte: ${reportData.periodName}`, 14, 32)
    
    // Reset text color
    doc.setTextColor(0, 0, 0)
    
    // Summary section
    let y = 55
    doc.setFontSize(16)
    doc.text('Resumen', 14, y)
    y += 10
    
    doc.setFontSize(11)
    doc.setTextColor(34, 197, 94)
    doc.text(`Total Ingresos: $${reportData.totalIngresos.toFixed(2)}`, 14, y)
    y += 7
    doc.setTextColor(239, 68, 68)
    doc.text(`Total Gastos: $${reportData.totalGastos.toFixed(2)}`, 14, y)
    y += 7
    doc.setTextColor(reportData.balance >= 0 ? 34 : 239, reportData.balance >= 0 ? 197 : 68, reportData.balance >= 0 ? 94 : 68)
    doc.text(`Balance: $${reportData.balance.toFixed(2)}`, 14, y)
    y += 7
    doc.setTextColor(100, 100, 100)
    doc.text(`Transacciones: ${reportData.transactionCount}`, 14, y)
    y += 15

    // Gastos por categoría
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.text('Gastos por Categoría', 14, y)
    y += 8

    const gastosData = Object.entries(reportData.gastosPorCategoria)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([name, data]) => [
        `${data.emoji} ${name}`,
        data.count.toString(),
        `$${data.total.toFixed(2)}`
      ])

    if (gastosData.length > 0) {
      doc.autoTable({
        startY: y,
        head: [['Categoría', 'Trans.', 'Total']],
        body: gastosData,
        theme: 'striped',
        headStyles: { fillColor: [239, 68, 68] },
        margin: { left: 14, right: 14 }
      })
      y = doc.lastAutoTable.finalY + 10
    } else {
      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text('Sin gastos en este período', 14, y + 5)
      y += 15
    }

    // Ingresos por categoría
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.text('Ingresos por Fuente', 14, y)
    y += 8

    const ingresosData = Object.entries(reportData.ingresosPorCategoria)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([name, data]) => [
        `${data.emoji} ${name}`,
        data.count.toString(),
        `$${data.total.toFixed(2)}`
      ])

    if (ingresosData.length > 0) {
      doc.autoTable({
        startY: y,
        head: [['Fuente', 'Trans.', 'Total']],
        body: ingresosData,
        theme: 'striped',
        headStyles: { fillColor: [34, 197, 94] },
        margin: { left: 14, right: 14 }
      })
      y = doc.lastAutoTable.finalY + 10
    }

    // Top 5 gastos
    if (reportData.topGastos.length > 0) {
      // Check if we need a new page
      if (y > 240) {
        doc.addPage()
        y = 20
      }

      doc.setFontSize(14)
      doc.text('Top 5 Gastos Más Altos', 14, y)
      y += 8

      const topData = reportData.topGastos.map(exp => {
        const cat = getCategoryById(exp.categoryId)
        return [
          format(parseISO(exp.date), 'dd/MM'),
          exp.description.substring(0, 30),
          cat?.name || 'Otro',
          `$${exp.amount.toFixed(2)}`
        ]
      })

      doc.autoTable({
        startY: y,
        head: [['Fecha', 'Descripción', 'Categoría', 'Monto']],
        body: topData,
        theme: 'striped',
        headStyles: { fillColor: [107, 114, 128] },
        margin: { left: 14, right: 14 }
      })
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(
        `Generado el ${format(new Date(), 'dd/MM/yyyy HH:mm')} - SpendSmart`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      )
    }

    return doc
  }

  // Descargar reporte
  const downloadReport = (type) => {
    const reportData = generateReportData(type)
    const doc = generatePDF(reportData)
    doc.save(`reporte_${type}_${format(new Date(), 'yyyy-MM-dd')}.pdf`)
    
    // Guardar en historial
    const savedReport = {
      id: Date.now(),
      type,
      periodName: reportData.periodName,
      generatedAt: format(new Date(), 'yyyy-MM-dd HH:mm'),
      totalGastos: reportData.totalGastos,
      totalIngresos: reportData.totalIngresos,
      balance: reportData.balance
    }
    setSavedReports(prev => [savedReport, ...prev].slice(0, 20)) // Mantener últimos 20
    
    showToast('Reporte descargado')
  }

  // Descartar recordatorio
  const dismissReminder = () => {
    setLastReportReminder(format(new Date(), 'yyyy-MM-dd'))
  }

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transacciones', icon: Receipt },
    { id: 'recurring', label: 'Recurrentes', icon: Repeat },
    { id: 'budget', label: 'Presupuesto', icon: PiggyBank },
    { id: 'goals', label: 'Metas', icon: Target },
    { id: 'reports', label: 'Reportes', icon: FileText },
  ]

  // Show loading while checking auth
  if (authLoading && isSupabaseConfigured()) {
    return (
      <div className="auth-container" data-theme={theme}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <RefreshCw size={40} className="spinner" style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  // Show login if not authenticated and Supabase is configured
  if (!user && isSupabaseConfigured()) {
    return <Auth onLogin={handleLoginSuccess} theme={theme} />
  }

  return (
    <div className="app" data-theme={theme}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Wallet size={22} />
          </div>
          <span>SpendSmart</span>
          <button 
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => { setCurrentView(item.id); setSidebarOpen(false); }}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <button 
            className="nav-item"
            onClick={() => setShowCategoryModal(true)}
          >
            <Settings size={20} />
            Categorías
          </button>
          <button
            className="theme-toggle"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
          </button>
          
          {/* User Menu & Sync Status */}
          {user && (
            <div className="user-menu">
              <div className="user-info">
                <div className="user-avatar">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                  <div className="user-name">{user.email?.split('@')[0]}</div>
                  <div className="user-email">{user.email}</div>
                </div>
              </div>
              <div className={`sync-indicator ${syncStatus}`}>
                {syncStatus === 'syncing' && <><RefreshCw size={14} /> Sincronizando...</>}
                {syncStatus === 'synced' && <><Check size={14} /> Sincronizado</>}
                {syncStatus === 'error' && <><CloudOff size={14} /> Error de sincronización</>}
                {syncStatus === 'idle' && <><Cloud size={14} /> Listo</>}
              </div>
              <button className="logout-btn" onClick={handleLogout}>
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          )}
          
          {/* Offline indicator when Supabase not configured */}
          {!isSupabaseConfigured() && (
            <div className="sync-indicator" style={{ marginTop: '1rem' }}>
              <CloudOff size={14} />
              Modo offline (localStorage)
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <button 
            className="mobile-menu-btn" 
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div className="header-content">
            <h1 className="page-title">
              {navItems.find(n => n.id === currentView)?.label}
            </h1>
            <p className="page-subtitle">
              {currentView === 'dashboard' && 'Resumen de tu actividad financiera'}
              {currentView === 'transactions' && 'Historial de todas tus transacciones'}
              {currentView === 'recurring' && 'Gestiona tus gastos e ingresos fijos'}
              {currentView === 'budget' && 'Control de presupuesto por categoría'}
              {currentView === 'goals' && 'Seguimiento de tus metas de ahorro'}
              {currentView === 'reports' && 'Genera y descarga reportes de tu actividad'}
            </p>
          </div>
        </header>

        {/* Floating Action Button for Mobile */}
        <button 
          className="fab" 
          onClick={() => setShowModal(true)}
          title="Nueva transacción"
        >
          <Plus size={28} />
          <span className="fab-text">Nueva Transacción</span>
        </button>
        {/* Main */}
        <main className="main">
          {/* Dashboard View */}
          {currentView === 'dashboard' && (
            <>
              {/* Month Selector */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                <div className="current-month" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button className="btn btn-ghost btn-icon" onClick={() => setSelectedMonth(prev => subMonths(prev, 1))}>
                    <ChevronLeft size={20} />
                  </button>
                  <div style={{ minWidth: '150px', textAlign: 'center' }}>
                    <small>Mes actual</small>
                    <span>{format(selectedMonth, 'MMMM yyyy', { locale: es })}</span>
                  </div>
                  <button className="btn btn-ghost btn-icon" onClick={() => setSelectedMonth(prev => addMonths(prev, 1))}>
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)', color: 'white' }}>
                  <div className="stat-label" style={{ color: 'rgba(255,255,255,0.85)' }}>Ingresos del Mes</div>
                  <div className="stat-value" style={{ color: 'white' }}>${monthTotalIncome.toFixed(2)}</div>
                  <div className="stat-sublabel" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    <ArrowUpRight size={16} style={{ display: 'inline' }} /> Total recibido
                  </div>
                </div>

                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)', color: 'white' }}>
                  <div className="stat-label" style={{ color: 'rgba(255,255,255,0.85)' }}>Gastos del Mes</div>
                  <div className="stat-value" style={{ color: 'white' }}>${monthTotalExpenses.toFixed(2)}</div>
                  <div className="stat-sublabel" style={{ color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {monthChange >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {Math.abs(monthChange).toFixed(1)}% vs mes anterior
                  </div>
                </div>
                
                <div className="stat-card primary">
                  <div className="stat-label" style={{ color: 'rgba(255,255,255,0.85)' }}>Balance</div>
                  <div className="stat-value" style={{ color: 'white' }}>${monthBalance.toFixed(2)}</div>
                  <div className="stat-sublabel" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {monthBalance >= 0 ? '✨ Vas bien!' : '⚠️ Gastos > Ingresos'}
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-card-header">
                    <div className="stat-icon green">
                      <DollarSign size={24} />
                    </div>
                    {topCategory && (
                      <span className="stat-badge green">{topCategory.emoji} Top</span>
                    )}
                  </div>
                  <div className="stat-label">Promedio por Gasto</div>
                  <div className="stat-value">${averageExpense.toFixed(2)}</div>
                  <div className="stat-sublabel">{monthOnlyExpenses.length} gastos este mes</div>
                </div>
              </div>

              {/* Dashboard Grid */}
              <div className="dashboard-grid">
                {/* Chart Section */}
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">Desglose de Gastos</h2>
                  </div>

                  <div className="chart-container" style={{ height: '220px' }}>
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={85}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => `$${value.toFixed(2)}`}
                            contentStyle={{ 
                              background: 'var(--bg-secondary)', 
                              border: '1px solid var(--border-color)', 
                              borderRadius: '8px',
                              color: 'var(--text-primary)'
                            }}
                            itemStyle={{ color: 'var(--text-primary)' }}
                            labelStyle={{ color: 'var(--text-primary)' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="empty-state">
                        <div className="empty-state-icon">📊</div>
                        <p>No hay datos para mostrar</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Legend */}
                  <div className="chart-legend">
                    {chartData.slice(0, 5).map((item, index) => (
                      <div key={index} className="legend-item">
                        <div className="legend-item-left">
                          <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                          <span className="legend-name">{item.emoji} {item.name}</span>
                        </div>
                        <span className="legend-value">${item.value.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">Transacciones Recientes</h2>
                    <button className="btn btn-ghost btn-sm" onClick={() => setCurrentView('transactions')}>
                      Ver todas
                    </button>
                  </div>
                  
                  <div className="transactions-list">
                    {monthExpenses.length > 0 ? (
                      [...monthExpenses]
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .slice(0, 6)
                        .map(expense => {
                          const category = getCategoryById(expense.categoryId)
                          const isIncome = expense.type === 'ingreso'
                          return (
                            <div key={expense.id} className="transaction-item">
                              <div 
                                className="transaction-icon" 
                                style={{ backgroundColor: `${category?.color}20` }}
                              >
                                {category?.emoji || '📦'}
                              </div>
                              <div className="transaction-info">
                                <div className="transaction-description">{expense.description}</div>
                                <div className="transaction-meta">
                                  {format(new Date(expense.date), 'dd MMM yyyy', { locale: es })} • {category?.name}
                                </div>
                              </div>
                              <div className="transaction-amount" style={{ color: isIncome ? '#22c55e' : '#ef4444' }}>
                                {isIncome ? '+' : '-'}${expense.amount.toFixed(2)}
                              </div>
                              <div className="transaction-actions">
                                <button 
                                  className="btn btn-ghost btn-icon btn-sm"
                                  onClick={() => handleEdit(expense)}
                                >
                                  <Pencil size={16} />
                                </button>
                                <button 
                                  className="btn btn-ghost btn-icon btn-sm"
                                  onClick={() => handleDelete(expense.id)}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          )
                        })
                    ) : (
                      <div className="empty-state">
                        <div className="empty-state-icon">💸</div>
                        <p>No hay transacciones este mes</p>
                        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowModal(true)}>
                          <Plus size={18} />
                          Agregar primera transacción
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Monthly Comparison Chart */}
              <div className="card" style={{ marginTop: '1.5rem' }}>
                <div className="card-header">
                  <h2 className="card-title">Comparación Mensual</h2>
                  <div className="tabs">
                    <button 
                      className={`tab ${activeTab === 'distribution' ? 'active' : ''}`}
                      onClick={() => setActiveTab('distribution')}
                    >
                      Barras
                    </button>
                    <button 
                      className={`tab ${activeTab === 'comparison' ? 'active' : ''}`}
                      onClick={() => setActiveTab('comparison')}
                    >
                      Líneas
                    </button>
                  </div>
                </div>
                <div className="chart-container">
                  {activeTab === 'distribution' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getMonthlyComparison()}>
                        <XAxis dataKey="name" stroke="var(--text-secondary)" />
                        <YAxis stroke="var(--text-secondary)" />
                        <Tooltip 
                          formatter={(value) => `$${value.toFixed(2)}`}
                          contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                        />
                        <Legend />
                        <Bar dataKey="gastos" fill="#ef4444" radius={[4, 4, 0, 0]} name="Gastos" />
                        <Bar dataKey="ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} name="Ingresos" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getMonthlyComparison()}>
                        <XAxis dataKey="name" stroke="var(--text-secondary)" />
                        <YAxis stroke="var(--text-secondary)" />
                        <Tooltip 
                          formatter={(value) => `$${value.toFixed(2)}`}
                          contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                        />
                        <Area type="monotone" dataKey="gastos" stroke="#ef4444" fill="rgba(239, 68, 68, 0.2)" name="Gastos" />
                        <Area type="monotone" dataKey="ingresos" stroke="#22c55e" fill="rgba(34, 197, 94, 0.2)" name="Ingresos" />
                        <Legend />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Transactions View */}
          {currentView === 'transactions' && (
            <div className="card">
              <div className="filter-bar">
                <div className="search-input" style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Buscar transacciones..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
                
                {/* Type Filter */}
                <select 
                  className="form-select"
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  style={{ minWidth: '120px' }}
                >
                  <option value="all">Todos</option>
                  <option value="gasto">🔴 Gastos</option>
                  <option value="ingreso">🟢 Ingresos</option>
                </select>

                {/* Category Filter */}
                <select 
                  className="form-select"
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                >
                  <option value="all">Todas las categorías</option>
                  <optgroup label="Gastos">
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Ingresos">
                    {incomeCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="transactions-list" style={{ maxHeight: 'none' }}>
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map(expense => {
                    const category = getCategoryById(expense.categoryId)
                    const isIncome = expense.type === 'ingreso'
                    return (
                      <div key={expense.id} className="transaction-item">
                        <div 
                          className="transaction-icon" 
                          style={{ backgroundColor: `${category?.color}20` }}
                        >
                          {category?.emoji || '📦'}
                        </div>
                        <div className="transaction-info">
                          <div className="transaction-description">{expense.description}</div>
                          <div className="transaction-meta">
                            {format(new Date(expense.date), 'dd MMMM yyyy', { locale: es })} • {category?.name}
                            <span style={{ 
                              marginLeft: '0.5rem', 
                              padding: '2px 6px', 
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              background: isIncome ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: isIncome ? '#22c55e' : '#ef4444'
                            }}>
                              {isIncome ? 'Ingreso' : 'Gasto'}
                            </span>
                          </div>
                        </div>
                        <div className="transaction-amount" style={{ color: isIncome ? '#22c55e' : '#ef4444' }}>
                          {isIncome ? '+' : '-'}${expense.amount.toFixed(2)}
                        </div>
                        <div className="transaction-actions" style={{ opacity: 1 }}>
                          <button 
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => handleEdit(expense)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => handleDelete(expense.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">🔍</div>
                    <p>No se encontraron transacciones</p>
                  </div>
                )}
              </div>
              
              <div className="pagination">
                <div className="pagination-info">
                  Mostrando {filteredExpenses.length} transacciones
                </div>
              </div>
            </div>
          )}

          {/* Budget View */}
          {currentView === 'budget' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                <button className="btn btn-primary" onClick={() => setShowBudgetModal(true)}>
                  <Plus size={18} />
                  Nuevo Presupuesto
                </button>
              </div>

              <div className="budget-grid">
                {budgets.map(budget => {
                  const category = getCategoryById(budget.categoryId)
                  const spent = categoryTotals[budget.categoryId] || 0
                  const percentage = Math.min((spent / budget.limit) * 100, 100)
                  const remaining = budget.limit - spent
                  const isOverBudget = spent > budget.limit
                  
                  return (
                    <div key={budget.id} className="budget-item">
                      <div className="budget-item-header">
                        <div className="budget-item-info">
                          <span className="budget-item-emoji">{category?.emoji}</span>
                          <div>
                            <div className="budget-item-name">{category?.name}</div>
                            <div className="budget-item-amount">
                              ${spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <button 
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => handleDeleteBudget(budget.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="budget-progress">
                        <div 
                          className="budget-progress-bar" 
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: isOverBudget ? 'var(--danger)' : percentage > 80 ? 'var(--warning)' : 'var(--success)'
                          }}
                        />
                      </div>
                      <div className="budget-stats">
                        <span>{percentage.toFixed(0)}% usado</span>
                        <span style={{ color: isOverBudget ? 'var(--danger)' : 'var(--success)' }}>
                          {isOverBudget ? 'Excedido por' : 'Restante:'} ${Math.abs(remaining).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {budgets.length === 0 && (
                <div className="card">
                  <div className="empty-state">
                    <div className="empty-state-icon">📊</div>
                    <p>No tienes presupuestos configurados</p>
                    <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowBudgetModal(true)}>
                      <Plus size={18} />
                      Crear primer presupuesto
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Recurring View */}
          {currentView === 'recurring' && (
            <>
              {/* Stats Summary */}
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)', color: 'white' }}>
                  <div className="stat-label" style={{ color: 'rgba(255,255,255,0.85)' }}>Gastos Fijos</div>
                  <div className="stat-value" style={{ color: 'white', fontSize: '1.5rem' }}>${recurringStats.totalGastos.toFixed(2)}</div>
                  <div className="stat-sublabel" style={{ color: 'rgba(255,255,255,0.7)' }}>por mes</div>
                </div>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)', color: 'white' }}>
                  <div className="stat-label" style={{ color: 'rgba(255,255,255,0.85)' }}>Ingresos Fijos</div>
                  <div className="stat-value" style={{ color: 'white', fontSize: '1.5rem' }}>${recurringStats.totalIngresos.toFixed(2)}</div>
                  <div className="stat-sublabel" style={{ color: 'rgba(255,255,255,0.7)' }}>por mes</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Activos</div>
                  <div className="stat-value" style={{ fontSize: '1.5rem' }}>{recurringStats.activeCount}</div>
                  <div className="stat-sublabel" style={{ color: 'var(--success)' }}>✓ Funcionando</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Pausados</div>
                  <div className="stat-value" style={{ fontSize: '1.5rem' }}>{recurringStats.pausedCount}</div>
                  <div className="stat-sublabel" style={{ color: 'var(--text-secondary)' }}>⏸ En pausa</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                <button className="btn btn-primary" onClick={() => setShowRecurringModal(true)}>
                  <Plus size={18} />
                  Nuevo Recurrente
                </button>
              </div>

              {/* Recurring List */}
              <div className="card">
                <div className="transactions-list" style={{ maxHeight: 'none' }}>
                  {recurring.length > 0 ? (
                    recurring.map(rec => {
                      const category = getCategoryById(rec.categoryId)
                      const isIncome = rec.type === 'ingreso'
                      return (
                        <div key={rec.id} className="transaction-item" style={{ opacity: rec.active ? 1 : 0.5 }}>
                          <div 
                            className="transaction-icon" 
                            style={{ backgroundColor: `${category?.color}20` }}
                          >
                            {category?.emoji || '📦'}
                          </div>
                          <div className="transaction-info">
                            <div className="transaction-description">
                              {rec.description}
                              {!rec.active && (
                                <span style={{ 
                                  marginLeft: '0.5rem', 
                                  padding: '2px 6px', 
                                  borderRadius: '4px',
                                  fontSize: '0.7rem',
                                  background: 'var(--bg-tertiary)',
                                  color: 'var(--text-secondary)'
                                }}>
                                  PAUSADO
                                </span>
                              )}
                            </div>
                            <div className="transaction-meta">
                              Día {rec.dayOfMonth} de cada mes • {category?.name}
                              <span style={{ 
                                marginLeft: '0.5rem', 
                                padding: '2px 6px', 
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                background: isIncome ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: isIncome ? '#22c55e' : '#ef4444'
                              }}>
                                {isIncome ? 'Ingreso' : 'Gasto'}
                              </span>
                            </div>
                          </div>
                          <div className="transaction-amount" style={{ color: isIncome ? '#22c55e' : '#ef4444' }}>
                            {isIncome ? '+' : '-'}${rec.amount.toFixed(2)}
                          </div>
                          <div className="transaction-actions" style={{ opacity: 1, display: 'flex', gap: '0.25rem' }}>
                            <button 
                              className="btn btn-ghost btn-icon btn-sm"
                              onClick={() => handleToggleRecurring(rec.id)}
                              title={rec.active ? 'Pausar' : 'Activar'}
                            >
                              {rec.active ? <Pause size={16} /> : <Play size={16} />}
                            </button>
                            <button 
                              className="btn btn-ghost btn-icon btn-sm"
                              onClick={() => handleEditRecurring(rec)}
                            >
                              <Pencil size={16} />
                            </button>
                            <button 
                              className="btn btn-ghost btn-icon btn-sm"
                              onClick={() => handleDeleteRecurring(rec.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="empty-state">
                      <div className="empty-state-icon">🔄</div>
                      <p>No tienes gastos o ingresos recurrentes</p>
                      <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowRecurringModal(true)}>
                        <Plus size={18} />
                        Crear primero
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Info card */}
              <div className="card" style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-tertiary)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>💡</span>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Tip:</strong> Los recurrentes se registran automáticamente cada mes en la fecha indicada. 
                    Puedes pausarlos temporalmente sin eliminarlos.
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Goals View */}
          {currentView === 'goals' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                <button className="btn btn-primary" onClick={() => setShowGoalModal(true)}>
                  <Plus size={18} />
                  Nueva Meta
                </button>
              </div>

              <div className="goals-grid">
                {goals.map(goal => {
                  const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
                  const remaining = goal.targetAmount - goal.currentAmount
                  
                  return (
                    <div key={goal.id} className="goal-card">
                      <div className="goal-header">
                        <div>
                          <div className="goal-name">{goal.name}</div>
                          <div className="goal-target">
                            Meta: ${goal.targetAmount.toFixed(2)}
                          </div>
                        </div>
                        <div className="goal-icon">{goal.emoji}</div>
                      </div>
                      
                      <div className="goal-progress">
                        <div className="goal-progress-bar">
                          <div 
                            className="goal-progress-fill" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="goal-stats">
                        <div className="goal-stat">
                          <div className="goal-stat-value">${goal.currentAmount.toFixed(2)}</div>
                          <div className="goal-stat-label">Ahorrado</div>
                        </div>
                        <div className="goal-stat">
                          <div className="goal-stat-value">{percentage.toFixed(0)}%</div>
                          <div className="goal-stat-label">Progreso</div>
                        </div>
                        <div className="goal-stat">
                          <div className="goal-stat-value">${remaining.toFixed(2)}</div>
                          <div className="goal-stat-label">Restante</div>
                        </div>
                      </div>
                      
                      {goal.deadline && (
                        <div style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          📅 Fecha límite: {format(new Date(goal.deadline), 'dd MMM yyyy', { locale: es })}
                        </div>
                      )}
                      
                      {/* Deposit/Withdraw buttons */}
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button 
                          className="btn btn-primary btn-sm" 
                          style={{ flex: 1, background: '#22c55e' }}
                          onClick={() => handleOpenDeposit(goal)}
                        >
                          <Plus size={14} />
                          Depositar
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1 }}
                          onClick={() => {
                            const amount = prompt('¿Cuánto deseas retirar?')
                            if (amount && !isNaN(parseFloat(amount))) {
                              handleWithdrawFromGoal(goal.id, parseFloat(amount))
                            }
                          }}
                          disabled={goal.currentAmount === 0}
                        >
                          <Minus size={14} />
                          Retirar
                        </button>
                      </div>
                      
                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button 
                          className="btn btn-ghost btn-sm" 
                          style={{ flex: 1 }}
                          onClick={() => handleEditGoal(goal)}
                        >
                          <Pencil size={14} />
                          Editar
                        </button>
                        <button 
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleDeleteGoal(goal.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Deposit history */}
                      {goal.deposits && goal.deposits.length > 0 && (
                        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                          <details>
                            <summary style={{ cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                              Ver historial ({goal.deposits.length} depósitos)
                            </summary>
                            <div style={{ marginTop: '0.5rem', maxHeight: '150px', overflow: 'auto' }}>
                              {goal.deposits.slice().reverse().map((dep, idx) => (
                                <div key={idx} style={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  fontSize: '0.75rem', 
                                  padding: '0.25rem 0',
                                  color: 'var(--text-secondary)'
                                }}>
                                  <span>{format(new Date(dep.date), 'dd MMM', { locale: es })}</span>
                                  <span style={{ color: '#22c55e' }}>+${dep.amount.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {goals.length === 0 && (
                <div className="card">
                  <div className="empty-state">
                    <div className="empty-state-icon">🎯</div>
                    <p>No tienes metas de ahorro</p>
                    <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowGoalModal(true)}>
                      <Plus size={18} />
                      Crear primera meta
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Reports View */}
          {currentView === 'reports' && (
            <>
              {/* Weekly Reminder Banner */}
              {needsReportReminder() && (
                <div className="card" style={{ 
                  marginBottom: '1.5rem', 
                  background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
                  color: 'white'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <AlertCircle size={24} />
                      <div>
                        <div style={{ fontWeight: 600 }}>¡Es lunes! Hora de revisar tus finanzas</div>
                        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Genera tu reporte semanal y mantén el control</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn" 
                        style={{ background: 'white', color: '#7c3aed' }}
                        onClick={() => downloadReport('weekly')}
                      >
                        <FileDown size={18} />
                        Descargar Semanal
                      </button>
                      <button 
                        className="btn btn-ghost" 
                        style={{ color: 'white' }}
                        onClick={dismissReminder}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Report Generation Cards */}
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '1.5rem' }}>
                <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📅</div>
                  <h3 style={{ marginBottom: '0.5rem' }}>Reporte Semanal</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Resumen de la semana pasada
                  </p>
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%' }}
                    onClick={() => downloadReport('weekly')}
                  >
                    <FileDown size={18} />
                    Descargar PDF
                  </button>
                </div>

                <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📊</div>
                  <h3 style={{ marginBottom: '0.5rem' }}>Reporte Mensual</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Resumen del mes anterior
                  </p>
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%' }}
                    onClick={() => downloadReport('monthly')}
                  >
                    <FileDown size={18} />
                    Descargar PDF
                  </button>
                </div>

                <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📈</div>
                  <h3 style={{ marginBottom: '0.5rem' }}>Mes Actual</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Progreso hasta hoy
                  </p>
                  <button 
                    className="btn btn-secondary" 
                    style={{ width: '100%' }}
                    onClick={() => downloadReport('current-month')}
                  >
                    <FileDown size={18} />
                    Descargar PDF
                  </button>
                </div>

                <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📁</div>
                  <h3 style={{ marginBottom: '0.5rem' }}>Exportar CSV</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Transacciones del mes en Excel
                  </p>
                  <button 
                    className="btn btn-secondary" 
                    style={{ width: '100%' }}
                    onClick={exportToCSV}
                  >
                    <Download size={18} />
                    Descargar CSV
                  </button>
                </div>
              </div>

              {/* Quick Preview - Current Month */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-header">
                  <h2 className="card-title">Vista Previa - Este Mes</h2>
                </div>
                <div style={{ padding: '1rem' }}>
                  {(() => {
                    const preview = generateReportData('current-month')
                    return (
                      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                        <div style={{ textAlign: 'center', padding: '1rem' }}>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Ingresos</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#22c55e' }}>
                            ${preview.totalIngresos.toFixed(2)}
                          </div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '1rem' }}>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Gastos</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#ef4444' }}>
                            ${preview.totalGastos.toFixed(2)}
                          </div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '1rem' }}>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Balance</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: preview.balance >= 0 ? '#22c55e' : '#ef4444' }}>
                            ${preview.balance.toFixed(2)}
                          </div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '1rem' }}>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Transacciones</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                            {preview.transactionCount}
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>

              {/* Report History */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">
                    <Clock size={20} style={{ marginRight: '0.5rem' }} />
                    Historial de Reportes
                  </h2>
                </div>
                
                <div className="transactions-list" style={{ maxHeight: '400px' }}>
                  {savedReports.length > 0 ? (
                    savedReports.map(report => (
                      <div key={report.id} className="transaction-item">
                        <div 
                          className="transaction-icon" 
                          style={{ backgroundColor: 'rgba(124, 58, 237, 0.1)' }}
                        >
                          {report.type === 'weekly' ? '📅' : report.type === 'monthly' ? '📊' : '📈'}
                        </div>
                        <div className="transaction-info">
                          <div className="transaction-description">{report.periodName}</div>
                          <div className="transaction-meta">
                            Generado: {report.generatedAt}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '0.875rem' }}>
                          <div style={{ color: '#22c55e' }}>+${report.totalIngresos.toFixed(2)}</div>
                          <div style={{ color: '#ef4444' }}>-${report.totalGastos.toFixed(2)}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <div className="empty-state-icon">📋</div>
                      <p>No has generado reportes aún</p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Descarga tu primer reporte para llevar un registro
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tips Card */}
              <div className="card" style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-tertiary)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>💡</span>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Tip:</strong> Genera un reporte semanal cada lunes para 
                    mantener el control de tus finanzas. Los reportes incluyen resumen de gastos, ingresos por categoría 
                    y tus gastos más altos del período.
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Add/Edit Expense Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingExpense ? 'Editar Transacción' : 'Nueva Transacción'}
              </h3>
              <button className="btn btn-ghost btn-icon" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Type Toggle */}
                <div className="form-group">
                  <label className="form-label">Tipo</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className={`btn ${formData.type === 'gasto' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1, background: formData.type === 'gasto' ? '#ef4444' : undefined }}
                      onClick={() => setFormData(prev => ({ ...prev, type: 'gasto', categoryId: '' }))}
                    >
                      <ArrowDownRight size={18} />
                      Gasto
                    </button>
                    <button
                      type="button"
                      className={`btn ${formData.type === 'ingreso' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1, background: formData.type === 'ingreso' ? '#22c55e' : undefined }}
                      onClick={() => setFormData(prev => ({ ...prev, type: 'ingreso', categoryId: '' }))}
                    >
                      <ArrowUpRight size={18} />
                      Ingreso
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={formData.type === 'gasto' ? "Ej: Almuerzo en restaurante" : "Ej: Salario de Mayo"}
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Monto ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Fecha</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.date}
                    onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    {formData.type === 'gasto' ? 'Categoría de Gasto' : 'Fuente de Ingreso'}
                  </label>
                  <div className="category-grid">
                    {(formData.type === 'gasto' ? categories : incomeCategories).map(cat => (
                      <div
                        key={cat.id}
                        className={`category-tag ${formData.categoryId === cat.id.toString() ? 'selected' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, categoryId: cat.id.toString() }))}
                      >
                        <span className="category-emoji">{cat.emoji}</span>
                        <span className="category-name">{cat.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingExpense ? 'Guardar Cambios' : 'Registrar Gasto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Gestionar Categorías</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowCategoryModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              {/* Tabs for Expense/Income categories */}
              <div className="tabs" style={{ marginBottom: '1rem' }}>
                <button 
                  className={`tab ${!showIncomeCategories ? 'active' : ''}`}
                  onClick={() => setShowIncomeCategories(false)}
                  style={{ flex: 1 }}
                >
                  <ArrowDownRight size={16} />
                  Gastos
                </button>
                <button 
                  className={`tab ${showIncomeCategories ? 'active' : ''}`}
                  onClick={() => setShowIncomeCategories(true)}
                  style={{ flex: 1 }}
                >
                  <ArrowUpRight size={16} />
                  Ingresos
                </button>
              </div>

              {/* Expense Categories */}
              {!showIncomeCategories && (
                <>
                  <div className="category-list">
                    {categories.map(cat => (
                      <div key={cat.id} className="category-item">
                        <div className="category-item-info">
                          <span style={{ fontSize: '1.5rem' }}>{cat.emoji}</span>
                          <span style={{ fontWeight: 500 }}>{cat.name}</span>
                        </div>
                        <button 
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => handleDeleteCategory(cat.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="add-category-form">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="🎮"
                      value={newCategory.emoji}
                      onChange={e => setNewCategory(prev => ({ ...prev, emoji: e.target.value }))}
                      style={{ width: '70px', flex: 'none', textAlign: 'center' }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Nombre de categoría"
                      value={newCategory.name}
                      onChange={e => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <button className="btn btn-primary" onClick={handleAddCategory}>
                      <Plus size={18} />
                    </button>
                  </div>
                </>
              )}

              {/* Income Categories */}
              {showIncomeCategories && (
                <>
                  <div className="category-list">
                    {incomeCategories.map(cat => (
                      <div key={cat.id} className="category-item">
                        <div className="category-item-info">
                          <span style={{ fontSize: '1.5rem' }}>{cat.emoji}</span>
                          <span style={{ fontWeight: 500 }}>{cat.name}</span>
                        </div>
                        <button 
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => handleDeleteIncomeCategory(cat.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="add-category-form">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="💵"
                      value={newIncomeCategory.emoji}
                      onChange={e => setNewIncomeCategory(prev => ({ ...prev, emoji: e.target.value }))}
                      style={{ width: '70px', flex: 'none', textAlign: 'center' }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Fuente de ingreso"
                      value={newIncomeCategory.name}
                      onChange={e => setNewIncomeCategory(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <button className="btn btn-primary" style={{ background: '#22c55e' }} onClick={handleAddIncomeCategory}>
                      <Plus size={18} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="modal-overlay" onClick={() => setShowBudgetModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Nuevo Presupuesto</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowBudgetModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Categoría</label>
                <select 
                  className="form-select"
                  value={budgetForm.categoryId}
                  onChange={e => setBudgetForm(prev => ({ ...prev, categoryId: e.target.value }))}
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Límite mensual ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="0.00"
                  value={budgetForm.limit}
                  onChange={e => setBudgetForm(prev => ({ ...prev, limit: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowBudgetModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleAddBudget}>
                Guardar Presupuesto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="modal-overlay" onClick={() => { setShowGoalModal(false); setEditingGoal(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingGoal ? 'Editar Meta' : 'Nueva Meta'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => { setShowGoalModal(false); setEditingGoal(null); }}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Emoji</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="🎯"
                  value={goalForm.emoji}
                  onChange={e => setGoalForm(prev => ({ ...prev, emoji: e.target.value }))}
                  style={{ width: '80px' }}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Nombre de la meta</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: Fondo de emergencia"
                  value={goalForm.name}
                  onChange={e => setGoalForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Monto objetivo ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="0.00"
                  value={goalForm.targetAmount}
                  onChange={e => setGoalForm(prev => ({ ...prev, targetAmount: e.target.value }))}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Monto ahorrado ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="0.00"
                  value={goalForm.currentAmount}
                  onChange={e => setGoalForm(prev => ({ ...prev, currentAmount: e.target.value }))}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Fecha límite (opcional)</label>
                <input
                  type="date"
                  className="form-input"
                  value={goalForm.deadline}
                  onChange={e => setGoalForm(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setShowGoalModal(false); setEditingGoal(null); }}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleAddGoal}>
                {editingGoal ? 'Guardar Cambios' : 'Crear Meta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && selectedGoalForDeposit && (
        <div className="modal-overlay" onClick={() => { setShowDepositModal(false); setSelectedGoalForDeposit(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                Depositar a: {selectedGoalForDeposit.emoji} {selectedGoalForDeposit.name}
              </h3>
              <button className="btn btn-ghost btn-icon" onClick={() => { setShowDepositModal(false); setSelectedGoalForDeposit(null); }}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div style={{ 
                background: 'var(--bg-tertiary)', 
                borderRadius: '8px', 
                padding: '1rem', 
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Progreso actual</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                  ${selectedGoalForDeposit.currentAmount.toFixed(2)} 
                  <span style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>/ ${selectedGoalForDeposit.targetAmount.toFixed(2)}</span>
                </div>
                <div style={{ 
                  marginTop: '0.5rem',
                  height: '8px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min((selectedGoalForDeposit.currentAmount / selectedGoalForDeposit.targetAmount) * 100, 100)}%`,
                    background: 'linear-gradient(90deg, #22c55e, #10b981)',
                    borderRadius: '4px'
                  }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Monto a depositar ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="0.00"
                  value={depositForm.amount}
                  onChange={e => setDepositForm(prev => ({ ...prev, amount: e.target.value }))}
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Nota (opcional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: Ahorro del mes"
                  value={depositForm.note}
                  onChange={e => setDepositForm(prev => ({ ...prev, note: e.target.value }))}
                />
              </div>

              {/* Quick amounts */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[10, 25, 50, 100, 200].map(amount => (
                  <button
                    key={amount}
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setDepositForm(prev => ({ ...prev, amount: amount.toString() }))}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setShowDepositModal(false); setSelectedGoalForDeposit(null); }}>
                Cancelar
              </button>
              <button 
                className="btn btn-primary" 
                style={{ background: '#22c55e' }}
                onClick={handleAddDeposit}
              >
                <Plus size={18} />
                Depositar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recurring Modal */}
      {showRecurringModal && (
        <div className="modal-overlay" onClick={closeRecurringModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingRecurring ? 'Editar Recurrente' : 'Nuevo Recurrente'}
              </h3>
              <button className="btn btn-ghost btn-icon" onClick={closeRecurringModal}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              {/* Type Toggle */}
              <div className="form-group">
                <label className="form-label">Tipo</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className={`btn ${recurringForm.type === 'gasto' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, background: recurringForm.type === 'gasto' ? '#ef4444' : undefined }}
                    onClick={() => setRecurringForm(prev => ({ ...prev, type: 'gasto', categoryId: '' }))}
                  >
                    <ArrowDownRight size={18} />
                    Gasto
                  </button>
                  <button
                    type="button"
                    className={`btn ${recurringForm.type === 'ingreso' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, background: recurringForm.type === 'ingreso' ? '#22c55e' : undefined }}
                    onClick={() => setRecurringForm(prev => ({ ...prev, type: 'ingreso', categoryId: '' }))}
                  >
                    <ArrowUpRight size={18} />
                    Ingreso
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Descripción</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={recurringForm.type === 'gasto' ? "Ej: Netflix, Alquiler, Gym" : "Ej: Salario, Renta"}
                  value={recurringForm.description}
                  onChange={e => setRecurringForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Monto mensual ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="0.00"
                  value={recurringForm.amount}
                  onChange={e => setRecurringForm(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Día del mes (1-28)</label>
                <input
                  type="number"
                  min="1"
                  max="28"
                  className="form-input"
                  placeholder="15"
                  value={recurringForm.dayOfMonth}
                  onChange={e => setRecurringForm(prev => ({ ...prev, dayOfMonth: e.target.value }))}
                />
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                  Se registrará automáticamente este día cada mes
                </small>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  {recurringForm.type === 'gasto' ? 'Categoría' : 'Fuente'}
                </label>
                <div className="category-grid">
                  {(recurringForm.type === 'gasto' ? categories : incomeCategories).map(cat => (
                    <div
                      key={cat.id}
                      className={`category-tag ${recurringForm.categoryId === cat.id.toString() ? 'selected' : ''}`}
                      onClick={() => setRecurringForm(prev => ({ ...prev, categoryId: cat.id.toString() }))}
                    >
                      <span className="category-emoji">{cat.emoji}</span>
                      <span className="category-name">{cat.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {editingRecurring && (
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={recurringForm.active}
                      onChange={e => setRecurringForm(prev => ({ ...prev, active: e.target.checked }))}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span>Activo</span>
                  </label>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeRecurringModal}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleAddRecurring}>
                {editingRecurring ? 'Guardar Cambios' : 'Crear Recurrente'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
