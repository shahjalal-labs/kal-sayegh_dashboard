import { Loader2 } from 'lucide-react'
import React from 'react'

function SimpleLoader() {
  return (
    <div className='flex items-center justify-center min-h-screen'>
        Loading data
        <Loader2 className='animate-spin' size={25}/>
    </div>
  )
}

export default SimpleLoader