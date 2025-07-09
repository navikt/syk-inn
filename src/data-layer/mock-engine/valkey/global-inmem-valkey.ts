import { lazyNextleton } from 'nextleton'

import { createInMemoryValkey } from './InMemValkey'

export const globalInMemoryValkey = lazyNextleton('global-in-memory-valkey', () => createInMemoryValkey())
