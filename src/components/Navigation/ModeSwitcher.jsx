import { MODES } from '../../utils/constants'

function ModeSwitcher({ currentMode, onModeChange }) {
  return (
    <div className="mode-switcher">
      <div className="mode-tabs">
        <button 
          className={`mode-tab ${currentMode === MODES.SINGLE_BIN ? 'active' : ''}`}
          onClick={() => onModeChange(MODES.SINGLE_BIN)}
        >
          Single Bin Nesting
        </button>
        <button 
          className={`mode-tab ${currentMode === MODES.MULTI_BIN ? 'active' : ''}`}
          onClick={() => onModeChange(MODES.MULTI_BIN)}
        >
          Multi-Bin Testing
        </button>
      </div>
    </div>
  )
}

export default ModeSwitcher