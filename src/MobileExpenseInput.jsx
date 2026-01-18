import { useState, useEffect } from 'react'
import { X, Calendar, Pencil, Check, AlignLeft, ChevronDown, ChevronUp, Repeat } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Opciones de recurrencia predefinidas
const RECURRENCE_OPTIONS = [
  { id: 'none', label: 'Ninguna', value: null },
  { id: 'daily', label: 'Diario', dayOfMonth: null, interval: 1, unit: 'day' },
  { id: 'weekly', label: 'Semanal', dayOfMonth: null, interval: 1, unit: 'week' },
  { id: 'monthly', label: 'Mensual', dayOfMonth: null, interval: 1, unit: 'month' },
  { id: '2weeks', label: 'Quincenal', dayOfMonth: null, interval: 2, unit: 'week' },
  { id: 'custom', label: 'Personalizado', dayOfMonth: null, interval: 1, unit: 'month' },
]

const MobileExpenseInput = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  categories, 
  incomeCategories,
  editingExpense = null,
  initialType = 'gasto'
}) => {
  const [amount, setAmount] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [note, setNote] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [time, setTime] = useState(format(new Date(), 'HH:mm'))
  const [type, setType] = useState(initialType)
  const [showNote, setShowNote] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showAllCategories, setShowAllCategories] = useState(false)
  
  // Recurrence states
  const [showRecurrenceMenu, setShowRecurrenceMenu] = useState(false)
  const [selectedRecurrence, setSelectedRecurrence] = useState('none')
  const [showCustomRecurrence, setShowCustomRecurrence] = useState(false)
  const [customInterval, setCustomInterval] = useState(1)
  const [customUnit, setCustomUnit] = useState('month')

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editingExpense) {
        setAmount(editingExpense.amount.toString())
        setSelectedCategory(editingExpense.categoryId)
        setNote(editingExpense.description)
        setDate(editingExpense.date)
        setType(editingExpense.type)
        setShowNote(editingExpense.description !== '')
      } else {
        setAmount('')
        setSelectedCategory(null)
        setNote('')
        setDate(format(new Date(), 'yyyy-MM-dd'))
        setTime(format(new Date(), 'HH:mm'))
        setType(initialType)
        setShowNote(false)
      }
      setShowAllCategories(false)
      setShowDatePicker(false)
      setShowRecurrenceMenu(false)
      setSelectedRecurrence('none')
      setShowCustomRecurrence(false)
      setCustomInterval(1)
      setCustomUnit('month')
    }
  }, [isOpen, editingExpense, initialType])

  const currentCategories = type === 'gasto' ? categories : incomeCategories
  const selectedCategoryData = currentCategories.find(c => c.id === selectedCategory)

  // Handle numpad input
  const handleNumpadPress = (value) => {
    if (value === 'backspace') {
      setAmount(prev => prev.slice(0, -1))
    } else if (value === '.') {
      if (!amount.includes('.')) {
        setAmount(prev => prev + '.')
      }
    } else {
      // Limit decimal places to 2
      if (amount.includes('.')) {
        const decimals = amount.split('.')[1]
        if (decimals && decimals.length >= 2) return
      }
      // Limit total length
      if (amount.length >= 10) return
      setAmount(prev => prev + value)
    }
  }

  // Handle submit
  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) return
    if (!selectedCategory) return

    const expenseData = {
      amount: parseFloat(amount),
      categoryId: selectedCategory,
      description: note || selectedCategoryData?.name || '',
      date: date,
      type: type
    }

    // Add recurrence data if selected
    let recurrenceData = null
    if (selectedRecurrence !== 'none') {
      const dateObj = new Date(date + 'T12:00:00')
      const dayOfMonth = dateObj.getDate()
      
      if (selectedRecurrence === 'custom') {
        recurrenceData = {
          interval: customInterval,
          unit: customUnit,
          dayOfMonth: dayOfMonth
        }
      } else {
        const option = RECURRENCE_OPTIONS.find(o => o.id === selectedRecurrence)
        if (option) {
          recurrenceData = {
            interval: option.interval,
            unit: option.unit,
            dayOfMonth: dayOfMonth
          }
        }
      }
    }

    onSubmit(expenseData, editingExpense?.id, recurrenceData)
    onClose()
  }

  // Handle recurrence selection
  const handleRecurrenceSelect = (optionId) => {
    setSelectedRecurrence(optionId)
    if (optionId === 'custom') {
      setShowCustomRecurrence(true)
      setShowRecurrenceMenu(false)
    } else {
      setShowCustomRecurrence(false)
      setShowRecurrenceMenu(false)
    }
  }

  // Get recurrence display label
  const getRecurrenceLabel = () => {
    if (selectedRecurrence === 'none') return null
    if (selectedRecurrence === 'custom') {
      const unitLabels = { day: 'días', week: 'semanas', month: 'meses', year: 'años' }
      return `Cada ${customInterval} ${unitLabels[customUnit]}`
    }
    const option = RECURRENCE_OPTIONS.find(o => o.id === selectedRecurrence)
    return option?.label || null
  }

  // Format display amount
  const displayAmount = amount || '0'
  const dateObj = new Date(date + 'T12:00:00')
  const today = new Date()
  const isToday = dateObj.toDateString() === today.toDateString()
  const formattedDate = isToday 
    ? `Hoy, ${format(dateObj, "d MMM", { locale: es })}` 
    : format(dateObj, "EEE, d MMM", { locale: es })

  if (!isOpen) return null

  return (
    <div className="mobile-expense-overlay" onClick={onClose}>
      <div className="mobile-expense-container" onClick={e => e.stopPropagation()}>
        {/* Header with Edit button */}
        <div className="mobile-expense-header">
          <button className="mobile-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
          <div className="mobile-type-toggle">
            <button 
              className={`mobile-type-btn ${type === 'gasto' ? 'active expense' : ''}`}
              onClick={() => { setType('gasto'); setSelectedCategory(null); }}
            >
              Gasto
            </button>
            <button 
              className={`mobile-type-btn ${type === 'ingreso' ? 'active income' : ''}`}
              onClick={() => { setType('ingreso'); setSelectedCategory(null); }}
            >
              Ingreso
            </button>
          </div>
          
          {/* Recurrence Button */}
          <button 
            className={`mobile-recurrence-btn ${selectedRecurrence !== 'none' ? 'active' : ''}`}
            onClick={() => setShowRecurrenceMenu(!showRecurrenceMenu)}
          >
            <Repeat size={18} />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="mobile-scrollable-content">        {/* Recurrence Dropdown Menu */}
        {showRecurrenceMenu && (
          <div className="mobile-recurrence-menu">
            {RECURRENCE_OPTIONS.map(option => (
              <button
                key={option.id}
                className={`mobile-recurrence-option ${selectedRecurrence === option.id ? 'selected' : ''}`}
                onClick={() => handleRecurrenceSelect(option.id)}
              >
                <span>{option.label}</span>
                {selectedRecurrence === option.id && <Check size={16} />}
              </button>
            ))}
          </div>
        )}

        {/* Main Content Area */}
        <div className="mobile-main-area">
          {/* Amount Display */}
          <div className="mobile-amount-area">
            <div className={`mobile-amount-display ${type === 'ingreso' ? 'income' : ''}`}>
              <span className="mobile-currency">B/.</span>
              <span className="mobile-amount-value">{displayAmount}</span>
              {/* Backspace button next to amount */}
              {amount && (
                <button 
                  className="mobile-amount-backspace"
                  onClick={() => handleNumpadPress('backspace')}
                >
                  ⌫
                </button>
              )}
            </div>
            
            {/* Recurrence indicator */}
            {selectedRecurrence !== 'none' && (
              <div className="mobile-recurrence-indicator">
                <Repeat size={14} />
                <span>{getRecurrenceLabel()}</span>
              </div>
            )}
            
            {/* Note Input (toggled) */}
            {showNote ? (
              <div className="mobile-note-input">
                <AlignLeft size={16} />
                <input
                  type="text"
                  placeholder="Agregar nota..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  autoFocus
                />
              </div>
            ) : (
              <button className="mobile-add-note-btn" onClick={() => setShowNote(true)}>
                <AlignLeft size={16} />
                <span>Agregar Nota</span>
              </button>
            )}
          </div>

          {/* Floating Categories */}
          <div className="mobile-categories-area">
            {currentCategories.slice(0, showAllCategories ? currentCategories.length : 5).map(cat => (
              <button
                key={cat.id}
                className={`mobile-category-pill ${selectedCategory === cat.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedCategory(cat.id)
                  setShowAllCategories(false) // Auto-minimize when selecting
                }}
              >
                <span className="mobile-category-emoji">{cat.emoji}</span>
                <span className="mobile-category-name">{cat.name}</span>
              </button>
            ))}
            {currentCategories.length > 5 && !showAllCategories && (
              <button 
                className="mobile-category-pill more"
                onClick={() => setShowAllCategories(true)}
              >
                <ChevronDown size={16} />
                <span>Más</span>
              </button>
            )}
            {showAllCategories && (
              <button 
                className="mobile-category-pill more"
                onClick={() => setShowAllCategories(false)}
              >
                <ChevronUp size={16} />
                <span>Menos</span>
              </button>
            )}
          </div>
        </div>

        {/* Date Row */}
        <div className="mobile-meta-row">
          <button 
            className="mobile-meta-btn"
            onClick={() => setShowDatePicker(!showDatePicker)}
          >
            <Calendar size={16} />
            <span>{formattedDate}</span>
            <span className="mobile-meta-time">{time}</span>
          </button>
          
          {selectedCategoryData && (
            <div className="mobile-selected-category">
              <span>{selectedCategoryData.emoji}</span>
              <span>{selectedCategoryData.name}</span>
            </div>
          )}
        </div>

        {/* Date Picker (conditional) */}
        {showDatePicker && (
          <div className="mobile-date-picker">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mobile-date-input"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mobile-time-input"
            />
          </div>
        )}

        {/* Custom Recurrence Modal */}
        {showCustomRecurrence && (
          <div className="mobile-custom-recurrence">
            <div className="mobile-custom-recurrence-header">
              <button 
                className="mobile-close-btn"
                onClick={() => {
                  setShowCustomRecurrence(false)
                  setSelectedRecurrence('none')
                }}
              >
                <X size={20} />
              </button>
              <span>Intervalo Personalizado</span>
              <button 
                className="mobile-confirm-btn"
                onClick={() => setShowCustomRecurrence(false)}
              >
                <Check size={20} />
              </button>
            </div>
            <div className="mobile-custom-recurrence-content">
              <span className="mobile-custom-label">Se repite cada</span>
              <div className="mobile-custom-inputs">
                <div className="mobile-custom-number">
                  <button 
                    className="mobile-custom-arrow"
                    onClick={() => setCustomInterval(prev => Math.min(prev + 1, 99))}
                  >
                    <ChevronUp size={20} />
                  </button>
                  <span className="mobile-custom-value">{customInterval}</span>
                  <button 
                    className="mobile-custom-arrow"
                    onClick={() => setCustomInterval(prev => Math.max(prev - 1, 1))}
                  >
                    <ChevronDown size={20} />
                  </button>
                </div>
                <div className="mobile-custom-unit">
                  <button 
                    className="mobile-custom-arrow"
                    onClick={() => {
                      const units = ['day', 'week', 'month', 'year']
                      const idx = units.indexOf(customUnit)
                      setCustomUnit(units[(idx + 1) % units.length])
                    }}
                  >
                    <ChevronUp size={20} />
                  </button>
                  <span className="mobile-custom-value">
                    {customUnit === 'day' && (customInterval > 1 ? 'días' : 'día')}
                    {customUnit === 'week' && (customInterval > 1 ? 'semanas' : 'semana')}
                    {customUnit === 'month' && (customInterval > 1 ? 'meses' : 'mes')}
                    {customUnit === 'year' && (customInterval > 1 ? 'años' : 'año')}
                  </span>
                  <button 
                    className="mobile-custom-arrow"
                    onClick={() => {
                      const units = ['day', 'week', 'month', 'year']
                      const idx = units.indexOf(customUnit)
                      setCustomUnit(units[(idx - 1 + units.length) % units.length])
                    }}
                  >
                    <ChevronDown size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>{/* End of mobile-scrollable-content */}

        {/* Custom Numpad */}
        <div className="mobile-numpad">
          <div className="mobile-numpad-row">
            <button className="mobile-numpad-btn" onClick={() => handleNumpadPress('1')}>1</button>
            <button className="mobile-numpad-btn" onClick={() => handleNumpadPress('2')}>2</button>
            <button className="mobile-numpad-btn" onClick={() => handleNumpadPress('3')}>3</button>
          </div>
          <div className="mobile-numpad-row">
            <button className="mobile-numpad-btn" onClick={() => handleNumpadPress('4')}>4</button>
            <button className="mobile-numpad-btn" onClick={() => handleNumpadPress('5')}>5</button>
            <button className="mobile-numpad-btn" onClick={() => handleNumpadPress('6')}>6</button>
          </div>
          <div className="mobile-numpad-row">
            <button className="mobile-numpad-btn" onClick={() => handleNumpadPress('7')}>7</button>
            <button className="mobile-numpad-btn" onClick={() => handleNumpadPress('8')}>8</button>
            <button className="mobile-numpad-btn" onClick={() => handleNumpadPress('9')}>9</button>
          </div>
          <div className="mobile-numpad-row">
            <button 
              className="mobile-numpad-btn" 
              onClick={() => handleNumpadPress('.')}
            >
              .
            </button>
            <button className="mobile-numpad-btn" onClick={() => handleNumpadPress('0')}>0</button>
            <button 
              className={`mobile-numpad-btn submit ${amount && selectedCategory ? 'active' : ''}`}
              onClick={handleSubmit}
              disabled={!amount || !selectedCategory}
            >
              <Check size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileExpenseInput
