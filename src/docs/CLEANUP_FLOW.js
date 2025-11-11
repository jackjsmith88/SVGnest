/**
 * CLEANUP FLOW DIAGRAM
 * 
 * When user navigates away or refreshes while algorithm is running:
 * 
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  USER ACTION: Navigate/Refresh                                  │
 * └───────────────────────────┬─────────────────────────────────────┘
 *                             │
 *                             ▼
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  React Unmount Phase Begins                                     │
 * └───────────────────────────┬─────────────────────────────────────┘
 *                             │
 *        ┌────────────────────┼────────────────────┐
 *        │                    │                    │
 *        ▼                    ▼                    ▼
 * ┌─────────────┐    ┌─────────────┐     ┌─────────────┐
 * │ Component   │    │   Hook      │     │   Utility   │
 * │  Cleanup    │    │  Cleanup    │     │  Cleanup    │
 * └──────┬──────┘    └──────┬──────┘     └──────┬──────┘
 *        │                  │                    │
 *        ▼                  ▼                    ▼
 * ┌─────────────┐    ┌─────────────┐     ┌─────────────┐
 * │ Set mounted │    │ Call        │     │ Remove temp │
 * │ ref = false │    │ SvgNest     │     │ DOM elements│
 * └──────┬──────┘    │ .stop()     │     └──────┬──────┘
 *        │           └──────┬──────┘            │
 *        │                  │                   │
 *        │                  ▼                   │
 *        │           ┌─────────────┐            │
 *        │           │ Clear       │            │
 *        │           │ intervals   │            │
 *        │           └──────┬──────┘            │
 *        │                  │                   │
 *        │                  ▼                   │
 *        │           ┌─────────────┐            │
 *        │           │ Set working │            │
 *        │           │ = false     │            │
 *        │           └──────┬──────┘            │
 *        │                  │                   │
 *        └──────────────────┼───────────────────┘
 *                           │
 *                           ▼
 *                    ┌─────────────┐
 *                    │ Web Workers │
 *                    │ Terminate   │
 *                    └──────┬──────┘
 *                           │
 *                           ▼
 *                    ┌─────────────┐
 *                    │ Cleanup     │
 *                    │ Complete    │
 *                    └─────────────┘
 * 
 * 
 * KEY COMPONENTS:
 * 
 * 1. Component Level (SVGNestReactParent.jsx, MultiBinTester.jsx)
 *    - Sets isMountedRef.current = false
 *    - Prevents future state updates
 *    - Calls stopNest()
 * 
 * 2. Hook Level (useSVGNest.js, useMultiBinNest.js)
 *    - Calls window.SvgNest.stop()
 *    - Clears timeouts/intervals
 *    - Terminates workers
 * 
 * 3. Utility Level (multiBinSVGNest.js)
 *    - Finally blocks ensure DOM cleanup
 *    - Removes temporary containers
 *    - Handles errors gracefully
 * 
 * 4. Core Level (svgnest.js)
 *    - Sets working flag to false
 *    - Workers check flag and exit
 *    - Genetic algorithm stops
 * 
 * 
 * GUARDS AGAINST:
 * ✓ Memory leaks from running workers
 * ✓ "Can't perform React state update on unmounted component" warnings
 * ✓ Lingering background processes
 * ✓ Orphaned DOM elements
 * ✓ Resource waste
 */
