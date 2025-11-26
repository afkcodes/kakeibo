import { usePWA } from '@/hooks/usePWA'
import { AnimatePresence, motion } from 'framer-motion'
import { Download, RefreshCw, Wifi, WifiOff, X } from 'lucide-react'

export function PWAPrompts() {
  const {
    isInstallable,
    isOnline,
    installApp,
    needRefresh,
    offlineReady,
    updateServiceWorker,
    closeOfflineReady,
    closeNeedRefresh,
    dismissInstallPrompt,
  } = usePWA()

  return (
    <>
      {/* Offline indicator */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-100 bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium"
          >
            <WifiOff className="w-4 h-4" />
            <span>You're offline. Some features may be limited.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Online restored indicator */}
      <AnimatePresence>
        {isOnline && offlineReady && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-100 bg-green-600 text-white rounded-lg shadow-lg p-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-500 rounded-full">
                <Wifi className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Ready for Offline</h3>
                <p className="text-sm text-green-100 mt-1">
                  App is ready to work offline.
                </p>
              </div>
              <button
                onClick={closeOfflineReady}
                className="p-1 hover:bg-green-500 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update available prompt */}
      <AnimatePresence>
        {needRefresh && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-100 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Update Available
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  A new version is available. Refresh to update.
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => updateServiceWorker(true)}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Refresh
                  </button>
                  <button
                    onClick={closeNeedRefresh}
                    className="px-3 py-1.5 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    Later
                  </button>
                </div>
              </div>
              <button
                onClick={closeNeedRefresh}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Install prompt */}
      <AnimatePresence>
        {isInstallable && !needRefresh && !offlineReady && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-100 bg-surface-800 rounded-lg shadow-2xl border border-surface-700 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary-500/20 rounded-lg">
                <Download className="w-5 h-5 text-primary-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-surface-100">
                  Install Kakeibo
                </h3>
                <p className="text-sm text-surface-400 mt-1">
                  Install the app for a better experience and offline access.
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={installApp}
                    className="flex-1 px-3 py-2 bg-primary-500 text-white text-sm font-medium rounded-md hover:bg-primary-600 transition-colors"
                  >
                    Install
                  </button>
                  <button
                    onClick={dismissInstallPrompt}
                    className="flex-1 px-3 py-2 text-surface-400 text-sm font-medium hover:bg-surface-700 rounded-md transition-colors"
                  >
                    Not now
                  </button>
                </div>
              </div>
              <button
                onClick={dismissInstallPrompt}
                className="p-1 hover:bg-surface-700 rounded-md transition-colors"
              >
                <X className="w-4 h-4 text-surface-500" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
