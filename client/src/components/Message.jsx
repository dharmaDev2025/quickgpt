import React, { useEffect } from 'react'
import { assets } from '../assets/assets'
import moment from 'moment'
import Markdown from 'react-markdown'
import Prism from 'prismjs'

const Message = ({ message }) => {
  useEffect(() => {
    Prism.highlightAll()
  }, [message.content])

  // ✅ Added: Debug log to check message structure
  console.log('Rendering message:', message)

  return (
    <div>
      {message.role === "user" ? (
        <div className='flex items-start justify-end my-4 gap-2'>
          <div className='flex flex-col gap-2 p-2 px-4 bg-slate-50 dark:bg-[#57317C]/30 border border-[#80609F]/30 rounded-md max-w-2xl'>
            <p className='text-sm dark:text-primary'>{message.content || 'No content'}</p>  // ✅ Added: Fallback for missing content
            <span className='text-xs text-gray-400 dark:text-[#B1A6C0]'>
              {message.timestamp ? moment(message.timestamp).fromNow() : 'Unknown time'}
            </span>
          </div>
          <img src={assets.user_icon} className='w-8 rounded-full' alt='User' />
        </div>
      ) : (
        <div className='inline-flex flex-col gap-2 p-2 px-4 max-w-2xl bg-primary/20 dark:bg-[#57317C]/30 border border-[#80609F]/30 rounded-md my-4'>
          {message.isImage ? (
            <img src={message.content} alt='Generated Image' className='w-full max-w-md mt-2 rounded-md' />
          ) : (
            <div className='text-sm dark:text-primary reset-tw'>
              <Markdown>{message.content || 'No content'}</Markdown>  // ✅ Added: Fallback for missing content
            </div>
          )}
          <span className='text-xs text-gray-400 dark:text-[#B1A6C0]'>
            {message.timestamp ? moment(message.timestamp).fromNow() : 'Unknown time'}
          </span>
        </div>
      )}
    </div>
  )
}

export default Message