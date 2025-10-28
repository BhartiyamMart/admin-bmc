import React from 'react'
import AuthLayout from './auth-layout'
import ResetForm from './reset-form'

const reset = () => {
  return (
    <AuthLayout title='Reset  password' subTitle='Enter your mail to reset password.'>
      <ResetForm/>
    </AuthLayout>
  )
}

export default reset
