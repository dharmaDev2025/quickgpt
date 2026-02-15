import React, { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import Message from './Message'
import toast from 'react-hot-toast'

const ChatBox = () => {

  const containerRef = useRef(null)

  const { selectedChat, theme, user, axios, token, setSelectedChat, setUser } = useAppContext()

  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState('text');
  const [isPublished, setIsPublished] = useState(false);

  const onSubmit = async (e) => {

    try {

      e.preventDefault()

      if (!user) return toast('login to send a message')

      const cost = mode === 'image' ? 2 : 1
      if (user.credits < cost) return toast('Insufficient credits')

      setLoading(true)

      const promptCopy = prompt
      setPrompt('')

      const userMessage = {
        role: 'user',
        content: promptCopy,
        timestamp: Date.now(),
        isImage: false
      }
      setMessages(prev => [...prev, userMessage])

      if (selectedChat) {
        const { data } = await axios.post(
          `/api/message/${mode}`,
          { chatId: selectedChat._id, prompt: promptCopy, isPublished },
          { headers: { Authorization: `Bearer ${token}` } }
        )

        console.log('Full API Response:', data)
        console.log('Reply field:', data.reply)

        if (data.success) {
          if (data.reply) {
            console.log('Adding reply to messages:', data.reply)
            setMessages(prev => [...prev, data.reply])

            setSelectedChat(prev => ({
              ...prev,
              messages: [...(prev.messages || []), userMessage, data.reply]
            }))

            setUser(prev => ({ ...prev, credits: prev.credits - cost }))
          } else {
            console.warn('No reply in response - backend not sending reply')
            toast.error('No reply received from backend')
            setMessages(prev => prev.slice(0, -1))
          }
        } else {
          console.error('API failed:', data.message)
          toast.error(data.message || 'Request failed')
          setPrompt(promptCopy)
          setMessages(prev => prev.slice(0, -1))
        }
      } else {
        console.log('No chat selected - no API call')
      }

    } catch (error) {

      console.error('API Error:', error.response?.data || error.message)
      toast.error(error.message || 'Network error')
      setPrompt(promptCopy)
      setMessages(prev => prev.slice(0, -1))

    } finally {

      setLoading(false)

    }
  }

  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages || [])
      console.log('Loaded messages from selectedChat:', selectedChat.messages)
    } else {
      setMessages([])
    }
  }, [selectedChat])

  useEffect(() => {

    if (containerRef.current) {

      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      })

    }

  }, [messages])

  return (

    <div className='flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40'>

      {/* CHAT MESSAGES */}
      <div ref={containerRef} className='flex-1 mb-5 overflow-y-scroll'>

        {messages.length === 0 && (

          <div className='h-full flex flex-col items-center justify-center gap-2 text-primary'>

            <img
              src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark}
              className='w-full max-w-56 sm:max-w-68'
            />

            <p>Ask me Anything.</p>

          </div>

        )}

        {messages.map((message, index) => (
          <Message key={message.timestamp || index} message={message} />  // ✅ Fixed: Use timestamp as unique key to prevent duplicate renders
        ))}

        {/* LOADING */}
        {
          loading &&
          <div className='loader flex items-center gap-1.5'>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
          </div>
        }

      </div>

      {/* IMAGE MODE OPTION */}
      {mode === 'image' && (

        <label className='inline-flex items-center gap-2 mb-3 text-sm mx-auto'>

          <p className='text-xs'>
            Publish Generated Image to Community
          </p>

          <input
            type='checkbox'
            className='cursor-pointer'
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />

        </label>

      )}

      {/* INPUT BOX */}
      <form onSubmit={onSubmit}
        className='bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/30 rounded-full w-full max-w-2xl p-3 pl-4 mx-auto flex gap-4 items-center'
      >

        <select
          onChange={(e) => setMode(e.target.value)}
          value={mode}
          className='text-sm pl-3 pr-2 outline-none'
        >
          <option className='dark:bg-purple-900' value='text'>Text</option>
          <option className='dark:bg-purple-900' value='image'>Image</option>
        </select>

        <input
          onChange={(e) => setPrompt(e.target.value)}
          value={prompt}
          type='text'
          placeholder='Type your prompt here....'
          className='flex-1 w-full text-sm outline-none'
          required
        />

        <button disabled={loading}>
          <img
            src={loading ? assets.stop_icon : assets.send_icon}
            className='w-8 cursor-pointer'
            alt=''
          />
        </button>

      </form>

    </div>
  )
}

export default ChatBox