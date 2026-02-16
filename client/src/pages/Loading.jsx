import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

const Loading = () => {

  const navigate = useNavigate()
  const [params] = useSearchParams()

  const { fetchUser, axios } = useAppContext()

  useEffect(() => {

    const loadUser = async () => {

      try {

        // ⭐ GET transaction id from Stripe redirect
        const txn = params.get("txn")

        // ⭐ VERIFY PAYMENT (IMPORTANT FOR CREDITS)
        if (txn) {
          await axios.get(`/api/credit/verify?txn=${txn}`)
        }

        // ⭐ refresh user after credits added
        if (fetchUser) {
          await fetchUser()
        }

      } catch (err) {
        console.log(err)
      }

      navigate('/')

    }

    const timeout = setTimeout(loadUser, 1500)

    return () => clearTimeout(timeout)

  }, [fetchUser, navigate, params, axios])


  return (
    <div className='bg-gradient-to-b from-[#531B81] to-[#29184B] flex items-center justify-center h-screen w-screen text-white text-2xl'>
      <div className='w-10 h-10 rounded-full border-4 border-white border-t-transparent animate-spin'></div>
    </div>
  )

}

export default Loading
