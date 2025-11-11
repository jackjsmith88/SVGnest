# Cleanup Pattern for SVGnest Algorithm

## Problem
When a user navigates away from a page or refreshes while the SVGnest algorithm is running, web workers and processes need to be properly stopped to prevent:
- Memory leaks
- Background processes continuing unnecessarily
- State updates on unmounted components (React warnings)
- Resource waste

## Solution Architecture

### 1. **Hook-Level Cleanup** (`useSVGNest.js`, `useMultiBinNest.js`)

Each hook manages its own cleanup using React's `useEffect` cleanup function:

```javascript
useEffect(() => {
  return () => {
    console.log('Hook: Cleaning up on unmount')
    if (window.SvgNest) {
      window.SvgNest.stop()
    }
  }
}, []) // Empty dependency array - only run on unmount
```

**What this does:**
- Automatically called when component unmounts
- Calls `window.SvgNest.stop()` which terminates web workers
- Clears any interval timers
- **Critical**: Empty dependency array ensures cleanup only runs on unmount, not on state changes

### 2. **Component-Level Cleanup** (`SVGNestReactParent.jsx`, `MultiBinTester.jsx`)

Components add an additional layer of cleanup:

```javascript
useEffect(() => {
  return () => {
    console.log('Component: Cleaning up on unmount')
    if (window.SvgNest) {
      window.SvgNest.stop()
    }
  }
}, []) // Empty dependency array - only run on unmount
```

**What this does:**
- Only runs cleanup when component actually unmounts
- Calls `window.SvgNest.stop()` to terminate workers
- **Critical**: Empty dependency array prevents cleanup from running on every state change

### 3. **Utility-Level Cleanup** (`multiBinSVGNest.js`)

The utility functions handle cleanup in a `finally` block:

```javascript
try {
  // Run algorithm
  await runMultiBinSVGNest(...)
} catch (err) {
  // Handle errors
} finally {
  // Cleanup temporary DOM elements
  if (container) {
    document.body.removeChild(container)
  }
}
```

**What this does:**
- Removes temporary DOM elements
- Ensures cleanup happens even if an error occurs
- Cleans up regardless of how the function exits

### 4. **SVGnest Core Cleanup** (`public/svgnest.js`)

The core SVGnest library has its own stop mechanism:

```javascript
this.stop = function(){
  this.working = false
  if(workerTimer){
    clearInterval(workerTimer)
  }
}
```

**What this does:**
- Sets `working` flag to false
- Clears interval timers
- Web workers check this flag and terminate themselves

## How It All Works Together

### Scenario: User Navigates Away While Algorithm Running

1. **React detects unmount** → Calls cleanup function in `useEffect`
2. **Component cleanup runs** → Sets `isMountedRef.current = false`
3. **Hook cleanup runs** → Calls `window.SvgNest.stop()`
4. **SVGnest stops** → Sets `working = false`, clears timers
5. **Workers terminate** → Check `working` flag and exit
6. **DOM cleanup** → `finally` block removes temporary elements
7. **State updates prevented** → `isMountedRef` check prevents React warnings

### Scenario: User Refreshes Page

1. **Browser starts unload** → React cleanup runs immediately
2. **All cleanup functions execute** → Same as navigation scenario
3. **New page loads** → Fresh state, no lingering processes

## Best Practices Implemented

✅ **Multiple cleanup layers** - Hook, component, and utility levels  
✅ **Mounted ref pattern** - Prevents state updates on unmounted components  
✅ **Finally blocks** - Ensures cleanup even on errors  
✅ **Logging** - Console logs help debug cleanup issues  
✅ **Dependency arrays** - Proper `useEffect` dependencies  
✅ **Worker termination** - Properly stops web workers  

## Testing Cleanup

To verify cleanup is working:

1. Start a long-running algorithm
2. Open DevTools Console
3. Navigate to different route or refresh
4. Check console logs for cleanup messages
5. Verify no "unmounted component" warnings
6. Check browser task manager - no lingering workers

## Common Issues & Solutions

### Issue: State updates after unmount
**Solution:** Use `isMountedRef` to guard state updates in async callbacks

### Issue: Workers still running
**Solution:** Ensure `window.SvgNest.stop()` is called in cleanup

### Issue: Memory leaks
**Solution:** Remove event listeners and DOM elements in `finally` blocks

### Issue: Cleanup not running
**Solution:** Check `useEffect` dependency arrays are correct

## Files Modified

- ✅ `src/hooks/useSVGNest.js` - Added useEffect cleanup
- ✅ `src/hooks/useMultiBinNest.js` - Added useEffect cleanup  
- ✅ `src/pages/SVGNestReact/SVGNestReactParent.jsx` - Added component cleanup
- ✅ `src/pages/SVGNestReact/MultiBin/MultiBinTester.jsx` - Added mounted ref checks
- ✅ `src/utils/multiBinSVGNest.js` - Already has finally blocks (no changes needed)
