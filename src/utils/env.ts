export const isLocalOrDemo = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_RUNTIME_ENV === 'demo'
