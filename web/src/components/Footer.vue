<template>
  <footer
    role="contentinfo"
    class="border-t border-gray-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60"
  >
    <div :class="['container mx-auto px-4 sm:px-6 lg:px-8', isDemoMode ? 'py-8' : 'py-4']">
      <div v-if="isDemoMode" class="grid gap-8 md:grid-cols-3">
        <!-- Brand -->
        <div class="space-y-3">
          <div class="flex items-center space-x-2">
            <ServerIcon class="h-6 w-6 text-blue-600" />
            <span class="text-lg font-bold gradient-text">{{ appTitle }}</span>
          </div>
          <p class="text-sm text-gray-600 max-w-sm">
            Lightweight, modern dashboard to monitor your Proxmox VE hosts, VMs, and containers.
          </p>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Vue 3 • Vite • Tailwind
            </span>
            <a
              href="https://github.com/nurawiguna/ProxmoxVE-Watcher/blob/development/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
            >
              MIT License
            </a>
          </div>
        </div>

        <!-- Navigation -->
        <nav aria-label="Footer" class="grid grid-cols-2 gap-6 sm:gap-8 text-sm">
          <div>
            <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-500">Navigate</h3>
            <ul class="mt-3 space-y-2">
              <li>
                <RouterLink class="footer-link" to="/">Dashboard</RouterLink>
              </li>
              <li>
                <RouterLink class="footer-link" to="/hosts">Hosts</RouterLink>
              </li>
              <li>
                <RouterLink class="footer-link" to="/vms">Virtual Machines</RouterLink>
              </li>
              <li>
                <RouterLink class="footer-link" to="/containers">Containers</RouterLink>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-500">Project</h3>
            <ul class="mt-3 space-y-2">
              <li>
                <a
                  class="footer-link"
                  href="https://github.com/nurawiguna/ProxmoxVE-Watcher"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span class="inline-flex items-center gap-2">
                    <SvgGitHub class="h-4 w-4" />
                    GitHub Repository
                  </span>
                </a>
              </li>
              <li>
                <a
                  class="footer-link"
                  href="https://github.com/nurawiguna/ProxmoxVE-Watcher/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Report Issue
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <!-- Call to action / Back to Top -->
        <div class="flex md:items-end">
          <div class="w-full card p-4 md:p-5 bg-white/80">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-sm font-medium text-gray-900">Enjoying this dashboard?</p>
                <p class="text-sm text-gray-600">Star the repo and share feedback.</p>
              </div>
              <div class="flex items-center gap-2">
                <a
                  href="https://github.com/nurawiguna/ProxmoxVE-Watcher"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn-secondary"
                >
                  <SvgGitHub class="h-4 w-4" />
                  <span class="ml-2">Star on GitHub</span>
                </a>
                <button @click="scrollTop" class="btn-primary" aria-label="Back to top">
                  <ArrowUpIcon class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom bar -->
      <div :class="['flex flex-col sm:flex-row items-center justify-between gap-3', isDemoMode ? 'pt-6 mt-8 border-t border-gray-200' : '']">
        <div class="text-xs text-gray-500 text-center sm:text-left leading-relaxed">
          <div class="mt-2">© {{ year }} {{ appTitle }}</div>
          <div>Built with ❤️ and vibe coding – using Vue 3, Vite, and Tailwind CSS.</div>
        </div>
        <div class="flex items-center gap-4 text-xs text-gray-500">
          <span class="inline-flex items-center gap-1">
            <ShieldCheckIcon class="h-4 w-4 text-green-600" />
            Open Source (MIT)
          </span>
          <span class="hidden sm:inline">•</span>
          <span class="inline-flex items-center gap-1">
            <SparklesIcon class="h-4 w-4 text-blue-600" />
            Clean, responsive UI
          </span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ServerIcon, ArrowUpIcon, ShieldCheckIcon, SparklesIcon } from '@heroicons/vue/24/outline'

const appTitle = computed(() => import.meta.env.VITE_APP_TITLE || 'Proxmox VE Watcher')
const year = new Date().getFullYear()
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

const scrollTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<script>
// Inline GitHub SVG as a small functional component for consistent styling
export default {
  name: 'Footer',
  components: {
    SvgGitHub: {
      name: 'SvgGitHub',
      props: { class: { type: String, default: '' } },
      template:
        '<svg :class="class" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M12 .5C5.73.5.98 5.23.98 11.5c0 4.84 3.14 8.94 7.49 10.39.55.11.75-.24.75-.54 0-.27-.01-1.16-.02-2.11-3.05.66-3.7-1.3-3.7-1.3-.5-1.26-1.22-1.6-1.22-1.6-.99-.68.08-.66.08-.66 1.09.08 1.66 1.12 1.66 1.12.98 1.67 2.57 1.19 3.2.91.1-.71.38-1.19.69-1.46-2.44-.28-5.01-1.22-5.01-5.44 0-1.2.43-2.17 1.13-2.94-.11-.28-.49-1.42.11-2.96 0 0 .92-.29 3.01 1.12.87-.24 1.8-.36 2.73-.36.93 0 1.86.12 2.73.36 2.09-1.41 3.01-1.12 3.01-1.12.6 1.54.22 2.68.11 2.96.7.77 1.13 1.74 1.13 2.94 0 4.23-2.57 5.16-5.02 5.44.39.33.73.98.73 1.98 0 1.43-.01 2.59-.01 2.94 0 .3.2.65.75.54 4.35-1.45 7.49-5.55 7.49-10.39C23.02 5.23 18.27.5 12 .5z" clip-rule="evenodd"/></svg>'
    }
  }
}
</script>

<style scoped lang="postcss">
.footer-link {
  @apply text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-1;
}
</style>
